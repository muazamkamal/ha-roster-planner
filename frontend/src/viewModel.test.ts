import { describe, expect, it } from "vitest";
import type {
  DayDetail,
  Resolved,
  RosterException,
  Rotation,
  ShiftType,
  Variation,
} from "./types";
import {
  actionsFor,
  assignmentOf,
  byPriority,
  describeAssignment,
  describeException,
  firstOccurrence,
  groupVariations,
  markerOf,
  movedPriorities,
  nextShift,
  originLine,
  recurringShift,
  resizeSlots,
  splitExceptions,
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

const noteOnly: RosterException = { date: "2026-11-17", note: "Bring keys" };

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
  it("marks a note on a rostered day as a note, not a change", () => {
    expect(
      markerOf(day({ shift: shift(), base: shift(), exception: noteOnly })),
    ).toBe("note");
  });
  it("marks a note on a day off", () => {
    expect(markerOf(day({ exception: noteOnly }))).toBe("note");
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
  it("has nothing to reset for a note on its own", () => {
    expect(
      actionsFor(day({ shift: shift(), base: shift(), exception: noteOnly })),
    ).toEqual({ change: true, extra: false, off: true, reset: false });
  });
});

describe("describeException", () => {
  it("shows the change and the note", () => {
    expect(describeException({ ...off, note: "Sick" }, [])).toBe("Off · Sick");
  });
  it("shows a note on its own", () => {
    expect(describeException(noteOnly, [])).toBe("Note · Bring keys");
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

const open: ShiftType = {
  id: "st1",
  name: "Open",
  start: "07:00",
  end: "15:30",
  colour: "#000000",
};

const rotation = (id: string, priority: number): Rotation => ({
  id,
  name: id,
  anchor: "2026-11-16",
  cycle_weeks: 1,
  slots: [null],
  active_from: "2026-11-16",
  active_until: null,
  priority,
});

describe("describeAssignment", () => {
  it("treats a missing day as off", () => {
    expect(describeAssignment(undefined, [])).toBe("Off");
  });
  it("names a shift type", () => {
    expect(
      describeAssignment({ type: "shift", shift_type_id: "st1" }, [open]),
    ).toBe("Open");
  });
  it("shows custom times with a next-day marker", () => {
    expect(
      describeAssignment({ type: "custom", start: "22:00", end: "06:00" }, []),
    ).toBe("Shift 22:00–06:00 (+1)");
  });
});

describe("resizeSlots", () => {
  it("pads with empty slots", () => {
    expect(resizeSlots(["a"], 3)).toEqual(["a", null, null]);
  });
  it("truncates", () => {
    expect(resizeSlots(["a", "b", "c"], 2)).toEqual(["a", "b"]);
  });
});

describe("movedPriorities", () => {
  const rotations = [rotation("a", 0), rotation("b", 5), rotation("c", 9)];

  it("swaps with the neighbour and renumbers", () => {
    expect(movedPriorities(rotations, "b", -1)).toEqual([
      { id: "b", priority: 0 },
      { id: "a", priority: 1 },
      { id: "c", priority: 2 },
    ]);
  });
  it("leaves out rotations whose priority stays the same", () => {
    const tidy = [rotation("a", 0), rotation("b", 1), rotation("c", 2)];
    expect(movedPriorities(tidy, "c", -1)).toEqual([
      { id: "c", priority: 1 },
      { id: "b", priority: 2 },
    ]);
  });
  it("does nothing past either end", () => {
    expect(movedPriorities(rotations, "a", -1)).toEqual([]);
    expect(movedPriorities(rotations, "c", 1)).toEqual([]);
  });
  it("sorts by priority", () => {
    expect(byPriority([rotation("z", 2), rotation("y", 1)])[0].id).toBe("y");
  });
});

describe("recurringShift", () => {
  it("finds the first matching weekday", () => {
    expect(firstOccurrence("2026-11-16", "mon")).toBe("2026-11-16");
    expect(firstOccurrence("2026-11-18", "mon")).toBe("2026-11-23");
    expect(firstOccurrence("2026-11-16", "sun")).toBe("2026-11-22");
  });

  it("builds a single-day pattern and an N-week rotation", () => {
    const built = recurringShift(2, "mon", open, "2026-11-16");
    expect(built.pattern.days).toEqual({
      mon: { type: "shift", shift_type_id: "st1" },
    });
    expect(built.rotation("p1")).toMatchObject({
      anchor: "2026-11-16",
      cycle_weeks: 2,
      slots: ["p1", null],
      active_from: "2026-11-16",
    });
  });

  it("anchors on the week of the first occurrence, not the start date", () => {
    const built = recurringShift(3, "mon", open, "2026-11-18");
    expect(built.rotation("p1").anchor).toBe("2026-11-23");
  });
});

describe("grouping", () => {
  const variation = (id: string, start: string, end: string): Variation => ({
    id,
    name: id,
    start_date: start,
    end_date: end,
    mode: "days",
  });

  it("groups variations around today, bounds inclusive", () => {
    const groups = groupVariations(
      [
        variation("past", "2026-11-01", "2026-11-09"),
        variation("ends-today", "2026-11-05", "2026-11-10"),
        variation("starts-today", "2026-11-10", "2026-11-12"),
        variation("next", "2026-11-11", "2026-11-20"),
      ],
      "2026-11-10",
    );
    expect(groups.past.map((item) => item.id)).toEqual(["past"]);
    expect(groups.active.map((item) => item.id)).toEqual([
      "ends-today",
      "starts-today",
    ]);
    expect(groups.upcoming.map((item) => item.id)).toEqual(["next"]);
  });

  it("splits exceptions, soonest upcoming and latest past first", () => {
    const at = (date: string): RosterException => ({
      date,
      assignment: { type: "off" },
    });
    const { upcoming, past } = splitExceptions(
      [at("2026-11-12"), at("2026-11-01"), at("2026-11-10"), at("2026-11-05")],
      "2026-11-10",
    );
    expect(upcoming.map((item) => item.date)).toEqual([
      "2026-11-10",
      "2026-11-12",
    ]);
    expect(past.map((item) => item.date)).toEqual(["2026-11-05", "2026-11-01"]);
  });
});

describe("assignmentOf", () => {
  it("uses the shift type when name and times still match", () => {
    expect(assignmentOf(shift(), [open])).toEqual({
      type: "shift",
      shift_type_id: open.id,
    });
  });
  it("falls back to the shift's own times", () => {
    expect(assignmentOf(shift({ title: "Training" }), [open])).toEqual({
      type: "custom",
      start: "07:00",
      end: "15:30",
      label: "Training",
    });
  });
});
