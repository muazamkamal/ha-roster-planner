"""Config and options flow tests."""

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.roster_planner.const import DOMAIN


async def start(hass: HomeAssistant):
    return await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )


async def test_create_roster(hass: HomeAssistant, hass_admin_user):
    result = await start(hass)
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"name": " Work ", "prefix": "Work: ", "owner": hass_admin_user.id},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Work"
    assert result["data"] == {
        "name": "Work",
        "prefix": "Work: ",
        "location": "",
        "owner": hass_admin_user.id,
    }


async def test_no_owner_is_stored_as_none(hass: HomeAssistant):
    result = await start(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Work", "owner": "none"}
    )
    assert result["data"]["owner"] is None


async def test_duplicate_name_rejected(hass: HomeAssistant, entry):
    result = await start(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Work", "owner": "none"}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"name": "name_exists"}


async def test_blank_name_rejected(hass: HomeAssistant):
    result = await start(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "   ", "owner": "none"}
    )
    assert result["errors"] == {"name": "name_required"}


async def test_options_update_settings_and_title(
    hass: HomeAssistant, entry, hass_admin_user
):
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "name": "Job",
            "prefix": "P: ",
            "location": "Shop",
            "owner": hass_admin_user.id,
        },
    )
    await hass.async_block_till_done()
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.title == "Job"
    assert entry.options["owner"] == hass_admin_user.id


async def test_options_form_copes_with_deleted_owner(hass: HomeAssistant, entry):
    hass.config_entries.async_update_entry(
        entry, data={**entry.data, "owner": "gone-user-id"}
    )
    result = await hass.config_entries.options.async_init(entry.entry_id)
    owner = next(key for key in result["data_schema"].schema if key == "owner")
    assert owner.default() == "none"
