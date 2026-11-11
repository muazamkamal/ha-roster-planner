import { useEffect, useMemo, useRef, useState } from "react";
import { MainScreen } from "./components/MainScreen";
import { SettingsList } from "./components/Settings";
import { ICONS, IconButton } from "./components/ui";
import { todayIn } from "./dates";
import {
  RosterContext,
  useHass,
  useRosterConfig,
  useRosterList,
} from "./hooks";

const TODAY_CHECK_MS = 60_000;

const useToday = (timeZone: string): string => {
  const [today, setToday] = useState(() => todayIn(timeZone));
  useEffect(() => {
    const timer = setInterval(
      () => setToday(todayIn(timeZone)),
      TODAY_CHECK_MS,
    );
    return () => clearInterval(timer);
  }, [timeZone]);
  return today;
};

export const App = ({ narrow }: { narrow: boolean }) => {
  const hass = useHass();
  const { rosters, error } = useRosterList();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [inSettings, setInSettings] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const today = useToday(hass.config.time_zone);

  // Fall back to the first roster if the chosen one is no longer listed.
  const roster =
    rosters?.find((item) => item.entry_id === entryId) ?? rosters?.[0];
  const activeId = roster?.entry_id ?? null;
  const { api, config, error: configError } = useRosterConfig(activeId);
  const canEdit = roster?.can_edit ?? false;

  const context = useMemo(
    () => (api && config ? { api, config, canEdit, today } : null),
    [api, config, canEdit, today],
  );

  const toggleMenu = () =>
    root.current?.dispatchEvent(
      new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }),
    );

  return (
    <div className="app" ref={root}>
      <header className="header">
        {inSettings ? (
          <IconButton
            path={ICONS.back}
            label="Back"
            onClick={() => setInSettings(false)}
          />
        ) : (
          narrow && (
            <IconButton path={ICONS.menu} label="Menu" onClick={toggleMenu} />
          )
        )}
        {rosters && rosters.length > 1 ? (
          <select
            className="roster-switcher"
            aria-label="Roster"
            value={activeId ?? ""}
            onChange={(event) => setEntryId(event.target.value)}
          >
            {rosters.map((item) => (
              <option key={item.entry_id} value={item.entry_id}>
                {item.title}
              </option>
            ))}
          </select>
        ) : (
          <h1>{roster?.title ?? "Roster"}</h1>
        )}
        {!inSettings && context && (
          <IconButton
            path={ICONS.gear}
            label="Settings"
            onClick={() => setInSettings(true)}
          />
        )}
      </header>
      {(error ?? configError) && (
        <p className="error content">{(error ?? configError)?.message}</p>
      )}
      {rosters?.length === 0 && (
        <p className="content muted">
          Add a roster under Settings → Devices & services.
        </p>
      )}
      {context && (
        <RosterContext.Provider value={context}>
          {inSettings ? <SettingsList /> : <MainScreen narrow={narrow} />}
        </RosterContext.Provider>
      )}
    </div>
  );
};
