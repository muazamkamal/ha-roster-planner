"""Model validation, CRUD and round-trip tests."""

from datetime import date

import pytest

from custom_components.roster_planner.models import RosterData, ValidationError

SHIFT = {"name": "Open", "start": "07:00", "end": "15:30", "colour": "#4caf50"}
ROTATION = {"name": "Main", "anchor": "2026-11-16", "cycle_weeks": 1, "slots": [None]}
VARIATION = {
    "name": "Xmas",
    "start_date": "2026-12-14",
    "end_date": "2026-12-27",
    "mode": "days",
    "days": {"mon": {"type": "off"}},
}


def expect(code, field, func, *args):
    with pytest.raises(ValidationError) as err:
        func(*args)
    assert err.value.code == code
    assert err.value.field == field


@pytest.mark.parametrize(
    ("change", "code", "field"),
    [
        ({"start": "25:00"}, "invalid_time", "start"),
        ({"start": "7:00"}, "invalid_time", "start"),
        ({"end": "07:00"}, "invalid_time_range", "end"),
        ({"colour": "red"}, "invalid_colour", "colour"),
        ({"name": "  "}, "invalid_name", "name"),
        ({"name": None}, "required", "name"),
    ],
)
def test_shift_type_validation(change, code, field):
    expect(code, field, RosterData().create_shift_type, {**SHIFT, **change})


@pytest.mark.parametrize(
    ("change", "code", "field"),
    [
        ({"anchor": "2026-11-17"}, "anchor_not_monday", "anchor"),
        ({"cycle_weeks": 13, "slots": [None] * 13}, "invalid_cycle", "cycle_weeks"),
        ({"cycle_weeks": 0, "slots": []}, "invalid_cycle", "cycle_weeks"),
        ({"cycle_weeks": 2}, "invalid_slots", "slots"),
        ({"slots": ["ghost"]}, "unknown_pattern", "slots"),
        (
            {"active_from": "2026-11-16", "active_until": "2026-11-15"},
            "invalid_date_range",
            "active_until",
        ),
    ],
)
def test_rotation_validation(change, code, field):
    expect(code, field, RosterData().create_rotation, {**ROTATION, **change})


def test_active_until_may_equal_active_from():
    RosterData().create_rotation(
        {**ROTATION, "active_from": "2026-11-16", "active_until": "2026-11-16"}
    )


def test_new_rotations_go_below_existing():
    data = RosterData()
    assert data.create_rotation(ROTATION).priority == 0
    assert data.create_rotation(ROTATION).priority == 1


def test_variations_may_not_overlap_and_error_names_them():
    data = RosterData()
    data.create_variation(VARIATION)
    with pytest.raises(ValidationError) as err:
        data.create_variation({**VARIATION, "name": "Other"})
    assert err.value.code == "variation_overlap"
    assert "Xmas" in err.value.message


def test_adjacent_variations_are_allowed():
    data = RosterData()
    data.create_variation(VARIATION)
    data.create_variation(
        {**VARIATION, "start_date": "2026-12-28", "end_date": "2026-12-30"}
    )


@pytest.mark.parametrize(
    ("change", "code", "field"),
    [
        ({"end_date": "2026-12-13"}, "invalid_date_range", "end_date"),
        ({"mode": "weird"}, "invalid_mode", "mode"),
        ({"days": {}}, "required", "days"),
        ({"days": {"funday": {"type": "off"}}}, "invalid_weekday", "days"),
        ({"mode": "pattern"}, "required", "pattern_id"),
        ({"mode": "pattern", "pattern_id": "ghost"}, "unknown_pattern", "pattern_id"),
    ],
)
def test_variation_validation(change, code, field):
    expect(code, field, RosterData().create_variation, {**VARIATION, **change})


def test_pattern_day_errors_name_the_day():
    expect(
        "invalid_time",
        "days.wed.start",
        RosterData().create_pattern,
        {
            "name": "P",
            "days": {"wed": {"type": "custom", "start": "x", "end": "10:00"}},
        },
    )


def test_pattern_rejects_unknown_shift_type():
    expect(
        "unknown_shift_type",
        "days.mon.shift_type_id",
        RosterData().create_pattern,
        {"name": "P", "days": {"mon": {"type": "shift", "shift_type_id": "ghost"}}},
    )


def populated():
    data = RosterData()
    shift_type = data.create_shift_type(SHIFT)
    pattern = data.create_pattern(
        {
            "name": "Week A",
            "days": {"mon": {"type": "shift", "shift_type_id": shift_type.id}},
        }
    )
    data.create_rotation({**ROTATION, "slots": [pattern.id]})
    return data, shift_type, pattern


def test_deleting_used_shift_type_is_blocked_and_lists_usage():
    data, shift_type, _ = populated()
    with pytest.raises(ValidationError) as err:
        data.delete_shift_type(shift_type.id)
    assert err.value.code == "in_use"
    assert "Week A" in err.value.message


def test_deleting_shift_type_with_replacement():
    data, shift_type, pattern = populated()
    other = data.create_shift_type({**SHIFT, "name": "Other"})
    data.delete_shift_type(shift_type.id, replace_with=other.id)
    assert shift_type.id not in data.shift_types
    assert data.patterns[pattern.id].days["mon"].shift_type_id == other.id


def test_deleting_used_pattern_is_blocked():
    data, _, pattern = populated()
    with pytest.raises(ValidationError) as err:
        data.delete_pattern(pattern.id)
    assert err.value.code == "in_use"
    assert "Main" in err.value.message


def test_deleting_pattern_with_replacement():
    data, _, pattern = populated()
    other = data.create_pattern({"name": "Week B"})
    data.delete_pattern(pattern.id, replace_with=other.id)
    assert next(iter(data.rotations.values())).slots == [other.id]


def test_replacement_must_differ():
    data, shift_type, _ = populated()
    expect(
        "invalid_replacement",
        "replace_with",
        data.delete_shift_type,
        shift_type.id,
        shift_type.id,
    )


def test_update_merges_and_keeps_id():
    data, shift_type, _ = populated()
    updated = data.update_shift_type(shift_type.id, {"name": "Early"})
    assert updated.id == shift_type.id
    assert updated.name == "Early"
    assert updated.start == "07:00"


def test_update_unknown_id():
    expect("not_found", "id", RosterData().update_rotation, "nope", {})


def test_exception_set_replaces_and_clear_removes():
    data = RosterData()
    data.set_exception({"date": "2026-11-21", "assignment": {"type": "off"}})
    data.set_exception(
        {
            "date": "2026-11-21",
            "assignment": {"type": "custom", "start": "09:00", "end": "10:00"},
        }
    )
    assert len(data.exceptions) == 1
    assert data.exceptions[date(2026, 11, 21)].assignment.type == "custom"
    data.clear_exception(date(2026, 11, 21))
    assert not data.exceptions


def test_round_trip():
    data, shift_type, _ = populated()
    data.create_variation(VARIATION)
    data.set_exception(
        {
            "date": "2026-11-21",
            "assignment": {"type": "shift", "shift_type_id": shift_type.id},
            "note": "Swapped",
        }
    )
    assert RosterData.from_dict(data.to_dict()).to_dict() == data.to_dict()


@pytest.mark.parametrize(
    ("payload", "code"),
    [
        ("nope", "invalid_format"),
        ({"version": 99}, "unsupported_version"),
        ({"shift_types": "x"}, "invalid_format"),
        ({"shift_types": [SHIFT | {"id": "a"}, SHIFT | {"id": "a"}]}, "duplicate_id"),
        (
            {
                "exceptions": [
                    {"date": "2026-01-01", "assignment": {"type": "off"}},
                    {"date": "2026-01-01", "assignment": {"type": "off"}},
                ]
            },
            "duplicate_date",
        ),
        ({"rotations": [{**ROTATION, "slots": ["ghost"]}]}, "unknown_pattern"),
        # A hand-edited backup can hold any JSON type where text belongs.
        ({"shift_types": [SHIFT | {"id": 7}]}, "invalid_format"),
        ({"shift_types": [SHIFT | {"notes": ["x"]}]}, "invalid_format"),
        (
            {
                "patterns": [
                    {
                        "name": "P",
                        "days": {"mon": {"type": "shift", "shift_type_id": ["x"]}},
                    }
                ]
            },
            "invalid_format",
        ),
        (
            {"variations": [VARIATION | {"mode": "pattern", "pattern_id": {}}]},
            "invalid_format",
        ),
        (
            {"exceptions": [{"date": "20260101", "assignment": {"type": "off"}}]},
            "invalid_date",
        ),
        (
            {"exceptions": [{"date": 20260101, "assignment": {"type": "off"}}]},
            "invalid_date",
        ),
    ],
)
def test_import_rejects_bad_data(payload, code):
    with pytest.raises(ValidationError) as err:
        RosterData.from_dict(payload)
    assert err.value.code == code


def test_with_draft_leaves_original_untouched():
    data = RosterData()
    draft = data.with_draft("rotation", ROTATION)
    assert len(draft.rotations) == 1
    assert not data.rotations


def test_with_draft_replaces_same_id():
    data = RosterData()
    existing = data.create_variation(VARIATION)
    draft = data.with_draft(
        "variation", {**VARIATION, "id": existing.id, "name": "Edited"}
    )
    assert draft.variations[existing.id].name == "Edited"
    assert len(draft.variations) == 1


def test_with_draft_new_rotation_gets_same_priority_as_saving():
    data = RosterData()
    data.create_rotation({**ROTATION, "priority": 3})
    draft = data.with_draft("rotation", {**ROTATION, "id": "new"})
    assert draft.rotations["new"].priority == 4
