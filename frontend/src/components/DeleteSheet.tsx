import { useState } from "react";
import type { ItemKind } from "../api";
import { useRoster, useSubmit } from "../hooks";
import { FormError, Sheet } from "./ui";

interface Option {
  id: string;
  name: string;
}

/** Confirms a delete. If the item is in use, offers to replace it instead. */
export const DeleteSheet = ({
  kind,
  item,
  replacements = [],
  onClose,
}: {
  kind: ItemKind;
  item: Option;
  replacements?: Option[];
  onClose: () => void;
}) => {
  const { api } = useRoster();
  const { error, busy, submit } = useSubmit();
  const [replaceWith, setReplaceWith] = useState(replacements[0]?.id ?? "");
  const inUse = error?.code === "in_use";

  const run = async (replacement?: string) => {
    if (await submit(() => api.remove(kind, item.id, replacement))) onClose();
  };

  return (
    <Sheet title={`Delete ${item.name}?`} onClose={onClose}>
      <FormError error={error} />
      {inUse && replacements.length > 0 && (
        <select
          aria-label="Replace with"
          value={replaceWith}
          onChange={(event) => setReplaceWith(event.target.value)}
        >
          {replacements.map((option) => (
            <option key={option.id} value={option.id}>
              Replace with {option.name}
            </option>
          ))}
        </select>
      )}
      <div className="actions">
        {inUse ? (
          replacements.length > 0 && (
            <button
              type="button"
              className="button danger"
              disabled={busy}
              onClick={() => run(replaceWith)}
            >
              Replace and delete
            </button>
          )
        ) : (
          <button
            type="button"
            className="button danger"
            disabled={busy}
            onClick={() => run()}
          >
            Delete
          </button>
        )}
        <button type="button" className="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Sheet>
  );
};
