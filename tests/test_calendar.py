"""Calendar entity, services, and lifecycle tests."""

from datetime import date, datetime, timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import (
    HomeAssistantError,
    ServiceValidationError,
    Unauthorized,
)
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


async def create(hass: HomeAssistant, **fields):
    await hass.services.async_call(
        CALENDAR_DOMAIN,
        "create_event",
        {"entity_id": ENTITY, "summary": "Training", **fields},
        blocking=True,
    )


async def test_create_event_becomes_exception(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    await create(
        hass,
        start_date_time="2026-11-17 09:00:00",
        end_date_time="2026-11-17 10:00:00",
        description="Room 2",
    )
    exception = entry.runtime_data.data.exceptions[date(2026, 11, 17)]
    assert exception.assignment.type == "custom"
    assert exception.assignment.label == "Training"
    assert exception.note == "Room 2"


async def test_create_event_matching_shift_type_uses_it(hass: HomeAssistant, entry):
    shift_type_id = await add_roster(entry, {"mon": "open"})
    await create(
        hass,
        summary="Open",
        start_date_time="2026-11-17 07:00:00",
        end_date_time="2026-11-17 15:30:00",
    )
    exception = entry.runtime_data.data.exceptions[date(2026, 11, 17)]
    assert exception.assignment.shift_type_id == shift_type_id


async def test_create_event_crossing_midnight(hass: HomeAssistant, entry):
    await create(
        hass,
        start_date_time="2026-11-17 22:00:00",
        end_date_time="2026-11-18 06:00:00",
    )
    found = await events(hass, local(2026, 11, 18), local(2026, 11, 19))
    assert found[0]["summary"] == "Training"


@pytest.mark.parametrize(
    "fields",
    [
        {"start_date": "2026-11-17", "end_date": "2026-11-18"},
        {
            "start_date_time": "2026-11-17 09:00:00",
            "end_date_time": "2026-11-19 09:00:00",
        },
    ],
)
async def test_create_event_rejects_unsupported(hass: HomeAssistant, entry, fields):
    with pytest.raises(HomeAssistantError):
        await create(hass, **fields)
    assert not entry.runtime_data.data.exceptions


def calendar_entity(hass: HomeAssistant):
    return hass.data[CALENDAR_DOMAIN].get_entity(ENTITY)


def uid(entry, day: str) -> str:
    return f"{entry.entry_id}-{day}"


async def test_create_event_rejects_rrule(hass: HomeAssistant, entry):
    with pytest.raises(HomeAssistantError):
        await calendar_entity(hass).async_create_event(
            dtstart=local(2026, 11, 17, 9),
            dtend=local(2026, 11, 17, 10),
            summary="x",
            rrule="FREQ=WEEKLY",
        )


async def test_delete_rostered_event_marks_off(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    await calendar_entity(hass).async_delete_event(uid(entry, MONDAY))
    assert await events(hass, local(2026, 11, 16), local(2026, 11, 17)) == []
    assert entry.runtime_data.data.exceptions[date(2026, 11, 16)].assignment.type == (
        "off"
    )


async def test_delete_extra_event_removes_exception(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    await create(
        hass,
        start_date_time="2026-11-17 09:00:00",
        end_date_time="2026-11-17 10:00:00",
    )
    await calendar_entity(hass).async_delete_event(uid(entry, "2026-11-17"))
    assert not entry.runtime_data.data.exceptions


async def test_delete_rejects_foreign_uid_and_series(hass: HomeAssistant, entry):
    entity = calendar_entity(hass)
    with pytest.raises(HomeAssistantError):
        await entity.async_delete_event("other-2026-11-16")
    with pytest.raises(HomeAssistantError):
        await entity.async_delete_event(
            uid(entry, MONDAY), recurrence_range="THISANDFUTURE"
        )


async def test_update_event_changes_times(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    await calendar_entity(hass).async_update_event(
        uid(entry, MONDAY),
        {
            "dtstart": local(2026, 11, 16, 8),
            "dtend": local(2026, 11, 16, 12),
            "summary": "Open",
        },
    )
    found = await events(hass, local(2026, 11, 16), local(2026, 11, 17))
    assert found[0]["start"].startswith("2026-11-16T08:00:00")


async def test_update_event_moving_date_cancels_old_day(hass: HomeAssistant, entry):
    await add_roster(entry, {"mon": "open"})
    await calendar_entity(hass).async_update_event(
        uid(entry, MONDAY),
        {
            "dtstart": local(2026, 11, 17, 7),
            "dtend": local(2026, 11, 17, 15, 30),
            "summary": "Open",
        },
    )
    found = await events(hass, local(2026, 11, 16), local(2026, 11, 18))
    assert [e["start"][:10] for e in found] == ["2026-11-17"]


async def stock_create(hass: HomeAssistant, hass_ws_client, token=None) -> dict:
    """Create an event the way the stock Calendar screen does."""
    client = await hass_ws_client(hass, token) if token else await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": "calendar/event/create",
            "entity_id": ENTITY,
            "event": {
                "summary": "Training",
                "dtstart": "2026-11-17T09:00:00+08:00",
                "dtend": "2026-11-17T10:00:00+08:00",
            },
        }
    )
    return await client.receive_json()


@pytest.fixture
async def normal_user(hass: HomeAssistant, hass_admin_user):
    """A non-admin user who, as is the default, may control every entity.

    The admin is created first because the first user becomes the owner.
    """
    return await hass.auth.async_create_user("Normal", group_ids=["system-users"])


@pytest.fixture
async def normal_token(hass: HomeAssistant, normal_user) -> str:
    refresh = await hass.auth.async_create_refresh_token(normal_user, "https://x/")
    return hass.auth.async_create_access_token(refresh)


async def test_stock_calendar_edit_denied_for_non_owner(
    hass: HomeAssistant, entry, hass_ws_client, normal_token
):
    result = await stock_create(hass, hass_ws_client, normal_token)
    assert not result["success"]
    assert not entry.runtime_data.data.exceptions


async def test_stock_calendar_edit_allowed_for_owner_and_admin(
    hass: HomeAssistant, entry, hass_ws_client, normal_user, normal_token
):
    assert (await stock_create(hass, hass_ws_client))["success"]
    await entry.runtime_data.async_mutate(
        lambda d: d.clear_exception(date(2026, 11, 17))
    )
    hass.config_entries.async_update_entry(
        entry, data={**entry.data, "owner": normal_user.id}
    )
    result = await stock_create(hass, hass_ws_client, normal_token)
    assert result["success"]
    assert date(2026, 11, 17) in entry.runtime_data.data.exceptions


async def test_create_event_service_denied_for_non_owner(
    hass: HomeAssistant, entry, normal_user
):
    with pytest.raises(Unauthorized):
        await hass.services.async_call(
            CALENDAR_DOMAIN,
            "create_event",
            {
                "entity_id": ENTITY,
                "summary": "Training",
                "start_date_time": "2026-11-17 09:00:00",
                "end_date_time": "2026-11-17 10:00:00",
            },
            blocking=True,
            context=Context(user_id=normal_user.id),
        )
    assert not entry.runtime_data.data.exceptions


async def test_set_exception_prefers_exact_shift_type_name(hass: HomeAssistant, entry):
    store = entry.runtime_data
    for name in ("open", "Open"):
        await store.async_mutate(
            lambda d, name=name: d.create_shift_type(
                {"name": name, "start": "07:00", "end": "15:30"}
            )
        )
    await hass.services.async_call(
        DOMAIN,
        "set_exception",
        {"entity_id": ENTITY, "date": MONDAY, "shift_type": "Open"},
        blocking=True,
    )
    chosen = store.data.exceptions[date(2026, 11, 16)].assignment.shift_type_id
    assert store.data.shift_types[chosen].name == "Open"
