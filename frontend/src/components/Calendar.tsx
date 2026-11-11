import { useRef } from "react";
import type { ReactNode, TouchEvent } from "react";
import { clockOf, formatDay, monthGrid, sameMonth, weekOf } from "../dates";
import type { DayDetail } from "../types";
import { markerOf, timeRange } from "../viewModel";

const SWIPE_DISTANCE = 60;

/** Calls back on a mostly-horizontal swipe. */
export const Swipeable = ({
  onPrevious,
  onNext,
  children,
}: {
  onPrevious: () => void;
  onNext: () => void;
  children: ReactNode;
}) => {
  const origin = useRef<{ x: number; y: number } | null>(null);

  const start = (event: TouchEvent) => {
    const touch = event.touches[0];
    origin.current = { x: touch.clientX, y: touch.clientY };
  };

  const end = (event: TouchEvent) => {
    if (!origin.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - origin.current.x;
    const dy = touch.clientY - origin.current.y;
    origin.current = null;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 2) {
      return;
    }
    if (dx > 0) onPrevious();
    else onNext();
  };

  return (
    <div onTouchStart={start} onTouchEnd={end}>
      {children}
    </div>
  );
};

const Marker = ({ day }: { day: DayDetail }) => {
  const marker = markerOf(day);
  if (marker === "extra") return <span className="marker plus">+</span>;
  if (marker === "changed") return <span className="marker dot" />;
  return null;
};

interface ViewProps {
  anchor: string;
  today: string;
  days: Map<string, DayDetail>;
  onSelect: (day: DayDetail) => void;
}

export const WeekView = ({ anchor, today, days, onSelect }: ViewProps) => (
  <div className="week">
    {weekOf(anchor).map((date) => {
      const day = days.get(date);
      const classes = [
        "week-row",
        date === today ? "today" : "",
        day?.variation_id ? "in-variation" : "",
      ];
      return (
        <button
          type="button"
          key={date}
          className={classes.join(" ")}
          disabled={!day}
          onClick={() => day && onSelect(day)}
        >
          <span className="week-date">
            <span className="muted">{formatDay(date, "EEE")}</span>
            <strong>{formatDay(date, "d")}</strong>
          </span>
          {day?.shift ? (
            <>
              <span
                className="colour-bar"
                style={{ background: day.shift.colour }}
              />
              <span className="week-shift">
                <strong>{timeRange(day.shift)}</strong>
                <span className="muted">{day.shift.title}</span>
              </span>
            </>
          ) : (
            <span className="week-shift muted">{day ? "Off" : ""}</span>
          )}
          {day && <Marker day={day} />}
        </button>
      );
    })}
  </div>
);

export const MonthView = ({
  anchor,
  today,
  days,
  onSelect,
  narrow,
}: ViewProps & { narrow: boolean }) => (
  <div className="month">
    {weekOf(anchor).map((date) => (
      <span key={date} className="month-heading muted">
        {formatDay(date, "EEEEE")}
      </span>
    ))}
    {monthGrid(anchor).map((date) => {
      const day = days.get(date);
      const classes = [
        "month-cell",
        date === today ? "today" : "",
        sameMonth(date, anchor) ? "" : "outside",
        day?.variation_id ? "in-variation" : "",
      ];
      return (
        <button
          type="button"
          key={date}
          className={classes.join(" ")}
          disabled={!day}
          aria-label={
            formatDay(date, "EEEE d MMMM") +
            (day?.shift ? `, ${timeRange(day.shift)} ${day.shift.title}` : "")
          }
          onClick={() => day && onSelect(day)}
        >
          <span className="month-number">
            {formatDay(date, "d")}
            {day && <Marker day={day} />}
          </span>
          {day?.shift &&
            (narrow ? (
              <span
                className="month-dot"
                style={{ background: day.shift.colour }}
              />
            ) : (
              <span
                className="month-time"
                style={{ borderColor: day.shift.colour }}
              >
                {clockOf(day.shift.start)}
              </span>
            ))}
        </button>
      );
    })}
  </div>
);
