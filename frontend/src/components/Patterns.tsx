import { useState } from "react";
import { useRoster, useSubmit } from "../hooks";
import type { DayAssignment, Days, WeekPattern } from "../types";
import { WEEKDAYS } from "../types";
import { describeAssignment, weekdayName } from "../viewModel";
import { AssignmentPicker } from "./AssignmentPicker";
import { DeleteSheet } from "./DeleteSheet";
import { Field, FieldError, FormError } from "./ui";

const OFF: DayAssignment = { type: "off" };

/** A Mon-Sun list of pickers, shared with the variation editor. */
export const DaysEditor = ({
  days,
  onChange,
}: {
  days: Days;
  onChange: (days: Days) => void;
}) => {
  const { config } = useRoster();
  return (
    <div className="days">
      {WEEKDAYS.map((weekday) => (
        <div className="days-row" key={weekday}>
          <span>{weekdayName(weekday).slice(0, 3)}</span>
          <AssignmentPicker
            value={days[weekday] ?? OFF}
            shiftTypes={config.shift_types}
            onChange={(value) => onChange({ ...days, [weekday]: value })}
          />
        </div>
      ))}
    </div>
  );
};

const Form = ({
  item,
  onClose,
}: {
  item: Pick<WeekPattern, "name" | "days"> & { id?: string };
  onClose: () => void;
}) => {
  const { api } = useRoster();
  const { error, busy, submit } = useSubmit();
  const [name, setName] = useState(item.name);
  const [days, setDays] = useState<Days>(item.days);

  const save = async () => {
    const payload = { name, days };
    const saved = await submit(() =>
      item.id
        ? api.update("pattern", item.id, payload)
        : api.create("pattern", payload),
    );
    if (saved) onClose();
  };

  return (
    <div className="form">
      <Field label="Name">
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <FieldError error={error} field="name" />
      <DaysEditor days={days} onChange={setDays} />
      <FormError error={error} fields={["name"]} />
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

export const Patterns = () => {
  const { config } = useRoster();
  const [editing, setEditing] = useState<
    (Pick<WeekPattern, "name" | "days"> & { id?: string }) | null
  >(null);
  const [deleting, setDeleting] = useState<WeekPattern | null>(null);

  if (editing) {
    return <Form item={editing} onClose={() => setEditing(null)} />;
  }

  return (
    <>
      <ul className="list">
        {config.patterns.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="list-main"
              onClick={() => setEditing(item)}
            >
              <span>
                {item.name}
                <span className="muted list-detail">
                  {WEEKDAYS.filter(
                    (weekday) =>
                      item.days[weekday] && item.days[weekday].type !== "off",
                  )
                    .map(
                      (weekday) =>
                        `${weekdayName(weekday).slice(0, 3)} ${describeAssignment(item.days[weekday], config.shift_types)}`,
                    )
                    .join(" · ") || "All off"}
                </span>
              </span>
            </button>
            <button
              type="button"
              className="button small"
              onClick={() =>
                setEditing({ name: `${item.name} copy`, days: item.days })
              }
            >
              Duplicate
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
      <button
        type="button"
        className="button primary"
        onClick={() => setEditing({ name: "", days: {} })}
      >
        Add week pattern
      </button>
      {deleting && (
        <DeleteSheet
          kind="pattern"
          item={deleting}
          replacements={config.patterns.filter(
            (item) => item.id !== deleting.id,
          )}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
};
