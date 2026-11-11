import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { App } from "./App";
import { HassContext } from "./hooks";
import styles from "./styles.css?inline";
import type { Hass } from "./types";

class RosterPlannerPanel extends HTMLElement {
  private root?: Root;
  private currentHass?: Hass;
  private currentNarrow = false;

  // HA sets hass on every state change anywhere in the system. Only the
  // connection and timezone matter here, so other updates skip the re-render.
  set hass(value: Hass) {
    const changed =
      this.currentHass?.connection !== value.connection ||
      this.currentHass?.config.time_zone !== value.config.time_zone;
    this.currentHass = value;
    if (changed) this.render();
  }

  set narrow(value: boolean) {
    if (value === this.currentNarrow) return;
    this.currentNarrow = value;
    this.render();
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = styles;
      const container = document.createElement("div");
      shadow.append(style, container);
      this.root = createRoot(container);
    }
    this.render();
  }

  private render() {
    if (!this.root || !this.currentHass) return;
    this.root.render(
      <HassContext.Provider value={this.currentHass}>
        <App narrow={this.currentNarrow} />
      </HassContext.Provider>,
    );
  }
}

if (!customElements.get("roster-planner-panel")) {
  customElements.define("roster-planner-panel", RosterPlannerPanel);
}
