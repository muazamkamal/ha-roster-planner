"""The Roster Planner integration."""

from __future__ import annotations

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from . import websocket_api
from .const import DOMAIN
from .helpers import RosterConfigEntry
from .store import RosterStore

PLATFORMS = [Platform.CALENDAR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the things that exist once, however many rosters there are."""
    # Stores outlive a config entry reload so panel subscriptions stay connected.
    hass.data[DOMAIN] = {}
    websocket_api.async_setup(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: RosterConfigEntry) -> bool:
    """Set up one roster."""
    stores: dict[str, RosterStore] = hass.data[DOMAIN]
    if (store := stores.get(entry.entry_id)) is None:
        store = RosterStore(hass, entry.entry_id)
        await store.async_load()
        stores[entry.entry_id] = store
    entry.runtime_data = store
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: RosterConfigEntry) -> bool:
    """Unload one roster."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: RosterConfigEntry) -> None:
    """Delete a roster's stored data when the entry is removed."""
    store = hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    if store is None:
        store = RosterStore(hass, entry.entry_id)
    await store.async_remove()
