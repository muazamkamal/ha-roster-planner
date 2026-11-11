import { useState } from "react";
import type { ChangeEvent } from "react";
import { useRoster, useSubmit } from "../hooks";
import { Confirm, FormError } from "./ui";

export const Backup = () => {
  const { api, canEdit, today } = useRoster();
  const { error, busy, submit, setError } = useSubmit();
  const [exported, setExported] = useState<string | null>(null);
  const [pending, setPending] = useState<unknown>(null);
  const [imported, setImported] = useState(false);

  const download = () =>
    submit(async () => {
      const text = JSON.stringify(await api.exportData(), null, 2);
      // Shown as text too: not every webview supports blob downloads.
      setExported(text);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([text], { type: "application/json" }),
      );
      link.download = `roster-${today}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImported(false);
    try {
      setPending(JSON.parse(await file.text()));
      setError(null);
    } catch {
      setError({
        code: "invalid_json",
        message: "That file is not valid JSON",
      });
    }
  };

  const restore = async () => {
    const data = pending;
    setPending(null);
    setImported(await submit(() => api.importData(data)));
  };

  return (
    <div className="form">
      <button
        type="button"
        className="button"
        disabled={busy}
        onClick={download}
      >
        Export JSON
      </button>
      {exported && (
        <textarea
          className="export"
          aria-label="Exported JSON"
          readOnly
          rows={8}
          value={exported}
        />
      )}
      {canEdit && (
        <label className="button file-button">
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={choose}
          />
        </label>
      )}
      <FormError error={error} />
      {imported && <p className="muted">Roster restored.</p>}
      {pending !== null && (
        <Confirm
          title="Replace this roster?"
          message="Everything in this roster will be replaced by the file's contents."
          action="Replace"
          onConfirm={restore}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
};
