"""Shared fixtures."""

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.roster_planner.const import DOMAIN


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Let Home Assistant load custom_components/ in every test."""
    return


@pytest.fixture(autouse=True)
async def stub_frontend(hass: HomeAssistant, enable_custom_integrations):
    """Satisfy the frontend dependencies without the hass_frontend package.

    Panels are registered through a plain dict, so nothing else is needed from it.
    """
    assert await async_setup_component(hass, "http", {})
    assert await async_setup_component(hass, "websocket_api", {})
    hass.config.components.update({"frontend", "panel_custom"})


@pytest.fixture
def entry_data() -> dict:
    """Return the settings for a test roster."""
    return {"name": "Work", "prefix": "", "location": "", "owner": None}


@pytest.fixture
async def entry(hass: HomeAssistant, entry_data: dict) -> MockConfigEntry:
    """Set up a test roster."""
    config_entry = MockConfigEntry(domain=DOMAIN, title="Work", data=entry_data)
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    return config_entry
