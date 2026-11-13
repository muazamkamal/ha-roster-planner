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
  // connection, timezone, and display format matter here.
  set hass(value: Hass) {
    const changed =
      this.currentHass?.connection !== value.connection ||
      this.currentHass?.config.time_zone !== value.config.time_zone ||
      this.currentHass?.locale?.time_format !== value.locale?.time_format ||
      this.currentHass?.locale?.language !== value.locale?.language;
    this.currentHass = value;
    if (changed) this.render();
  }

  set narrow(value: boolean) {
    if (value === this.currentNarrow) return;
    this.currentNarrow = value;
    this.render();
  }

  connectedCallback() {
    let container = this.shadowRoot?.querySelector("div");
    if (!container) {
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = styles;
      container = document.createElement("div");
      shadow.append(style, container);
    }
    this.root ??= createRoot(container);
    this.render();
  }

  // HA removes the panel when you navigate away. Unmounting ends the
  // websocket subscription and timers, which would otherwise pile up.
  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
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
