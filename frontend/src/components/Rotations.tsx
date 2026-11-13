import { useState } from "react";
import { mondayOf } from "../dates";
import { useRoster, useSubmit } from "../hooks";
import type { Rotation, Weekday } from "../types";
import { WEEKDAYS } from "../types";
import {
  byPriority,
  movedPriorities,
  recurringShift,
  resizeSlots,
  weekdayName,
} from "../viewModel";
import { DeleteSheet } from "./DeleteSheet";
import { Preview } from "./Preview";
import { Field, FieldError, FormError, ICONS, IconButton } from "./ui";

const FIELDS = [
  "name",
  "anchor",
  "cycle_weeks",
  "slots",
  "active_from",
  "active_until",
];
const PREVIEW_WEEKS = 8;
const MAX_CYCLE = 12;

const clampCycle = (value: number): number =>
  Math.min(MAX_CYCLE, Math.max(1, Math.round(value) || 1));

const Form = ({
  item,
  onClose,
}: {
  item: Rotation | null;
  onClose: () => void;
}) => {
  const { api, config, today } = useRoster();
  const { error, busy, submit } = useSubmit();
  const monday = mondayOf(today);
  const [name, setName] = useState(item?.name ?? "");
  const [anchor, setAnchor] = useState(item?.anchor ?? monday);
  const [slots, setSlots] = useState<(string | null)[]>(
    item?.slots ?? [config.patterns[0]?.id ?? null],
  );
  const [activeFrom, setActiveFrom] = useState(item?.active_from ?? monday);
  const [activeUntil, setActiveUntil] = useState(item?.active_until ?? "");

  const payload = {
    name,
    anchor,
    cycle_weeks: slots.length,
    slots,
    active_from: activeFrom,
    active_until: activeUntil || null,
    ...(item ? { priority: item.priority } : {}),
  };

  const save = async () => {
    const saved = await submit(() =>
      item
        ? api.update("rotation", item.id, payload)
        : api.create("rotation", payload),
    );
    if (saved) onClose();
  };

  return (
    <div className="form">
      <Field label="Name">
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <FieldError error={error} field="name" />
      <div className="form-row">
        <Field label="Start date (a Monday)">
          <input
            type="date"
            value={anchor}
            onChange={(event) =>
              event.target.value && setAnchor(mondayOf(event.target.value))
            }
          />
        </Field>
        <Field label="Cycle length (weeks)">
          <input
            type="number"
            min={1}
            max={MAX_CYCLE}
            value={slots.length}
            onChange={(event) =>
              setSlots(
                resizeSlots(slots, clampCycle(Number(event.target.value))),
              )
            }
          />
        </Field>
      </div>
      <FieldError error={error} field="anchor" />
      <FieldError error={error} field="cycle_weeks" />
      {slots.map((slot, index) => (
        <Field label={`Week ${index + 1}`} key={index}>
          <select
            value={slot ?? ""}
            onChange={(event) =>
              setSlots(
                slots.map((current, position) =>
                  position === index ? event.target.value || null : current,
                ),
              )
            }
          >
            <option value="">Empty</option>
            {config.patterns.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </select>
        </Field>
      ))}
      <FieldError error={error} field="slots" />
      <div className="form-row">
        <Field label="Active from">
          <input
            type="date"
            value={activeFrom}
            onChange={(event) => setActiveFrom(event.target.value)}
          />
        </Field>
        <Field label="Active until (optional)">
          <input
            type="date"
            value={activeUntil}
            onChange={(event) => setActiveUntil(event.target.value)}
          />
        </Field>
      </div>
      <FieldError error={error} field="active_from" />
      <FieldError error={error} field="active_until" />
      <FormError error={error} fields={FIELDS} />
      <Preview
        kind="rotation"
        draft={{ ...payload, name: name || "Preview", id: item?.id }}
        start={monday}
        weeks={PREVIEW_WEEKS}
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

const Wizard = ({ onClose }: { onClose: () => void }) => {
  const { api, config, today } = useRoster();
  const { error, busy, submit, setError } = useSubmit();
  const [everyWeeks, setEveryWeeks] = useState(2);
  const [weekday, setWeekday] = useState<Weekday>("mon");
  const [shiftTypeId, setShiftTypeId] = useState(config.shift_types[0]?.id);
  const [start, setStart] = useState(today);

  const save = async () => {
    const shiftType = config.shift_types.find(
      (item) => item.id === shiftTypeId,
    );
    if (!shiftType) {
      setError({ code: "required", message: "Add a shift type first" });
      return;
    }
    if (!start) {
      setError({ code: "required", message: "Choose a starting date" });
      return;
    }
    const built = recurringShift(
      everyWeeks,
      weekday,
      shiftType,
      start,
      config.default_shift_name,
    );
    const saved = await submit(async () => {
      const pattern = await api.create<{ id: string }>(
        "pattern",
        built.pattern,
      );
      try {
        await api.create("rotation", built.rotation(pattern.id));
      } catch (err) {
        // Report the original failure even if tidying up fails too.
        await api.remove("pattern", pattern.id).catch(() => undefined);
        throw err;
      }
    });
    if (saved) onClose();
  };

  return (
    <div className="form">
      <div className="form-row">
        <Field label="Every (weeks)">
          <input
            type="number"
            min={1}
            max={MAX_CYCLE}
            value={everyWeeks}
            onChange={(event) =>
              setEveryWeeks(clampCycle(Number(event.target.value)))
            }
          />
        </Field>
        <Field label="On">
          <select
            value={weekday}
            onChange={(event) => setWeekday(event.target.value as Weekday)}
          >
            {WEEKDAYS.map((item) => (
              <option key={item} value={item}>
                {weekdayName(item)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Shift type">
        <select
          value={shiftTypeId ?? ""}
          onChange={(event) => setShiftTypeId(event.target.value)}
        >
          {config.shift_types.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Starting">
        <input
          type="date"
          value={start}
          onChange={(event) => setStart(event.target.value)}
        />
      </Field>
      <FormError error={error} />
      <div className="actions">
        <button
          type="button"
          className="button primary"
          disabled={busy}
          onClick={save}
        >
          Create
        </button>
        <button type="button" className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export const Rotations = () => {
  const { api, config } = useRoster();
  const { error, busy, submit } = useSubmit();
  const [editing, setEditing] = useState<Rotation | "new" | null>(null);
  const [wizard, setWizard] = useState(false);
  const [deleting, setDeleting] = useState<Rotation | null>(null);
  const ordered = byPriority(config.rotations);

  if (wizard) return <Wizard onClose={() => setWizard(false)} />;
  if (editing) {
    return (
      <Form
        item={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  const move = (id: string, direction: -1 | 1) =>
    submit(async () => {
      for (const change of movedPriorities(ordered, id, direction)) {
        await api.update("rotation", change.id, {
          priority: change.priority,
        });
      }
    });

  return (
    <>
      <FormError error={error} />
      <ul className="list">
        {ordered.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className="list-main"
              onClick={() => setEditing(item)}
            >
              <span>
                {item.name}
                <span className="muted list-detail">
                  {item.cycle_weeks}-week cycle
                </span>
              </span>
            </button>
            <IconButton
              path={ICONS.up}
              label="Higher priority"
              disabled={busy || index === 0}
              onClick={() => move(item.id, -1)}
            />
            <IconButton
              path={ICONS.down}
              label="Lower priority"
              disabled={busy || index === ordered.length - 1}
              onClick={() => move(item.id, 1)}
            />
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
      <div className="actions">
        <button
          type="button"
          className="button primary"
          onClick={() => setEditing("new")}
        >
          Add rotation
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setWizard(true)}
        >
          Quick add: recurring shift
        </button>
      </div>
      {deleting && (
        <DeleteSheet
          kind="rotation"
          item={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
};
