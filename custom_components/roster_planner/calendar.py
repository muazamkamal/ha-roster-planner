"""The roster as a calendar entity, computed on demand from its rules."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.components.calendar import (
    CalendarEntity,
    CalendarEntityFeature,
    CalendarEvent,
)
from homeassistant.core import HomeAssistant, ServiceCall, callback
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


def _assignment(entity: RosterCalendarEntity, call: ServiceCall) -> dict[str, Any]:
    """Build a day assignment from exactly one of shift_type, start/end or off."""
    data = call.data
    off = data.get(ATTR_OFF, False)
    has_times = ATTR_START in data or ATTR_END in data
    if sum((off, ATTR_SHIFT_TYPE in data, has_times)) != 1:
        raise ServiceValidationError(
            "Provide exactly one of: shift_type, start and end, or off"
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
    for shift_type in entity.store.data.shift_types.values():
        if wanted in (shift_type.id, shift_type.name) or (
            wanted.casefold() == shift_type.name.casefold()
        ):
            return {"type": "shift", "shift_type_id": shift_type.id}
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
        def refresh(_: datetime) -> None:
            self.async_write_ha_state()

        self.async_on_remove(
            async_track_time_change(self.hass, refresh, hour=0, minute=0, second=5)
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
        payload = self._exception_from_event(kwargs)
        await self._async_apply(lambda data: data.set_exception(payload))

    async def async_delete_event(
        self,
        uid: str,
        recurrence_id: str | None = None,
        recurrence_range: str | None = None,
    ) -> None:
        """Cancel a shift. An extra shift is simply removed."""
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
        _reject_series(recurrence_range)
        old_day = self._date_from_uid(uid)
        payload = self._exception_from_event(event)

        def apply(data: RosterData) -> None:
            if payload["date"] != old_day:
                self._cancel(data, old_day)
            data.set_exception(payload)

        await self._async_apply(apply)

    async def _async_apply(self, operation: Any) -> None:
        try:
            await self.store.async_mutate(operation)
        except ValidationError as err:
            raise HomeAssistantError(err.message) from err

    def _cancel(self, data: RosterData, day: date) -> None:
        tz = dt_util.get_default_time_zone()
        if engine.resolve_without_exception(day, data, tz) is None:
            data.clear_exception(day)
        else:
            data.set_exception({"date": day, "assignment": {"type": "off"}})

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
        title = event.get("summary") or ""
        if self._prefix:
            title = title.removeprefix(self._prefix)
        return {
            "date": start.date(),
            "assignment": self._assignment_for(title, start_time, end_time),
            "note": event.get("description"),
        }

    def _assignment_for(self, title: str, start: str, end: str) -> dict[str, Any]:
        """Use the matching shift type if there is one, to keep its colour."""
        for shift_type in self.store.data.shift_types.values():
            if (shift_type.name, shift_type.start, shift_type.end) == (
                title,
                start,
                end,
            ):
                return {"type": "shift", "shift_type_id": shift_type.id}
        return {"type": "custom", "start": start, "end": end, "label": title}

    def _to_event(self, shift: engine.Resolved) -> CalendarEvent:
        return CalendarEvent(
            start=shift.start,
            end=shift.end,
            summary=f"{self._prefix}{shift.title}",
            description=_describe(shift),
            location=self._location,
            uid=f"{self.entry.entry_id}-{shift.date.isoformat()}",
        )


def _reject_series(recurrence_range: str | None) -> None:
    """Shifts are single events, so a change cannot span a series."""
    if recurrence_range:
        raise HomeAssistantError("Repeating events are not supported")


def _describe(shift: engine.Resolved) -> str:
    """Say where a shift came from."""
    if shift.source == "exception":
        origin = "Extra shift" if shift.flag == "extra" else "Changed shift"
    elif shift.source == "variation":
        origin = f"Variation: {shift.source_name}"
    else:
        origin = f"{shift.source_name} · Week {shift.week}"
    return f"{origin}\n{shift.note}" if shift.note else origin
