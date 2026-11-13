import { useEffect } from "react";
import type { ReactNode } from "react";
import type { ApiError } from "../types";

export const ICONS = {
  menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
  back: "M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",
  left: "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",
  right: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
  gear: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
  up: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",
  down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
} as const;

export const Icon = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d={path} fill="currentColor" />
  </svg>
);

export const IconButton = ({
  path,
  label,
  onClick,
  disabled,
  slot,
}: {
  path: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  slot?: string;
}) => (
  <button
    type="button"
    className="icon-button"
    slot={slot}
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon path={path} />
  </button>
);

export const Sheet = ({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`sheet-backdrop${wide ? " wide-sheet" : ""}`}
      onClick={onClose}
    >
      <div
        className={`sheet${wide ? " wide-sheet" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export const Confirm = ({
  title,
  message,
  action,
  onConfirm,
  onCancel,
}: {
  title: string;
  message?: string;
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Sheet title={title} onClose={onCancel}>
    {message && <p className="muted">{message}</p>}
    <div className="actions">
      <button type="button" className="button danger" onClick={onConfirm}>
        {action}
      </button>
      <button type="button" className="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  </Sheet>
);

/** Shows an API error beside the field it names. */
export const FieldError = ({
  error,
  field,
}: {
  error: ApiError | null;
  field: string;
}) =>
  error?.field === field ? <p className="error">{error.message}</p> : null;

/** Shows an API error that no field on the form will display. */
export const FormError = ({
  error,
  fields = [],
}: {
  error: ApiError | null;
  fields?: string[];
}) =>
  error && !fields.includes(error.field ?? "") ? (
    <p className="error">{error.message}</p>
  ) : null;

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);
