import type { DayAssignment, ShiftType } from "../types";

const CUSTOM = "__custom";
const OFF = "__off";

const selection = (value: DayAssignment): string => {
  if (value.type === "off") return OFF;
  if (value.type === "custom") return CUSTOM;
  return value.shift_type_id;
};

/** Pick a shift type, custom times, or (when allowed) off. */
export const AssignmentPicker = ({
  value,
  shiftTypes,
  onChange,
  allowOff = true,
}: {
  value: DayAssignment;
  shiftTypes: ShiftType[];
  onChange: (value: DayAssignment) => void;
  allowOff?: boolean;
}) => {
  const change = (selected: string) => {
    if (selected === OFF) onChange({ type: "off" });
    else if (selected === CUSTOM)
      onChange({ type: "custom", start: "09:00", end: "17:00" });
    else onChange({ type: "shift", shift_type_id: selected });
  };

  return (
    <div className="assignment">
      <select
        value={selection(value)}
        onChange={(event) => change(event.target.value)}
      >
        {allowOff && <option value={OFF}>Off</option>}
        {shiftTypes.map((shiftType) => (
          <option key={shiftType.id} value={shiftType.id}>
            {shiftType.name} ({shiftType.start}–{shiftType.end})
          </option>
        ))}
        <option value={CUSTOM}>Custom times</option>
      </select>
      {value.type === "custom" && (
        <div className="assignment-times">
          <input
            type="time"
            aria-label="Start"
            value={value.start}
            onChange={(event) =>
              onChange({ ...value, start: event.target.value })
            }
          />
          <input
            type="time"
            aria-label="End"
            value={value.end}
            onChange={(event) =>
              onChange({ ...value, end: event.target.value })
            }
          />
          {value.end < value.start && <span className="muted">(+1)</span>}
        </div>
      )}
    </div>
  );
};
