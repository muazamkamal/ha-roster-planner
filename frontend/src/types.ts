export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: Weekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export interface ShiftType {
  id: string;
  name: string;
  start: string;
  end: string;
  colour: string;
  notes?: string;
}

export type DayAssignment =
  | { type: "off" }
  | { type: "shift"; shift_type_id: string }
  | { type: "custom"; start: string; end: string; label?: string | null };

export type Days = Partial<Record<Weekday, DayAssignment>>;

export interface WeekPattern {
  id: string;
  name: string;
  days: Days;
}

export interface Rotation {
  id: string;
  name: string;
  anchor: string;
  cycle_weeks: number;
  slots: (string | null)[];
  active_from: string;
  active_until: string | null;
  priority: number;
}

export interface Variation {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  mode: "pattern" | "days";
  pattern_id?: string;
  days?: Days;
}

export interface RosterException {
  date: string;
  assignment: DayAssignment;
  note?: string;
}

export interface RosterConfig {
  version: number;
  shift_types: ShiftType[];
  patterns: WeekPattern[];
  rotations: Rotation[];
  variations: Variation[];
  exceptions: RosterException[];
}

export interface Resolved {
  date: string;
  start: string;
  end: string;
  title: string;
  colour: string;
  source: "rotation" | "variation" | "exception";
  source_id: string;
  source_name: string | null;
  week: number | null;
  flag: "extra" | "changed" | null;
  note: string | null;
}

export interface DayDetail {
  date: string;
  shift: Resolved | null;
  base: Resolved | null;
  exception: RosterException | null;
  variation_id: string | null;
  overlaps_previous: boolean;
}

export interface RosterSummary {
  entry_id: string;
  title: string;
  owner: string | null;
  can_edit: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string | null;
}

export interface HassConnection {
  sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
  subscribeMessage<T>(
    callback: (message: T) => void,
    message: Record<string, unknown>,
  ): Promise<() => Promise<void>>;
}

export interface Hass {
  connection: HassConnection;
  config: { time_zone: string };
}
