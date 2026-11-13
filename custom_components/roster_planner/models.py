"""Roster data model: dataclasses, (de)serialisation, validation and CRUD.

Pure Python with no Home Assistant imports, so it is testable on its own. Mutators
change the instance in place and validate the whole roster before returning; callers
that need all-or-nothing behaviour run them on a copy (see ``store.py``).
"""

from __future__ import annotations

import copy
from dataclasses import dataclass, field
from datetime import date, datetime
import itertools
import re
import secrets
from typing import Any

SCHEMA_VERSION = 1
WEEKDAYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
MIN_CYCLE_WEEKS = 1
MAX_CYCLE_WEEKS = 12

_TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_COLOUR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
DEFAULT_SHIFT_NAME = "Shift"


class ValidationError(Exception):
    """A rule was broken. Carries what the UI needs to show it inline."""

    def __init__(self, code: str, message: str, field: str | None = None) -> None:
        """Store the structured error."""
        super().__init__(message)
        self.code = code
        self.message = message
        self.field = field


def new_id() -> str:
    """Return a short random id."""
    return secrets.token_hex(4)


def _require(payload: Any, key: str) -> Any:
    if not isinstance(payload, dict) or payload.get(key) is None:
        raise ValidationError("required", f"{key} is required", key)
    return payload[key]


def _name(payload: dict[str, Any]) -> str:
    value = _require(payload, "name")
    if not isinstance(value, str) or not value.strip():
        raise ValidationError("invalid_name", "Name cannot be empty", "name")
    return value.strip()


def _text(payload: dict[str, Any], key: str) -> str | None:
    """Return optional free text, with blank treated as absent."""
    value = payload.get(key)
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValidationError("invalid_format", f"{key} must be text", key)
    return value.strip() or None


def _ref(payload: Any, key: str) -> str:
    """Return a required reference to another item's id."""
    value = _require(payload, key)
    if not isinstance(value, str):
        raise ValidationError("invalid_format", f"{key} must be text", key)
    return value


def _id(payload: dict[str, Any]) -> str:
    """Return the payload's id, or a new one."""
    value = payload.get("id")
    if value is None or value == "":
        return new_id()
    if not isinstance(value, str):
        raise ValidationError("invalid_format", "id must be text", "id")
    return value


def _time(value: Any, key: str) -> str:
    if not isinstance(value, str) or not _TIME_RE.match(value):
        raise ValidationError("invalid_time", "Use 24-hour HH:MM", key)
    return value


def _date(value: Any, key: str) -> date:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    # fromisoformat also takes forms like 20261224 and 2026-W52-4.
    if not isinstance(value, str) or not _DATE_RE.match(value):
        raise ValidationError("invalid_date", "Use YYYY-MM-DD", key)
    try:
        return date.fromisoformat(value)
    except ValueError as err:
        raise ValidationError("invalid_date", "Use YYYY-MM-DD", key) from err


def _check_times(start: str, end: str) -> None:
    if start == end:
        raise ValidationError(
            "invalid_time_range", "Start and end cannot be the same", "end"
        )


def _list_of_dicts(payload: dict[str, Any], key: str) -> list[dict[str, Any]]:
    value = payload.get(key, [])
    if not isinstance(value, list) or not all(isinstance(i, dict) for i in value):
        raise ValidationError("invalid_format", f"{key} must be a list", key)
    return value


@dataclass
class ShiftType:
    """A shift with fixed times and an optional name."""

    id: str
    name: str | None
    start: str
    end: str
    colour: str = "#2196f3"
    notes: str | None = None

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> ShiftType:
        """Build and validate from a payload."""
        start = _time(_require(payload, "start"), "start")
        end = _time(_require(payload, "end"), "end")
        _check_times(start, end)
        colour = payload.get("colour") or "#2196f3"
        if not isinstance(colour, str) or not _COLOUR_RE.match(colour):
            raise ValidationError("invalid_colour", "Use #RRGGBB", "colour")
        return cls(
            id=_id(payload),
            name=_text(payload, "name"),
            start=start,
            end=end,
            colour=colour,
            notes=_text(payload, "notes"),
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialise."""
        result = {
            "id": self.id,
            "name": self.name,
            "start": self.start,
            "end": self.end,
            "colour": self.colour,
        }
        if self.notes:
            result["notes"] = self.notes
        return result


@dataclass
class DayAssignment:
    """What happens on a day: a shift type, custom times, or off."""

    type: str
    shift_type_id: str | None = None
    start: str | None = None
    end: str | None = None
    label: str | None = None

    @classmethod
    def from_dict(cls, payload: Any) -> DayAssignment:
        """Build and validate from a payload."""
        kind = _require(payload, "type")
        if kind == "off":
            return cls(type="off")
        if kind == "shift":
            return cls(type="shift", shift_type_id=_ref(payload, "shift_type_id"))
        if kind == "custom":
            start = _time(_require(payload, "start"), "start")
            end = _time(_require(payload, "end"), "end")
            _check_times(start, end)
            return cls(
                type="custom",
                start=start,
                end=end,
                label=_text(payload, "label"),
            )
        raise ValidationError(
            "invalid_assignment", "Type must be shift, custom or off", "type"
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialise."""
        if self.type == "shift":
            return {"type": "shift", "shift_type_id": self.shift_type_id}
        if self.type == "custom":
            result = {"type": "custom", "start": self.start, "end": self.end}
            if self.label:
                result["label"] = self.label
            return result
        return {"type": "off"}


def _days(payload: Any, key: str) -> dict[str, DayAssignment]:
    if not isinstance(payload, dict):
        raise ValidationError("invalid_format", "Days must be an object", key)
    days: dict[str, DayAssignment] = {}
    for weekday, assignment in payload.items():
        if weekday not in WEEKDAYS:
            raise ValidationError("invalid_weekday", f"Unknown weekday {weekday}", key)
        try:
            days[weekday] = DayAssignment.from_dict(assignment)
        except ValidationError as err:
            raise ValidationError(
                err.code, err.message, f"{key}.{weekday}.{err.field}"
            ) from err
    return days


@dataclass
class WeekPattern:
    """A named Mon-Sun template. A missing day is off."""

    id: str
    name: str
    days: dict[str, DayAssignment] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> WeekPattern:
        """Build and validate from a payload."""
        return cls(
            id=_id(payload),
            name=_name(payload),
            days=_days(payload.get("days", {}), "days"),
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialise."""
        return {
            "id": self.id,
            "name": self.name,
            "days": {k: v.to_dict() for k, v in self.days.items()},
        }


@dataclass
class Rotation:
    """A cycle of week patterns counted from a Monday anchor."""

    id: str
    name: str
    anchor: date
    cycle_weeks: int
    slots: list[str | None]
    active_from: date
    active_until: date | None = None
    priority: int = 0

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> Rotation:
        """Build and validate from a payload."""
        anchor = _date(_require(payload, "anchor"), "anchor")
        if anchor.weekday() != 0:
            raise ValidationError("anchor_not_monday", "Must be a Monday", "anchor")
        cycle_weeks = _require(payload, "cycle_weeks")
        if (
            not isinstance(cycle_weeks, int)
            or isinstance(cycle_weeks, bool)
            or not MIN_CYCLE_WEEKS <= cycle_weeks <= MAX_CYCLE_WEEKS
        ):
            raise ValidationError(
                "invalid_cycle",
                f"Must be {MIN_CYCLE_WEEKS}-{MAX_CYCLE_WEEKS} weeks",
                "cycle_weeks",
            )
        slots = _require(payload, "slots")
        if not isinstance(slots, list) or len(slots) != cycle_weeks:
            raise ValidationError(
                "invalid_slots", "Need one slot per week in the cycle", "slots"
            )
        if not all(slot is None or isinstance(slot, str) for slot in slots):
            raise ValidationError(
                "invalid_slots", "A slot is a pattern or empty", "slots"
            )
        active_from = _date(payload.get("active_from") or anchor, "active_from")
        active_until = (
            _date(payload["active_until"], "active_until")
            if payload.get("active_until")
            else None
        )
        if active_until is not None and active_until < active_from:
            raise ValidationError(
                "invalid_date_range",
                "Cannot end before it starts",
                "active_until",
            )
        priority = payload.get("priority", 0)
        if not isinstance(priority, int) or isinstance(priority, bool):
            raise ValidationError(
                "invalid_priority", "Must be a whole number", "priority"
            )
        return cls(
            id=_id(payload),
            name=_name(payload),
            anchor=anchor,
            cycle_weeks=cycle_weeks,
            slots=list(slots),
            active_from=active_from,
            active_until=active_until,
            priority=priority,
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialise."""
        return {
            "id": self.id,
            "name": self.name,
            "anchor": self.anchor.isoformat(),
            "cycle_weeks": self.cycle_weeks,
            "slots": list(self.slots),
            "active_from": self.active_from.isoformat(),
            "active_until": (
                self.active_until.isoformat() if self.active_until else None
            ),
            "priority": self.priority,
        }

    def is_active(self, day: date) -> bool:
        """Return True if the rotation applies on this date (bounds inclusive)."""
        return self.active_from <= day and (
            self.active_until is None or day <= self.active_until
        )


@dataclass
class Variation:
    """A date range that temporarily replaces the rotation."""

    id: str
    name: str
    start_date: date
    end_date: date
    mode: str
    pattern_id: str | None = None
    days: dict[str, DayAssignment] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> Variation:
        """Build and validate from a payload."""
        start_date = _date(_require(payload, "start_date"), "start_date")
        end_date = _date(_require(payload, "end_date"), "end_date")
        if end_date < start_date:
            raise ValidationError(
                "invalid_date_range", "Cannot end before it starts", "end_date"
            )
        mode = _require(payload, "mode")
        if mode == "pattern":
            pattern_id = _ref(payload, "pattern_id")
            days: dict[str, DayAssignment] = {}
        elif mode == "days":
            pattern_id = None
            days = _days(payload.get("days", {}), "days")
            if not days:
                raise ValidationError("required", "Edit at least one weekday", "days")
        else:
            raise ValidationError(
                "invalid_mode", "Mode must be pattern or days", "mode"
            )
        return cls(
            id=_id(payload),
            name=_name(payload),
            start_date=start_date,
            end_date=end_date,
            mode=mode,
            pattern_id=pattern_id,
            days=days,
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialise."""
        result: dict[str, Any] = {
            "id": self.id,
            "name": self.name,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "mode": self.mode,
        }
        if self.mode == "pattern":
            result["pattern_id"] = self.pattern_id
        else:
            result["days"] = {k: v.to_dict() for k, v in self.days.items()}
        return result

    def covers(self, day: date) -> bool:
        """Return True if the date is inside the range (bounds inclusive)."""
        return self.start_date <= day <= self.end_date


@dataclass
class RosterException:
    """A one-off change on a single date.

    With no assignment the day follows the roster and only carries the note.
    """

    date: date
    assignment: DayAssignment | None
    note: str | None = None

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> RosterException:
        """Build and validate from a payload."""
        day = _date(_require(payload, "date"), "date")
        raw = payload.get("assignment")
        assignment = None if raw is None else DayAssignment.from_dict(raw)
        note = _text(payload, "note")
        if assignment is None and note is None:
            raise ValidationError("required", "Add a change or a note", "note")
        return cls(date=day, assignment=assignment, note=note)

    def to_dict(self) -> dict[str, Any]:
        """Serialise."""
        result: dict[str, Any] = {"date": self.date.isoformat()}
        if self.assignment is not None:
            result["assignment"] = self.assignment.to_dict()
        if self.note:
            result["note"] = self.note
        return result


@dataclass
class RosterData:
    """Everything stored for one roster."""

    default_shift_name: str = DEFAULT_SHIFT_NAME
    shift_types: dict[str, ShiftType] = field(default_factory=dict)
    patterns: dict[str, WeekPattern] = field(default_factory=dict)
    rotations: dict[str, Rotation] = field(default_factory=dict)
    variations: dict[str, Variation] = field(default_factory=dict)
    exceptions: dict[date, RosterException] = field(default_factory=dict)

    # Serialisation

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> RosterData:
        """Build and validate a whole roster, e.g. from storage or an import."""
        if not isinstance(payload, dict):
            raise ValidationError("invalid_format", "Expected a JSON object")
        version = payload.get("version", SCHEMA_VERSION)
        if version != SCHEMA_VERSION:
            raise ValidationError(
                "unsupported_version", f"Unsupported version {version}", "version"
            )
        data = cls()
        data.default_shift_name = (
            _text(payload, "default_shift_name") or DEFAULT_SHIFT_NAME
        )
        for key, target, parser in (
            ("shift_types", data.shift_types, ShiftType.from_dict),
            ("patterns", data.patterns, WeekPattern.from_dict),
            ("rotations", data.rotations, Rotation.from_dict),
            ("variations", data.variations, Variation.from_dict),
        ):
            for item in _list_of_dicts(payload, key):
                parsed = parser(item)
                if parsed.id in target:
                    raise ValidationError(
                        "duplicate_id", f"Duplicate id {parsed.id}", key
                    )
                target[parsed.id] = parsed  # type: ignore[assignment]
        for item in _list_of_dicts(payload, "exceptions"):
            exception = RosterException.from_dict(item)
            if exception.date in data.exceptions:
                raise ValidationError(
                    "duplicate_date",
                    f"Two exceptions on {exception.date.isoformat()}",
                    "exceptions",
                )
            data.exceptions[exception.date] = exception
        data.validate()
        return data

    def to_dict(self) -> dict[str, Any]:
        """Serialise the whole roster."""
        return {
            "version": SCHEMA_VERSION,
            "default_shift_name": self.default_shift_name,
            "shift_types": [i.to_dict() for i in self.shift_types.values()],
            "patterns": [i.to_dict() for i in self.patterns.values()],
            "rotations": [i.to_dict() for i in self.rotations.values()],
            "variations": [i.to_dict() for i in self.variations.values()],
            "exceptions": [
                self.exceptions[day].to_dict() for day in sorted(self.exceptions)
            ],
        }

    def copy(self) -> RosterData:
        """Return an independent copy."""
        return copy.deepcopy(self)

    def set_default_shift_name(self, name: str) -> None:
        """Set the fallback name, using the built-in value when left blank."""
        self.default_shift_name = (
            _text({"default_shift_name": name}, "default_shift_name")
            or DEFAULT_SHIFT_NAME
        )

    # Lookups used by the engine

    def exception_for(self, day: date) -> RosterException | None:
        """Return the exception on a date, if any."""
        return self.exceptions.get(day)

    def variation_covering(self, day: date) -> Variation | None:
        """Return the variation covering a date, if any."""
        return next((v for v in self.variations.values() if v.covers(day)), None)

    def active_rotations(self, day: date) -> list[Rotation]:
        """Return rotations active on a date, highest priority (lowest number) first."""
        return sorted(
            (r for r in self.rotations.values() if r.is_active(day)),
            key=lambda r: r.priority,
        )

    # Validation

    def validate(self) -> None:
        """Check every cross-reference and the no-overlap rule."""
        for pattern in self.patterns.values():
            self._check_days(pattern.days)
        for rotation in self.rotations.values():
            for slot in rotation.slots:
                if slot is not None and slot not in self.patterns:
                    raise ValidationError(
                        "unknown_pattern", f"Unknown pattern {slot}", "slots"
                    )
        for variation in self.variations.values():
            if variation.mode == "pattern" and (
                variation.pattern_id not in self.patterns
            ):
                raise ValidationError(
                    "unknown_pattern",
                    f"Unknown pattern {variation.pattern_id}",
                    "pattern_id",
                )
            self._check_days(variation.days)
        for exception in self.exceptions.values():
            if exception.assignment is not None:
                self._check_assignment(exception.assignment, "assignment.shift_type_id")
        ordered = sorted(self.variations.values(), key=lambda v: v.start_date)
        for earlier, later in itertools.pairwise(ordered):
            if later.start_date <= earlier.end_date:
                raise ValidationError(
                    "variation_overlap",
                    f'Overlaps "{earlier.name}" and "{later.name}"',
                    "start_date",
                )

    def _check_days(self, days: dict[str, DayAssignment]) -> None:
        for weekday, assignment in days.items():
            self._check_assignment(assignment, f"days.{weekday}.shift_type_id")

    def _check_assignment(self, assignment: DayAssignment, key: str) -> None:
        if (
            assignment.type == "shift"
            and assignment.shift_type_id not in self.shift_types
        ):
            raise ValidationError(
                "unknown_shift_type",
                f"Unknown shift type {assignment.shift_type_id}",
                key,
            )

    # Usage checks

    def shift_type_usages(self, shift_type_id: str) -> list[str]:
        """Describe everywhere a shift type is used."""

        def uses(days: dict[str, DayAssignment]) -> bool:
            return any(a.shift_type_id == shift_type_id for a in days.values())

        usages = [
            f"Week pattern: {p.name}" for p in self.patterns.values() if uses(p.days)
        ]
        usages += [
            f"Variation: {v.name}" for v in self.variations.values() if uses(v.days)
        ]
        usages += [
            f"Exception: {e.date.isoformat()}"
            for e in self.exceptions.values()
            if e.assignment is not None and e.assignment.shift_type_id == shift_type_id
        ]
        return usages

    def pattern_usages(self, pattern_id: str) -> list[str]:
        """Describe everywhere a week pattern is used."""
        usages = [
            f"Rotation: {r.name}"
            for r in self.rotations.values()
            if pattern_id in r.slots
        ]
        usages += [
            f"Variation: {v.name}"
            for v in self.variations.values()
            if v.pattern_id == pattern_id
        ]
        return usages

    # CRUD

    @staticmethod
    def _get(items: dict[str, Any], item_id: str, label: str) -> Any:
        if item_id not in items:
            raise ValidationError("not_found", f"{label} not found", "id")
        return items[item_id]

    def _create(self, items: dict[str, Any], parser: Any, payload: dict) -> Any:
        item = parser({**payload, "id": new_id()})
        items[item.id] = item
        self.validate()
        return item

    def _update(
        self,
        items: dict[str, Any],
        parser: Any,
        item_id: str,
        payload: dict,
        label: str,
    ) -> Any:
        current = self._get(items, item_id, label)
        item = parser({**current.to_dict(), **payload, "id": item_id})
        items[item_id] = item
        self.validate()
        return item

    def create_shift_type(self, payload: dict[str, Any]) -> ShiftType:
        """Add a shift type."""
        return self._create(self.shift_types, ShiftType.from_dict, payload)

    def update_shift_type(self, item_id: str, payload: dict[str, Any]) -> ShiftType:
        """Change a shift type."""
        return self._update(
            self.shift_types, ShiftType.from_dict, item_id, payload, "Shift type"
        )

    def delete_shift_type(self, item_id: str, replace_with: str | None = None) -> None:
        """Delete a shift type, optionally repointing its uses at another one."""
        self._get(self.shift_types, item_id, "Shift type")
        if replace_with is not None:
            if replace_with == item_id:
                raise ValidationError(
                    "invalid_replacement", "Pick a different one", "replace_with"
                )
            self._get(self.shift_types, replace_with, "Replacement")
            assignments = [
                *(a for p in self.patterns.values() for a in p.days.values()),
                *(a for v in self.variations.values() for a in v.days.values()),
                *(e.assignment for e in self.exceptions.values() if e.assignment),
            ]
            for assignment in assignments:
                if assignment.shift_type_id == item_id:
                    assignment.shift_type_id = replace_with
        if usages := self.shift_type_usages(item_id):
            raise ValidationError("in_use", "In use by " + "; ".join(usages), "id")
        del self.shift_types[item_id]

    def create_pattern(self, payload: dict[str, Any]) -> WeekPattern:
        """Add a week pattern."""
        return self._create(self.patterns, WeekPattern.from_dict, payload)

    def update_pattern(self, item_id: str, payload: dict[str, Any]) -> WeekPattern:
        """Change a week pattern."""
        return self._update(
            self.patterns, WeekPattern.from_dict, item_id, payload, "Pattern"
        )

    def delete_pattern(self, item_id: str, replace_with: str | None = None) -> None:
        """Delete a week pattern, optionally repointing its uses at another one."""
        self._get(self.patterns, item_id, "Pattern")
        if replace_with is not None:
            if replace_with == item_id:
                raise ValidationError(
                    "invalid_replacement", "Pick a different one", "replace_with"
                )
            self._get(self.patterns, replace_with, "Replacement")
            for rotation in self.rotations.values():
                rotation.slots = [
                    replace_with if slot == item_id else slot for slot in rotation.slots
                ]
            for variation in self.variations.values():
                if variation.pattern_id == item_id:
                    variation.pattern_id = replace_with
        if usages := self.pattern_usages(item_id):
            raise ValidationError("in_use", "In use by " + "; ".join(usages), "id")
        del self.patterns[item_id]

    def create_rotation(self, payload: dict[str, Any]) -> Rotation:
        """Add a rotation. Without a priority it goes below the existing ones."""
        return self._create(
            self.rotations, Rotation.from_dict, self._with_priority(payload)
        )

    def _with_priority(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Give a rotation with no priority the lowest one."""
        if payload.get("priority") is not None:
            return payload
        lowest = max((r.priority for r in self.rotations.values()), default=-1)
        return {**payload, "priority": lowest + 1}

    def update_rotation(self, item_id: str, payload: dict[str, Any]) -> Rotation:
        """Change a rotation."""
        return self._update(
            self.rotations, Rotation.from_dict, item_id, payload, "Rotation"
        )

    def delete_rotation(self, item_id: str) -> None:
        """Delete a rotation."""
        self._get(self.rotations, item_id, "Rotation")
        del self.rotations[item_id]

    def create_variation(self, payload: dict[str, Any]) -> Variation:
        """Add a variation."""
        return self._create(self.variations, Variation.from_dict, payload)

    def update_variation(self, item_id: str, payload: dict[str, Any]) -> Variation:
        """Change a variation."""
        return self._update(
            self.variations, Variation.from_dict, item_id, payload, "Variation"
        )

    def delete_variation(self, item_id: str) -> None:
        """Delete a variation."""
        self._get(self.variations, item_id, "Variation")
        del self.variations[item_id]

    def set_exception(self, payload: dict[str, Any]) -> RosterException:
        """Set the exception on a date, replacing any already there."""
        exception = RosterException.from_dict(payload)
        self.exceptions[exception.date] = exception
        self.validate()
        return exception

    def clear_exception(self, day: date) -> None:
        """Remove the exception on a date. Does nothing if there is none."""
        self.exceptions.pop(day, None)

    def with_draft(self, kind: str, payload: dict[str, Any]) -> RosterData:
        """Return a copy including an unsaved rotation or variation, for previews."""
        draft = self.copy()
        if kind == "rotation":
            items: dict[str, Any] = draft.rotations
            parser: Any = Rotation.from_dict
            payload = draft._with_priority(payload)
        elif kind == "variation":
            items = draft.variations
            parser = Variation.from_dict
        else:
            raise ValidationError("invalid_draft", f"Unknown draft {kind}", "kind")
        item = parser(payload)
        items[item.id] = item
        draft.validate()
        return draft
