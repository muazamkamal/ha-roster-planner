import { useState } from "react";
import { formatDay } from "../dates";
import { useHass, useRoster, useSubmit } from "../hooks";
import type { DayAssignment, DayDetail, ShiftType } from "../types";
import { actionsFor, assignmentOf, originLine, timeRange } from "../viewModel";
import { AssignmentPicker } from "./AssignmentPicker";
import { Field, FormError, Sheet } from "./ui";

/** Start editing from what the day already has, so a small change is small. */
const initialAssignment = (
  day: DayDetail,
  shiftTypes: ShiftType[],
  defaultShiftName: string,
): DayAssignment => {
  const current = day.exception?.assignment;
  if (current && current.type !== "off") return current;
  if (day.shift) return assignmentOf(day.shift, shiftTypes, defaultShiftName);
  return shiftTypes[0]
    ? { type: "shift", shift_type_id: shiftTypes[0].id }
    : { type: "custom", start: "09:00", end: "17:00" };
};

export const DaySheet = ({
  day,
  onClose,
}: {
  day: DayDetail;
  onClose: () => void;
}) => {
  const { api, config, canEdit } = useRoster();
  const { locale } = useHass();
  const timeFormat = locale?.time_format ?? "24";
  const timeLocale = locale?.language ?? "en";
  const { error, busy, submit } = useSubmit();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(day.exception?.note ?? "");
  const [assignment, setAssignment] = useState<DayAssignment>(() =>
    initialAssignment(day, config.shift_types, config.default_shift_name),
  );
  const actions = actionsFor(day);
  const origin = originLine(day, timeFormat, timeLocale);
  const savedNote = day.exception?.note ?? "";
  const noteChanged = note.trim() !== savedNote;

  const run = async (action: () => Promise<unknown>) => {
    if (await submit(action)) onClose();
  };

  /** Keep the rostered shift, with the note if there is one. */
  const followRoster = () =>
    note.trim()
      ? api.setException(day.date, null, note)
      : api.clearException(day.date);

  /** Save the note alone, leaving any change to the day as it is. */
  const saveNote = () =>
    day.exception?.assignment
      ? api.setException(day.date, day.exception.assignment, note)
      : followRoster();

  return (
    <Sheet title={formatDay(day.date, "EEEE d MMMM")} onClose={onClose}>
      {day.shift ? (
        <p className="sheet-shift">
          <span
            className="colour-bar"
            style={{ background: day.shift.colour }}
          />
          <strong>{timeRange(day.shift, timeFormat, timeLocale)}</strong>{" "}
          {day.shift.title}
        </p>
      ) : (
        <p className="sheet-shift muted">Off</p>
      )}
      {origin && <p className="muted">{origin}</p>}
      {day.exception?.note && !canEdit && <p>{day.exception.note}</p>}
      {day.overlaps_previous && (
        <p className="warning">Overlaps the previous day's shift.</p>
      )}

      {canEdit && editing && (
        <AssignmentPicker
          value={assignment}
          shiftTypes={config.shift_types}
          onChange={setAssignment}
          allowOff={false}
        />
      )}
      {canEdit && (
        <Field label="Note">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
      )}
      <FormError error={error} />

      {canEdit && (
        <div className="actions">
          {editing ? (
            <>
              <button
                type="button"
                className="button primary"
                disabled={busy}
                onClick={() =>
                  run(() => api.setException(day.date, assignment, note))
                }
              >
                Save
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {noteChanged && (
                <button
                  type="button"
                  className="button primary"
                  disabled={busy}
                  onClick={() => run(saveNote)}
                >
                  Save note
                </button>
              )}
              {actions.change && (
                <button
                  type="button"
                  className="button"
                  onClick={() => setEditing(true)}
                >
                  Change this day
                </button>
              )}
              {actions.extra && (
                <button
                  type="button"
                  className="button"
                  onClick={() => setEditing(true)}
                >
                  Add extra shift
                </button>
              )}
              {actions.off && (
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() =>
                    run(() => api.setException(day.date, { type: "off" }, note))
                  }
                >
                  Day off
                </button>
              )}
              {actions.reset && (
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() => run(followRoster)}
                >
                  Reset to roster
                </button>
              )}
            </>
          )}
        </div>
      )}
      {!editing && (
        <button type="button" className="button" onClick={onClose}>
          Close
        </button>
      )}
    </Sheet>
  );
};
