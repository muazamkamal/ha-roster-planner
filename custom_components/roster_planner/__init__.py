"""The Roster Planner integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from . import websocket_api
from .const import (
    DOMAIN,
    PANEL_BUNDLE,
    PANEL_COMPONENT,
    PANEL_ICON,
    PANEL_STATIC_URL,
    PANEL_TITLE,
    PANEL_URL_PATH,
)
from .helpers import RosterConfigEntry
from .models import ValidationError
from .store import RosterStore

PLATFORMS = [Platform.CALENDAR, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
DATA_PANEL_REGISTERED = f"{DOMAIN}_panel_registered"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the things that exist once, however many rosters there are."""
    # Stores outlive a config entry reload so panel subscriptions stay connected.
    hass.data[DOMAIN] = {}
    websocket_api.async_setup(hass)
    # Static routes cannot be removed, so this lives here and not in entry setup.
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                PANEL_STATIC_URL,
                str(Path(__file__).parent / "frontend"),
                cache_headers=False,
            )
        ]
    )
    return True


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Add the sidebar panel unless another roster already has."""
    if hass.data.get(DATA_PANEL_REGISTERED):
        return
    # Set before awaiting so two rosters starting together register it once.
    hass.data[DATA_PANEL_REGISTERED] = True
    try:
        integration = await async_get_integration(hass, DOMAIN)
        await panel_custom.async_register_panel(
            hass,
            frontend_url_path=PANEL_URL_PATH,
            webcomponent_name=PANEL_COMPONENT,
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            module_url=f"{PANEL_STATIC_URL}/{PANEL_BUNDLE}?v={integration.version}",
            require_admin=False,
        )
    except BaseException:
        hass.data.pop(DATA_PANEL_REGISTERED, None)
        raise


async def async_setup_entry(hass: HomeAssistant, entry: RosterConfigEntry) -> bool:
    """Set up one roster."""
    stores: dict[str, RosterStore] = hass.data[DOMAIN]
    if (store := stores.get(entry.entry_id)) is None:
        store = RosterStore(hass, entry.entry_id)
        try:
            await store.async_load()
        except ValidationError as err:
            raise ConfigEntryError(
                f"Stored roster for {entry.title} is invalid: {err.message}"
            ) from err
        stores[entry.entry_id] = store
    entry.runtime_data = store
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await _async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: RosterConfigEntry) -> bool:
    """Unload one roster, removing the panel along with the last one."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    others = [
        other
        for other in hass.config_entries.async_loaded_entries(DOMAIN)
        if other.entry_id != entry.entry_id
    ]
    if unloaded and not others and hass.data.pop(DATA_PANEL_REGISTERED, False):
        frontend.async_remove_panel(hass, PANEL_URL_PATH)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: RosterConfigEntry) -> None:
    """Delete a roster's stored data when the entry is removed."""
    store = hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    if store is None:
        store = RosterStore(hass, entry.entry_id)
    await store.async_remove()
