"""Next shift sensor tests."""

from datetime import datetime

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import async_fire_time_changed

START = "sensor.work_next_shift_start"
END = "sensor.work_next_shift_end"


@pytest.fixture(autouse=True)
async def set_timezone(hass: HomeAssistant):
    await hass.config.async_set_time_zone("Australia/Perth")


def local(*args) -> datetime:
    return datetime(*args, tzinfo=dt_util.get_default_time_zone())


def iso(value: datetime) -> str:
    return dt_util.as_utc(value).isoformat()


async def seed(entry) -> None:
    store = entry.runtime_data
    shift_type = await store.async_mutate(
        lambda d: d.create_shift_type(
            {"name": "Open", "start": "07:00", "end": "15:30"}
        )
    )
    pattern = await store.async_mutate(
        lambda d: d.create_pattern(
            {
                "name": "A",
                "days": {
                    day: {"type": "shift", "shift_type_id": shift_type.id}
                    for day in ("mon", "tue")
                },
            }
        )
    )
    await store.async_mutate(
        lambda d: d.create_rotation(
            {
                "name": "R",
                "anchor": "2026-11-16",
                "cycle_weeks": 1,
                "slots": [pattern.id],
            }
        )
    )


async def tick(hass: HomeAssistant, freezer: FrozenDateTimeFactory, when: datetime):
    freezer.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()


async def test_unknown_with_no_shifts(hass: HomeAssistant, entry):
    assert hass.states.get(START).state == "unknown"
    assert hass.states.get(END).state == "unknown"


async def test_device_class(hass: HomeAssistant, entry):
    assert hass.states.get(START).attributes["device_class"] == "timestamp"


async def test_values_before_shift(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    freezer.move_to(local(2026, 11, 16, 6, 0))
    await seed(entry)
    assert hass.states.get(START).state == iso(local(2026, 11, 16, 7, 0))
    assert hass.states.get(END).state == iso(local(2026, 11, 16, 15, 30))


async def test_start_moves_on_when_shift_starts_but_end_stays(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    freezer.move_to(local(2026, 11, 16, 6, 0))
    await seed(entry)
    await tick(hass, freezer, local(2026, 11, 16, 7, 0))
    assert hass.states.get(START).state == iso(local(2026, 11, 17, 7, 0))
    assert hass.states.get(END).state == iso(local(2026, 11, 16, 15, 30))


async def test_end_moves_on_when_shift_ends(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    freezer.move_to(local(2026, 11, 16, 8, 0))
    await seed(entry)
    await tick(hass, freezer, local(2026, 11, 16, 15, 30))
    assert hass.states.get(END).state == iso(local(2026, 11, 17, 15, 30))


async def test_rule_change_updates_sensors(
    hass: HomeAssistant, entry, freezer: FrozenDateTimeFactory
):
    freezer.move_to(local(2026, 11, 16, 6, 0))
    await seed(entry)
    await entry.runtime_data.async_mutate(
        lambda d: d.set_exception({"date": "2026-11-16", "assignment": {"type": "off"}})
    )
    assert hass.states.get(START).state == iso(local(2026, 11, 17, 7, 0))


async def test_timezone_change_recomputes(hass: HomeAssistant, entry, freezer):
    await tick(hass, freezer, datetime(2026, 11, 16, 1, 0, tzinfo=dt_util.UTC))
    await seed(entry)
    before = hass.states.get(START).state
    await hass.config.async_update(time_zone="Europe/London")
    await hass.async_block_till_done()
    after = hass.states.get(START).state
    assert before != after
    assert (
        dt_util.parse_datetime(after)
        .astimezone(dt_util.get_time_zone("Europe/London"))
        .strftime("%H:%M")
        == "07:00"
    )
