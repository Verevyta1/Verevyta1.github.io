# Technical Architecture Specification

> **Status:** Approved high-level architecture for the first implementation stage  
> **Scope:** Browser-first 2D incremental game  
> **Primary commercial target:** CrazyGames  
> **Related documents:** `GAME_DESIGN.md`, `DECISIONS.md`, `DEVELOPMENT_WORKFLOW.md`

---

## 1. Architecture goals

The architecture must make the game easy to balance, test, extend and debug while remaining lightweight enough for browser distribution.

Primary goals:

1. deterministic economy independent of rendering;
2. smooth 2D visual presentation;
3. responsive DOM-based UI;
4. data-driven content;
5. versioned save data;
6. portal integrations behind adapters;
7. strong automated tests for progression logic;
8. easy local development and Codex-assisted iteration;
9. predictable performance on modest hardware;
10. clear module boundaries that prevent a monolithic codebase.

The architecture should optimize for maintainability over cleverness.

---

## 2. Approved stack

### Language

**TypeScript**

Reasons:

- strong type safety for economic state and save schemas;
- good browser ecosystem;
- easy interoperability with Phaser, Vite and testing tools;
- makes data contracts explicit for Codex-assisted work.

### Build/dev tooling

**Vite**

Responsibilities:

- local dev server;
- TypeScript/browser build pipeline;
- production bundling;
- asset importing where appropriate;
- environment-specific config.

### Game renderer

**Phaser 4**

Responsibilities:

- canvas/WebGL rendering;
- scene lifecycle;
- sprites/images;
- tweens;
- particles;
- parallax;
- visual scale transitions;
- pointer/touch game input;
- animation timing.

Phaser should be treated as a view/gameplay presentation layer, not the economy source of truth.

### UI

**HTML/CSS DOM UI**

Responsibilities:

- top HUD;
- upgrade panels;
- Matter Collapse panel;
- Fundamental Laws;
- settings;
- achievements/statistics;
- tooltips;
- responsive layout;
- accessibility-oriented controls.

UI framework choice is intentionally left open for the first spike. Plain TypeScript/DOM may be sufficient. Do not add React/Vue/Svelte unless the interface complexity demonstrates a clear need.

### Unit/integration testing

**Vitest**

Use for:

- deterministic economic formulas;
- numeric wrapper;
- upgrades;
- Collapse calculations;
- save migrations;
- offline progress;
- content validation;
- application services.

### Browser/E2E testing

**Playwright**

Use for:

- app boot;
- responsive HUD;
- upgrade interaction;
- save/reload;
- panel interactions;
- Collapse confirmation;
- platform mock behaviour;
- important browser regressions.

### Extreme numbers

**break_eternity.js**, wrapped behind project-owned `GameNumber` abstractions.

Never allow unrelated modules to depend directly on the third-party number library.

---

## 3. Architectural layers

The codebase should be understood as four primary layers.

```text
┌────────────────────────────────────────────┐
│ Presentation                               │
│ Phaser renderer + DOM UI                   │
└─────────────────────┬──────────────────────┘
                      │ commands / snapshots
┌─────────────────────▼──────────────────────┐
│ Application                                │
│ orchestration, use cases, lifecycle        │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│ Core Domain                                │
│ economy, progression, Collapse, save rules │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│ Infrastructure                             │
│ storage, CrazyGames, browser/platform      │
└────────────────────────────────────────────┘
```

Dependency rule:

- core domain must not import presentation or portal modules;
- application can depend on core abstractions;
- presentation calls application APIs;
- infrastructure implements interfaces defined inward from the domain/application boundary.

---

## 4. Proposed folder structure

```text
src/
  app/
    bootstrap/
      create-app.ts
      create-services.ts
    lifecycle/
      game-lifecycle.ts
      visibility-controller.ts
    commands/
    events/

  core/
    numbers/
      game-number.ts
      game-number-format.ts
      game-number-serialization.ts

    economy/
      economy-state.ts
      production.ts
      rewards.ts
      affordability.ts

    progression/
      mass-progress.ts
      scale-band.ts
      scale-unlocks.ts

    upgrades/
      upgrade-definition.ts
      upgrade-state.ts
      upgrade-cost.ts
      upgrade-effects.ts

    collapse/
      collapse-reward.ts
      collapse-reset.ts
      genesis-energy.ts
      fundamental-laws.ts

    milestones/
      milestone-definition.ts
      milestone-evaluator.ts

    offline/
      offline-calculator.ts
      offline-policy.ts

    simulation/
      simulation-state.ts
      simulation-step.ts
      simulation-events.ts

    save/
      save-schema.ts
      save-validation.ts
      save-migrations.ts

  game/
    scenes/
      boot-scene.ts
      main-scene.ts

    core-visual/
      matter-core-view.ts
      core-form-controller.ts

    objects/
      matter-object-view.ts
      object-pool.ts

    spawning/
      spawn-controller.ts
      spawn-patterns.ts

    absorption/
      absorption-controller.ts
      absorption-paths.ts

    camera/
      scale-camera-controller.ts
      parallax-controller.ts

    effects/
      particle-factory.ts
      transition-effects.ts

    audio/
      audio-controller.ts

    input/
      gravity-pulse-input.ts

  ui/
    hud/
    panels/
    components/
    formatters/
    styles/

  platform/
    platform-api.ts
    local-platform.ts
    crazygames-platform.ts
    platform-types.ts

  persistence/
    save-repository.ts
    local-save-repository.ts
    platform-save-repository.ts

  data/
    objects/
    scale-bands/
    upgrades/
    milestones/
    fundamental-laws/

  assets/
    sprites/
    audio/
    fonts/

  tests/
    fixtures/

scripts/
  balance/
  validate-data/
  build-audit/

tests/
  unit/
  integration/
  e2e/
```

The structure may evolve, but modules should remain small and purpose-specific.

---

## 5. Domain state

The domain state must remain serializable and renderer-agnostic.

Example conceptual state:

```ts
interface GameState {
  version: number;
  run: RunState;
  permanent: PermanentState;
  unlocks: UnlockState;
  statistics: StatisticsState;
}

interface RunState {
  mass: GameNumberSerialized;
  matter: GameNumberSerialized;
  peakMass: GameNumberSerialized;
  scaleBandId: ScaleBandId;
  upgradeLevels: Record<UpgradeId, number>;
  pendingScaleTransition?: ScaleBandId;
  startedAt: number;
}

interface PermanentState {
  genesisEnergy: GameNumberSerialized;
  collapseCount: number;
  lawLevels: Record<FundamentalLawId, number>;
}
```

Do not store:

- Phaser objects;
- DOM nodes;
- texture references;
- timers with implicit browser state;
- closures/functions;
- class instances that cannot migrate safely.

---

## 6. GameNumber abstraction

### 6.1 Purpose

All extreme-number operations must route through a project-owned API.

Conceptual interface:

```ts
interface GameNumber {
  add(value: GameNumberLike): GameNumber;
  sub(value: GameNumberLike): GameNumber;
  mul(value: GameNumberLike): GameNumber;
  div(value: GameNumberLike): GameNumber;
  pow(value: GameNumberLike): GameNumber;
  log10(): GameNumber;
  cmp(value: GameNumberLike): number;
  gte(value: GameNumberLike): boolean;
  lte(value: GameNumberLike): boolean;
  isFinite(): boolean;
  serialize(): string;
}
```

Actual implementation style can be functional rather than object-oriented if simpler.

### 6.2 Rules

- `break_eternity.js` imports should be localized;
- save format should not depend on undocumented internal fields;
- formatters are separate from math;
- comparisons should never convert huge values to JS `number`;
- cost/reward formulas should accept/return GameNumber-compatible values.

### 6.3 Testing

Required before economy implementation:

- parse normal values;
- parse exponent values;
- add/multiply;
- powers;
- comparisons;
- serialize/deserialize;
- invalid input handling;
- values beyond ordinary JS range.

---

## 7. Simulation model

### 7.1 Authoritative state

The deterministic simulation is authoritative for:

- resource production;
- upgrade effects;
- thresholds;
- milestones;
- scale unlocks;
- Matter Collapse rewards;
- offline progress.

The renderer is not authoritative.

### 7.2 Tick strategy

Do not require gameplay correctness to depend on a stable 60 FPS.

Prefer time-delta based simulation:

```text
elapsedSeconds
× currentProductionRate
= economic progress
```

Where discrete events matter, process bounded deterministic steps or scheduled domain events.

Visual frame rate can fluctuate without changing long-term economy materially.

### 7.3 Renderer sampling

The Phaser layer reads snapshots/events from the application layer and animates toward them.

This allows:

- smooth visuals despite coarse economy steps;
- testable simulation;
- offline calculation reuse;
- less coupling to requestAnimationFrame timing.

---

## 8. Event model

Use explicit events for meaningful state changes.

Examples:

```text
MatterGained
MassGained
UpgradePurchased
MilestoneUnlocked
ObjectFamilyUnlocked
ScaleTransitionPending
ScaleTransitionConfirmed
CollapseAvailable
CollapsePerformed
FundamentalLawPurchased
OfflineProgressClaimed
```

Events should carry enough immutable data for views to react without recomputing authoritative formulas.

Example:

```ts
{
  type: 'UpgradePurchased',
  upgradeId: 'gravity',
  previousLevel: 9,
  newLevel: 10,
  cost: '1.25e8',
  milestoneUnlocked: 'orbital-capture'
}
```

---

## 9. Presentation architecture

### 9.1 Phaser canvas

The canvas should fill the central gameplay area and scale responsively.

Responsibilities:

- Matter Core visual;
- visible matter objects;
- absorption animation;
- parallax/backgrounds;
- effects;
- scale transitions.

### 9.2 DOM overlay

The DOM UI is positioned around/over the canvas using CSS layout.

Prefer:

- CSS Grid/Flexbox;
- semantic buttons;
- CSS variables for theme tokens;
- accessible labels;
- responsive breakpoints kept minimal.

Avoid:

- hard-coded pixel positions for every control;
- UI built as hundreds of Phaser text objects;
- duplicated state between DOM and Phaser.

### 9.3 UI state

UI should derive from application snapshots/selectors.

For example:

```text
selectMatterDisplay(state)
selectNextUpgradeCost(state, id)
selectCollapseReward(state)
selectNextScaleGoal(state)
```

These selectors must not contain hidden mutation.

---

## 10. Matter rendering strategy

### 10.1 Bounded visual population

Set a configurable maximum number of actively rendered matter objects.

The exact budget comes from performance profiling.

The simulation can represent much higher production than the visual population.

### 10.2 Pooling

Matter sprites should use pools.

Lifecycle:

```text
inactive pool
→ configured/spawned
→ drifting/targeted
→ absorbed
→ reset
→ inactive pool
```

Avoid destroying/recreating sprites continuously.

### 10.3 Visual throughput mapping

Create a function mapping economic production rate to visual intensity.

Example concepts:

- logarithmic spawn frequency;
- increased cluster size;
- particle-stream density;
- occasional larger absorption events;
- faster orbit/attraction speed.

Do not map `1 economic event = 1 sprite event`.

---

## 11. Scale transition architecture

Scale transitions require a dedicated controller/state machine.

Possible states:

```text
Stable
TransitionPending
Preparing
ZoomingOut
SwappingContent
Revealing
Stable
```

Rules:

- simulation can mark transition eligibility;
- renderer does not autonomously change economic scale;
- transition completion should be acknowledged back to application state;
- reloading during a transition should recover safely to a known state;
- reduced-motion mode uses shorter/simple transitions with the same state outcome.

---

## 12. Matter Collapse transaction

Matter Collapse should be treated as an atomic domain transaction.

Conceptually:

```text
calculate reward
validate eligibility
record permanent reward
increment collapse stats
reset run state
apply permanent starting bonuses
persist
emit CollapsePerformed
```

Never grant reward in visual animation code.

The animation begins after the transaction is prepared/confirmed through the application flow.

Save safety is important because prestige is a high-value irreversible action.

---

## 13. Save architecture

### 13.1 Versioned schema

Every save has `saveVersion`.

Example:

```ts
interface SaveEnvelope {
  saveVersion: number;
  createdAt: number;
  lastSavedAt: number;
  game: SerializedGameState;
  settings: SettingsState;
  platformState: PlatformState;
}
```

### 13.2 Migration flow

```text
load raw data
→ parse JSON
→ validate envelope
→ migrate sequentially
→ validate current schema
→ hydrate domain state
```

Never silently accept unknown malformed structures.

### 13.3 Save triggers

Save after:

- meaningful upgrade purchase batches;
- scale transitions;
- Matter Collapse;
- Fundamental Law purchases;
- offline claim;
- settings changes;
- page visibility/unload lifecycle where feasible.

Also use a throttled periodic save while active.

### 13.4 Backup policy

Where storage allows, retain at least one previous valid local snapshot before applying a destructive migration or overwrite.

---

## 14. Platform abstraction

Interface example:

```ts
interface PlatformApi {
  initialize(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
  requestRewardedAd(): Promise<RewardedAdResult>;
  requestMidgameAd(): Promise<MidgameAdResult>;
  loadCloudSave?(): Promise<string | null>;
  saveCloudData?(data: string): Promise<void>;
}
```

Implementations:

- `LocalPlatform` — development/testing, no real ads;
- `CrazyGamesPlatform` — portal adapter;
- possible future portal adapters.

The game should boot with `LocalPlatform` without any CrazyGames script present.

---

## 15. Rewarded-ad integration rules

Never grant rewards because the button was clicked.

Flow:

```text
user requests reward
→ app validates reward availability
→ platform adapter requests ad
→ wait for result
→ if completed, application grants reward
→ persist reward state
→ UI confirms
```

Cancelled/unavailable/error paths return to normal gameplay without penalty.

Ad callbacks should be normalized by the platform adapter into project-owned result types.

---

## 16. Asset strategy

### 16.1 Band-based asset groups

Organize content by scale band so late-game assets can be lazy-loaded.

Example:

```text
assets/
  common/
  primordial/
  cellular/
  tiny/
  familiar/
  human/
  planetary/
  stellar/
  galactic/
  cosmic/
```

### 16.2 Initial payload

The initial build should contain only:

- common UI/core assets;
- first playable scale assets;
- minimum audio needed for first session;
- loading/transition assets.

Later assets load before they are needed.

### 16.3 Fallbacks

If late asset loading fails:

- do not corrupt progression;
- show a retry/fallback state;
- never award/lose resources based on asset load timing.

---

## 17. Performance budgets

Exact budgets are established by profiling, but the project should track:

- initial JS bundle size;
- initial asset payload;
- total build size;
- active sprite count;
- particle count;
- frame time;
- memory usage over long sessions;
- garbage collection spikes;
- transition loading spikes.

### 17.1 Performance principles

- pool repeated entities;
- avoid allocation inside hot frame loops;
- avoid per-frame DOM layout churn;
- batch UI updates;
- prefer simple tweens to full physics;
- cap particle systems;
- preload only imminent assets;
- pause/reduce visual work when page is hidden.

---

## 18. Accessibility architecture

Accessibility is not purely visual polish; it needs technical hooks.

Settings should support:

- reduced motion;
- master/music/SFX volume;
- UI scale/text size if feasible;
- toggling strong screen shake;
- high-contrast-friendly semantic states.

Reduced motion should change presentation, not economy timing.

DOM controls should use semantic elements instead of clickable anonymous divs where practical.

---

## 19. Testing pyramid

### Unit tests — many

Focus:

- pure rules;
- formulas;
- parsers;
- serializers;
- migrations;
- selectors.

### Integration tests — moderate

Focus:

- purchase flows;
- multi-system progression;
- Collapse transaction;
- save/load;
- offline progress;
- platform adapter results.

### E2E tests — fewer, high value

Focus:

- boot;
- UI flows;
- browser storage;
- real rendering smoke test;
- responsive layouts;
- critical player journey.

### Visual/manual QA

Required for:

- animation quality;
- scale-transition feel;
- Core readability;
- particle density;
- audio feel;
- reduced-motion experience.

---

## 20. CI expectations

Before merging feature branches into `staging`, CI should eventually run:

```text
install with lockfile
→ typecheck
→ lint
→ unit tests
→ integration tests
→ production build
→ selected Playwright smoke tests
```

A later stage may add:

- build-size audit;
- data validation;
- save migration fixture tests;
- visual screenshot comparisons where stable enough.

Do not create a large complex CI pipeline before the foundation exists; add checks as the corresponding systems are introduced.

---

## 21. Code quality rules

### Prefer

- pure functions for formulas;
- explicit types;
- composition;
- small modules;
- immutable inputs where practical;
- named constants for balance parameters;
- data-driven definitions;
- dependency injection for platform/storage/time where useful;
- comments explaining **why**, not restating obvious code.

### Avoid

- giant manager classes;
- hidden global mutable state;
- economic formulas inside UI components;
- direct portal SDK calls throughout game code;
- importing Phaser into core logic;
- magic numbers scattered across scenes;
- save schemas inferred from runtime classes;
- premature abstraction with no concrete use.

---

## 22. Time abstraction

Offline systems and deterministic tests benefit from an injectable clock.

Example:

```ts
interface Clock {
  now(): number;
}
```

Production uses a browser/system clock implementation. Tests use a fake clock.

This avoids tests that depend on real waiting.

---

## 23. Randomness abstraction

If randomized spawns or rewards affect tests, isolate RNG.

Example:

```ts
interface RandomSource {
  next(): number;
}
```

The renderer can use non-deterministic randomness for purely cosmetic particles, but economic randomness should be seedable/testable if introduced.

---

## 24. Balance-data validation

Create scripts/tests that reject invalid content such as:

- duplicate object IDs;
- unknown scale-band references;
- negative costs;
- malformed GameNumber strings;
- impossible milestone dependencies;
- missing asset references where validation is practical;
- circular unlock dependencies.

The goal is to catch content mistakes before browser runtime.

---

## 25. Headless simulator architecture

The balance simulator should import the same domain/application functions used by the game.

It should **not** reimplement the economy separately.

Possible CLI output:

```text
Scenario: new-player-default
First upgrade: 00:22
First automation: 03:48
Cellular → Tiny: 07:15
First Collapse available: 21:42
Genesis Energy: 5
Recovery to previous peak: 04:51
```

Scenario strategies may include:

- cheapest affordable;
- highest ROI;
- fixed upgrade priority;
- idle-only;
- active Pulse at ideal intervals.

The simulator informs balance decisions; it does not replace human playtesting.

---

## 26. First technical spike

Before large feature development, build the smallest architecture-valid spike.

The spike should prove:

1. Vite + TypeScript + Phaser 4 boots;
2. DOM HUD can overlay/align with the Phaser canvas;
3. a placeholder Matter Core renders and pulses;
4. a few pooled placeholder objects drift and absorb with custom curves;
5. a tiny headless `GameNumber` economy increments Mass/Matter;
6. Gravity Pulse triggers through application commands;
7. one Vitest suite runs;
8. one Playwright boot test runs;
9. production build succeeds;
10. no economic code imports Phaser.

The spike is not an art/content milestone. Placeholder geometry is preferred.

---

## 27. Definition of done for architecture foundation

The foundation is ready for feature production when:

- project boots locally;
- project builds production output;
- typecheck passes;
- unit test runner passes;
- Playwright smoke test passes;
- `GameNumber` wrapper is tested;
- core simulation can run without renderer;
- Phaser canvas and DOM UI coexist responsively;
- local platform adapter works;
- save schema v1 exists even if minimal;
- no direct CrazyGames dependency exists in core modules;
- repository structure matches documented dependency boundaries closely enough to be understandable.

---

## 28. Codex tasking rules

Do not ask Codex to “build the game.”

Give it narrow tasks with:

- goal;
- allowed/expected files;
- architectural constraints;
- acceptance criteria;
- tests to add/run;
- explicit non-goals.

Example:

```text
Task: implement GameNumber wrapper.

Goal:
Provide deterministic parsing, arithmetic, comparison and serialization using break_eternity.js.

Constraints:
- third-party library imports only inside src/core/numbers;
- no rendering/UI changes;
- serialization must be stable strings.

Acceptance:
- unit tests cover normal and huge values;
- typecheck passes;
- no direct break_eternity import outside wrapper.
```

This keeps generated changes reviewable and reduces architectural drift.

---

## 29. Things deliberately not chosen yet

Do not add these until a real need appears:

- React/Vue/Svelte;
- Redux-like global state libraries;
- ECS framework;
- physics engine;
- backend server;
- database;
- multiplayer networking;
- 3D engine;
- shader-heavy rendering architecture;
- complex analytics SDK;
- multiple prestige layers.

Every dependency should justify its bundle size, maintenance cost and conceptual complexity.

---

## 30. Architecture review rule

Any implementation that materially violates one of these boundaries should either:

1. be refactored back into compliance, or
2. update `docs/DECISIONS.md` with a deliberate accepted architectural change.

Silent drift is not acceptable for core systems.
