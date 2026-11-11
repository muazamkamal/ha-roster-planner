import { useState } from "react";
import { formatDay } from "../dates";
import { useRoster, useSubmit } from "../hooks";
import type { DayAssignment, DayDetail, ShiftType } from "../types";
import { actionsFor, assignmentOf, originLine, timeRange } from "../viewModel";
import { AssignmentPicker } from "./AssignmentPicker";
import { Field, FormError, Sheet } from "./ui";

/** Start editing from what the day already has, so a small change is small. */
const initialAssignment = (
  day: DayDetail,
  shiftTypes: ShiftType[],
): DayAssignment => {
  const current = day.exception?.assignment;
  if (current && current.type !== "off") return current;
  if (day.shift) return assignmentOf(day.shift, shiftTypes);
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
  const { error, busy, submit } = useSubmit();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(day.exception?.note ?? "");
  const [assignment, setAssignment] = useState<DayAssignment>(() =>
    initialAssignment(day, config.shift_types),
  );
  const actions = actionsFor(day);
  const origin = originLine(day);

  const run = async (action: () => Promise<unknown>) => {
    if (await submit(action)) onClose();
  };

  return (
    <Sheet title={formatDay(day.date, "EEEE d MMMM")} onClose={onClose}>
      {day.shift ? (
        <p className="sheet-shift">
          <span
            className="colour-bar"
            style={{ background: day.shift.colour }}
          />
          <strong>{timeRange(day.shift)}</strong> {day.shift.title}
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
                  onClick={() => run(() => api.clearException(day.date))}
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
