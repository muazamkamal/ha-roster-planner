import { useMemo, useState } from "react";
import { formatDay, monthGrid, shiftDays, shiftMonths, weekOf } from "../dates";
import { useDays, useHass, useNow, useRoster } from "../hooks";
import type { DayDetail } from "../types";
import { nextShift, summaryLine } from "../viewModel";
import { MonthView, Swipeable, WeekView } from "./Calendar";
import { DaySheet } from "./DaySheet";
import { ICONS, IconButton } from "./ui";

const LOOKAHEAD_DAYS = 60;

export const MainScreen = ({ narrow }: { narrow: boolean }) => {
  const { today } = useRoster();
  const { locale } = useHass();
  const timeFormat = locale?.time_format ?? "24";
  const timeLocale = locale?.language ?? "en";
  const [view, setView] = useState<"week" | "month">(narrow ? "week" : "month");
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState<string | null>(null);

  const range = view === "week" ? weekOf(anchor) : monthGrid(anchor);
  const details = useDays(range[0], range[range.length - 1]);
  const upcoming = useDays(
    shiftDays(today, -1),
    shiftDays(today, LOOKAHEAD_DAYS),
  );
  const days = useMemo(
    () => new Map((details ?? []).map((day) => [day.date, day])),
    [details],
  );

  const move = (direction: number) =>
    setAnchor((current) =>
      view === "week"
        ? shiftDays(current, direction * 7)
        : shiftMonths(current, direction),
    );

  const now = useNow();
  const selectedDay = selected ? days.get(selected) : undefined;
  const heading =
    view === "week"
      ? `${formatDay(range[0], "d MMM")} – ${formatDay(range[6], "d MMM")}`
      : formatDay(anchor, "MMMM yyyy");
  const onSelect = (day: DayDetail) => setSelected(day.date);

  return (
    <main className="content">
      {upcoming && (
        <p className="summary">
          {summaryLine(nextShift(upcoming, now), now, timeFormat, timeLocale)}
        </p>
      )}
      <div className="toolbar">
        <IconButton
          path={ICONS.left}
          label="Previous"
          onClick={() => move(-1)}
        />
        <strong className="toolbar-title">{heading}</strong>
        <IconButton path={ICONS.right} label="Next" onClick={() => move(1)} />
        <button
          type="button"
          className="button small"
          onClick={() => setAnchor(today)}
        >
          Today
        </button>
        <div className="segmented">
          {(["week", "month"] as const).map((option) => (
            <button
              type="button"
              key={option}
              className={view === option ? "selected" : ""}
              onClick={() => setView(option)}
            >
              {option === "week" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>
      <Swipeable onPrevious={() => move(-1)} onNext={() => move(1)}>
        {view === "week" ? (
          <WeekView
            anchor={anchor}
            today={today}
            days={days}
            onSelect={onSelect}
            timeFormat={timeFormat}
            timeLocale={timeLocale}
          />
        ) : (
          <MonthView
            anchor={anchor}
            today={today}
            days={days}
            onSelect={onSelect}
            narrow={narrow}
            timeFormat={timeFormat}
            timeLocale={timeLocale}
          />
        )}
      </Swipeable>
      {selectedDay && (
        <DaySheet
          key={selectedDay.date}
          day={selectedDay}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
};
