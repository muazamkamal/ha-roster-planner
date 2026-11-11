import {
  clockOf,
  crossesMidnight,
  endsNextDay,
  formatDay,
  mondayOf,
  shiftDays,
  weekdayOf,
} from "./dates";
import type {
  DayAssignment,
  DayDetail,
  Days,
  Resolved,
  RosterException,
  Rotation,
  ShiftType,
  Variation,
  Weekday,
} from "./types";
import { WEEKDAYS } from "./types";

export const timeRange = (shift: Resolved): string => {
  const suffix = crossesMidnight(shift.start, shift.end) ? " (+1)" : "";
  return `${clockOf(shift.start)}–${clockOf(shift.end)}${suffix}`;
};

export type Marker = "extra" | "changed" | "note" | null;

/** Small marker for a day: "+" for an extra shift, a dot for any other change,
 * a ring for a note on a day that still follows the roster. */
export const markerOf = (day: DayDetail): Marker => {
  if (day.exception && !day.exception.assignment) return "note";
  if (day.shift?.flag === "extra") return "extra";
  if (day.exception && (day.shift || day.base)) return "changed";
  return null;
};

export interface DayActions {
  change: boolean;
  extra: boolean;
  off: boolean;
  reset: boolean;
}

/** The assignment that reproduces a resolved shift, as a starting point for
 * changing it: its shift type if one still matches, else its times. */
export const assignmentOf = (
  shift: Resolved,
  shiftTypes: ShiftType[],
): DayAssignment => {
  const start = clockOf(shift.start);
  const end = clockOf(shift.end);
  const match = shiftTypes.find(
    (item) =>
      item.name === shift.title && item.start === start && item.end === end,
  );
  if (match) return { type: "shift", shift_type_id: match.id };
  return { type: "custom", start, end, label: shift.title };
};

export const actionsFor = (day: DayDetail): DayActions => ({
  change: day.shift !== null,
  extra: day.shift === null,
  off: day.shift !== null,
  // A note on its own changes nothing, so there is nothing to reset.
  reset: Boolean(day.exception?.assignment),
});

/** One muted line saying where the day's result came from. */
export const originLine = (day: DayDetail): string => {
  const { shift, base } = day;
  if (!shift) {
    if (day.exception && base) return `Cancelled · usually ${timeRange(base)}`;
    return "";
  }
  if (shift.source === "exception") {
    if (shift.flag === "extra") return "Extra shift";
    return base ? `Changed · usually ${timeRange(base)}` : "Changed";
  }
  if (shift.source === "variation") return `From ${shift.source_name}`;
  return `From ${shift.source_name} · Week ${shift.week}`;
};

/** The running shift, else the next one, from a list of days in date order. */
export const nextShift = (days: DayDetail[], now: number): Resolved | null => {
  for (const day of days) {
    if (day.shift && new Date(day.shift.end).getTime() > now) return day.shift;
  }
  return null;
};

export const summaryLine = (shift: Resolved | null, now: number): string => {
  if (!shift) return "No upcoming shifts";
  const running = new Date(shift.start).getTime() <= now;
  if (running) return `On shift until ${clockOf(shift.end)}`;
  return `Next shift: ${formatDay(shift.date, "EEE")} ${timeRange(shift)}`;
};

const WEEKDAY_NAMES: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const weekdayName = (weekday: Weekday): string => WEEKDAY_NAMES[weekday];

export const describeAssignment = (
  assignment: DayAssignment | undefined,
  shiftTypes: ShiftType[],
): string => {
  if (!assignment || assignment.type === "off") return "Off";
  if (assignment.type === "custom") {
    const suffix = endsNextDay(assignment.start, assignment.end) ? " (+1)" : "";
    return `${assignment.label ?? "Custom"} ${assignment.start}–${assignment.end}${suffix}`;
  }
  return (
    shiftTypes.find((item) => item.id === assignment.shift_type_id)?.name ??
    "Unknown"
  );
};

/** Grow or shrink a rotation's slots to a new cycle length, keeping what fits. */
export const resizeSlots = (
  slots: (string | null)[],
  length: number,
): (string | null)[] =>
  Array.from({ length }, (_, index) => slots[index] ?? null);

export const byPriority = (rotations: Rotation[]): Rotation[] =>
  [...rotations].sort((a, b) => a.priority - b.priority);

/** The priority updates that move one rotation up or down the list. Only the
 * rotations whose priority actually changes are returned. */
export const movedPriorities = (
  rotations: Rotation[],
  id: string,
  direction: -1 | 1,
): { id: string; priority: number }[] => {
  const ordered = byPriority(rotations);
  const from = ordered.findIndex((item) => item.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ordered.length) return [];
  [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
  return ordered
    .map((item, priority) => ({ id: item.id, priority, was: item.priority }))
    .filter((item) => item.priority !== item.was)
    .map(({ id, priority }) => ({ id, priority }));
};

/** First date on or after `start` falling on `weekday`. */
export const firstOccurrence = (start: string, weekday: Weekday): string => {
  const wanted = WEEKDAYS.indexOf(weekday);
  const actual = WEEKDAYS.indexOf(weekdayOf(start));
  return shiftDays(start, (wanted - actual + 7) % 7);
};

/** The single-day pattern and rotation behind "every N weeks on a weekday". */
export const recurringShift = (
  everyWeeks: number,
  weekday: Weekday,
  shiftType: ShiftType,
  start: string,
) => {
  const name = `Every ${everyWeeks === 1 ? "week" : `${everyWeeks} weeks`}: ${weekdayName(weekday)} ${shiftType.name}`;
  return {
    pattern: {
      name,
      days: {
        [weekday]: { type: "shift", shift_type_id: shiftType.id },
      } as Days,
    },
    rotation: (patternId: string) => ({
      name,
      anchor: mondayOf(firstOccurrence(start, weekday)),
      cycle_weeks: everyWeeks,
      slots: resizeSlots([patternId], everyWeeks),
      active_from: start,
    }),
  };
};

export const groupVariations = (variations: Variation[], today: string) => {
  const sorted = [...variations].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );
  return {
    active: sorted.filter(
      (item) => item.start_date <= today && today <= item.end_date,
    ),
    upcoming: sorted.filter((item) => item.start_date > today),
    past: sorted.filter((item) => item.end_date < today).reverse(),
  };
};

/** One line for an exception in the list: the change, then any note. */
export const describeException = (
  exception: RosterException,
  shiftTypes: ShiftType[],
): string => {
  if (!exception.assignment) return `Note · ${exception.note ?? ""}`;
  const change = describeAssignment(exception.assignment, shiftTypes);
  return exception.note ? `${change} · ${exception.note}` : change;
};

/** Upcoming exceptions soonest first; past ones most recent first. */
export const splitExceptions = (
  exceptions: RosterException[],
  today: string,
) => {
  const sorted = [...exceptions].sort((a, b) => a.date.localeCompare(b.date));
  return {
    upcoming: sorted.filter((item) => item.date >= today),
    past: sorted.filter((item) => item.date < today).reverse(),
  };
};
