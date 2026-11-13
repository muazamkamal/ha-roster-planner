import type * as React from "react";
import type { Hass } from "./types";

type HAElementProps<Element extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<Element>,
  Element
>;

interface HAMenuButton extends HTMLElement {
  hass: Hass;
  narrow: boolean;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ha-top-app-bar-fixed": HAElementProps<HTMLElement & { narrow: boolean }>;
      "ha-menu-button": HAElementProps<HAMenuButton>;
    }
  }
}
