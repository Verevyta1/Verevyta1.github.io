# Decision Log

This file records decisions that materially affect game design, architecture, player progression, production workflow or save compatibility.

Use this format for new entries:

```text
## ADR-XXX — Title
Status: Proposed | Accepted | Superseded
Date: YYYY-MM-DD

Context:
Why the decision is needed.

Decision:
What was chosen.

Rationale:
Why this approach was selected.

Consequences:
Trade-offs, follow-up work, save/performance implications.
```

---

## ADR-001 — Browser-first distribution
**Status:** Accepted  
**Date:** 2026-09-25

### Context
The game is intended to launch as a web browser title with CrazyGames as the first commercial target.

### Decision
Design gameplay, UI, performance, asset loading and platform integration for browser delivery first.

### Consequences
- initial payload and runtime memory require explicit budgets;
- keyboard/mouse and touch input are first-class;
- portal-specific behaviour must be isolated behind adapters;
- gameplay must remain functional when ads or portal services are unavailable.

---

## ADR-002 — Two long-lived branches
**Status:** Accepted  
**Date:** 2026-09-25

### Decision
Use:
- `main` for production/release state;
- `staging` for integration/pre-production state.

Feature/fix branches normally start from and return to `staging`. Normal production promotion happens through a `staging -> main` release pull request.

### Consequences
This adds one promotion step but provides a stable place for combined QA before production.

---

## ADR-003 — Deterministic economy separate from rendering
**Status:** Accepted  
**Date:** 2026-09-25

### Decision
Progression, upgrades, Matter Collapse, offline calculations, big numbers and save transformations must be implemented independently of the rendering framework.

### Consequences
- core rules can be unit-tested headlessly;
- renderer/framework replacement is less expensive;
- balance simulation can reuse production formulas;
- UI/scenes call core services rather than duplicating formulas.

---

## ADR-004 — Ads are optional progression accelerators
**Status:** Accepted  
**Date:** 2026-09-25

### Decision
Rewarded advertising may accelerate progression but cannot be required for core advancement. The game must continue normally when advertising is unavailable, declined or blocked.

### Consequences
Meaningful rewarded-ad currencies/benefits require non-ad acquisition paths. Ad success must be confirmed before rewards are granted.

---

## ADR-005 — UI direction
**Status:** Accepted  
**Date:** 2026-09-25

### Decision
Use a clean, readable interface with solid opaque panels and simple rounded controls. Avoid an overall yellow/orange filter, excessive neon and glass/translucent primary UI.

### Consequences
Reference-game screenshots guide usability and density only; final interface, branding and artwork must remain original.

---

## ADR-006 — Test-driven deterministic systems
**Status:** Accepted  
**Date:** 2026-09-25

### Decision
Use TDD where practical for deterministic economy/progression/save systems. Regression bugs should receive a failing test before the fix when feasible.

### Consequences
Core modules require clear boundaries and pure calculations. Visual-only behaviour may use integration/E2E/manual testing instead of forcing low-value unit tests.

---

## ADR-007 — Renderer and web toolchain
**Status:** Accepted  
**Date:** 2026-09-26

### Context
The game needs smooth 2D animation, particles, parallax and scale transitions, but does not need a heavyweight 3D world or realistic rigid-body simulation.

### Decision
Use:
- TypeScript;
- Vite;
- Phaser 4 for the animated 2D playfield;
- HTML/CSS DOM UI for most menus/HUD;
- Vitest for unit/integration tests;
- Playwright for browser/E2E tests.

### Rationale
This stack provides a lightweight browser-first renderer while keeping deterministic progression code independent from presentation. DOM UI is preferable for responsive layout, accessibility and menu-heavy incremental systems.

### Consequences
- Phaser must not become the owner of economic state;
- DOM and canvas state require a clear event/state boundary;
- dependency versions are pinned and updated intentionally;
- no full 3D engine is planned for the initial product.

---

## ADR-008 — Large-number abstraction
**Status:** Accepted  
**Date:** 2026-09-26

### Context
Progression is intended to move beyond planets, galaxies and universes, making ordinary JavaScript numbers unsuitable for the full economy.

### Decision
Use `break_eternity.js` behind a project-owned numeric wrapper, working name `GameNumber`.

Core game code must not import the third-party number implementation directly outside the wrapper module.

### Rationale
The game needs very large incremental values and deterministic serialization while retaining the freedom to replace the underlying library later.

### Consequences
- wrapper operations require strong unit coverage;
- save data stores canonical serialized numeric values;
- display notation is separate from state;
- economic data may store large values as strings for deterministic parsing.

---

## ADR-009 — Mass and Matter are separate run quantities
**Status:** Accepted  
**Date:** 2026-09-26

### Context
Spending Mass directly would conflict with the fantasy that Mass determines physical growth: an upgrade purchase should not make the Core appear to shrink.

### Decision
Use:
- **Mass** as non-spendable physical/run progression;
- **Matter** as the temporary spendable run currency.

Both reset during Matter Collapse unless a later permanent rule explicitly changes that behaviour.

### Consequences
- the player must understand two related values early;
- tutorial/UI should explain them through behaviour rather than dense text;
- separate values allow upgrade spending without reversing physical growth.

---

## ADR-010 — Central fixed playfield and layered 2D perspective
**Status:** Accepted  
**Date:** 2026-09-26

### Context
Earlier plans considered top-down movement and shallow isometric navigation. The approved concept is now a simpler idle/incremental screen centred on a persistent avatar.

### Decision
The Matter Core remains near the centre of a fixed main playfield. The player does not normally navigate a large map with WASD.

Use a 2D layered shallow-perspective scene with foreground/gameplay/background layers and parallax. The world visually scales around the Core.

### Rationale
This better supports idle play, mobile/touch interaction, visual focus, performance and the intended “the universe shrinks around me” fantasy.

### Consequences
- normal movement controls are removed from the core design;
- scene motion/spawning must provide visual life around a mostly stationary Core;
- camera/scale transitions become a primary polish feature.

---

## ADR-011 — Matter Collapse prestige theme
**Status:** Accepted  
**Date:** 2026-09-26

### Context
A generic “Rebirth” label does not match the game’s identity.

### Decision
The first prestige layer is called **Matter Collapse**.

The Core compresses into a singular state, then restarts the run through a Big-Bang-like explosion. Permanent currency is provisionally called **Genesis Energy** and permanent upgrades are themed as **Fundamental Laws**.

### Consequences
- Collapse requires a signature animation sequence;
- permanent upgrade copy should use universe/law/matter theming;
- names may be refined later without changing the underlying mechanic.

---

## ADR-012 — Collapse is encouraged through soft economic walls
**Status:** Accepted  
**Date:** 2026-09-26

### Context
Some progression should effectively require permanent multipliers, but literal “you must prestige now” gates can feel arbitrary and frustrating.

### Decision
Use soft walls created by exponential/super-exponential costs and slowing production. The player can technically continue waiting, but Matter Collapse becomes the strategically attractive route.

Initial first-Collapse target for simulation is approximately 15–35 minutes for an engaged new player.

### Consequences
- economy requires a headless simulator before final values are locked;
- Collapse UI should clearly show expected permanent benefit;
- post-Collapse recovery time is a key balance metric;
- timing is a target range, not a final constant.

---

## ADR-013 — Landscape-first responsive browser presentation
**Status:** Accepted  
**Date:** 2026-09-26

### Decision
Design gameplay primarily for desktop and mobile landscape. Most UI should adapt across common browser widths and heights, with approximately 907×510 included in mandatory layout testing.

Portrait is not a launch requirement unless later user testing justifies it.

### Consequences
- touch controls remain supported;
- menus should remain usable on narrow layouts;
- the main playfield should not depend on large permanent side panels.

---

## ADR-014 — Original player fantasy: Matter Core
**Status:** Accepted  
**Date:** 2026-09-26

### Context
The game needs an identity that remains plausible from microscopic scales through invented post-universal content without copying reference-game characters.

### Decision
The player controls a fictional **Matter Core**, a central evolving entity that absorbs matter and eventually distorts reality-scale structures.

The Core maintains a recognizable silhouette while its material, animation and effects evolve across progression.

### Consequences
- art direction can move from particle/biological forms to gravitational/cosmic abstractions;
- the Core can remain visually readable even when economic scale becomes absurd;
- final title and exact art style remain open.

---

## ADR-015 — Discrete scale bands behind a continuous-growth illusion
**Status:** Accepted  
**Date:** 2026-09-26

### Context
A literally continuous world spanning microscopic to universal distances would create unnecessary precision, asset and streaming problems.

### Decision
Represent progression using discrete internal scale bands. Transitions visually zoom the existing scene away and reveal the next scale so the experience appears continuous.

Economic scale and rendered coordinates remain completely separate.

### Consequences
- scale transitions need dedicated state/event handling;
- asset packs can be lazy-loaded per band;
- rendering uses ordinary coordinate ranges regardless of economic magnitude;
- background foreshadowing should hide the internal content swap.

---

## ADR-016 — Custom absorption motion instead of general physics
**Status:** Accepted  
**Date:** 2026-09-26

### Context
Most objects simply need to be attracted, curve inward and disappear smoothly. Full rigid-body simulation adds cost and unpredictability without improving the core loop.

### Decision
Implement ordinary attraction/absorption with controlled interpolation, curves, tweens and pooled entities. Add physics only for a future mechanic that clearly needs it.

### Consequences
- visual motion can be deterministic and highly polished;
- renderer load is easier to cap;
- economic rewards must not depend on animation frame timing.

---

## ADR-017 — Representative rendering of economic throughput
**Status:** Accepted  
**Date:** 2026-09-26

### Context
Late-game production may represent enormous numbers of absorbed objects per second. Rendering every event is impossible and unnecessary.

### Decision
The core simulation calculates true economic throughput. The renderer displays a bounded number of representative absorption events, particles or matter streams.

### Consequences
- visual intensity should scale perceptually, not linearly with production;
- visible object count is not authoritative economy state;
- tests must validate economy separately from rendering.

---

## ADR-018 — Major offline discoveries require an on-return reveal
**Status:** Accepted  
**Date:** 2026-09-26

### Context
A player could earn enough Mass offline to cross a major scale threshold. Silently spawning them in a new band would skip one of the game’s most important rewards.

### Decision
Offline progress may satisfy the numeric requirement for a new scale, but major scale transitions remain pending until the player returns and sees/activates the reveal.

### Consequences
- save state needs pending milestone/transition flags;
- return summary must report newly reached scale milestones;
- transition logic must be idempotent and safe across reloads.

---

# Proposed / unresolved decisions

These do not block the technical foundation but should be resolved before their affected content is finalized.

## ADR-019 — Exact first-Collapse economy
**Status:** Proposed

Need simulation/playtests to choose:
- exact Collapse threshold;
- prestige exponent;
- first Genesis Energy award;
- cost curve for early Fundamental Laws;
- target recovery time after Collapse.

## ADR-020 — Active Pulse advantage
**Status:** Proposed

Determine how much faster an attentive player should progress compared with idle baseline, and how that ratio changes after automation unlocks.

## ADR-021 — Fundamental Law layout
**Status:** Proposed

Candidates:
- branching tree;
- category tabs with levels;
- hybrid tree with repeatable nodes.

Must support meaningful choices without becoming unreadable on smaller browser sizes.

## ADR-022 — Final art language
**Status:** Proposed

The Matter Core identity is accepted, but final shape language, palette, background treatment, object illustration style and animation language require a dedicated art-direction pass.

## ADR-023 — Final game title
**Status:** Proposed

`Project Scale` remains a working project name only.
