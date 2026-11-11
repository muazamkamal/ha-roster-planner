"""Next shift start and end as timestamp sensors."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, tzinfo

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_time_change,
)
from homeassistant.util import dt as dt_util

from . import engine
from .const import DOMAIN
from .helpers import RosterConfigEntry
from .models import RosterData

type ValueFunc = Callable[[datetime, RosterData, tzinfo], datetime | None]


def _next_start(now: datetime, data: RosterData, tz: tzinfo) -> datetime | None:
    shift = engine.next_start(now, data, tz)
    return shift.start if shift else None


def _next_end(now: datetime, data: RosterData, tz: tzinfo) -> datetime | None:
    shift = engine.current_or_next(now, data, tz)
    return shift.end if shift else None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RosterConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the sensors."""
    async_add_entities(
        [
            RosterTimeSensor(entry, "next_shift_start", _next_start),
            RosterTimeSensor(entry, "next_shift_end", _next_end),
        ]
    )


class RosterTimeSensor(SensorEntity):
    """A moment computed from the roster, recomputed when that moment passes."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry: RosterConfigEntry, key: str, value: ValueFunc) -> None:
        """Initialise from a config entry."""
        self._store = entry.runtime_data
        self._value = value
        self._alarm: CALLBACK_TYPE | None = None
        self._attr_translation_key = key
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Compute now, then on every rule change and daily."""
        self.async_on_remove(self._store.async_add_listener(self._async_refresh))
        self.async_on_remove(
            async_track_time_change(
                self.hass, self._async_refresh, hour=0, minute=0, second=5
            )
        )
        self.async_on_remove(self._async_cancel_alarm)
        self._async_refresh()

    @callback
    def _async_cancel_alarm(self) -> None:
        if self._alarm is not None:
            self._alarm()
            self._alarm = None

    @callback
    def _async_refresh(self, _: datetime | None = None) -> None:
        self._async_cancel_alarm()
        value = self._value(
            dt_util.now(), self._store.data, dt_util.get_default_time_zone()
        )
        self._attr_native_value = value
        if value is not None:
            self._alarm = async_track_point_in_time(
                self.hass, self._async_refresh, value
            )
        self.async_write_ha_state()
