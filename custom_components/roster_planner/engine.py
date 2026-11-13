"""Pure roster resolution: which shift, if any, falls on a date.

No Home Assistant imports. Every date is checked against three layers in order:
one-off exception, then variation, then rotations. The first with an answer wins.

Python compares two datetimes that share a tzinfo by wall clock, which is wrong
across a DST change, so all ordering here goes through UTC.
"""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta, tzinfo

from .models import (
    DEFAULT_SHIFT_NAME,
    WEEKDAYS,
    DayAssignment,
    RosterData,
    RosterException,
)

DEFAULT_COLOUR = "#2196f3"
LOOKAHEAD_DAYS = 60


@dataclass
class Resolved:
    """A shift on a specific date."""

    date: date
    start: datetime
    end: datetime
    title: str
    colour: str
    source: str  # rotation | variation | exception
    source_id: str
    source_name: str | None = None
    week: int | None = None  # 1-based slot in the rotation cycle
    flag: str | None = None  # extra | changed
    note: str | None = None

    def to_dict(self) -> dict[str, object]:
        """Serialise for the websocket API."""
        return {
            "date": self.date.isoformat(),
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
            "title": self.title,
            "colour": self.colour,
            "source": self.source,
            "source_id": self.source_id,
            "source_name": self.source_name,
            "week": self.week,
            "flag": self.flag,
            "note": self.note,
        }


@dataclass
class DayDetail:
    """Everything the panel shows for one date, including days off."""

    date: date
    shift: Resolved | None
    base: Resolved | None  # the roster without any exception
    exception: RosterException | None
    variation_id: str | None
    overlaps_previous: bool

    def to_dict(self) -> dict[str, object]:
        """Serialise for the websocket API."""
        return {
            "date": self.date.isoformat(),
            "shift": self.shift.to_dict() if self.shift else None,
            "base": self.base.to_dict() if self.base else None,
            "exception": self.exception.to_dict() if self.exception else None,
            "variation_id": self.variation_id,
            "overlaps_previous": self.overlaps_previous,
        }


def monday_of(day: date) -> date:
    """Return the Monday of the week containing a date."""
    return day - timedelta(days=day.weekday())


def _parse(value: str) -> time:
    hours, minutes = value.split(":")
    return time(int(hours), int(minutes))


def _utc(value: datetime) -> datetime:
    return value.astimezone(UTC)


def _shift_bounds(
    day: date, start: str, end: str, tz: tzinfo
) -> tuple[datetime, datetime]:
    """Return aware bounds from wall-clock times, rolling end over midnight."""
    start_time, end_time = _parse(start), _parse(end)
    end_day = day + timedelta(days=1) if end_time <= start_time else day
    naive_start = datetime.combine(day, start_time)
    naive_end = datetime.combine(end_day, end_time)
    # Round-tripping through UTC moves a time inside a DST gap to a real one.
    start_at = _utc(naive_start.replace(tzinfo=tz)).astimezone(tz)
    end_at = _utc(naive_end.replace(tzinfo=tz)).astimezone(tz)
    if _utc(end_at) <= _utc(start_at):
        # The shift sits inside a DST gap: keep its intended length.
        end_at = (_utc(start_at) + (naive_end - naive_start)).astimezone(tz)
    return start_at, end_at


def _to_resolved(
    assignment: DayAssignment | None,
    day: date,
    data: RosterData,
    tz: tzinfo,
    source: str,
    source_id: str,
    source_name: str | None = None,
    week: int | None = None,
) -> Resolved | None:
    if assignment is None or assignment.type == "off":
        return None
    if assignment.type == "shift":
        shift_type = data.shift_types[assignment.shift_type_id or ""]
        start, end = shift_type.start, shift_type.end
        title, colour = shift_type.name or data.default_shift_name, shift_type.colour
    else:
        start, end = assignment.start or "", assignment.end or ""
        title, colour = (
            assignment.label or data.default_shift_name or DEFAULT_SHIFT_NAME,
            DEFAULT_COLOUR,
        )
    start_at, end_at = _shift_bounds(day, start, end, tz)
    return Resolved(
        date=day,
        start=start_at,
        end=end_at,
        title=title,
        colour=colour,
        source=source,
        source_id=source_id,
        source_name=source_name,
        week=week,
    )


def resolve_without_exception(
    day: date, data: RosterData, tz: tzinfo
) -> Resolved | None:
    """Resolve a date from variations and rotations only."""
    weekday = WEEKDAYS[day.weekday()]
    if variation := data.variation_covering(day):
        if variation.mode == "pattern":
            pattern = data.patterns[variation.pattern_id or ""]
            return _to_resolved(
                pattern.days.get(weekday),
                day,
                data,
                tz,
                "variation",
                variation.id,
                variation.name,
            )
        if weekday in variation.days:
            return _to_resolved(
                variation.days[weekday],
                day,
                data,
                tz,
                "variation",
                variation.id,
                variation.name,
            )
    for rotation in data.active_rotations(day):
        weeks = (monday_of(day) - rotation.anchor).days // 7
        slot = weeks % rotation.cycle_weeks  # floor mod handles dates before anchor
        pattern_id = rotation.slots[slot]
        if pattern_id is None:
            continue
        assignment = data.patterns[pattern_id].days.get(weekday)
        if assignment is not None and assignment.type != "off":
            return _to_resolved(
                assignment,
                day,
                data,
                tz,
                "rotation",
                rotation.id,
                rotation.name,
                slot + 1,
            )
    return None


def resolve(day: date, data: RosterData, tz: tzinfo) -> Resolved | None:
    """Resolve a date to its shift, or None for a day off."""
    exception = data.exception_for(day)
    if exception is None:
        return resolve_without_exception(day, data, tz)
    if exception.assignment is None:
        # A note on its own: the day still follows the roster.
        resolved = resolve_without_exception(day, data, tz)
        if resolved is not None:
            resolved.note = exception.note
        return resolved
    resolved = _to_resolved(
        exception.assignment, day, data, tz, "exception", day.isoformat()
    )
    if resolved is not None:
        base = resolve_without_exception(day, data, tz)
        resolved.flag = "extra" if base is None else "changed"
        resolved.note = exception.note
    return resolved


def _day_detail(
    day: date, data: RosterData, tz: tzinfo, previous: Resolved | None
) -> DayDetail:
    exception = data.exception_for(day)
    base = resolve_without_exception(day, data, tz)
    shift = base if exception is None else resolve(day, data, tz)
    variation = data.variation_covering(day)
    return DayDetail(
        date=day,
        shift=shift,
        base=base,
        exception=exception,
        variation_id=variation.id if variation else None,
        overlaps_previous=(
            shift is not None
            and previous is not None
            and _utc(previous.end) > _utc(shift.start)
        ),
    )


def day_detail(day: date, data: RosterData, tz: tzinfo) -> DayDetail:
    """Return the full picture for one date."""
    return _day_detail(day, data, tz, resolve(day - timedelta(days=1), data, tz))


def day_details(
    start: date, end: date, data: RosterData, tz: tzinfo
) -> list[DayDetail]:
    """Return details for every date from start to end, both inclusive."""
    result: list[DayDetail] = []
    # Each day needs the one before it, so carry it along instead of resolving twice.
    previous = resolve(start - timedelta(days=1), data, tz)
    for offset in range((end - start).days + 1):
        detail = _day_detail(start + timedelta(days=offset), data, tz, previous)
        result.append(detail)
        previous = detail.shift
    return result


def shifts_overlapping(
    range_start: datetime, range_end: datetime, data: RosterData, tz: tzinfo
) -> list[Resolved]:
    """Return shifts overlapping a time range, in order.

    Starts a day early to catch a shift crossing midnight into the range.
    """
    first = range_start.astimezone(tz).date() - timedelta(days=1)
    last = range_end.astimezone(tz).date()
    result = []
    for offset in range((last - first).days + 1):
        shift = resolve(first + timedelta(days=offset), data, tz)
        if (
            shift is not None
            and _utc(shift.start) < _utc(range_end)
            and _utc(shift.end) > _utc(range_start)
        ):
            result.append(shift)
    return result


def _upcoming(
    now: datetime, data: RosterData, tz: tzinfo, lookahead_days: int
) -> Iterator[Resolved]:
    """Yield shifts not yet finished at ``now``, in order.

    Lazy, because callers want the first match and entities ask on every state write.
    """
    today = now.astimezone(tz).date()
    for offset in range(-1, lookahead_days + 1):
        shift = resolve(today + timedelta(days=offset), data, tz)
        if shift is not None and _utc(shift.end) > _utc(now):
            yield shift


def current_or_next(
    now: datetime,
    data: RosterData,
    tz: tzinfo,
    lookahead_days: int = LOOKAHEAD_DAYS,
) -> Resolved | None:
    """Return the running shift, else the next one within the lookahead."""
    return next(_upcoming(now, data, tz, lookahead_days), None)


def next_start(
    now: datetime,
    data: RosterData,
    tz: tzinfo,
    lookahead_days: int = LOOKAHEAD_DAYS,
) -> Resolved | None:
    """Return the next shift that has not started yet."""
    return next(
        (
            shift
            for shift in _upcoming(now, data, tz, lookahead_days)
            if _utc(shift.start) > _utc(now)
        ),
        None,
    )
