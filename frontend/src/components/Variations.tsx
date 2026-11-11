import { useState } from "react";
import { differenceInCalendarWeeks, parseISO } from "date-fns";
import { formatDay, mondayOf } from "../dates";
import { useRoster, useSubmit } from "../hooks";
import type { DayAssignment, Days, Variation } from "../types";
import { WEEKDAYS } from "../types";
import { groupVariations, weekdayName } from "../viewModel";
import { AssignmentPicker } from "./AssignmentPicker";
import { DeleteSheet } from "./DeleteSheet";
import { Preview } from "./Preview";
import { Field, FieldError, FormError } from "./ui";

const FIELDS = ["name", "start_date", "end_date", "mode", "pattern_id", "days"];
const MAX_PREVIEW_WEEKS = 8;
const OFF: DayAssignment = { type: "off" };

/** Only ticked weekdays change; the rest keep following the rotation. */
const WeekdayEdits = ({
  days,
  onChange,
}: {
  days: Days;
  onChange: (days: Days) => void;
}) => {
  const { config } = useRoster();
  return (
    <div className="days">
      {WEEKDAYS.map((weekday) => {
        const value = days[weekday];
        const toggle = (checked: boolean) => {
          const next = { ...days };
          if (checked) next[weekday] = OFF;
          else delete next[weekday];
          onChange(next);
        };
        return (
          <div className="days-row wide" key={weekday}>
            <label className="check">
              <input
                type="checkbox"
                checked={value !== undefined}
                onChange={(event) => toggle(event.target.checked)}
              />
              {weekdayName(weekday).slice(0, 3)}
            </label>
            {value ? (
              <AssignmentPicker
                value={value}
                shiftTypes={config.shift_types}
                onChange={(next) => onChange({ ...days, [weekday]: next })}
              />
            ) : (
              <span className="muted days-unchanged">No change</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Form = ({
  item,
  onClose,
}: {
  item: Variation | null;
  onClose: () => void;
}) => {
  const { api, config, today } = useRoster();
  const { error, busy, submit } = useSubmit();
  const [name, setName] = useState(item?.name ?? "");
  const [startDate, setStartDate] = useState(item?.start_date ?? today);
  const [endDate, setEndDate] = useState(item?.end_date ?? today);
  const [mode, setMode] = useState<Variation["mode"]>(item?.mode ?? "pattern");
  const [patternId, setPatternId] = useState(
    item?.pattern_id ?? config.patterns[0]?.id ?? "",
  );
  const [days, setDays] = useState<Days>(item?.days ?? {});

  const payload = {
    name,
    start_date: startDate,
    end_date: endDate,
    mode,
    ...(mode === "pattern" ? { pattern_id: patternId } : { days }),
  };

  const save = async () => {
    const saved = await submit(() =>
      item
        ? api.update("variation", item.id, payload)
        : api.create("variation", payload),
    );
    if (saved) onClose();
  };

  const previewStart = mondayOf(startDate || today);
  const previewWeeks = endDate
    ? Math.min(
        MAX_PREVIEW_WEEKS,
        Math.max(
          1,
          differenceInCalendarWeeks(parseISO(endDate), parseISO(previewStart), {
            weekStartsOn: 1,
          }) + 2,
        ),
      )
    : 1;

  return (
    <div className="form">
      <Field label="Name">
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <FieldError error={error} field="name" />
      <div className="form-row">
        <Field label="From">
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </Field>
      </div>
      <FieldError error={error} field="start_date" />
      <FieldError error={error} field="end_date" />
      <div className="segmented fit">
        <button
          type="button"
          className={mode === "pattern" ? "selected" : ""}
          onClick={() => setMode("pattern")}
        >
          Use a pattern
        </button>
        <button
          type="button"
          className={mode === "days" ? "selected" : ""}
          onClick={() => setMode("days")}
        >
          Edit weekdays
        </button>
      </div>
      {mode === "pattern" ? (
        <Field label="Pattern">
          <select
            value={patternId}
            onChange={(event) => setPatternId(event.target.value)}
          >
            {config.patterns.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <WeekdayEdits days={days} onChange={setDays} />
      )}
      <FieldError error={error} field="pattern_id" />
      <FieldError error={error} field="days" />
      <FormError error={error} fields={FIELDS} />
      <Preview
        kind="variation"
        draft={{ ...payload, name: name || "Preview", id: item?.id }}
        start={previewStart}
        weeks={previewWeeks}
      />
      <div className="actions">
        <button
          type="button"
          className="button primary"
          disabled={busy}
          onClick={save}
        >
          Save
        </button>
        <button type="button" className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export const Variations = () => {
  const { config, today } = useRoster();
  const [editing, setEditing] = useState<Variation | "new" | null>(null);
  const [deleting, setDeleting] = useState<Variation | null>(null);

  if (editing) {
    return (
      <Form
        item={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  const groups = groupVariations(config.variations, today);
  const sections: [string, Variation[]][] = [
    ["Active", groups.active],
    ["Upcoming", groups.upcoming],
    ["Past", groups.past],
  ];

  return (
    <>
      {sections.map(
        ([title, items]) =>
          items.length > 0 && (
            <section key={title}>
              <h4 className="muted group-title">{title}</h4>
              <ul className="list">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="list-main"
                      onClick={() => setEditing(item)}
                    >
                      <span>
                        {item.name}
                        <span className="muted list-detail">
                          {formatDay(item.start_date, "d MMM")} –{" "}
                          {formatDay(item.end_date, "d MMM yyyy")}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="button small danger"
                      onClick={() => setDeleting(item)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
      <button
        type="button"
        className="button primary"
        onClick={() => setEditing("new")}
      >
        Add variation
      </button>
      {deleting && (
        <DeleteSheet
          kind="variation"
          item={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
};
