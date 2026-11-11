import { clockOf, crossesMidnight, formatDay } from "./dates";
import type { DayDetail, Resolved } from "./types";

export const timeRange = (shift: Resolved): string => {
  const suffix = crossesMidnight(shift.start, shift.end) ? " (+1)" : "";
  return `${clockOf(shift.start)}–${clockOf(shift.end)}${suffix}`;
};

export type Marker = "extra" | "changed" | null;

/** Small marker for a day: "+" for an extra shift, a dot for any other change. */
export const markerOf = (day: DayDetail): Marker => {
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

export const actionsFor = (day: DayDetail): DayActions => ({
  change: day.shift !== null,
  extra: day.shift === null,
  off: day.shift !== null,
  reset: day.exception !== null,
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
