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
Progression, upgrades, rebirth, offline calculations, big numbers and save transformations must be implemented independently of the rendering framework.

### Consequences
- core rules can be unit-tested headlessly;
- renderer/framework replacement is less expensive;
- balance simulation can reuse production formulas;
- UI/scenes must call core services rather than duplicating formulas.

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

# Proposed / unresolved decisions

These entries must be resolved before production implementation reaches the affected system.

## ADR-007 — Renderer/game framework
**Status:** Proposed

Candidate: TypeScript + Vite + Phaser.

Need to confirm after a short technical spike considers:
- current browser/mobile performance;
- asset pipeline;
- physics needs;
- UI integration;
- CrazyGames compatibility;
- maintainability with Codex-assisted development.

## ADR-008 — Large-number library
**Status:** Proposed

Candidate: `break_infinity.js` behind a project-owned `NumberValue`/numeric abstraction.

Acceptance criteria before approval:
- required ranges;
- deterministic serialization;
- predictable comparison/power/log operations;
- acceptable bundle size/performance;
- straightforward unit testing.

## ADR-009 — Mass vs Matter for run upgrades
**Status:** Proposed

Option A: upgrades spend Mass directly.  
Option B: Mass determines size while a separate Matter currency pays for run upgrades.

Decision should be based on headless balance prototypes. Prefer the simpler one-currency system unless spending Mass creates confusing shrinking/progression behaviour.

## ADR-010 — Camera/presentation style
**Status:** Proposed

Candidates:
- top-down 2D;
- shallow 2.5D/isometric.

Avoid committing to expensive full 3D production before the core loop is proven.

## ADR-011 — Rebirth terminology/theme
**Status:** Proposed

Working name: Rebirth.

Possible thematic replacements depend on the final player fantasy, e.g. Singularity, Evolution, Collapse or Ascension.

## ADR-012 — First-rebirth pacing
**Status:** Proposed

A target time must be chosen and validated with simulation/playtests. The second run should feel materially faster within its opening minute.

## ADR-013 — Mobile orientation support
**Status:** Proposed

Decide whether gameplay is landscape-first only or fully supports portrait. Menus should remain responsive either way.

## ADR-014 — Original player fantasy/art direction
**Status:** Proposed

Need an original identity before asset production. Candidates include an organism, anomaly, machine, magical entity or singularity-like object, but it must not visually copy the reference games.