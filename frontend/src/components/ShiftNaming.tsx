import { useState } from "react";
import { useRoster, useSubmit } from "../hooks";
import { Field, FormError } from "./ui";

export const ShiftNaming = () => {
  const { api, config } = useRoster();
  const { error, busy, submit } = useSubmit();
  const [name, setName] = useState(config.default_shift_name);

  const save = async () => {
    if (await submit(() => api.setDefaultShiftName(name))) {
      setName(name.trim() || "Shift");
    }
  };

  return (
    <div className="form">
      <Field label="Default shift name">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Shift"
        />
      </Field>
      <p className="muted">
        Used for shift types and custom shifts without a name. Leave blank to
        use “Shift”.
      </p>
      <FormError error={error} />
      <div className="actions">
        <button
          type="button"
          className="button primary"
          disabled={busy}
          onClick={save}
        >
          Save
        </button>
      </div>
    </div>
  );
};
