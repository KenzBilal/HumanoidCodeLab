# Changelog

All notable changes to **Humanoid Code Lab** are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] — 2026-03-31

### 🚀 Major Feature Update & Proprietary Release

This major release introduces a complete UI overhaul and a suite of powerful new professional-grade features for 3D humanoid robot programming.

#### Added
- **Project Explorer** — New persistent file tree system supporting deep project, folder, and file management across sessions.
- **Command Palette (`Ctrl+Shift+P`)** — Global quick-action search for all IDE features, running scripts, and navigating the app.
- **Integrated Help Modal** — Native interactive tutorial system and comprehensive command documentation.
- **Script Template Library** — Quick-start gallery for common robot routines (movement, dancing, exercise).
- **AI Provider Support** — Expanded AI backend with improved settings and support for latest generation models.
- **UI & Accessibility** — Overhauled iconography using Lucide-react and optimized the resizable pane layout for complex work.

#### Changed
- **License Update** — Transitioned the project to a **Proprietary** licensing model (All rights reserved).
- **Enhanced Interpreter** — Significant performance improvements to the Python-to-AST compilation pipeline.

---

## [1.1.0] — 2026-03-31

### 🚀 First Stable Production Release

This release marks the first official stable version of Humanoid Code Lab, resolving critical issues from early internal builds and introducing a suite of powerful new features for robot programming and simulation.



#### Added
- **Monaco Editor** — Replaced the textarea code editor with Microsoft's Monaco Editor (the engine behind VS Code). Includes custom `robot.*` DSL IntelliSense auto-complete and keyword syntax highlighting.
- **Visual Stepping Debugger** — New `Debug` + `Step` controls in the TopBar allow line-by-line execution. The Monaco editor highlights the current line synced in real-time with the 3D robot sequence.
- **Multi-Provider AI Backend** — `electron/main.ts` now proxies AI generation via OpenAI GPT-4o, Anthropic Claude 3.7 Sonnet, and Google Gemini 2.0 Flash. Users switch providers in-app.
- **Secure Key Storage (`safeStorage`)** — Electron's native OS keychain encryption (`safeStorage.encryptString`) now stores API keys. Keys are never persisted to `localStorage`.
- **Curriculum Mode** — Interactive pop-up modal (`CurriculumModal.tsx`) providing gamified coding challenges. User script AST is verified against target win-conditions.
- **Resizable Panels** — Integrated `react-resizable-panels` (via `Group` / `Panel` / `Separator`) into `App.tsx` for draggable, flexible workspace layout.
- **Zod State Validation** — Zustand persistence now validates the hydrated state against strict Zod schemas, preventing stale or malformed data from causing UI breakage.
- **Hardware Serial Interface** — `serial-communicate` IPC handler in `main.ts` streams logical DSL actions to physical hardware via `serialport` module.
- **Vitest Unit Tests** — `src/engine/Interpreter.test.ts` covers DSL grammar: commands, variables, for-loops, if/elif/else branching, and source-line tracing.

#### Changed
- **DSL variable fix** — Fixed a bug in `substituteVars()` where keyword argument names (e.g. `steps=`) were incorrectly resolved as variable substitutions.
- **`react-resizable-panels` API** — Updated import names from `PanelGroup`/`PanelResizeHandle` to the v4 API (`Group` / `Separator`). Fixed `direction` → `orientation` prop.
- **Improved `.env.example`** — Now documents all three AI provider keys with guidance links.
- **Updated `README.md`** — Complete rewrite with full feature list, architecture diagram, and command reference tables.

---

## [0.8.0] — 2026-03-28

### Added
- **if / elif / else** — Full conditional branching in the DSL interpreter with operator support (`==`, `!=`, `<`, `>`, `<=`, `>=`, `and`, `or`, `not`).
- **Variable declarations** — Variables declared like `steps = 3` are correctly substituted into command arguments throughout the script.
- **Loop variable binding** — `for i in range(N)` now binds `i` correctly per iteration (0, 1, 2, ...).
- **Source-line tracing** — Compilation errors and debug events now reference original script line numbers.

---

## [0.5.0] — 2026-03-26

### Added
- **Animator view** — Full keyframe animation editor with per-joint rotation sliders, timeline, playback, and scrubbing.
- **Custom animations** — User-created animations can be played via `robot.play(animation='name')`.
- **AI Generate Modal** — Describe robot motion in natural language; Gemini generates a script.
- **Output panel** — Scrollable log showing INFO / WARN / ERROR entries from each run.

---

## [0.1.0] — 2026-03-24

### Added
- Initial release — 3D humanoid with 18 joints, DSL interpreter, basic command set, Editor + Viewport layout.
