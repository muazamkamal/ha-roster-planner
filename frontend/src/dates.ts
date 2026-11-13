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
import type { TimeFormat, Weekday } from "./types";
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
export const todayIn = (timeZone: string, now: Date = new Date()): string => {
  // Built from parts: a locale's own date layout is not guaranteed.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

/** Formats an HA wall-clock time without converting it to the browser timezone. */
export const formatClock = (
  time: string,
  timeFormat: TimeFormat = "24",
  locale = "en",
): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, hours, minutes));
  const hourCycle =
    timeFormat === "12" ? "h12" : timeFormat === "24" ? "h23" : undefined;
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    ...(hourCycle ? { hourCycle } : {}),
  }).format(date);
};

/**
 * The HH:MM of an ISO datetime as written. The API sends times in HA's zone, so
 * reading them straight off the string shows HA's wall clock in any browser.
 */
export const clockOf = (
  isoDateTime: string,
  timeFormat: TimeFormat = "24",
  locale = "en",
): string => formatClock(isoDateTime.slice(11, 16), timeFormat, locale);

/** True if a shift's end falls on a later date than its start. */
export const crossesMidnight = (start: string, end: string): boolean =>
  start.slice(0, 10) !== end.slice(0, 10);

/** The same check for bare HH:MM times, where end <= start means next day. */
export const endsNextDay = (start: string, end: string): boolean =>
  end <= start;
