import { useState } from "react";
import type { ComponentType } from "react";
import { useRoster } from "../hooks";
import { Backup } from "./Backup";
import { Exceptions } from "./Exceptions";
import { Patterns } from "./Patterns";
import { Rotations } from "./Rotations";
import { ShiftTypes } from "./ShiftTypes";
import { ShiftNaming } from "./ShiftNaming";
import { ICONS, Icon, Sheet } from "./ui";
import { Variations } from "./Variations";

interface Screen {
  title: string;
  component: ComponentType;
  readOnly?: boolean;
}

const SCREENS: Screen[] = [
  { title: "Shift naming", component: ShiftNaming },
  { title: "Shift types", component: ShiftTypes },
  { title: "Week patterns", component: Patterns },
  { title: "Rotations", component: Rotations },
  { title: "Variations", component: Variations },
  { title: "Exceptions", component: Exceptions },
  { title: "Backup", component: Backup, readOnly: true },
];

export const SettingsList = ({ onClose }: { onClose: () => void }) => {
  const { canEdit } = useRoster();
  const [open, setOpen] = useState<Screen | null>(null);
  const screens = SCREENS.filter((screen) => canEdit || screen.readOnly);
  const Component = open?.component;

  return (
    <Sheet title={open?.title ?? "Settings"} onClose={onClose} wide>
      {Component ? (
        <>
          <button
            type="button"
            className="breadcrumb"
            onClick={() => setOpen(null)}
          >
            <Icon path={ICONS.left} /> Settings
          </button>
          <Component />
        </>
      ) : (
        <>
          {!canEdit && (
            <p className="muted screen-title">
              You can view this roster but not change it.
            </p>
          )}
          <ul className="list">
            {screens.map((screen) => (
              <li key={screen.title}>
                <button
                  type="button"
                  className="list-main"
                  onClick={() => setOpen(screen)}
                >
                  <span>{screen.title}</span>
                  <Icon path={ICONS.right} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Sheet>
  );
};
