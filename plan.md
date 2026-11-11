# Roster Planner — Home Assistant integration plan

Nov 11, 2026 · @Zammy

## Overview

Build **Roster Planner**, a Home Assistant custom integration (installable via HACS) that models a rotating work roster as rules and exposes it as a normal calendar entity, plus a sidebar panel for managing it. It replaces hand-entering shifts into the Local Calendar integration.

**Core design decision: compute, don't copy.** The integration never writes events into another calendar. It stores rules (shift types, week patterns, rotations, variations, one-off exceptions) and computes each day's shift on demand when HA asks the calendar entity for events. Changing a rule instantly changes every future week, and there is nothing to sync or de-duplicate.

Because the output is a standard `CalendarEntity`, everything downstream works unchanged: the HA Calendar sidebar, calendar triggers in automations, dashboards, and other consumers such as a custom wall/fridge calendar display.

**Note to the implementing agent:** the owner is comfortable with Python, TypeScript and React, and runs HA on self-hosted infrastructure. Keep the main screen minimal; all complexity lives on secondary settings screens. Where this plan leaves a choice open, pick the simplest option that satisfies the acceptance criteria and note it in the README.

## Prerequisites

Development runs in a devcontainer with Python for the integration, Node for the panel, and a local Home Assistant instance for testing. The owner sets up the container; this lists what it needs.

| Tool | Version | Used for |
| --- | --- | --- |
| Python | Whatever current HA core requires (check `requires-python` in HA core's `pyproject.toml`; 3.14.2+ as of Nov 2026) | Integration code, tests, running HA locally |
| uv (or pip + venv) | Latest | Python dependency management |
| homeassistant | Pinned to the version `pytest-homeassistant-custom-component` targets | Local dev instance (`hass -c ./config`) |
| pytest-homeassistant-custom-component | Latest | Integration and engine tests |
| ruff | Latest | Python lint and format |
| mypy | Latest (optional) | Type checking |
| Node.js | Current LTS (24.x) | Building the panel |
| npm (or pnpm) | Bundled with Node | Frontend dependencies |
| TypeScript, Vite, React 18, date-fns | Via `package.json` | Panel source and bundle |
| Vitest, ESLint, Prettier | Via `package.json` | Frontend tests, lint, format |
| git + GitHub CLI (`gh`) | Latest | Repo, releases, CI |
| pre-commit | Latest (optional) | Runs ruff, eslint and prettier on commit |

**Devcontainer notes**

- Base image: a Debian/Ubuntu Python image plus the devcontainer Node and GitHub CLI features.
- Forward port **8123** so the local HA instance is reachable from the browser, and from a phone on the same network for Companion app testing.
- Symlink `custom_components/roster_planner` into `./config/custom_components/` so HA loads the code you're editing. Restart HA after Python changes; the panel only needs a rebuild and a browser refresh.
- Run `npm run watch` (a script for \`vite build --watch\`) so the bundle in `custom_components/roster_planner/frontend/` rebuilds on save.
- If the HA dev instance complains about missing system libraries, add `libturbojpeg0` and `ffmpeg` via apt. They aren't needed by this integration itself.
- No Docker-in-Docker needed. HACS and hassfest validation run in GitHub Actions only.
- Suggested VS Code extensions: Python, Pylance, Ruff, ESLint, Prettier, Home Assistant Config Helper.

## Requirements

The roster must support recurring patterns of any cycle length, temporary variations that revert on their own, and one-off changes, all editable from a UI.

**Functional**

1. **Shift types** — create, edit, delete. Fields: name, start time, end time, colour, optional notes. Example: "Open 07:00–15:30".
2. **Week patterns** — create, edit, delete. A named template for Mon–Sun where each day is a shift type, custom times, or off. Example: "Week A".
3. **Rotations** — create, edit, delete. A cycle of N weeks with a start date; each week slot uses a week pattern or is empty. Must express both:
   - "Monday repeats every other week" (2-week cycle, one slot with a Monday-only pattern)
   - "Week pattern A repeats every 3 weeks" (3-week cycle: A, empty, empty)
   - The owner's real case: a 4-week rotation, Tue–Sat, times varying by day and week.
4. **Variations** — create, edit, delete. A date range that temporarily replaces the rotation (with another pattern, or with per-weekday edits). After the range ends, the rotation resumes automatically with no manual reset.
5. **One-off exceptions** — on any single date: add an extra shift on a day off, change the times of a rostered shift, or cancel a shift (day off). Removing the exception reverts that date to the computed roster.
6. **Calendar entity** — `calendar.<name>` returns one event per working day for any requested range. Its state is `on` during a shift.
7. **Minimal main UI** — a clean week/month view of shifts. All rule management lives behind a settings screen.

**Constraints**

- At most **one continuous shift per day**. No split shifts. A shift may end after midnight (end ≤ start means next day).
- Weeks start on **Monday** for all cycle maths.
- All times are in the HA instance's configured local timezone. Use HA's `dt_util` and aware datetimes throughout.
- Mobile-first: the panel will mostly be used in the HA Companion app on a phone.
- Target the current stable HA release. No deprecated APIs (e.g. use `async_register_static_paths`, not `register_static_path`).

**Out of scope (v1)**

- Pay or hours calculation, leave balances, shift swapping with others.
- Importing from roster apps (Deputy, etc.).
- Multiple shifts per day.

Design so multiple rosters are possible later: one config entry = one roster (e.g. a partner's roster added as a second entry), with a roster switcher in the panel when more than one exists.

## Domain model and resolution

Every date resolves to at most one shift by checking three layers in order: **one-off exception → variation → rotations**. The first layer that has something for that date wins.

**Entities**

| Entity | Key fields | Notes |
| --- | --- | --- |
| ShiftType | id, name, start (HH:MM), end (HH:MM), colour, notes | end ≤ start = ends next day |
| DayAssignment | type: `shift` \| `custom` \| `off`; shift\_type\_id; start/end/label for `custom` | Used by patterns, variations and exceptions |
| WeekPattern | id, name, days: {mon..sun → DayAssignment} | Missing day = off |
| Rotation | id, name, anchor (a Monday), cycle\_weeks (1–12), slots: \[pattern\_id \| null\], active\_from, active\_until?, priority | Slot list length = cycle\_weeks |
| Variation | id, name, start\_date, end\_date, mode: `pattern` \| `days`, pattern\_id? , days? | Ranges must not overlap each other |
| Exception | date (unique), assignment: DayAssignment, note? | One per date |

**Storage** — one `homeassistant.helpers.storage.Store` per config entry, key `roster_planner.<entry_id>`, schema version 1 with a migration hook. IDs are short random strings.

```json
{
  "version": 1,
  "shift_types": [{"id": "st1", "name": "Open", "start": "07:00", "end": "15:30", "colour": "#4caf50"}],
  "patterns": [{"id": "pa", "name": "Week A", "days": {"tue": {"type": "shift", "shift_type_id": "st1"}, "wed": {"type": "custom", "start": "12:00", "end": "20:30"}}}],
  "rotations": [{"id": "r1", "name": "Main roster", "anchor": "2026-11-16", "cycle_weeks": 4, "slots": ["pa", "pb", "pc", "pd"], "active_from": "2026-11-16", "active_until": null, "priority": 0}],
  "variations": [{"id": "v1", "name": "Christmas trading", "start_date": "2026-12-14", "end_date": "2026-12-27", "mode": "pattern", "pattern_id": "px"}],
  "exceptions": [{"date": "2026-11-21", "assignment": {"type": "off"}, "note": "Swapped"}]
}
```

**Resolution algorithm** (pure function in `engine.py`, no HA imports, fully unit tested)

```python
def resolve(day: date, data) -> Resolved | None:
    # 1. Exception
    if ex := data.exception_for(day):
        base = resolve_without_exception(day, data)
        r = to_resolved(ex.assignment, day, source="exception")
        if r: r.flag = "extra" if base is None else "changed"
        return r                              # None if assignment is off
    return resolve_without_exception(day, data)

def resolve_without_exception(day, data):
    wd = WEEKDAYS[day.weekday()]              # "mon".."sun"
    # 2. Variation
    if v := data.variation_covering(day):
        if v.mode == "pattern":
            return to_resolved(data.pattern(v.pattern_id).days.get(wd), day, "variation")
        if wd in v.days:                       # days mode: listed weekdays only
            return to_resolved(v.days[wd], day, "variation")
    # 3. Rotations, by priority; empty slot or off day falls through
    for rot in sorted(data.active_rotations(day), key=lambda r: r.priority):
        weeks = (monday_of(day) - rot.anchor).days // 7
        pattern_id = rot.slots[weeks % rot.cycle_weeks]  # floor mod handles dates before anchor
        if pattern_id and (a := data.pattern(pattern_id).days.get(wd)) and a.type != "off":
            return to_resolved(a, day, "rotation")
    return None
```

`Resolved` carries: date, start and end as aware datetimes, title, colour, source (`rotation` | `variation` | `exception`), source id, and flag (`extra` | `changed` | none). The UI uses source and flag to show small markers.

Rotation fall-through means a "Monday every other week" rotation can be layered on a main Tue–Sat rotation without either one blocking the other.

## Architecture

A Python integration owns storage, resolution, the calendar entity and a websocket API. A React panel, bundled into one JS file served by the integration, talks to it only over that websocket API.

**Repository layout**

```text
roster-planner/
├─ custom_components/roster_planner/
│  ├─ __init__.py        # setup entry, load store, register panel + static path + websocket
│  ├─ manifest.json      # domain roster_planner, config_flow: true, deps: http, frontend, panel_custom, websocket_api
│  ├─ config_flow.py     # roster name, event title prefix, optional location; options flow to edit
│  ├─ const.py
│  ├─ models.py          # dataclasses + (de)serialisation + validation
│  ├─ store.py           # Store wrapper, CRUD, change listeners
│  ├─ engine.py          # pure resolution logic (no HA imports)
│  ├─ calendar.py        # RosterCalendarEntity
│  ├─ sensor.py          # next shift start / end (timestamp sensors)
│  ├─ websocket_api.py
│  ├─ services.yaml + services.py
│  ├─ strings.json, translations/en.json
│  └─ frontend/roster-planner-panel.js   # built bundle, committed
├─ frontend/              # panel source (Vite + React + TypeScript)
├─ tests/                 # pytest + pytest-homeassistant-custom-component
├─ hacs.json, README.md
└─ .github/workflows/     # hassfest, HACS validate, pytest, frontend build check
```

**Calendar entity** (`calendar.py`)

- `async_get_events(hass, start, end)`: iterate dates from start−1 day (to catch shifts crossing midnight) to end, resolve each, return `CalendarEvent`s overlapping the range.
- `event` property: the current shift if one is running, else the next upcoming one (look ahead up to 60 days).
- Schedule `async_track_point_in_time` for the next shift start/end so the state flips on time; reschedule on every store change and call `async_write_ha_state()`.
- Event fields: summary = `<prefix><shift type name or "Shift">`, description = source info (e.g. "Extra shift", "Variation: Christmas trading"), location from config, uid = `<entry_id>-<date>`.
- Optional (milestone 6): `CalendarEntityFeature.CREATE_EVENT | DELETE_EVENT | UPDATE_EVENT`, mapped to exceptions, so edits in the stock HA calendar UI and `calendar.create_event` work. Non-recurring only; reject RRULEs.

**Websocket API** (`websocket_api.py`) — all commands prefixed `roster_planner/`, all take `entry_id`. Mutations require admin.

| Command | Purpose |
| --- | --- |
| `get` | Full config for one roster |
| `subscribe` | Push the full config on every change (keeps several open devices in sync) |
| `resolve` | Resolved shifts for a date range (the main view uses this) |
| `shift_type/create`, `/update`, `/delete` | Shift type CRUD |
| `pattern/create`, `/update`, `/delete` | Week pattern CRUD |
| `rotation/create`, `/update`, `/delete` | Rotation CRUD |
| `variation/create`, `/update`, `/delete` | Variation CRUD |
| `exception/set`, `/clear` | Set or clear the exception on one date |
| `preview` | Resolve a range using an unsaved draft rotation or variation (editor live preview) |
| `export`, `import` | JSON backup and restore |

Validate every payload with voluptuous schemas. Return structured errors (`code`, `message`, `field`) the UI can show inline.

**Services** — `roster_planner.set_exception`, `roster_planner.clear_exception` (target: calendar entity; fields: date, shift\_type or start/end, or off). Lets automations and voice assistants add a one-off shift.

**Sensors** — `sensor.<name>_next_shift_start` and `_next_shift_end` (device\_class timestamp). Useful for "leave for work" automations.

**Panel registration** — serve the bundle with `hass.http.async_register_static_paths([StaticPathConfig(...)])` using a cache-busting query string (integration version). Register with `panel_custom.async_register_panel(webcomponent_name="roster-planner-panel", sidebar_title="Roster", sidebar_icon="mdi:calendar-clock", module_url=..., require_admin=False)`. Register once even with multiple config entries; remove it when the last entry unloads.

**Frontend stack**

- Vite + React 18 + TypeScript, built as a single ES module that defines the custom element `roster-planner-panel`.
- The element receives `hass`, `narrow`, `route` and `panel` from HA; it mounts a React root in its shadow DOM and passes `hass` down through context.
- Use `hass.connection.sendMessagePromise` and `subscribeMessage` for the websocket API.
- Styling: HA theme CSS variables (`--primary-color`, `--card-background-color`, `--primary-text-color`, `--divider-color`) so light and dark themes just work. No heavy UI library; keep the bundle under \~200 KB gzipped.
- Date maths: `date-fns`. Handle dates as `YYYY-MM-DD` strings at the API boundary.

## UI and screens

The main screen shows only shifts. Everyday changes take two taps, and pattern management sits behind one gear icon.

**Main screen**

- Header: roster name (switcher if more than one roster), Today button, Week/Month toggle, gear icon.
- **Week view** (default on narrow screens): one row per day, Mon–Sun. A working day shows the time range, shift name and colour bar. A day off shows a muted "Off". Swipe or arrows to move between weeks.
- **Month view**: a compact grid with a coloured dot or short time per working day.
- Small markers only: a dot for a changed day, a "+" for an extra shift, a thin outline band for days inside a variation. No legends or explanatory text on this screen.
- Today is highlighted. A one-line summary at the top: "Next shift: Tue 07:00–15:30".

**Day sheet** (bottom sheet on tap)

- Shows the resolved shift and where it came from in one muted line (e.g. "From Main roster · Week 3").
- Actions, shown only when they apply:
  - **Change this day**: pick a shift type or enter custom times
  - **Add extra shift**: on an off day
  - **Day off**: cancel a rostered shift
  - **Reset to roster**: when an exception exists
- Optional note field. Saving writes one exception via `exception/set`.

**Settings** (gear icon) — a simple list linking to:

1. **Shift types**: list with colour swatches; form with name, start, end, colour.
2. **Week patterns**: list; editor shows Mon–Sun rows, each a dropdown (shift types, Custom times, Off). "Duplicate pattern" action, since rotating rosters often have near-identical weeks.
3. **Rotations**: list; editor with name, start date (date picker snaps to Monday), cycle length (1–12 weeks), one dropdown per slot (pattern or Empty), active from/until, priority (up/down arrows). A live preview below shows the next 8 weeks via `preview`.
   - **Quick add: recurring shift**: a small wizard ("Every \[2\] weeks on \[Monday\], \[shift type\], starting \[date\]") that generates a single-day pattern plus a rotation behind the scenes.
4. **Variations**: list grouped into upcoming, active and past; editor with name, date range, and mode (use a pattern, or edit specific weekdays), with live preview.
5. **Exceptions**: a chronological list of one-off changes, upcoming first, each removable. Past ones are collapsed.
6. **Backup**: export and import JSON.

**Validation and deletion rules**

- Start ≠ end. Times are HH:MM in 24-hour format. A shift that crosses midnight shows "(+1)" beside the end time.
- Rotation anchor must be a Monday. `slots.length == cycle_weeks`. `active_until ≥ active_from`.
- Variations may not overlap; the editor names the clashing variation.
- Deleting a shift type or pattern that is in use is blocked, and the error lists where it is used. Offer "replace with…" as a convenience.
- Warn (don't block) when a cross-midnight shift overlaps the next day's shift.
- Every delete asks for confirmation. Every save shows an inline error from the API's `field` on failure.

## Milestones, testing and packaging

Ship in six milestones. Each one ends with passing tests and something usable, so work can stop after any milestone without leaving broken code.

**Milestones**

1. **Engine and storage**: models, validation, `engine.py`, `store.py`, and the full engine test table below. Done when all engine tests pass with no HA running.
2. **Integration shell**: config flow, calendar entity, websocket API, services. Done when a rotation created through the websocket API appears in the stock HA Calendar sidebar and the entity state flips on at shift start.
3. **Panel and main screen**: panel registration, week and month views, day sheet with exceptions. Done when the owner can add an extra shift, change a day, mark a day off and reset it, all from a phone.
4. **Rule editors**: shift types, week patterns (with duplicate), rotations (with live preview and the recurring-shift wizard). Done when the owner's 4-week Tue–Sat roster can be entered entirely in the UI in under 10 minutes.
5. **Variations and housekeeping**: variation editor with preview, exceptions list, export/import. Done when a 2-week variation shows in the calendar and the rotation resumes on the first day after it with no manual step.
6. **Polish**: next-shift sensors, optional calendar create/update/delete mapped to exceptions, README with screenshots, HACS release. Done when it installs cleanly on a fresh HA via HACS custom repository.

**Engine test cases** (pytest, table-driven)

- 4-week rotation, Tue–Sat, different times per week: correct shift on every day for 3 full cycles.
- Dates before the anchor resolve correctly (negative week offsets use floor mod).
- Cycle length 1 (same every week), 2 ("Monday every other week"), 3 ("Pattern A every 3 weeks": shift only in slot 0).
- Two rotations layered: higher priority wins; an empty slot or off day falls through to the lower one.
- `active_from` / `active_until` boundaries are both inclusive (same for variation start\_date / end\_date).
- Variation in pattern mode replaces whole weeks, including off days; in days mode, unlisted weekdays fall through to the rotation; the day after `end_date` reverts.
- Exception precedence over variation and rotation; `extra` vs `changed` flag; `off` exception cancels; clearing restores.
- Shift crossing midnight: appears in a range query that starts on the next day; calendar state is on at 00:30.
- Timezone: aware datetimes in the configured zone; one test using a zone with DST (e.g. Australia/Sydney) across the changeover.

**Integration tests** (`pytest-homeassistant-custom-component`): config flow, entity setup and unload, every websocket command (happy path and validation error), services, and state transition timing using a frozen clock.

**Frontend**: Vitest for date helpers and view-model logic. A short manual checklist in the README covering phone and desktop, light and dark themes, and the Companion app.

**Packaging**

- `hacs.json` with name and minimum HA version; `manifest.json` with version, `iot_class: local_calculated`, codeowners, issue tracker.
- Commit the built panel bundle under `custom_components/roster_planner/frontend/` so HACS users need no Node toolchain. CI fails if the committed bundle is stale.
- GitHub Actions: hassfest, HACS validation, pytest, frontend lint and build.
- Tag releases with semver; the version doubles as the panel's cache-busting key.

**Open questions for the owner**

- [ ] Event title format in the calendar: just the shift name ("Open"), or prefixed ("Work: Open")? Default: configurable prefix, empty by default.
- [ ] Should past exceptions be pruned automatically after some months, or kept forever? Default: kept, collapsed in the UI.