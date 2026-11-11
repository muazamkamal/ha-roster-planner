import { describe, expect, it } from "vitest";
import type { DayDetail, Resolved, RosterException } from "./types";
import {
  actionsFor,
  markerOf,
  nextShift,
  originLine,
  summaryLine,
  timeRange,
} from "./viewModel";

const shift = (overrides: Partial<Resolved> = {}): Resolved => ({
  date: "2026-11-17",
  start: "2026-11-17T07:00:00+08:00",
  end: "2026-11-17T15:30:00+08:00",
  title: "Open",
  colour: "#000000",
  source: "rotation",
  source_id: "r1",
  source_name: "Main roster",
  week: 3,
  flag: null,
  note: null,
  ...overrides,
});

const day = (overrides: Partial<DayDetail> = {}): DayDetail => ({
  date: "2026-11-17",
  shift: null,
  base: null,
  exception: null,
  variation_id: null,
  overlaps_previous: false,
  ...overrides,
});

const off: RosterException = {
  date: "2026-11-17",
  assignment: { type: "off" },
};

describe("timeRange", () => {
  it("formats a same-day shift", () => {
    expect(timeRange(shift())).toBe("07:00–15:30");
  });
  it("marks a shift ending the next day", () => {
    expect(
      timeRange(
        shift({
          start: "2026-11-17T22:00:00+08:00",
          end: "2026-11-18T06:00:00+08:00",
        }),
      ),
    ).toBe("22:00–06:00 (+1)");
  });
});

describe("markerOf", () => {
  it("is empty for a plain day", () => {
    expect(markerOf(day({ shift: shift() }))).toBeNull();
  });
  it("marks extra shifts", () => {
    expect(
      markerOf(
        day({ shift: shift({ flag: "extra" }), exception: off, base: null }),
      ),
    ).toBe("extra");
  });
  it("marks changed shifts", () => {
    expect(
      markerOf(
        day({
          shift: shift({ flag: "changed" }),
          exception: off,
          base: shift(),
        }),
      ),
    ).toBe("changed");
  });
  it("marks a cancelled shift as changed", () => {
    expect(markerOf(day({ exception: off, base: shift() }))).toBe("changed");
  });
  it("ignores an off exception on a day already off", () => {
    expect(markerOf(day({ exception: off }))).toBeNull();
  });
});

describe("actionsFor", () => {
  it("offers change and off on a rostered day", () => {
    expect(actionsFor(day({ shift: shift() }))).toEqual({
      change: true,
      extra: false,
      off: true,
      reset: false,
    });
  });
  it("offers extra on a day off", () => {
    expect(actionsFor(day())).toEqual({
      change: false,
      extra: true,
      off: false,
      reset: false,
    });
  });
  it("offers reset when an exception exists", () => {
    expect(actionsFor(day({ exception: off })).reset).toBe(true);
  });
});

describe("originLine", () => {
  it("names the rotation and week", () => {
    expect(originLine(day({ shift: shift() }))).toBe(
      "From Main roster · Week 3",
    );
  });
  it("names a variation", () => {
    expect(
      originLine(
        day({ shift: shift({ source: "variation", source_name: "Xmas" }) }),
      ),
    ).toBe("From Xmas");
  });
  it("describes an extra shift", () => {
    expect(
      originLine(day({ shift: shift({ source: "exception", flag: "extra" }) })),
    ).toBe("Extra shift");
  });
  it("shows the usual times of a changed shift", () => {
    expect(
      originLine(
        day({
          shift: shift({ source: "exception", flag: "changed" }),
          base: shift(),
        }),
      ),
    ).toBe("Changed · usually 07:00–15:30");
  });
  it("describes a cancelled shift", () => {
    expect(originLine(day({ exception: off, base: shift() }))).toBe(
      "Cancelled · usually 07:00–15:30",
    );
  });
  it("is empty for an ordinary day off", () => {
    expect(originLine(day())).toBe("");
  });
});

describe("nextShift and summaryLine", () => {
  const start = new Date("2026-11-17T07:00:00+08:00").getTime();
  const days = [day({ shift: shift() })];

  it("skips finished shifts", () => {
    expect(nextShift(days, start + 24 * 3600 * 1000)).toBeNull();
  });
  it("returns a running shift", () => {
    expect(nextShift(days, start + 1000)?.title).toBe("Open");
  });
  it("summarises the next shift", () => {
    expect(summaryLine(shift(), start - 1000)).toBe(
      "Next shift: Tue 07:00–15:30",
    );
  });
  it("summarises a running shift", () => {
    expect(summaryLine(shift(), start + 1000)).toBe("On shift until 15:30");
  });
  it("handles having nothing upcoming", () => {
    expect(summaryLine(null, start)).toBe("No upcoming shifts");
  });
});
