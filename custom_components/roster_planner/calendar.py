"""The roster as a calendar entity, computed on demand from its rules."""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta, tzinfo
from typing import Any

from homeassistant.auth.models import User
from homeassistant.components.calendar import (
    CalendarEntity,
    CalendarEntityFeature,
    CalendarEvent,
)
from homeassistant.components.websocket_api import current_connection
from homeassistant.const import EVENT_CORE_CONFIG_UPDATE
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import (
    HomeAssistantError,
    ServiceValidationError,
    Unauthorized,
)
from homeassistant.helpers import config_validation as cv, entity_platform
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_track_time_change
from homeassistant.util import dt as dt_util
import probatio as vol

from . import engine
from .const import CONF_LOCATION, CONF_PREFIX, DOMAIN
from .helpers import RosterConfigEntry, can_edit, entry_settings
from .models import RosterData, ValidationError

SERVICE_SET_EXCEPTION = "set_exception"
SERVICE_CLEAR_EXCEPTION = "clear_exception"

ATTR_DATE = "date"
ATTR_SHIFT_TYPE = "shift_type"
ATTR_START = "start"
ATTR_END = "end"
ATTR_OFF = "off"
ATTR_NOTE = "note"
ATTR_LABEL = "label"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RosterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the calendar and register its services."""
    async_add_entities([RosterCalendarEntity(entry)])

    platform = entity_platform.async_get_current_platform()
    platform.async_register_entity_service(
        SERVICE_SET_EXCEPTION,
        {
            vol.Required(ATTR_DATE): cv.date,
            vol.Optional(ATTR_SHIFT_TYPE): cv.string,
            vol.Optional(ATTR_START): cv.string,
            vol.Optional(ATTR_END): cv.string,
            vol.Optional(ATTR_OFF): cv.boolean,
            vol.Optional(ATTR_LABEL): cv.string,
            vol.Optional(ATTR_NOTE): cv.string,
        },
        _async_set_exception,
    )
    platform.async_register_entity_service(
        SERVICE_CLEAR_EXCEPTION,
        {vol.Required(ATTR_DATE): cv.date},
        _async_clear_exception,
    )


async def _async_check_permission(
    entity: RosterCalendarEntity, call: ServiceCall
) -> None:
    """Apply the edit rule. Calls with no user, like automations, are allowed."""
    if not call.context.user_id:
        return
    user = await entity.hass.auth.async_get_user(call.context.user_id)
    if user is None or not can_edit(entity.entry, user):
        raise Unauthorized(context=call.context)


def _assignment(
    entity: RosterCalendarEntity, call: ServiceCall
) -> dict[str, Any] | None:
    """Build a day assignment from exactly one of shift_type, start/end or off.

    With none of them and a note, return None: the note goes on the rostered day.
    """
    data = call.data
    off = data.get(ATTR_OFF, False)
    has_times = ATTR_START in data or ATTR_END in data
    given = sum((off, ATTR_SHIFT_TYPE in data, has_times))
    if given == 0 and data.get(ATTR_NOTE):
        return None
    if given != 1:
        raise ServiceValidationError(
            "Provide exactly one of: shift_type, start and end, or off. "
            "Or give only a note."
        )
    if off:
        return {"type": "off"}
    if has_times:
        return {
            "type": "custom",
            "start": data.get(ATTR_START),
            "end": data.get(ATTR_END),
            "label": data.get(ATTR_LABEL),
        }
    wanted = data[ATTR_SHIFT_TYPE]
    shift_types = entity.store.data.shift_types.values()
    # An exact id or name wins over a name that differs only by case.
    for matches in (
        lambda item: wanted in (item.id, item.name),
        lambda item: (
            item.name is not None and wanted.casefold() == item.name.casefold()
        ),
    ):
        if found := next(filter(matches, shift_types), None):
            return {"type": "shift", "shift_type_id": found.id}
    raise ServiceValidationError(f"Unknown shift type: {wanted}")


async def _async_set_exception(entity: RosterCalendarEntity, call: ServiceCall) -> None:
    """Handle roster_planner.set_exception."""
    await _async_check_permission(entity, call)
    payload = {
        "date": call.data[ATTR_DATE],
        "assignment": _assignment(entity, call),
        "note": call.data.get(ATTR_NOTE),
    }
    try:
        await entity.store.async_mutate(lambda data: data.set_exception(payload))
    except ValidationError as err:
        raise ServiceValidationError(err.message) from err


async def _async_clear_exception(
    entity: RosterCalendarEntity, call: ServiceCall
) -> None:
    """Handle roster_planner.clear_exception."""
    await _async_check_permission(entity, call)
    day: date = call.data[ATTR_DATE]
    await entity.store.async_mutate(lambda data: data.clear_exception(day))


class RosterCalendarEntity(CalendarEntity):
    """A calendar whose events are computed from the roster's rules."""

    _attr_has_entity_name = True
    _attr_name = None
    _attr_supported_features = (
        CalendarEntityFeature.CREATE_EVENT
        | CalendarEntityFeature.DELETE_EVENT
        | CalendarEntityFeature.UPDATE_EVENT
    )

    def __init__(self, entry: RosterConfigEntry) -> None:
        """Initialise from a config entry."""
        self.entry = entry
        self.store = entry.runtime_data
        settings = entry_settings(entry)
        self._prefix: str = settings.get(CONF_PREFIX) or ""
        self._location: str | None = settings.get(CONF_LOCATION) or None
        self._attr_unique_id = entry.entry_id
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Refresh on every rule change, and daily.

        The base class schedules updates at the start and end of the current
        event. The daily refresh picks up a shift that was beyond the lookahead
        when no event was known, which would otherwise schedule nothing.
        """
        await super().async_added_to_hass()
        self.async_on_remove(self.store.async_add_listener(self.async_write_ha_state))

        @callback
        def refresh(_: datetime | Event) -> None:
            self.async_write_ha_state()

        self.async_on_remove(
            async_track_time_change(self.hass, refresh, hour=0, minute=0, second=5)
        )
        # Shift times are wall-clock, so a timezone change moves every one of them.
        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_CORE_CONFIG_UPDATE, refresh)
        )

    @property
    def event(self) -> CalendarEvent | None:
        """Return the running shift, else the next one."""
        shift = engine.current_or_next(
            dt_util.now(), self.store.data, dt_util.get_default_time_zone()
        )
        return self._to_event(shift) if shift else None

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        """Return shifts overlapping a time range."""
        shifts = engine.shifts_overlapping(
            start_date, end_date, self.store.data, dt_util.get_default_time_zone()
        )
        return [self._to_event(shift) for shift in shifts]

    async def async_create_event(self, **kwargs: Any) -> None:
        """Save a new event as a one-off exception."""
        await self._async_check_permission()
        payload = self._exception_from_event(kwargs)
        await self._async_apply(lambda data: data.set_exception(payload))

    async def async_delete_event(
        self,
        uid: str,
        recurrence_id: str | None = None,
        recurrence_range: str | None = None,
    ) -> None:
        """Cancel a shift. An extra shift is simply removed."""
        await self._async_check_permission()
        _reject_series(recurrence_range)
        day = self._date_from_uid(uid)
        await self._async_apply(lambda data: self._cancel(data, day))

    async def async_update_event(
        self,
        uid: str,
        event: dict[str, Any],
        recurrence_id: str | None = None,
        recurrence_range: str | None = None,
    ) -> None:
        """Change a shift, which may move it to another date."""
        await self._async_check_permission()
        _reject_series(recurrence_range)
        old_day = self._date_from_uid(uid)
        payload = self._exception_from_event(event)

        def apply(data: RosterData) -> None:
            tz = dt_util.get_default_time_zone()
            # The description we sent starts with a generated origin line.
            current = engine.resolve(old_day, data, tz)
            if current is not None:
                payload["note"] = _strip_origin(payload["note"], current)
            if payload["date"] != old_day:
                self._cancel(data, old_day)
            elif self._is_rostered(data, old_day, event, tz):
                # Only the description changed: keep following the roster.
                _set_note(data, old_day, payload["note"])
                return
            data.set_exception(payload)

        await self._async_apply(apply)

    def _is_rostered(
        self, data: RosterData, day: date, event: dict[str, Any], tz: tzinfo
    ) -> bool:
        """Return True if the event matches what the roster gives on the day."""
        base = engine.resolve_without_exception(day, data, tz)
        title = self._event_base_title(event.get("summary") or "")
        return (
            base is not None
            and base.title == title
            and base.start == event["dtstart"]
            and base.end == event["dtend"]
        )

    async def _async_check_permission(self) -> None:
        """Apply the edit rule to edits made through the stock calendar.

        Home Assistant only checks that the user may control the entity, which
        every user can by default, and does not pass the user on. A websocket
        request leaves its connection in a context variable; a service call
        sets the entity's context just before calling in.
        """
        user: User | None
        if (connection := current_connection.get()) is not None:
            user = connection.user
        elif self._context is not None and self._context.user_id:
            user = await self.hass.auth.async_get_user(self._context.user_id)
        else:
            return
        if user is None or not can_edit(self.entry, user):
            raise Unauthorized(context=self._context)

    async def _async_apply(self, operation: Callable[[RosterData], object]) -> None:
        try:
            await self.store.async_mutate(operation)
        except ValidationError as err:
            raise HomeAssistantError(err.message) from err

    def _cancel(self, data: RosterData, day: date) -> None:
        """Make the day off, keeping any note on it."""
        tz = dt_util.get_default_time_zone()
        existing = data.exception_for(day)
        note = existing.note if existing else None
        if engine.resolve_without_exception(day, data, tz) is None:
            _set_note(data, day, note)
        else:
            data.set_exception(
                {"date": day, "assignment": {"type": "off"}, "note": note}
            )

    def _date_from_uid(self, uid: str) -> date:
        prefix = f"{self.entry.entry_id}-"
        try:
            if not uid.startswith(prefix):
                raise ValueError
            return date.fromisoformat(uid.removeprefix(prefix))
        except ValueError as err:
            raise HomeAssistantError(f"Unknown event: {uid}") from err

    def _exception_from_event(self, event: dict[str, Any]) -> dict[str, Any]:
        """Turn calendar event fields into an exception on one date."""
        if event.get("rrule"):
            raise HomeAssistantError("Repeating events are not supported")
        start, end = event["dtstart"], event["dtend"]
        if not isinstance(start, datetime) or not isinstance(end, datetime):
            raise HomeAssistantError("All-day events are not supported")
        start, end = dt_util.as_local(start), dt_util.as_local(end)
        if not timedelta(0) < end - start < timedelta(days=1):
            raise HomeAssistantError("A shift must be shorter than 24 hours")
        start_time, end_time = start.strftime("%H:%M"), end.strftime("%H:%M")
        title = self._event_base_title(event.get("summary") or "")
        return {
            "date": start.date(),
            "assignment": self._assignment_for(title, start_time, end_time),
            "note": event.get("description"),
        }

    def _assignment_for(self, title: str, start: str, end: str) -> dict[str, Any]:
        """Use the matching shift type if there is one, to keep its colour."""
        for shift_type in self.store.data.shift_types.values():
            if (
                shift_type.name or self.store.data.default_shift_name,
                shift_type.start,
                shift_type.end,
            ) == (
                title,
                start,
                end,
            ):
                return {"type": "shift", "shift_type_id": shift_type.id}
        return {"type": "custom", "start": start, "end": end, "label": title}

    def _event_base_title(self, title: str) -> str:
        """Remove the integration prefix and generated status suffix from a title."""
        title = title.removeprefix(self._prefix)
        for suffix in (" (Changed)", " (OT)", " (Variation)"):
            if title.endswith(suffix):
                return title.removesuffix(suffix)
        return title

    @staticmethod
    def _event_suffix(shift: engine.Resolved) -> str:
        if shift.flag == "extra":
            return " (OT)"
        if shift.flag == "changed":
            return " (Changed)"
        if shift.source == "variation":
            return " (Variation)"
        return ""

    def _to_event(self, shift: engine.Resolved) -> CalendarEvent:
        return CalendarEvent(
            start=shift.start,
            end=shift.end,
            summary=f"{self._prefix}{shift.title}{self._event_suffix(shift)}",
            description=_describe(shift),
            location=self._location,
            uid=f"{self.entry.entry_id}-{shift.date.isoformat()}",
        )


def _reject_series(recurrence_range: str | None) -> None:
    """Shifts are single events, so a change cannot span a series."""
    if recurrence_range:
        raise HomeAssistantError("Repeating events are not supported")


def _set_note(data: RosterData, day: date, note: str | None) -> None:
    """Leave the day on the roster, with the note if there is one."""
    if note:
        data.set_exception({"date": day, "note": note})
    else:
        data.clear_exception(day)


def _origin(shift: engine.Resolved) -> str:
    """Say where a shift came from."""
    if shift.source == "exception":
        return "Extra shift" if shift.flag == "extra" else "Changed shift"
    if shift.source == "variation":
        return f"Variation: {shift.source_name}"
    return f"{shift.source_name} · Week {shift.week}"


def _describe(shift: engine.Resolved) -> str:
    """Return the event description: the origin, then the note."""
    origin = _origin(shift)
    return f"{origin}\n{shift.note}" if shift.note else origin


def _strip_origin(description: str | None, shift: engine.Resolved) -> str | None:
    """Return the user's note from a description we generated for the shift."""
    if description is None:
        return None
    origin = _origin(shift)
    if description.strip() == origin:
        return None
    return description.removeprefix(f"{origin}\n")
