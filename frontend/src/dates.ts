import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Weekday } from "./types";
import { WEEKDAYS } from "./types";

// Dates are YYYY-MM-DD strings everywhere. date-fns only sees them as local
// midnights, so the browser's own timezone cannot shift a date.

export const toIso = (date: Date): string => format(date, "yyyy-MM-dd");

export const shiftDays = (iso: string, days: number): string =>
  toIso(addDays(parseISO(iso), days));

export const shiftMonths = (iso: string, months: number): string =>
  toIso(addMonths(parseISO(iso), months));

export const mondayOf = (iso: string): string =>
  toIso(startOfWeek(parseISO(iso), { weekStartsOn: 1 }));

export const isMonday = (iso: string): boolean => parseISO(iso).getDay() === 1;

export const weekdayOf = (iso: string): Weekday =>
  WEEKDAYS[(parseISO(iso).getDay() + 6) % 7];

export const weekOf = (iso: string): string[] => {
  const monday = mondayOf(iso);
  return WEEKDAYS.map((_, index) => shiftDays(monday, index));
};

/** Every date shown on a month grid: whole weeks covering the month. */
export const monthGrid = (iso: string): string[] => {
  const date = parseISO(iso);
  const first = mondayOf(toIso(startOfMonth(date)));
  const last = shiftDays(mondayOf(toIso(endOfMonth(date))), 6);
  const count = differenceInCalendarDays(parseISO(last), parseISO(first)) + 1;
  return Array.from({ length: count }, (_, index) => shiftDays(first, index));
};

export const sameMonth = (a: string, b: string): boolean =>
  a.slice(0, 7) === b.slice(0, 7);

export const formatDay = (iso: string, pattern: string): string =>
  format(parseISO(iso), pattern);

/** Today's date in a named timezone, which may differ from the browser's. */
export const todayIn = (timeZone: string, now: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

/**
 * The HH:MM of an ISO datetime as written. The API sends times in HA's zone, so
 * reading them straight off the string shows HA's wall clock in any browser.
 */
export const clockOf = (isoDateTime: string): string =>
  isoDateTime.slice(11, 16);

/** True if a shift's end falls on a later date than its start. */
export const crossesMidnight = (start: string, end: string): boolean =>
  start.slice(0, 10) !== end.slice(0, 10);

/** The same check for bare HH:MM times, where end <= start means next day. */
export const endsNextDay = (start: string, end: string): boolean =>
  end <= start;
