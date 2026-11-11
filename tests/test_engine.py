"""Engine tests. Table-driven where the shape allows it."""

from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from custom_components.roster_planner import engine
from custom_components.roster_planner.models import RosterData

TZ = ZoneInfo("Australia/Perth")  # no DST
SYDNEY = ZoneInfo("Australia/Sydney")
ANCHOR = date(2026, 11, 16)  # a Monday


def shift(shift_type_id):
    return {"type": "shift", "shift_type_id": shift_type_id}


def custom(start, end, label=None):
    return {"type": "custom", "start": start, "end": end, "label": label}


def build(patterns=None, rotations=None, variations=None, exceptions=None):
    return RosterData.from_dict(
        {
            "shift_types": [
                {"id": "open", "name": "Open", "start": "07:00", "end": "15:30"},
                {"id": "close", "name": "Close", "start": "12:00", "end": "20:30"},
                {"id": "night", "name": "Night", "start": "22:00", "end": "06:00"},
            ],
            "patterns": patterns or [],
            "rotations": rotations or [],
            "variations": variations or [],
            "exceptions": exceptions or [],
        }
    )


def rotation(slots, rid="r1", anchor=ANCHOR, **extra):
    return {
        "id": rid,
        "name": rid,
        "anchor": anchor.isoformat(),
        "cycle_weeks": len(slots),
        "slots": slots,
        "active_from": extra.pop("active_from", "2020-01-06"),
        **extra,
    }


MONDAY_ONLY = {"id": "mon", "name": "Mon", "days": {"mon": shift("open")}}
TUESDAY_ONLY = {"id": "tue", "name": "Tue", "days": {"tue": shift("close")}}
ALL_MONDAY_OFF = {"id": "off", "name": "Off", "days": {"mon": {"type": "off"}}}


def title(day, data):
    resolved = engine.resolve(day, data, TZ)
    return resolved.title if resolved else None


def test_four_week_rotation_three_full_cycles():
    """The owner's case: Tue-Sat, times varying by day and by week."""
    times = {
        week: {
            day: custom(f"{7 + week:02d}:{index * 5:02d}", "20:00", f"w{week}{day}")
            for index, day in enumerate(("tue", "wed", "thu", "fri", "sat"))
        }
        for week in range(4)
    }
    patterns = [
        {"id": f"p{week}", "name": f"P{week}", "days": days}
        for week, days in times.items()
    ]
    data = build(patterns, [rotation(["p0", "p1", "p2", "p3"])])

    for offset in range(7 * 4 * 3):
        day = ANCHOR + timedelta(days=offset)
        week = (offset // 7) % 4
        weekday = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")[offset % 7]
        resolved = engine.resolve(day, data, TZ)
        if weekday in ("mon", "sun"):
            assert resolved is None, day
            continue
        assert resolved is not None, day
        assert resolved.title == f"w{week}{weekday}"
        assert resolved.start.strftime("%H:%M") == times[week][weekday]["start"]
        assert resolved.week == week + 1


@pytest.mark.parametrize(
    ("day", "expected"),
    [
        (date(2026, 11, 9), None),  # one week before anchor: slot 1
        (date(2026, 11, 2), "Open"),  # two weeks before: slot 0
        (date(2026, 10, 26), None),
        (date(2026, 11, 16), "Open"),
    ],
)
def test_dates_before_anchor_use_floor_mod(day, expected):
    data = build([MONDAY_ONLY], [rotation(["mon", None])])
    assert title(day, data) == expected


@pytest.mark.parametrize(
    ("slots", "expected_weeks"),
    [
        (["mon"], [True, True, True, True, True, True]),
        (["mon", None], [True, False, True, False, True, False]),
        (["mon", None, None], [True, False, False, True, False, False]),
    ],
)
def test_cycle_lengths(slots, expected_weeks):
    data = build([MONDAY_ONLY], [rotation(slots)])
    for week, expected in enumerate(expected_weeks):
        day = ANCHOR + timedelta(weeks=week)
        assert (title(day, data) == "Open") is expected


def test_higher_priority_rotation_wins():
    other = {"id": "mon2", "name": "M2", "days": {"mon": shift("close")}}
    data = build(
        [MONDAY_ONLY, other],
        [
            rotation(["mon2"], "low", priority=1),
            rotation(["mon"], "high", priority=0),
        ],
    )
    assert title(ANCHOR, data) == "Open"


@pytest.mark.parametrize(
    "top", [pytest.param([None], id="empty"), pytest.param(["off"], id="off-day")]
)
def test_empty_slot_or_off_day_falls_through(top):
    data = build(
        [MONDAY_ONLY, ALL_MONDAY_OFF],
        [rotation(top, "high", priority=0), rotation(["mon"], "low", priority=1)],
    )
    assert title(ANCHOR, data) == "Open"


def test_layered_rotations_do_not_block_each_other():
    data = build(
        [MONDAY_ONLY, TUESDAY_ONLY],
        [rotation(["tue"], "main", priority=0), rotation(["mon"], "m", priority=1)],
    )
    assert title(ANCHOR, data) == "Open"
    assert title(ANCHOR + timedelta(days=1), data) == "Close"


@pytest.mark.parametrize(
    ("day", "expected"),
    [
        (date(2026, 11, 9), None),
        (date(2026, 11, 16), "Open"),  # active_from inclusive
        (date(2026, 11, 23), "Open"),  # active_until inclusive
        (date(2026, 11, 30), None),
    ],
)
def test_rotation_active_bounds_inclusive(day, expected):
    data = build(
        [MONDAY_ONLY],
        [rotation(["mon"], active_from="2026-11-16", active_until="2026-11-23")],
    )
    assert title(day, data) == expected


def variation(**extra):
    return {
        "id": "v1",
        "name": "Christmas",
        "start_date": "2026-11-23",
        "end_date": "2026-11-30",
        **extra,
    }


@pytest.mark.parametrize(
    ("day", "expected"),
    [
        (date(2026, 11, 16), "Open"),
        (date(2026, 11, 23), None),  # start inclusive; pattern has Monday off
        (date(2026, 11, 24), "Close"),
        (date(2026, 11, 30), None),  # end inclusive
        (date(2026, 12, 7), "Open"),  # reverts afterwards
    ],
)
def test_variation_pattern_mode_replaces_whole_week(day, expected):
    data = build(
        [MONDAY_ONLY, TUESDAY_ONLY],
        [rotation(["mon"])],
        [variation(mode="pattern", pattern_id="tue")],
    )
    assert title(day, data) == expected


def test_variation_days_mode_unlisted_days_fall_through():
    data = build(
        [
            {
                "id": "p",
                "name": "P",
                "days": {"mon": shift("open"), "tue": shift("open")},
            }
        ],
        [rotation(["p"])],
        [variation(mode="days", days={"tue": shift("close")})],
    )
    assert title(date(2026, 11, 23), data) == "Open"
    assert title(date(2026, 11, 24), data) == "Close"


def test_variation_days_mode_listed_off_cancels():
    data = build(
        [MONDAY_ONLY],
        [rotation(["mon"])],
        [variation(mode="days", days={"mon": {"type": "off"}})],
    )
    assert title(date(2026, 11, 23), data) is None


def test_day_after_variation_end_reverts():
    data = build(
        [{"id": "p", "name": "P", "days": {"tue": shift("open")}}, TUESDAY_ONLY],
        [rotation(["p"])],
        [variation(mode="pattern", pattern_id="tue", end_date="2026-11-30")],
    )
    assert title(date(2026, 11, 24), data) == "Close"
    assert title(date(2026, 12, 1), data) == "Open"


def test_exception_beats_variation_and_rotation():
    data = build(
        [MONDAY_ONLY, TUESDAY_ONLY],
        [rotation(["tue"])],
        [variation(mode="pattern", pattern_id="tue")],
        [{"date": "2026-11-24", "assignment": shift("night")}],
    )
    assert title(date(2026, 11, 24), data) == "Night"


@pytest.mark.parametrize(
    ("day", "flag"),
    [(date(2026, 11, 16), "changed"), (date(2026, 11, 17), "extra")],
)
def test_exception_flags(day, flag):
    data = build(
        [MONDAY_ONLY],
        [rotation(["mon"])],
        exceptions=[{"date": day.isoformat(), "assignment": shift("close")}],
    )
    resolved = engine.resolve(day, data, TZ)
    assert resolved.flag == flag
    assert resolved.source == "exception"


def test_off_exception_cancels_and_clearing_restores():
    data = build(
        [MONDAY_ONLY],
        [rotation(["mon"])],
        exceptions=[{"date": "2026-11-16", "assignment": {"type": "off"}}],
    )
    assert title(ANCHOR, data) is None
    data.clear_exception(ANCHOR)
    assert title(ANCHOR, data) == "Open"


def test_note_only_exception_follows_the_roster():
    data = build(
        [MONDAY_ONLY, TUESDAY_ONLY],
        [rotation(["mon"])],
        exceptions=[
            {"date": "2026-11-16", "note": "Bring keys"},
            {"date": "2026-11-17", "note": "Dentist"},
        ],
    )
    resolved = engine.resolve(ANCHOR, data, TZ)
    assert (resolved.title, resolved.source, resolved.flag, resolved.week) == (
        "Open",
        "rotation",
        None,
        1,
    )
    assert resolved.note == "Bring keys"
    # On a day off the note stays in the exception but there is no shift.
    detail = engine.day_detail(date(2026, 11, 17), data, TZ)
    assert detail.shift is None
    assert detail.exception.note == "Dentist"
    # A later rule change still applies to the noted day.
    data.rotations["r1"].slots = ["tue"]
    assert title(ANCHOR, data) is None
    assert title(date(2026, 11, 17), data) == "Close"


def test_note_only_day_detail_keeps_base_without_note():
    data = build(
        [MONDAY_ONLY],
        [rotation(["mon"])],
        exceptions=[{"date": "2026-11-16", "note": "Bring keys"}],
    )
    detail = engine.day_detail(ANCHOR, data, TZ)
    assert detail.shift.note == "Bring keys"
    assert detail.base.note is None


def night_data():
    return build(
        [{"id": "n", "name": "N", "days": {"mon": shift("night")}}],
        [rotation(["n"])],
    )


def test_shift_crossing_midnight_ends_next_day():
    resolved = engine.resolve(ANCHOR, night_data(), TZ)
    assert resolved.start == datetime(2026, 11, 16, 22, 0, tzinfo=TZ)
    assert resolved.end == datetime(2026, 11, 17, 6, 0, tzinfo=TZ)


def test_shift_crossing_midnight_appears_in_next_day_range():
    start = datetime(2026, 11, 17, 0, 0, tzinfo=TZ)
    shifts = engine.shifts_overlapping(
        start, start + timedelta(days=1), night_data(), TZ
    )
    assert [s.date for s in shifts] == [ANCHOR]


def test_shift_crossing_midnight_is_current_at_0030():
    now = datetime(2026, 11, 17, 0, 30, tzinfo=TZ)
    current = engine.current_or_next(now, night_data(), TZ)
    assert current.date == ANCHOR
    assert current.start <= now < current.end


def test_range_excludes_shifts_touching_only_the_boundary():
    data = night_data()
    end = datetime(2026, 11, 16, 22, 0, tzinfo=TZ)
    assert engine.shifts_overlapping(end - timedelta(hours=1), end, data, TZ) == []
    start = datetime(2026, 11, 17, 6, 0, tzinfo=TZ)
    assert engine.shifts_overlapping(start, start + timedelta(hours=1), data, TZ) == []


def test_next_lookup_respects_lookahead():
    data = build([MONDAY_ONLY], [rotation(["mon", None, None, None, None, None])])
    now = datetime(2026, 11, 17, 0, 0, tzinfo=TZ)
    assert engine.current_or_next(now, data, TZ, lookahead_days=7) is None
    found = engine.current_or_next(now, data, TZ, lookahead_days=60)
    assert found.date == ANCHOR + timedelta(weeks=6)


def test_next_start_skips_running_shift():
    data = build(
        [
            {
                "id": "p",
                "name": "P",
                "days": {"mon": shift("open"), "tue": shift("open")},
            }
        ],
        [rotation(["p"])],
    )
    now = datetime(2026, 11, 16, 8, 0, tzinfo=TZ)
    assert engine.next_start(now, data, TZ).date == date(2026, 11, 17)


def sydney_data(start, end, weekday="sun"):
    return build(
        [{"id": "p", "name": "P", "days": {weekday: custom(start, end)}}],
        [rotation(["p"], anchor=date(2026, 9, 28))],
    )


# Sydney: clocks go forward at 02:00 on 2026-10-04, back at 03:00 on 2026-04-05.
@pytest.mark.parametrize(
    ("day", "start", "end", "hours"),
    [
        pytest.param(date(2026, 10, 3), "22:00", "06:00", 7, id="spring-forward"),
        pytest.param(date(2026, 4, 4), "22:00", "06:00", 9, id="fall-back"),
        pytest.param(date(2026, 10, 10), "22:00", "06:00", 8, id="ordinary"),
    ],
)
def test_dst_changeover_shift_length(day, start, end, hours):
    data = sydney_data(start, end, "sat")
    resolved = engine.resolve(day, data, SYDNEY)
    length = resolved.end.astimezone(UTC) - resolved.start.astimezone(UTC)
    assert length == timedelta(hours=hours)
    assert resolved.start.strftime("%H:%M") == start
    assert resolved.end.strftime("%H:%M") == end


def test_dst_gap_shift_still_has_positive_length():
    data = sydney_data("02:15", "02:45")
    resolved = engine.resolve(date(2026, 10, 4), data, SYDNEY)
    length = resolved.end.astimezone(UTC) - resolved.start.astimezone(UTC)
    assert length == timedelta(minutes=30)


def test_dst_current_shift_uses_real_time():
    data = sydney_data("22:00", "06:00", "sat")
    # 05:30 AEDT on the Sunday is 18:30 UTC on the Saturday: still running.
    now = datetime(2026, 10, 3, 18, 30, tzinfo=UTC)
    assert engine.current_or_next(now, data, SYDNEY).date == date(2026, 10, 3)


def test_day_detail_reports_base_and_variation():
    data = build(
        [MONDAY_ONLY, TUESDAY_ONLY],
        [rotation(["mon"])],
        [variation(mode="days", days={"tue": shift("close")})],
        [{"date": "2026-11-23", "assignment": {"type": "off"}}],
    )
    detail = engine.day_detail(date(2026, 11, 23), data, TZ)
    assert detail.shift is None
    assert detail.base.title == "Open"
    assert detail.exception is not None
    assert detail.variation_id == "v1"


def test_day_detail_flags_overlap_with_previous_night():
    data = build(
        [
            {
                "id": "p",
                "name": "P",
                "days": {"mon": shift("night"), "tue": custom("05:00", "09:00")},
            }
        ],
        [rotation(["p"])],
    )
    assert engine.day_detail(date(2026, 11, 17), data, TZ).overlaps_previous
    assert not engine.day_detail(ANCHOR, data, TZ).overlaps_previous


def test_day_details_is_inclusive():
    details = engine.day_details(ANCHOR, ANCHOR + timedelta(days=6), build(), TZ)
    assert len(details) == 7


def test_day_details_matches_day_by_day():
    data = build(
        [
            {
                "id": "p",
                "name": "P",
                "days": {"mon": shift("night"), "tue": custom("05:00", "09:00")},
            }
        ],
        [rotation(["p"])],
        [variation(mode="days", days={"wed": shift("close")})],
        [{"date": "2026-11-17", "assignment": {"type": "off"}}],
    )
    start, end = ANCHOR - timedelta(days=3), ANCHOR + timedelta(days=20)
    one_by_one = [
        engine.day_detail(start + timedelta(days=offset), data, TZ)
        for offset in range((end - start).days + 1)
    ]
    assert engine.day_details(start, end, data, TZ) == one_by_one
