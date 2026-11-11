import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RosterApi } from "./api";
import type {
  ApiError,
  DayDetail,
  Hass,
  RosterConfig,
  RosterSummary,
} from "./types";

export const HassContext = createContext<Hass | null>(null);

export const useHass = (): Hass => {
  const hass = useContext(HassContext);
  if (!hass) throw new Error("Panel rendered without hass");
  return hass;
};

export interface RosterContextValue {
  api: RosterApi;
  config: RosterConfig;
  canEdit: boolean;
  today: string;
}

export const RosterContext = createContext<RosterContextValue | null>(null);

export const useRoster = (): RosterContextValue => {
  const value = useContext(RosterContext);
  if (!value) throw new Error("No roster selected");
  return value;
};

export const useRosterList = () => {
  const { connection } = useHass();
  const [rosters, setRosters] = useState<RosterSummary[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let active = true;
    RosterApi.list(connection).then(
      (result) => active && setRosters(result),
      (err: ApiError) => active && setError(err),
    );
    return () => {
      active = false;
    };
  }, [connection]);

  return { rosters, error };
};

/** Keeps a live copy of the roster's rules, pushed on every change. */
export const useRosterConfig = (entryId: string | null) => {
  const { connection } = useHass();
  const [config, setConfig] = useState<RosterConfig | null>(null);
  const api = useMemo(
    () => (entryId ? new RosterApi(connection, entryId) : null),
    [connection, entryId],
  );

  useEffect(() => {
    if (!api) return;
    let active = true;
    let unsubscribe: (() => Promise<void>) | undefined;
    api
      .subscribe((next) => active && setConfig(next))
      .then((stop) => {
        if (active) unsubscribe = stop;
        else void stop();
      });
    return () => {
      active = false;
      setConfig(null);
      void unsubscribe?.();
    };
  }, [api]);

  return { api, config };
};

/** Resolved days for a range, refetched whenever the rules change. */
export const useDays = (start: string, end: string): DayDetail[] | null => {
  const { api, config } = useRoster();
  const [days, setDays] = useState<DayDetail[] | null>(null);

  useEffect(() => {
    let active = true;
    // On failure (usually a dropped connection) keep showing the last result.
    api.resolve(start, end).then(
      (result) => active && setDays(result),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [api, config, start, end]);

  return days;
};

/** Runs a save, exposing the error so forms can show it next to the field. */
export const useSubmit = () => {
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (action: () => Promise<unknown>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { error, busy, submit, setError };
};
