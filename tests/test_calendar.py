"""Calendar entity, services, and lifecycle tests."""

from datetime import datetime, timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.roster_planner.const import DOMAIN

ENTITY = "calendar.work"
MONDAY = "2026-11-16"


@pytest.fixture(autouse=True)
async def set_timezone(hass: HomeAssistant):
    await hass.config.async_set_time_zone("Australia/Perth")


async def add_roster(entry: MockConfigEntry, days: dict) -> str:
    store = entry.runtime_data
    shift_type = await store.async_mutate(
        lambda d: d.create_shift_type(
            {"name": "Open", "start": "07:00", "end": "15:30"}
        )
    )
    night = await store.async_mutate(
        lambda d: d.create_shift_type(
            {"name": "Night", "start": "22:00", "end": "06:00"}
        )
    )
    ids = {"open": shift_type.id, "night": night.id}
    pattern = await store.async_mutate(
        lambda d: d.create_pattern(
            {
                "name": "A",
                "days": {
                    day: {"type": "shift", "shift_type_id": ids[kind]}
                    for day, kind in days.items()
                },
            }
        )
    )
    await store.async_mutate(
        lambda d: d.create_rotation(
            {
                "name": "Main roster",
                "anchor": MONDAY,
                "cycle_weeks": 1,
                "slots": [pattern.id],
            }
        )
    )
    return shift_type.id


def local(*args) -> datetime:
    return datetime(*args, tzinfo=dt_util.get_default_time_zone())


async def events(hass: HomeAssistant, start: datetime, end: datetime) -> list[dict]:
    result = await hass.services.async_call(
        CALENDAR_DOMAIN,
        "get_events",
        {
            "entity_id": ENTITY,
            "start_date_time": start.isoformat(),
            "end_date_time": end.isoformat(),
        },
        blocking=True,
        return_response=True,
    )
    return result[ENTITY]["events"]


async def tick(hass: HomeAssistant, freezer: FrozenDateTimeFactory, when: datetime):
    freezer.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()


async def test_events_one_per_working_day(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open", "tue": "open"})
    found = await events(hass, local(2026, 11, 16), local(2026, 11, 23))
    assert [e["summary"] for e in found] == ["Open", "Open"]
    assert found[0]["start"].startswith("2026-11-16T07:00:00")
    assert found[0]["description"] == "Main roster · Week 1"


@pytest.mark.parametrize(
    "entry_data",
    [{"name": "Work", "prefix": "Job: ", "location": "Shop", "owner": None}],
)
async def test_prefix_and_location(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    found = await events(hass, local(2026, 11, 16), local(2026, 11, 17))
    assert found[0]["summary"] == "Job: Open"
    assert found[0]["location"] == "Shop"


async def test_cross_midnight_in_next_day_range(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "night"})
    found = await events(hass, local(2026, 11, 17), local(2026, 11, 18))
    assert [e["summary"] for e in found] == ["Night"]


async def test_state_flips_on_at_start_and_off_at_end(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    freezer.move_to(local(2026, 11, 16, 6, 0))
    await add_roster(entry, {"mon": "open"})
    assert hass.states.get(ENTITY).state == "off"
    await tick(hass, freezer, local(2026, 11, 16, 7, 0))
    assert hass.states.get(ENTITY).state == "on"
    await tick(hass, freezer, local(2026, 11, 16, 15, 30))
    assert hass.states.get(ENTITY).state == "off"


async def test_state_on_at_0030_during_night_shift(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    freezer.move_to(local(2026, 11, 17, 0, 30))
    await add_roster(entry, {"mon": "night"})
    assert hass.states.get(ENTITY).state == "on"


async def test_rule_change_updates_state_immediately(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    freezer.move_to(local(2026, 11, 16, 8, 0))
    await add_roster(entry, {"mon": "open"})
    assert hass.states.get(ENTITY).state == "on"
    await hass.services.async_call(
        DOMAIN,
        "set_exception",
        {"entity_id": ENTITY, "date": MONDAY, "off": True},
        blocking=True,
    )
    assert hass.states.get(ENTITY).state == "off"


async def test_daily_refresh_finds_shift_beyond_lookahead(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    """With no event known no alarm exists, so the daily refresh must find it."""
    freezer.move_to(local(2026, 11, 16, 12, 0))
    store = entry.runtime_data
    shift_day = dt_util.parse_datetime("2027-01-20T00:00:00+08:00").date()
    await store.async_mutate(
        lambda d: d.set_exception(
            {
                "date": shift_day,
                "assignment": {"type": "custom", "start": "09:00", "end": "10:00"},
            }
        )
    )
    assert hass.states.get(ENTITY).attributes.get("start_time") is None
    midnight = local(2026, 11, 22, 0, 0, 5)
    await tick(hass, freezer, midnight)
    assert hass.states.get(ENTITY).attributes["start_time"] == "2027-01-20 09:00:00"


async def test_set_exception_with_shift_type_name(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    await hass.services.async_call(
        DOMAIN,
        "set_exception",
        {"entity_id": ENTITY, "date": "2026-11-17", "shift_type": "open"},
        blocking=True,
    )
    found = await events(hass, local(2026, 11, 17), local(2026, 11, 18))
    assert found[0]["description"] == "Extra shift"


async def test_set_exception_custom_then_clear(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    await hass.services.async_call(
        DOMAIN,
        "set_exception",
        {
            "entity_id": ENTITY,
            "date": MONDAY,
            "start": "09:00",
            "end": "10:00",
            "label": "Training",
            "note": "Room 2",
        },
        blocking=True,
    )
    found = await events(hass, local(2026, 11, 16), local(2026, 11, 17))
    assert found[0]["summary"] == "Training"
    assert found[0]["description"] == "Changed shift\nRoom 2"
    await hass.services.async_call(
        DOMAIN,
        "clear_exception",
        {"entity_id": ENTITY, "date": MONDAY},
        blocking=True,
    )
    found = await events(hass, local(2026, 11, 16), local(2026, 11, 17))
    assert found[0]["summary"] == "Open"


@pytest.mark.parametrize(
    "fields",
    [
        {},
        {"off": True, "shift_type": "Open"},
        {"shift_type": "Ghost"},
        {"start": "09:00"},
        {"start": "bad", "end": "10:00"},
    ],
)
async def test_set_exception_rejects_bad_input(hass: HomeAssistant, entry, fields):
    await add_roster(entry, {"mon": "open"})
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            "set_exception",
            {"entity_id": ENTITY, "date": MONDAY, **fields},
            blocking=True,
        )


async def test_service_denied_for_non_owner(
    hass: HomeAssistant, entry, hass_read_only_user
):
    with pytest.raises(Unauthorized):
        await hass.services.async_call(
            DOMAIN,
            "set_exception",
            {"entity_id": ENTITY, "date": MONDAY, "off": True},
            blocking=True,
            context=Context(user_id=hass_read_only_user.id),
        )


async def test_unload_and_reload_keeps_data(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    found = await events(hass, local(2026, 11, 16), local(2026, 11, 17))
    assert len(found) == 1


async def test_data_persists_through_storage(
    hass: HomeAssistant, entry, hass_storage, freezer: FrozenDateTimeFactory
):
    await add_roster(entry, {"mon": "open"})
    freezer.tick(timedelta(seconds=30))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    stored = hass_storage[f"{DOMAIN}.{entry.entry_id}"]["data"]
    assert stored["version"] == 1
    assert stored["shift_types"][0]["name"] == "Open"


async def test_remove_entry_deletes_storage(hass: HomeAssistant, entry, hass_storage):
    await add_roster(entry, {"mon": "open"})
    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert f"{DOMAIN}.{entry.entry_id}" not in hass_storage
