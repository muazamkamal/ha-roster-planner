"""Sidebar panel registration tests."""

from homeassistant.components.frontend import DATA_PANELS
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.roster_planner.const import DOMAIN, PANEL_URL_PATH


def panel_registered(hass: HomeAssistant) -> bool:
    return PANEL_URL_PATH in hass.data.get(DATA_PANELS, {})


async def add_entry(hass: HomeAssistant, title: str) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, title=title, data={"name": title})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_panel_config(hass: HomeAssistant, entry):
    panel = hass.data[DATA_PANELS][PANEL_URL_PATH]
    assert panel.sidebar_title == "Roster"
    assert panel.require_admin is False
    custom = panel.config["_panel_custom"]
    assert custom["name"] == "roster-planner-panel"
    assert custom["module_url"].endswith("roster-planner-panel.js?v=0.1.0")


async def test_panel_registered_once_and_removed_with_last_entry(hass: HomeAssistant):
    first = await add_entry(hass, "One")
    second = await add_entry(hass, "Two")
    assert panel_registered(hass)
    assert await hass.config_entries.async_unload(first.entry_id)
    assert panel_registered(hass)
    assert await hass.config_entries.async_unload(second.entry_id)
    assert not panel_registered(hass)


async def test_panel_returns_after_reload(hass: HomeAssistant, entry):
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert panel_registered(hass)


async def test_bundle_is_served(hass: HomeAssistant, entry, hass_client_no_auth):
    client = await hass_client_no_auth()
    response = await client.get("/roster_planner_static/roster-planner-panel.js")
    assert response.status == 200
    assert "roster-planner-panel" in await response.text()
