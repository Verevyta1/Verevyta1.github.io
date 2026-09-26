# Implementation Roadmap

> **Purpose:** Convert the approved design into small, testable implementation tasks suitable for human review and Codex-assisted development.  
> **Rule:** Work flows from feature branches into `staging`; `main` receives only tested release promotions.

---

## 1. Delivery philosophy

Build vertical slices, not isolated piles of systems.

Each milestone should leave the project in a runnable state and prove one important assumption before more content is added.

Priorities:

1. architecture correctness;
2. deterministic economy;
3. browser performance;
4. satisfying visual growth;
5. balance simulation;
6. content volume;
7. monetisation integration near the end of the vertical slice, not at the start.

---

## 2. Milestone A — technical foundation

### Goal

A blank but production-shaped browser project proving the approved stack and module boundaries.

### Tasks

1. Initialize Vite + TypeScript.
2. Add Phaser 4.
3. Add Vitest.
4. Add Playwright.
5. Add `break_eternity.js`.
6. Add lint/typecheck scripts.
7. Create documented source folders.
8. Implement tested `GameNumber` wrapper.
9. Create minimal save schema v1.
10. Create `PlatformApi` and `LocalPlatform`.
11. Create one production build smoke test.
12. Add CI for typecheck, tests and build.

### Acceptance

- `npm install` from lockfile succeeds;
- dev server starts;
- production build succeeds;
- unit tests pass;
- Playwright smoke test passes;
- core modules have no Phaser imports;
- `GameNumber` round-trips extreme values;
- repository contains no game art dependency yet.

### Non-goals

- real object art;
- final UI;
- real balance;
- CrazyGames ad implementation;
- Matter Collapse animation.

---

## 3. Milestone B — greybox Matter Core

### Goal

Prove the central screen concept with placeholder visuals.

### Tasks

1. Add main Phaser scene.
2. Render placeholder Matter Core at centre.
3. Add subtle idle Core pulse.
4. Add DOM HUD with Mass and Matter.
5. Add a small pool of placeholder matter objects.
6. Add drift/spawn patterns.
7. Add custom attraction curve.
8. Add absorption completion event.
9. Connect absorption rewards to core simulation.
10. Add Gravity Pulse input.
11. Add reduced-motion plumbing, even if basic.
12. Add performance counters in development mode.

### Acceptance

- objects visibly drift toward and absorb into Core;
- Mass/Matter update from domain state, not renderer math;
- Pulse visibly accelerates attraction;
- no normal WASD movement exists;
- object sprites are pooled;
- economy continues correctly if visual animation is disabled;
- scene remains stable after a 30-minute automated run.

---

## 4. Milestone C — first upgrades

### Goal

Create the first real incremental decision loop.

### Initial upgrades

- Density;
- Gravity;
- Influence;
- Assimilation;
- Compression/Pulse Power.

### Tasks

1. Create upgrade data schema.
2. Implement exponential cost helper.
3. Implement affordability/purchase transaction.
4. Add upgrade panel.
5. Add Buy 1.
6. Add one milestone upgrade effect.
7. Make visible behaviour reflect relevant upgrades.
8. Add upgrade unit/integration tests.
9. Add a simple ROI view to balance simulator.

### Acceptance

- no upgrade formula lives in UI code;
- purchasing is atomic;
- Matter cannot go negative;
- upgrade effects visibly influence the scene;
- at least one milestone changes behaviour, not only a number.

---

## 5. Milestone D — scale transition prototype

### Goal

Prove the game’s signature “the world becomes smaller” effect before producing many bands.

### Content

Use only 2–3 placeholder scale bands.

Example:

- Primordial;
- Cellular;
- Tiny.

### Tasks

1. Add scale-band data schema.
2. Add object family eligibility thresholds.
3. Add `pendingScaleTransition` domain state.
4. Add transition state machine.
5. Shrink/fade old world content.
6. Reveal new aspirational objects.
7. Add parallax/background swap.
8. Add skip/reduced-motion form.
9. Add save/reload recovery tests during pending transition.

### Acceptance

- scale eligibility is decided by core state;
- renderer cannot award a scale transition itself;
- transition looks smooth in normal mode;
- reduced-motion mode reaches the same result quickly;
- reloading during a transition does not corrupt state.

---

## 6. Milestone E — balance simulator v1

### Goal

Stop tuning progression by intuition alone.

### Tasks

1. Create CLI simulation runner.
2. Reuse production economy modules.
3. Add new-player scenario.
4. Add idle-only strategy.
5. Add active-Pulse strategy.
6. Add cheapest-upgrade strategy.
7. Add rough ROI strategy.
8. Print time-to-milestone report.
9. Export results to machine-readable JSON for later analysis.

### Required metrics

- first upgrade time;
- automation unlock time;
- each scale transition time;
- Matter/hour;
- Mass/hour;
- dead-time stretches;
- active versus idle ratio.

### Acceptance

Balance simulator contains no duplicated economic formulas.

---

## 7. Milestone F — Matter Collapse v1

### Goal

Complete the first prestige loop.

### Tasks

1. Add Collapse eligibility.
2. Add Genesis Energy reward formula.
3. Add preview selector showing current reward.
4. Add confirmation panel.
5. Add atomic Collapse transaction.
6. Add permanent starting bonuses.
7. Add first Fundamental Laws.
8. Add Collapse save-safety tests.
9. Add placeholder Collapse animation.
10. Add simulator support for repeated runs.

### Acceptance

- reward is deterministic;
- Genesis Energy cannot be duplicated through reload;
- temporary state resets correctly;
- permanent state survives;
- second run clearly reaches previous milestones faster;
- first-Collapse timing can be tuned through data/formulas without renderer changes.

---

## 8. Milestone G — idle/offline system

### Goal

Make returning to the game satisfying and safe.

### Tasks

1. Add injectable clock.
2. Add stable-production snapshot.
3. Add offline reward formula.
4. Add duration cap.
5. Add return summary panel.
6. Add pending scale reveal from offline progress.
7. Add timestamp corruption handling.
8. Add test fixtures for short/long/negative/huge elapsed time.

### Acceptance

- no per-second offline loop;
- negative clock changes do not grant negative rewards;
- implausible time is clamped;
- major scale transitions wait for on-return presentation;
- normal return claim requires no ad.

---

## 9. Milestone H — art-direction vertical slice

### Goal

Replace greybox visuals for the first small portion of the game and validate final visual language.

### Tasks

1. Define Core shape language.
2. Define UI colour/type tokens.
3. Produce first Core forms.
4. Produce first object family sprites.
5. Produce first backgrounds/parallax.
6. Add polished absorption VFX.
7. Add polished scale transition.
8. Add first audio pass.
9. Profile real assets.
10. Validate readability at target viewport sizes.

### Acceptance

The slice should be visually original and recognizable without relying on reference-game styling.

---

## 10. Milestone I — CrazyGames integration

### Goal

Integrate platform services only after local gameplay is stable.

### Tasks

1. Implement `CrazyGamesPlatform`.
2. Initialize current CrazyGames SDK according to current documentation.
3. Wire gameplay start/stop lifecycle.
4. Implement rewarded-ad normalized result flow.
5. Add optional midgame-ad hook only at approved natural breaks.
6. Integrate portal data/save functionality if selected.
7. Ensure local platform still works.
8. Test unavailable/cancelled ad states.
9. Audit build size/file count.
10. Test portal iframe/responsive behaviour.

### Acceptance

- game works without portal SDK;
- ads are optional;
- no reward is granted before completion signal;
- platform failures cannot corrupt saves;
- gameplay/audio lifecycle obeys portal requirements.

---

## 11. Milestone J — launch content expansion

Only after the vertical slice and first prestige loop are fun should content expand toward:

- Human scale;
- Massive scale;
- Planetary;
- Stellar;
- Galactic;
- Cosmic;
- Reality;
- post-universal invented scales.

Each new band should justify itself with at least one of:

- striking new objects;
- new Core visual form;
- new absorption presentation;
- new upgrade milestone;
- new automation behaviour;
- a meaningful economic shift.

Do not add a band that is only the previous band with larger numbers and a different background.

---

## 12. Suggested first Codex task sequence

The first implementation PRs should be deliberately small.

### PR 1 — project bootstrap

Create Vite/TypeScript project, scripts, strict TypeScript config and minimal app boot.

### PR 2 — testing foundation

Add Vitest, Playwright and smoke tests.

### PR 3 — GameNumber

Add `break_eternity.js` wrapper and tests.

### PR 4 — domain state

Add minimal Mass/Matter simulation state and deterministic tick.

### PR 5 — Phaser shell

Add Phaser scene with placeholder Core only.

### PR 6 — DOM HUD

Render Mass/Matter from application state.

### PR 7 — pooled matter objects

Add placeholder object pool and absorption animation.

### PR 8 — Gravity Pulse

Add active command and bounded bonus.

This sequence is intentionally slower than generating everything at once. It keeps failures easy to locate and architecture easy to review.

---

## 13. Bug-fix workflow after implementation begins

For a reproducible bug:

1. create `fix/<short-name>` from `staging`;
2. write/confirm reproduction steps;
3. add a failing automated regression test when practical;
4. make the smallest fix;
5. run relevant full test groups;
6. PR to `staging`;
7. verify in staging build;
8. promote to `main` in a release batch unless it is an urgent production hotfix.

Urgent production issues use `hotfix/*` from `main` and must be merged back into `staging` after release.

---

## 14. Change-control rule

Before implementing a feature that conflicts with the game design or architecture:

- do not silently improvise;
- document the conflict;
- update `docs/DECISIONS.md` with the proposed change;
- resolve the design choice;
- then implement.

This keeps Codex-assisted development aligned with the intended game rather than allowing accidental architecture-by-generation.
