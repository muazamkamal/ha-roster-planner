import { useCallback, useEffect, useMemo, useState } from "react";
import { MainScreen } from "./components/MainScreen";
import { SettingsList } from "./components/Settings";
import { ICONS, IconButton } from "./components/ui";
import { todayIn } from "./dates";
import type { Hass } from "./types";
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
  const [showSettings, setShowSettings] = useState(false);
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

  const setAppBar = useCallback(
    (element: (HTMLElement & { narrow: boolean }) | null) => {
      if (element) element.narrow = narrow;
    },
    [narrow],
  );
  const setMenuButton = useCallback(
    (element: (HTMLElement & { hass: Hass; narrow: boolean }) | null) => {
      if (!element) return;
      element.hass = hass;
      element.narrow = narrow;
    },
    [hass, narrow],
  );

  return (
    <ha-top-app-bar-fixed ref={setAppBar}>
      <ha-menu-button slot="navigationIcon" ref={setMenuButton} />
      <div slot="title">
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
          (roster?.title ?? "Roster")
        )}
      </div>
      {context && (
        <IconButton
          path={ICONS.gear}
          label="Settings"
          slot="actionItems"
          onClick={() => setShowSettings(true)}
        />
      )}
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
          <MainScreen narrow={narrow} />
          {showSettings && (
            <SettingsList onClose={() => setShowSettings(false)} />
          )}
        </RosterContext.Provider>
      )}
    </ha-top-app-bar-fixed>
  );
};
