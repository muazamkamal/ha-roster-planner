import { describe, expect, it } from "vitest";
import {
  clockOf,
  crossesMidnight,
  endsNextDay,
  isMonday,
  mondayOf,
  monthGrid,
  shiftDays,
  shiftMonths,
  todayIn,
  weekOf,
  weekdayOf,
} from "./dates";

describe("dates", () => {
  it("finds the Monday of a week", () => {
    expect(mondayOf("2026-11-16")).toBe("2026-11-16");
    expect(mondayOf("2026-11-22")).toBe("2026-11-16");
    expect(mondayOf("2026-11-23")).toBe("2026-11-23");
  });

  it("recognises Mondays", () => {
    expect(isMonday("2026-11-16")).toBe(true);
    expect(isMonday("2026-11-17")).toBe(false);
  });

  it("maps dates to weekday keys", () => {
    expect(weekdayOf("2026-11-16")).toBe("mon");
    expect(weekdayOf("2026-11-22")).toBe("sun");
  });

  it("builds a Monday-first week", () => {
    const week = weekOf("2026-11-18");
    expect(week).toHaveLength(7);
    expect(week[0]).toBe("2026-11-16");
    expect(week[6]).toBe("2026-11-22");
  });

  it("builds whole weeks for a month", () => {
    const grid = monthGrid("2026-11-18");
    expect(grid[0]).toBe("2026-10-26");
    expect(grid.at(-1)).toBe("2026-12-06");
    expect(grid.length % 7).toBe(0);
  });

  it("adds days across a month end", () => {
    expect(shiftDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(shiftDays("2026-12-01", -1)).toBe("2026-11-30");
  });

  it("clamps when adding months", () => {
    expect(shiftMonths("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("works out today in another timezone", () => {
    const now = new Date("2026-11-16T20:00:00Z");
    expect(todayIn("Australia/Perth", now)).toBe("2026-11-17");
    expect(todayIn("America/New_York", now)).toBe("2026-11-16");
  });

  it("reads the wall clock off an ISO string, ignoring the browser", () => {
    expect(clockOf("2026-11-16T07:00:00+08:00")).toBe("07:00");
  });

  it("detects shifts crossing midnight", () => {
    expect(
      crossesMidnight("2026-11-16T22:00:00+08:00", "2026-11-17T06:00:00+08:00"),
    ).toBe(true);
    expect(
      crossesMidnight("2026-11-16T07:00:00+08:00", "2026-11-16T15:00:00+08:00"),
    ).toBe(false);
    expect(endsNextDay("22:00", "06:00")).toBe(true);
    expect(endsNextDay("07:00", "15:30")).toBe(false);
  });
});
