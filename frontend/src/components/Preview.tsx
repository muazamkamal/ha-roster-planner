import { useEffect, useState } from "react";
import { clockOf, formatDay, shiftDays } from "../dates";
import { useHass, useRoster } from "../hooks";
import type { ApiError, DayDetail } from "../types";

const DEBOUNCE_MS = 300;

/** Live preview of an unsaved rotation or variation, one row per week. */
export const Preview = ({
  kind,
  draft,
  start,
  weeks,
}: {
  kind: "rotation" | "variation";
  draft: object;
  start: string;
  weeks: number;
}) => {
  const { api, config } = useRoster();
  const { locale } = useHass();
  const timeFormat = locale?.time_format ?? "24";
  const timeLocale = locale?.language ?? "en";
  const [days, setDays] = useState<DayDetail[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const serialised = JSON.stringify(draft);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      api
        .preview(
          kind,
          JSON.parse(serialised),
          start,
          shiftDays(start, weeks * 7 - 1),
        )
        .then(
          (result) => {
            if (!active) return;
            setDays(result);
            setError(null);
          },
          (err: ApiError) => active && setError(err),
        );
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [api, config, kind, serialised, start, weeks]);

  if (error) return <p className="muted">Preview: {error.message}</p>;
  if (!days) return null;

  // While a new range loads, the last result may cover fewer weeks.
  const rows = Array.from({ length: weeks }, (_, week) =>
    days.slice(week * 7, week * 7 + 7),
  ).filter((row) => row.length > 0);

  return (
    <div className="preview" aria-label="Preview">
      {rows.map((row) => (
        <div className="preview-row" key={row[0].date}>
          <span className="muted">{formatDay(row[0].date, "d MMM")}</span>
          {row.map((day) => (
            <span
              key={day.date}
              className="preview-cell"
              style={
                day.shift
                  ? { borderBottomColor: day.shift.colour }
                  : { opacity: 0.4 }
              }
              title={day.date}
            >
              {day.shift
                ? clockOf(day.shift.start, timeFormat, timeLocale)
                : "–"}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
