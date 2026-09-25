# Project Scale — Game Design & Development Plan

> **Status:** Pre-production / living document  
> **Target:** Web browser; CrazyGames is the first intended commercial portal  
> **Implementation status:** Do not build the game yet. Resolve the open decisions in this document before production code begins.

---

## 1. Product vision

Create an original idle/incremental growth game built around one instantly readable fantasy:

> Start microscopic, consume things small enough to absorb, grow through increasingly dramatic size bands, automate more of the process, then reset through rebirth to become permanently stronger and push farther on the next run.

The active play should capture the satisfying *type* of progression found in consume-and-grow games: objects that initially block the player later become food. The long-term structure should use proven incremental-game ideas: exponential costs, multipliers, offline gains, automation, milestones, prestige currency, permanent upgrades and extremely large numbers.

The finished game must have original art, naming, object lists, progression structure, sounds, level layouts, interface, copy, balancing and presentation. Reference games are used only to understand mechanics and readability; no assets or distinctive trade dress should be copied.

### Player promise

- Immediate satisfaction from consuming visible objects.
- Frequent “I can eat that now” unlock moments.
- Clear physical and numerical growth.
- Useful choices every few minutes early on.
- Active play that remains meaningful even after automation appears.
- Offline progress that respects the player's time.
- Rebirths that immediately make later runs faster.
- Long-term progression from microscopic matter to cities, planets, stars, galaxies, universes and later abstract cosmic scales.

---

## 2. Design pillars

### 2.1 Visible growth is the primary reward
The player entity must visibly grow as Mass rises. Camera behaviour, object scale and environment content should reinforce that growth rather than presenting only larger numbers.

### 2.2 “Too big” becomes “edible”
Large objects serve as natural short-term goals. The player should repeatedly see something impossible, improve, then return and consume it.

### 2.3 Active and idle systems support each other
Active routing, targeting and timed abilities provide the best immediate progress. Automation/offline systems preserve momentum while away. Neither mode should invalidate the other.

### 2.4 Scale changes are events
Major scale bands should alter scenery, object families, camera zoom, audio ambience and reward pacing so progression feels like travelling through different worlds rather than changing a number label.

### 2.5 Complexity unlocks gradually
The opening minutes should expose only Mass, movement and a few upgrades. Rebirth, automation, offline upgrades, permanent trees and advanced currencies appear over time.

### 2.6 Rebirth means acceleration
The player gives up temporary run progress for permanent power. The next run should demonstrate the benefit almost immediately.

### 2.7 Monetisation is optional acceleration
The game must work fully when ads fail, are blocked, or the player declines them. Rewarded ads provide optional boosts and convenience rather than mandatory access.

---

## 3. Audience and session shape

Target players:

- casual browser players;
- fans of idle/incremental/clicker/evolution games;
- players who enjoy “eat to get bigger” loops;
- players who alternate between short active sessions and returning to accumulated progress.

Target session behaviour:

| Session | Design goal |
|---|---|
| First session | 10–20 minutes, fast discovery, several upgrades, at least one dramatic unlock |
| Normal active session | 5–15 minutes |
| Idle return | claim progress, buy upgrades, push toward the next size band |
| Long term | repeat rebirths and unlock new scale bands over days/weeks |

Exact timings require balance simulation and playtesting.

---

## 4. Core loop

1. Move through a bounded or streamed play area.
2. Identify objects below the current consumption threshold.
3. Contact or pull eligible objects into the player.
4. Gain Mass and potentially run currency.
5. Increase visible size.
6. Unlock larger object families.
7. Purchase temporary run upgrades.
8. Cross milestones and transition to a larger scale band.
9. Reach diminishing progress / a soft wall.
10. Rebirth for permanent meta-currency.
11. Spend permanent currency.
12. Restart with meaningful advantages and reach farther.

### Active skill expression

The game should not be pure waiting. Active players can improve progress by:

- routing through dense clusters;
- avoiding or navigating around objects still too large;
- timing a Pulse/Vacuum Burst ability;
- choosing upgrade order;
- deciding when to change zones;
- deciding when to rebirth.

---

## 5. Controls

### Desktop

- WASD / arrows: movement.
- Space or left click: active Pulse/Vacuum Burst.
- Escape: pause/settings.
- Mouse position may influence facing/targeting if later useful.

### Mobile

- virtual joystick or drag-to-move;
- large single action button for Pulse;
- touch targets sized for casual play;
- landscape is the likely primary layout, but the interface should remain safe on narrow screens.

Input handling should be abstracted so keyboard, pointer, touch and later gamepad support share the same gameplay commands.

---

## 6. Mass, size and consumption

### Mass

`Mass` is the main run progression quantity. Objects provide a Mass reward. Player capability is based on Mass rather than visual radius.

### Visual radius

Use a softened power relationship so visible growth is satisfying without becoming impossible to render:

```text
visualRadius = baseRadius * (mass / baseMass) ^ growthExponent
```

Initial test range for `growthExponent`: `0.25–0.34`.

This is a balance parameter, not a final constant.

### Object data

Every consumable object should be data-driven and contain at least:

```text
id
category
requiredMass
massReward
visualScale
spawnWeight
collisionMode
assetKey
scaleBand
```

### Eligibility

```text
playerMass >= object.requiredMass  => edible
playerMass < object.requiredMass   => obstacle / hazard / non-target
```

Later testing may introduce a small tolerance around thresholds if strict comparisons feel frustrating.

### Unlock feedback

When a meaningful category becomes edible:

- short outline/icon pulse;
- small toast such as “Now edible: Bicycles”;
- short sound cue;
- no modal interruption for routine unlocks.

---

## 7. Scale-band roadmap

The experience should appear continuous while internally splitting content into manageable worlds/bands.

| Band | Fantasy scale | Example object families |
|---|---|---|
| 1. Microscopic | sub-mm → mm | particles, microbes, cells, fibres |
| 2. Tiny | mm → cm | crumbs, droplets, seeds, insects |
| 3. Household | cm → m | stationery, food, toys, furniture |
| 4. Street | m → tens of m | people, bins, bikes, cars, trees |
| 5. City | tens of m → km | buses, houses, towers, blocks, bridges |
| 6. Regional | km → hundreds km | districts, mountains, islands, storms |
| 7. Planetary | planetary | asteroids, moons, planets, rings |
| 8. Stellar | solar-system | gas giants, stars, systems |
| 9. Galactic | interstellar | nebulae, clusters, galaxies |
| 10. Universal | cosmic | galaxy groups, large-scale structures, universes |
| 11+ | post-universal | dimensions, timelines, realities, multiversal abstractions |

These are gameplay scales, not a promise of scientific simulation.

### Zone transitions

A transition is a natural place to:

- save;
- summarize progress;
- present upgrade choices;
- unload/load asset bundles;
- request an optional midgame ad only at a natural break and only when platform policy allows it.

---

## 8. Active and idle systems

### Active movement/collection
The player directly moves through the world and consumes objects.

### Passive suction
An upgradeable radius pulls currently edible objects toward the player.

Important variables:

- suction radius;
- pull force/speed;
- target capacity;
- maximum object size ratio;
- falloff curve.

### Pulse / Vacuum Burst
A cooldown ability that temporarily increases collection power. Candidate effects:

- larger suction radius;
- stronger pull speed;
- instant collection of nearby trivial objects;
- later permanent upgrade allowing borderline-size objects to count as edible briefly.

The ability should create an active-play advantage without making normal movement irrelevant.

### Auto-collector
Unlock after early progression or the first rebirth. It should select nearby valid targets and produce progress while the player is not actively moving.

### Offline progress
Do not simulate collisions while offline. Store enough state to approximate production safely.

Proposed first version:

- base offline efficiency: 20–30% of recent stable production;
- starting cap: about 4 hours;
- permanent upgrades can raise efficiency and the cap toward 12–24 hours;
- show a compact return summary;
- cap pathological time jumps and validate timestamps.

Exact numbers are placeholders until simulations exist.

---

## 9. Economy and currencies

Keep the first hour intentionally simple.

### 9.1 Mass — run progression

- gained primarily by consuming objects;
- determines size and edible thresholds;
- resets on rebirth.

### 9.2 Matter — proposed run upgrade currency

A separate run currency may be useful so buying upgrades does not visually shrink the player by spending Mass.

Possible sources:

- objects;
- milestones;
- conversion from a portion of Mass;
- zone completions.

**Open decision:** prototype both “Mass buys upgrades” and “Matter buys upgrades” in the headless simulator before locking the economy.

### 9.3 Cores — rebirth currency

Permanent currency earned on reset. Intended uses:

- permanent Mass gain multiplier;
- starting Mass;
- movement baseline;
- suction radius/strength baseline;
- offline efficiency/cap;
- starting run-upgrade levels;
- milestone bonuses;
- auto-collection improvements.

### 9.4 Boost Tokens — optional convenience currency

Potential sources:

- achievements;
- milestones;
- return rewards;
- rewarded ads.

If Boost Tokens buy meaningful progression, they must also be earnable without advertising.

Candidate uses:

- timed x2 Mass gain;
- limited instant offline-progress claim;
- temporary Pulse cooldown reduction;
- temporary auto-collector speed boost.

Do not add a currency unless it creates a distinct decision.

---

## 10. Large-number system

The design must support numbers far beyond JavaScript's normal comfortable range.

Requirements:

- use a battle-tested arbitrary-large incremental number library behind a project-owned wrapper;
- gameplay systems depend on the wrapper, not directly on the library;
- comparisons, addition, multiplication, powers, logs and serialization must be deterministic;
- formatting is separate from numeric state;
- tests cover boundary and serialization behaviour.

### Formatting progression

Early values should be familiar:

```text
999
1.20K
12.5M
3.40B
```

At extreme values, switch to scientific notation or another documented format:

```text
1.23e45
7.8e1,250
```

Do not make the display notation itself part of the saved economic state.

---

## 11. Run upgrades

Run upgrades reset on rebirth unless a permanent upgrade says otherwise.

Initial categories:

1. **Absorption** — Mass gained per consumed object.
2. **Movement** — travel speed / acceleration.
3. **Suction Radius** — pull area.
4. **Suction Strength** — pull speed.
5. **Pulse Power** — burst effectiveness.
6. **Pulse Recharge** — cooldown reduction.
7. **Matter Yield** — if Matter is retained.
8. **Auto Collector** — passive collection frequency/capacity.

Typical exponential cost model:

```text
cost(level) = baseCost * growthRate ^ level
```

Production upgrades must be checked against target time-to-milestone curves rather than tuned independently.

### Upgrade UX

Each card shows:

- name;
- current level;
- concise effect;
- next-level effect;
- cost;
- buy button;
- optional buy x1 / x10 / max mode later.

Unavailable upgrades should clearly explain their unlock condition.

---

## 12. Milestones

Milestones break long exponential stretches into visible goals.

Examples:

- reach a Mass threshold;
- consume first object in a category;
- complete a scale band;
- first rebirth;
- rebirth with a target Core reward;
- reach a new permanent-upgrade tier.

Milestone rewards can include:

- temporary multiplier;
- Cores/Boost Tokens;
- unlocking automation;
- unlocking an upgrade category;
- increasing offline cap;
- opening a new scale band.

Milestones should create anticipation but not become a dense checklist that distracts from play.

---

## 13. Rebirth / prestige system

Working terminology is **Rebirth** until a more thematic term is approved.

### Reset behaviour

A rebirth should reset:

- Mass;
- run currency;
- temporary run upgrades;
- current zone progress;
- temporary boosts where appropriate.

It should preserve:

- Cores;
- permanent upgrade purchases;
- achievements and discovered-object catalogue;
- settings;
- monetisation reward state that should survive reset;
- lifetime statistics.

### Reward model

Use a soft power/log-style formula so reward rises rapidly at first and then requires meaningful deeper runs.

Example shape only:

```text
cores = floor((runPeakMass / rebirthThreshold) ^ prestigeExponent * milestoneMultiplier)
```

The exact formula must be tuned by simulation.

### Rebirth UX

Before confirming, show:

- what resets;
- what remains;
- Cores earned now;
- next meaningful reward breakpoint;
- a clear cancel option.

After rebirth, the opening minute should be observably faster.

---

## 14. Permanent upgrades

Candidate permanent nodes/categories:

- universal Mass multiplier;
- starting Mass;
- starting Matter;
- movement baseline;
- suction baseline;
- Pulse baseline;
- offline efficiency;
- offline duration cap;
- auto-collector unlock/strength;
- first N run-upgrade levels free;
- milestone reward multiplier;
- reduced early-zone friction;
- additional object-value multiplier per completed scale band.

Permanent upgrades should create multiple viable priorities instead of one compulsory linear path. Costs can rise sharply because they persist forever.

---

## 15. Later prestige layers

Do **not** put multiple prestige systems into the MVP.

The numeric/serialization architecture should permit a future second layer, possibly tied to cosmic progression, that resets Rebirth progress for a more powerful permanent resource. This should only be added after the first prestige layer has meaningful depth.

---

## 16. World/content model

World content must be data-driven.

Each scale band defines:

- object catalogue;
- required Mass ranges;
- spawn tables/densities;
- obstacle rules;
- background/tiles/environment;
- music/ambience;
- camera limits;
- milestone thresholds;
- transition conditions.

### Spawn philosophy

The map should contain a mixture of:

- plentiful safe objects below current size;
- some objects close to current threshold;
- a visible set of aspirational objects that are currently too large.

As the player grows, stale tiny objects should be cleaned up or aggregated to avoid performance waste.

### Pooling

Repeated world objects should use pooling/reuse rather than excessive allocation/destruction.

---

## 17. Camera and perspective

Recommended prototype direction: top-down or shallow 2.5D/isometric presentation. The core loop must be proven before committing to a heavy 3D city simulation.

Camera goals:

- keep the player readable;
- zoom gradually with size;
- avoid motion sickness or constant zoom jitter;
- maintain useful target density;
- make transitions between scale bands dramatic.

---

## 18. UI/UX direction

The interface should be light, simple and highly readable.

### Visual rules

- opaque solid-colour surfaces;
- simple rounded corners;
- restrained borders/shadows;
- clear typography and iconography;
- limited accent colours with semantic use;
- no yellow/orange global colour filter;
- no excessive neon;
- avoid glassmorphism/translucent HUD as the main style;
- avoid visual resemblance to the supplied reference games.

### Main HUD

Candidate elements:

- current Mass/size;
- Mass progress toward the next meaningful unlock;
- run currency;
- Pulse button/cooldown;
- shortcut to upgrades;
- current scale band;
- optional small objective text.

Avoid covering the playfield with panels.

### Upgrade screen

Use clean cards in a responsive grid/list. It should work at common desktop browser sizes and touch widths.

### Feedback hierarchy

Use stronger feedback only for meaningful events:

- consume: small animation/sound;
- category unlock: medium toast + sound;
- size band transition: significant presentation;
- rebirth: major transition.

---

## 19. Accessibility

Minimum goals:

- UI remains understandable without relying on colour alone;
- keyboard navigation for menus where practical;
- remappable/multiple movement keys where possible;
- reduced-motion option for large camera/particle effects;
- master/music/SFX volume controls;
- readable contrast and scalable text;
- no critical information conveyed only by rapid animation.

---

## 20. Audio direction

Audio should reinforce scale:

- tiny soft consumption ticks at microscopic level;
- progressively heavier impact/absorption sounds;
- stronger transition cues for object-category and world unlocks;
- distinct Pulse ability cue;
- low-frequency cosmic ambience in late bands.

Avoid audio spam when hundreds of trivial objects are collected; batch/throttle repeated sounds.

---

## 21. Monetisation plan

### Principle

Ads should increase optional speed, never determine whether the core game can continue.

### Rewarded ads

Candidate rewards:

- temporary x2 Mass/Matter gain;
- temporary auto-collector boost;
- bonus Boost Tokens;
- limited enhanced offline claim;
- optional post-run reward multiplier.

Rules:

- reward only after a confirmed completed rewarded-ad event;
- unavailable/cancelled ads return the player to the game without penalty;
- every meaningful ad-derived currency has a non-ad earning route;
- do not pressure the player after every interaction.

### Midgame/interstitial ads

If used, request only at natural breaks and according to the portal's current policy/SDK rules. Never interrupt active movement unexpectedly. Gameplay/audio must pause appropriately while the ad is active.

### Platform adapter

CrazyGames-specific calls must sit behind a project-owned platform interface so local development and another web portal can use mock/alternate implementations.

Potential interface responsibilities:

```text
init platform
request rewarded ad
request midgame ad
signal gameplay start/stop
load/save cloud data
read user/account information when allowed
submit optional analytics events
```

The game must remain playable with the mock/no-ad adapter.

---

## 22. Save architecture

Save data must be explicit and versioned from the first implementation.

Example top-level shape:

```text
saveVersion
createdAt
lastSavedAt
currentRun
permanentProgress
settings
achievements
statistics
platformState
```

### Requirements

- migration functions between save versions;
- automatic backup of the previous local save before destructive migration where possible;
- validate loaded data instead of trusting it;
- never save renderer/runtime objects directly;
- throttle saves rather than writing every frame;
- save at milestones, purchases, rebirths, settings changes and page lifecycle events.

The platform cloud/data module should be wrapped behind the same save repository abstraction used by local storage.

---

## 23. Offline progress safety

Offline calculations are a common source of exploits and bugs.

Requirements:

- cap maximum claim duration;
- clamp negative/invalid elapsed time;
- avoid iterating per second while offline;
- derive production from stable state/snapshots;
- record enough information to explain an offline reward in tests;
- tolerate browser clock changes rather than corrupting progression.

For a client-only browser game, perfect anti-cheat is not the goal. Protect progression from accidental corruption and obvious trivial exploits while keeping the architecture simple.

---

## 24. Proposed technical architecture

**Proposed only until recorded as accepted in `DECISIONS.md`.**

Candidate stack:

- TypeScript;
- Vite;
- Phaser;
- Vitest;
- Playwright;
- a large-number library such as break_infinity.js, wrapped by project code.

### Architectural boundaries

Keep deterministic game rules separate from rendering.

Suggested future structure:

```text
src/
  app/
  core/
    economy/
    progression/
    prestige/
    upgrades/
    numbers/
    save/
  game/
    scenes/
    entities/
    systems/
    world/
    input/
  ui/
    components/
    screens/
    hud/
  platform/
    platform-api.ts
    local-platform.ts
    crazygames-platform.ts
  data/
    objects/
    upgrades/
    worlds/
  assets/
  tests/
```

The exact layout may evolve, but these boundaries should remain clear.

### Core rule

`core/` must not import Phaser. Economy tests should run headlessly without a canvas.

---

## 25. Performance strategy

Browser performance is a design constraint, not a final optimisation pass.

### Requirements

- object pooling for repeated entities;
- spatial indexing / broad-phase queries for nearby consumables;
- only evaluate suction/consumption candidates near the player;
- remove or aggregate irrelevant tiny objects after large growth;
- batch visual particles and sound triggers;
- lazy-load later scale-band assets;
- minimise large textures/audio in the initial payload;
- test representative low/mid-range hardware early;
- keep gameplay responsive when many objects are visible.

### Internal bundle goals

Set stricter internal limits than platform maxima. An initial target is to keep the first playable payload around or below ~15 MB where practical, with later scale assets loaded on demand. Re-check current CrazyGames technical limits before submission.

---

## 26. Testing strategy

### Unit tests

Deterministic systems require strong coverage:

- number wrapper and formatting boundaries;
- Mass/visual-size conversion;
- edible threshold logic;
- upgrade costs/effects;
- max-buy calculations;
- rebirth rewards;
- permanent upgrade stacking;
- offline reward calculation;
- save serialization/migration/validation;
- spawn selection rules where deterministic;
- ad reward state machine.

### Integration tests

Examples:

- consuming an object updates run state and unlock checks;
- buying an upgrade affects the intended production path;
- rebirth resets/preserves the correct fields;
- save/load preserves an entire progression state;
- platform mocks return valid fallback behaviour.

### Browser/E2E tests

Critical user journeys:

- game boots;
- player can start a run;
- upgrade screen opens and a purchase works;
- save persists through reload;
- rebirth flow works;
- mocked rewarded-ad success grants exactly one reward;
- mocked ad cancellation grants nothing and does not block play.

### Balance tests/simulator

A headless simulator should run deterministic player profiles:

- active optimiser;
- average active player;
- mostly idle player;
- even-spend/no-strategy player.

Track:

- time to each scale band;
- time to first rebirth;
- upgrade purchase sequence;
- Cores/hour;
- effect of permanent upgrades;
- long stalls;
- runaway compounding.

Balance changes should be checked by simulation before relying solely on manual feel.

---

## 27. TDD and code quality

For deterministic mechanics:

1. define behaviour/acceptance criteria;
2. add a failing test;
3. implement the smallest behaviour;
4. refactor with tests green;
5. run the relevant suite;
6. update docs if the rule changed.

General coding principles:

- small cohesive modules;
- explicit types;
- meaningful naming;
- avoid duplicated formula logic;
- prefer pure functions for economy calculations;
- dependency inversion for platform/storage/rendering boundaries;
- comments explain *why*, not obvious syntax;
- no unexplained magic constants — use named balance/config data;
- avoid premature abstraction, but isolate systems known to vary by platform.

---

## 28. Codex workflow

Do not ask Codex to generate the complete game in one task.

Each Codex implementation prompt should include:

1. goal;
2. relevant design-document section;
3. allowed files/directories;
4. acceptance criteria;
5. tests required;
6. explicit non-goals;
7. performance constraints;
8. save compatibility requirements.

Good task examples:

- implement the project numeric wrapper + tests;
- implement pure upgrade-cost functions + tests;
- implement rebirth reward model + simulator test;
- implement save schema v1 and migrations;
- implement one microscopic world vertical slice;
- implement CrazyGames adapter against an already-defined interface.

A Codex change is complete only when tests pass, acceptance criteria pass, unrelated files are unchanged and required docs are updated.

---

## 29. MVP scope

The MVP proves the progression loop; it does not need the entire cosmic roadmap.

### MVP target

- 3–4 scale bands: Microscopic → Tiny → Household → Street;
- ~25–40 distinct object types;
- movement and consumption;
- passive suction;
- Pulse ability;
- run upgrades;
- first rebirth loop;
- ~8–12 permanent upgrade nodes/levels;
- offline progress;
- save/load;
- desktop + touch controls;
- platform adapter with local mock;
- rewarded ads only after the non-ad loop is already fun.

### Not required for MVP

- fully implemented galaxies/universes;
- second prestige layer;
- multiplayer;
- trading;
- complex cosmetics economy;
- backend server;
- in-app purchases.

Cosmic tiers should still be represented in design/data forecasts so numeric architecture will support them later.

---

## 30. Milestones

### Milestone 0 — pre-production

- approve working title;
- approve visual theme;
- approve camera style;
- approve framework;
- decide Mass-vs-Matter upgrade economy;
- approve rebirth terminology;
- define first-rebirth timing target;
- define MVP art pipeline.

### Milestone 1 — headless economy prototype

- large-number wrapper;
- Mass/size conversion;
- edible eligibility;
- upgrade economy;
- rebirth formula;
- offline math;
- balance simulator;
- unit tests.

### Milestone 2 — microscopic prototype

- movement;
- consumption;
- spawning;
- camera;
- HUD;
- first upgrades;
- basic touch support.

### Milestone 3 — vertical slice

- several scale bands;
- representative UI style;
- audio feedback;
- save system;
- first rebirth;
- offline gains;
- initial accessibility settings.

### Milestone 4 — platform integration

- CrazyGames SDK adapter;
- lifecycle integration;
- cloud/data integration;
- rewarded ads;
- allowed natural-break midgame ads;
- no-ad/failure handling.

### Milestone 5 — balance/optimisation

- automated simulations;
- performance profiling;
- mobile pass;
- bundle optimisation;
- accessibility pass;
- exploit/corrupt-save tests.

### Milestone 6 — submission candidate

- full QA checklist;
- CrazyGames preview testing;
- production store assets;
- analytics/telemetry review;
- exact tested release artifact.

---

## 31. Post-launch metrics

Do not optimise purely for ad views. Retention and enjoyable progression come first.

Useful signals:

- gameplay conversion/start rate;
- average session time;
- D1 retention where measurable;
- time to first upgrade;
- time to first major category unlock;
- time to first band transition;
- time to first rebirth;
- completion percentage per band;
- rewarded-ad opt-in rate;
- quit rate following ads;
- returning-save rate;
- common progression walls.

Analytics should answer design questions rather than simply maximise interruptions.

---

## 32. Open decisions before coding

These are intentionally unresolved. Record final decisions in `docs/DECISIONS.md`.

1. Final game title (working title: Project Scale).
2. Original player fantasy: organism, anomaly, singularity, machine, magical entity, etc.
3. Top-down 2D vs shallow 2.5D/isometric.
4. Phaser vs another browser renderer/framework.
5. Mass directly buys upgrades vs separate Matter currency.
6. Final prestige terminology.
7. Target time to first rebirth.
8. Late-game active-play intensity.
9. Landscape-only vs full portrait mobile support.
10. Art production method and style.
11. Whether “too large” objects physically block/damage the player or simply cannot be consumed.
12. Exact rewarded-ad reward set.
13. Whether daily rewards/achievements ship in MVP or later.

---

## 33. Non-negotiable constraints

- Browser-first.
- Core game runs if advertising is unavailable.
- No rewarded-ad progression gates.
- Original assets and presentation.
- No yellow/orange global filter.
- No excessive neon or glass/translucent primary UI.
- Solid panels and simple rounded controls.
- Deterministic economy separated from rendering.
- Save data versioned and migratable.
- `main` and `staging` are long-lived release/integration branches.
- Feature/fix changes reach `staging` before normal production release.
- Production releases originate from `main` only.
- Tests are required for deterministic progression rules.
- Performance and initial download size are design requirements.

---

## 34. External references to re-check before implementation/submission

Platform/library requirements change. Re-verify these rather than relying on stale assumptions:

- CrazyGames developer docs: https://docs.crazygames.com/
- SDK introduction: https://docs.crazygames.com/sdk/intro/
- ads requirements: https://docs.crazygames.com/requirements/ads/
- video ads: https://docs.crazygames.com/sdk/video-ads/
- technical requirements: https://docs.crazygames.com/requirements/technical/
- account integration: https://docs.crazygames.com/requirements/account-integration/
- data module: https://docs.crazygames.com/sdk/data/
- Phaser releases: https://phaser.io/download
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- break_infinity.js: https://github.com/Patashu/break_infinity.js

---

## 35. Document maintenance rule

This document is the intended living source of truth.

When a major design/architecture rule changes:

1. edit the relevant section here;
2. record the decision and rationale in `docs/DECISIONS.md`;
3. update affected issue acceptance criteria;
4. update automated tests/simulations if the rule is measurable;
5. note save compatibility/migration impact if relevant.

The design document should describe the game actually being built, not an abandoned earlier concept.