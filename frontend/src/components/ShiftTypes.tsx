import { useState } from "react";
import { endsNextDay, formatClock } from "../dates";
import { useHass, useRoster, useSubmit } from "../hooks";
import type { ShiftType } from "../types";
import { DeleteSheet } from "./DeleteSheet";
import { Field, FieldError, FormError } from "./ui";

const BLANK = {
  name: "",
  start: "09:00",
  end: "17:00",
  colour: "#2196f3",
  notes: "",
};

const FIELDS = ["name", "start", "end", "colour"];

const Form = ({
  item,
  onClose,
}: {
  item: ShiftType | null;
  onClose: () => void;
}) => {
  const { api } = useRoster();
  const { error, busy, submit } = useSubmit();
  const [form, setForm] = useState({
    ...BLANK,
    ...item,
    name: item?.name ?? "",
  });
  const set = (key: keyof typeof BLANK, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    const payload = {
      name: form.name || null,
      start: form.start,
      end: form.end,
      colour: form.colour,
      notes: form.notes || null,
    };
    const saved = await submit(() =>
      item
        ? api.update("shift_type", item.id, payload)
        : api.create("shift_type", payload),
    );
    if (saved) onClose();
  };

  return (
    <div className="form">
      <Field label="Name (optional)">
        <input
          placeholder="Uses the default shift name"
          value={form.name}
          onChange={(event) => set("name", event.target.value)}
        />
      </Field>
      <FieldError error={error} field="name" />
      <div className="form-row">
        <Field label="Start">
          <input
            type="time"
            value={form.start}
            onChange={(event) => set("start", event.target.value)}
          />
        </Field>
        <Field label={endsNextDay(form.start, form.end) ? "End (+1)" : "End"}>
          <input
            type="time"
            value={form.end}
            onChange={(event) => set("end", event.target.value)}
          />
        </Field>
        <Field label="Colour">
          <input
            type="color"
            value={form.colour}
            onChange={(event) => set("colour", event.target.value)}
          />
        </Field>
      </div>
      <FieldError error={error} field="start" />
      <FieldError error={error} field="end" />
      <FieldError error={error} field="colour" />
      <Field label="Notes">
        <input
          value={form.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </Field>
      <FormError error={error} fields={FIELDS} />
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

export const ShiftTypes = () => {
  const { config } = useRoster();
  const { locale } = useHass();
  const timeFormat = locale?.time_format ?? "24";
  const timeLocale = locale?.language ?? "en";
  const [editing, setEditing] = useState<ShiftType | "new" | null>(null);
  const [deleting, setDeleting] = useState<ShiftType | null>(null);

  if (editing) {
    return (
      <Form
        item={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <ul className="list">
        {config.shift_types.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="list-main"
              onClick={() => setEditing(item)}
            >
              <span className="swatch" style={{ background: item.colour }} />
              <span>
                {item.name || config.default_shift_name}
                <span className="muted">
                  {" "}
                  {formatClock(item.start, timeFormat, timeLocale)}–
                  {formatClock(item.end, timeFormat, timeLocale)}
                  {endsNextDay(item.start, item.end) ? " (+1)" : ""}
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
      <button
        type="button"
        className="button primary"
        onClick={() => setEditing("new")}
      >
        Add shift type
      </button>
      {deleting && (
        <DeleteSheet
          kind="shift_type"
          item={deleting}
          replacements={config.shift_types.filter(
            (item) => item.id !== deleting.id,
          )}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
};
