import { useState } from "react";
import { formatDay } from "../dates";
import { useRoster, useSubmit } from "../hooks";
import type { RosterException } from "../types";
import { describeException, splitExceptions } from "../viewModel";
import { Confirm, FormError } from "./ui";

const Row = ({
  item,
  onRemove,
}: {
  item: RosterException;
  onRemove: (item: RosterException) => void;
}) => {
  const { config } = useRoster();
  return (
    <li>
      <span className="list-main">
        <span>
          {formatDay(item.date, "EEE d MMM yyyy")}
          <span className="muted list-detail">
            {describeException(item, config.shift_types)}
          </span>
        </span>
      </span>
      <button
        type="button"
        className="button small danger"
        onClick={() => onRemove(item)}
      >
        Remove
      </button>
    </li>
  );
};

export const Exceptions = () => {
  const { api, config, today } = useRoster();
  const { error, submit } = useSubmit();
  const [removing, setRemoving] = useState<RosterException | null>(null);
  const [showPast, setShowPast] = useState(false);
  const { upcoming, past } = splitExceptions(config.exceptions, today);

  const remove = async () => {
    if (!removing) return;
    const date = removing.date;
    setRemoving(null);
    await submit(() => api.clearException(date));
  };

  return (
    <>
      <FormError error={error} />
      {upcoming.length === 0 && past.length === 0 && (
        <p className="muted">No one-off changes.</p>
      )}
      <ul className="list">
        {upcoming.map((item) => (
          <Row key={item.date} item={item} onRemove={setRemoving} />
        ))}
      </ul>
      {past.length > 0 && (
        <button
          type="button"
          className="button small"
          onClick={() => setShowPast(!showPast)}
        >
          {showPast ? "Hide past" : `Show past (${past.length})`}
        </button>
      )}
      {showPast && (
        <ul className="list past">
          {past.map((item) => (
            <Row key={item.date} item={item} onRemove={setRemoving} />
          ))}
        </ul>
      )}
      {removing && (
        <Confirm
          title={`Remove the change on ${formatDay(removing.date, "d MMM")}?`}
          message={
            removing.assignment
              ? "This date will follow the roster again."
              : "The note will be removed."
          }
          action="Remove"
          onConfirm={remove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </>
  );
};
