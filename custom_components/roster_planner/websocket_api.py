"""Websocket API used by the panel.

Item payloads are checked for shape here; ``models.py`` enforces the rules, so every
rule failure can name the field it belongs to.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import date
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util
import probatio as vol

from . import engine
from .const import CONF_OWNER, DOMAIN
from .helpers import RosterConfigEntry, can_edit, entry_settings
from .models import WEEKDAYS, RosterData, ValidationError

MAX_RANGE_DAYS = 400

OPTIONAL_TEXT = vol.Any(str, None)

ASSIGNMENT = vol.Schema(
    {
        vol.Required("type"): str,
        vol.Optional("shift_type_id"): OPTIONAL_TEXT,
        vol.Optional("start"): OPTIONAL_TEXT,
        vol.Optional("end"): OPTIONAL_TEXT,
        vol.Optional("label"): OPTIONAL_TEXT,
    }
)
DAYS = vol.Schema({vol.In(WEEKDAYS): ASSIGNMENT})
SHIFT_TYPE = vol.Schema(
    {
        vol.Optional("name"): OPTIONAL_TEXT,
        vol.Optional("start"): OPTIONAL_TEXT,
        vol.Optional("end"): OPTIONAL_TEXT,
        vol.Optional("colour"): OPTIONAL_TEXT,
        vol.Optional("notes"): OPTIONAL_TEXT,
    }
)
PATTERN = vol.Schema({vol.Optional("name"): OPTIONAL_TEXT, vol.Optional("days"): DAYS})
ROTATION = vol.Schema(
    {
        vol.Optional("id"): str,
        vol.Optional("name"): OPTIONAL_TEXT,
        vol.Optional("anchor"): OPTIONAL_TEXT,
        vol.Optional("cycle_weeks"): int,
        vol.Optional("slots"): [OPTIONAL_TEXT],
        vol.Optional("active_from"): OPTIONAL_TEXT,
        vol.Optional("active_until"): OPTIONAL_TEXT,
        vol.Optional("priority"): vol.Any(int, None),
    }
)
VARIATION = vol.Schema(
    {
        vol.Optional("id"): str,
        vol.Optional("name"): OPTIONAL_TEXT,
        vol.Optional("start_date"): OPTIONAL_TEXT,
        vol.Optional("end_date"): OPTIONAL_TEXT,
        vol.Optional("mode"): OPTIONAL_TEXT,
        vol.Optional("pattern_id"): OPTIONAL_TEXT,
        vol.Optional("days"): DAYS,
    }
)

type Handler = Callable[
    [HomeAssistant, ActiveConnection, RosterConfigEntry, dict[str, Any]],
    Awaitable[Any],
]


def _send_validation_error(
    connection: ActiveConnection, msg_id: int, err: ValidationError
) -> None:
    connection.send_message(
        {
            "id": msg_id,
            "type": "result",
            "success": False,
            "error": {"code": err.code, "message": err.message, "field": err.field},
        }
    )


def _register(
    hass: HomeAssistant,
    name: str,
    schema: dict[Any, Any],
    handler: Handler,
    *,
    mutation: bool = False,
) -> None:
    """Register a command with the entry lookup, permissions and error handling."""
    full_schema = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
        {
            vol.Required("type"): f"{DOMAIN}/{name}",
            vol.Required("entry_id"): str,
            **schema,
        }
    )

    @websocket_api.async_response
    async def wrapped(
        hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
    ) -> None:
        entry = hass.config_entries.async_get_entry(msg["entry_id"])
        if (
            entry is None
            or entry.domain != DOMAIN
            or entry.state is not ConfigEntryState.LOADED
        ):
            connection.send_error(msg["id"], "not_found", "Roster not found")
            return
        if mutation and not can_edit(entry, connection.user):
            connection.send_error(
                msg["id"], "unauthorized", "You cannot edit this roster"
            )
            return
        try:
            result = await handler(hass, connection, entry, msg)
        except ValidationError as err:
            _send_validation_error(connection, msg["id"], err)
            return
        if result is not _ALREADY_SENT:
            connection.send_result(msg["id"], result)

    websocket_api.async_register_command(hass, f"{DOMAIN}/{name}", wrapped, full_schema)


_ALREADY_SENT = object()


def _check_range(start: date, end: date) -> None:
    if end < start:
        raise ValidationError(
            "invalid_date_range", "Cannot end before it starts", "end"
        )
    if (end - start).days > MAX_RANGE_DAYS:
        raise ValidationError(
            "range_too_large", f"At most {MAX_RANGE_DAYS} days", "end"
        )


def _details(data: RosterData, start: date, end: date) -> list[dict[str, object]]:
    _check_range(start, end)
    tz = dt_util.get_default_time_zone()
    return [day.to_dict() for day in engine.day_details(start, end, data, tz)]


async def _get(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> dict[str, Any]:
    return entry.runtime_data.data.to_dict()


async def _subscribe(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> object:
    store = entry.runtime_data

    @callback
    def forward() -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], store.data.to_dict())
        )

    connection.subscriptions[msg["id"]] = store.async_add_listener(forward)
    connection.send_result(msg["id"])
    forward()
    return _ALREADY_SENT


async def _resolve(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> list[dict[str, object]]:
    return _details(entry.runtime_data.data, msg["start"], msg["end"])


async def _preview(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> list[dict[str, object]]:
    kind = next((key for key in ("rotation", "variation") if key in msg), None)
    if kind is None:
        raise ValidationError("required", "Provide a rotation or a variation")
    draft = entry.runtime_data.data.with_draft(kind, msg[kind])
    return _details(draft, msg["start"], msg["end"])


async def _import(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> dict[str, Any]:
    data = RosterData.from_dict(msg["data"])
    await entry.runtime_data.async_replace(data)
    return data.to_dict()


async def _set_exception(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> dict[str, Any]:
    payload = {
        "date": msg["date"],
        "assignment": msg.get("assignment"),
        "note": msg.get("note"),
    }
    result = await entry.runtime_data.async_mutate(
        lambda data: data.set_exception(payload)
    )
    return result.to_dict()


async def _clear_exception(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> None:
    await entry.runtime_data.async_mutate(
        lambda data: data.clear_exception(msg["date"])
    )


async def _set_default_shift_name(
    hass: HomeAssistant,
    connection: ActiveConnection,
    entry: RosterConfigEntry,
    msg: dict[str, Any],
) -> None:
    await entry.runtime_data.async_mutate(
        lambda data: data.set_default_shift_name(msg["name"])
    )


def _crud(hass: HomeAssistant, kind: str, schema: vol.Schema, plural: bool) -> None:
    """Register create, update and delete for one kind of item."""

    async def create(
        hass: HomeAssistant,
        connection: ActiveConnection,
        entry: RosterConfigEntry,
        msg: dict[str, Any],
    ) -> dict[str, Any]:
        result = await entry.runtime_data.async_mutate(
            lambda data: getattr(data, f"create_{kind}")(msg["item"])
        )
        return result.to_dict()

    async def update(
        hass: HomeAssistant,
        connection: ActiveConnection,
        entry: RosterConfigEntry,
        msg: dict[str, Any],
    ) -> dict[str, Any]:
        result = await entry.runtime_data.async_mutate(
            lambda data: getattr(data, f"update_{kind}")(msg["item_id"], msg["item"])
        )
        return result.to_dict()

    async def delete(
        hass: HomeAssistant,
        connection: ActiveConnection,
        entry: RosterConfigEntry,
        msg: dict[str, Any],
    ) -> None:
        args = (
            (msg["item_id"], msg.get("replace_with")) if plural else (msg["item_id"],)
        )
        await entry.runtime_data.async_mutate(
            lambda data: getattr(data, f"delete_{kind}")(*args)
        )

    delete_schema: dict[Any, Any] = {vol.Required("item_id"): str}
    if plural:
        delete_schema[vol.Optional("replace_with")] = vol.Any(str, None)
    _register(
        hass, f"{kind}/create", {vol.Required("item"): schema}, create, mutation=True
    )
    _register(
        hass,
        f"{kind}/update",
        {vol.Required("item_id"): str, vol.Required("item"): schema},
        update,
        mutation=True,
    )
    _register(hass, f"{kind}/delete", delete_schema, delete, mutation=True)


@callback
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/list"})
def _list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the loaded rosters and whether this user can edit each."""
    connection.send_result(
        msg["id"],
        [
            {
                "entry_id": entry.entry_id,
                "title": entry.title,
                "owner": entry_settings(entry).get(CONF_OWNER),
                "can_edit": can_edit(entry, connection.user),
            }
            for entry in hass.config_entries.async_loaded_entries(DOMAIN)
        ],
    )


@callback
def async_setup(hass: HomeAssistant) -> None:
    """Register every command."""
    websocket_api.async_register_command(hass, _list)

    date_range = {vol.Required("start"): cv.date, vol.Required("end"): cv.date}
    _register(hass, "get", {}, _get)
    _register(hass, "export", {}, _get)
    _register(hass, "subscribe", {}, _subscribe)
    _register(hass, "resolve", date_range, _resolve)
    _register(
        hass,
        "preview",
        {
            **date_range,
            vol.Exclusive("rotation", "draft"): ROTATION,
            vol.Exclusive("variation", "draft"): VARIATION,
        },
        _preview,
    )
    _register(hass, "import", {vol.Required("data"): dict}, _import, mutation=True)
    _register(
        hass,
        "default_shift_name/set",
        {vol.Required("name"): str},
        _set_default_shift_name,
        mutation=True,
    )

    _crud(hass, "shift_type", SHIFT_TYPE, plural=True)
    _crud(hass, "pattern", PATTERN, plural=True)
    _crud(hass, "rotation", ROTATION, plural=False)
    _crud(hass, "variation", VARIATION, plural=False)

    _register(
        hass,
        "exception/set",
        {
            vol.Required("date"): cv.date,
            vol.Optional("assignment"): vol.Any(None, ASSIGNMENT),
            vol.Optional("note"): OPTIONAL_TEXT,
        },
        _set_exception,
        mutation=True,
    )
    _register(
        hass,
        "exception/clear",
        {vol.Required("date"): cv.date},
        _clear_exception,
        mutation=True,
    )
