# Project Scale — Game Design & Development Plan

> **Status:** Pre-production / living document  
> **Target:** Web browser, with CrazyGames as the first intended commercial portal  
> **Design direction:** Approved core concept; economy values remain subject to simulation and playtesting  
> **Implementation note:** This document is the primary design source of truth. Where an older note or prototype conflicts with this document, this document wins unless a later ADR explicitly supersedes it.

---

## 1. Product vision

Create an original 2D idle/incremental growth game built around one central fantasy:

> The player controls a strange Matter Core that continuously absorbs increasingly large forms of matter. As it grows, the surrounding world appears to shrink and new scales of reality are revealed. When progress slows, the player can trigger a Matter Collapse, compressing the Core into a singularity and causing a new Big-Bang-like restart that permanently strengthens future runs.

The game takes inspiration from the emotional appeal of consume-and-grow games and the long-term structure of incremental games, but it is not a movement-heavy clone of either. The primary experience is watching one impossible object become powerful enough to consume larger and larger layers of existence.

The finished game must use original art, naming, progression, effects, sounds, object sets, balancing, interface, upgrade structure and presentation.

### 1.1 Player promise

The player should repeatedly experience:

- “That object is huge compared with me.”
- “I can absorb it now.”
- “Everything that used to look large now looks tiny.”
- “The next scale is becoming visible.”
- “My previous run hit a wall here; this run breaks through it easily.”
- “My Matter Core is changing, not just the number beside it.”
- “The game keeps revealing a bigger idea of what ‘large’ means.”

### 1.2 Genre positioning

The game is primarily:

- idle/incremental;
- 2D browser-first;
- visually driven;
- low-input but not zero-input;
- designed around short active visits and long-term return progression;
- easy to understand early, with complexity unlocked gradually.

It is **not** intended to be:

- a physics sandbox;
- a large explorable map;
- a WASD movement game;
- a realistic scientific simulation;
- a click-speed endurance game;
- a game where progress depends on watching ads.

---

## 2. Core design pillars

### 2.1 The Matter Core is always the star

The Matter Core is the principal visual object and should remain near the centre of the playfield. The rest of the world exists to communicate its changing power and scale.

The player should not lose the Core in clutter, and the UI should never visually dominate it.

### 2.2 Growth must be visible, not only numerical

Mass numbers can become enormous, but numerical growth alone is not enough. Progress should also change:

- object sizes relative to the Core;
- which object families appear;
- parallax depth;
- background scale;
- Core animation/material/effects;
- absorption speed and range;
- density of matter streams;
- sound and impact weight.

### 2.3 “Impossible” becomes ordinary

Large objects should serve as visible future goals. The player sees objects that cannot yet be absorbed, then later watches them become common and trivial.

This contrast is one of the game’s strongest reward loops.

### 2.4 The world scales around the player

The Core should remain readable in screen space. As effective Mass increases, the scene visually zooms out and current objects become smaller, revealing larger objects and backgrounds.

The player should feel as though the camera is retreating through larger and larger scales, even though the implementation uses discrete scale bands internally.

### 2.5 Active input accelerates idle progress

The player can actively pulse the Core and make meaningful upgrade choices, but optimal play must never require frantic clicking.

Automation should arrive early and grow in sophistication.

### 2.6 Matter Collapse should feel desirable

Progression walls should make a Matter Collapse strategically attractive rather than forcibly mandatory through arbitrary locking.

The player may technically continue waiting, but the economic curve should make resetting for permanent power the clearly more interesting choice.

### 2.7 Complexity unlocks gradually

The first minutes expose only the minimum concepts needed to enjoy growth. Later systems appear when the player has a reason to care about them.

### 2.8 Ads are optional acceleration

Advertising can speed progress or grant convenience rewards, but declining or failing an ad must never block progression.

---

## 3. Main screen and camera language

### 3.1 Primary screen composition

The main screen is a large central playfield surrounded by lightweight UI.

Target composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ MASS                     MATTER                     SCALE     │
│                                                              │
│ [UPGRADES]                                           [GOAL]   │
│                                                              │
│             distant / aspirational objects                   │
│                                                              │
│                        ◉                                     │
│                    MATTER CORE                               │
│                                                              │
│              nearby absorbable objects                       │
│                                                              │
│ [COLLAPSE]                                       [SETTINGS]  │
│                                                              │
├──────────── PULSE ───────── AUTO ───────── BOOST ─────────────┤
└──────────────────────────────────────────────────────────────┘
```

This is a structural guide, not final art.

The playfield should occupy most of the viewport. Permanent UI should be thin; larger panels open only when needed.

### 3.2 Perspective

Use a **2D layered shallow-perspective presentation**.

The scene can imply depth through:

- foreground layer;
- primary gameplay layer;
- distant/background layer;
- slight vertical scale variation;
- parallax motion;
- depth-based blur/contrast where appropriate;
- layered shadows and atmospheric particles.

Do not use a true 3D world unless a later validated feature specifically requires it.

### 3.3 Core screen-space behaviour

The Matter Core usually remains in a controlled screen-size range. It may grow somewhat between milestones, but the camera/world scaling prevents it from filling the screen.

A typical scale-up event should:

1. slightly enlarge/pulse the Core;
2. ease the surrounding objects outward and smaller;
3. adjust background/parallax scale;
4. reveal larger object families;
5. stabilize over roughly 0.5–2 seconds depending on event importance.

Continuous camera jitter must be avoided. Prefer smooth thresholded interpolation instead of reacting to every tiny Mass change.

### 3.4 Why visual and economic scale are separate

Economic values can reach extreme orders of magnitude, while rendering should continue using ordinary browser-friendly coordinates.

Example:

```text
Economic state:
requiredMass = 3.8e142

Renderer state:
x = 620
y = 215
visualScale = 1.4
```

Never represent astronomical distances directly in world coordinates.

---

## 4. The Matter Core

### 4.1 Identity

The player entity is provisionally named **Matter Core**.

It is deliberately fictional and can evolve visually beyond realistic matter. This lets the same entity make sense from microscopic scale to reality-scale progression.

### 4.2 Evolution language

The Core should retain a recognizable central silhouette but gradually change character.

Possible visual evolution:

1. unstable mote;
2. soft particle cluster;
3. biological-looking nucleus;
4. dense crystalline/plasma core;
5. gravitational anomaly;
6. star-like energy body;
7. singularity-like cosmic object;
8. abstract reality distortion.

These stages do not need to map one-to-one with every scale band.

### 4.3 Core animation

Even while idle, the Core should feel alive:

- slow breathing/pulsation;
- subtle internal swirl;
- orbiting dust/particles;
- distortion or glow that changes with stage;
- reaction pulse when Matter is gained;
- stronger reaction on milestone unlocks.

Avoid permanent high-intensity neon effects. Effects should communicate power while keeping the UI and scene readable.

---

## 5. Core gameplay loop

The intended loop is:

1. Matter objects appear or drift into the visible playfield.
2. Eligible objects are pulled toward the Matter Core automatically or through active Pulse input.
3. Absorption grants **Mass** and **Matter**.
4. Mass increases physical progression and unlocks larger object families.
5. Matter is spent on temporary run upgrades.
6. Upgrades improve production and visibly alter absorption behaviour.
7. Milestones reveal new visual scale and stronger systems.
8. Exponential costs eventually create a soft progression wall.
9. The player triggers **Matter Collapse**.
10. The run resets and grants permanent **Genesis Energy**.
11. Genesis Energy buys permanent Fundamental Laws.
12. The next run reaches previous milestones faster and pushes farther.

---

## 6. Input and active play

### 6.1 No normal character movement

The Core is not controlled with WASD and does not navigate a large map.

The scene moves around the Core instead.

This supports:

- simple idle play;
- touch devices;
- low cognitive load;
- visual focus;
- easier responsive UI;
- better automation;
- easier performance management.

### 6.2 Gravity Pulse

The primary active input is **Gravity Pulse**.

Clicking/tapping the Core or activating the Pulse control sends out a short radial effect.

Possible effects by progression stage:

- pulls nearby edible objects inward;
- briefly increases attraction strength;
- accelerates objects already being pulled;
- instantly absorbs trivial low-value matter;
- later triggers chain absorption;
- later temporarily enlarges effective influence radius.

Pulse should use a cooldown, charge system or diminishing repeated input so excessive click speed does not dominate progress.

### 6.3 Active versus idle balance

Initial target philosophy:

- idle play provides steady baseline progress;
- attentive active play provides a noticeable but bounded acceleration;
- good upgrade choices matter more than click speed;
- active advantage can decrease as automation deepens, then reappear through strategic abilities rather than repetitive input.

Exact active multipliers require simulation/playtesting.

---

## 7. Economy and currencies

Keep currencies intentionally limited.

### 7.1 Mass — physical progression

**Mass** is the main non-spendable run progression quantity.

Mass:

- increases when objects are absorbed;
- determines effective scale;
- determines which objects can be consumed;
- determines milestone/scale progression;
- resets on Matter Collapse;
- is never directly spent.

This avoids the confusing behaviour where purchasing an upgrade makes the player physically smaller.

### 7.2 Matter — spendable run currency

**Matter** is the main temporary currency.

Matter:

- is gained from absorbed objects;
- may receive production multipliers;
- is spent on run upgrades;
- resets on Matter Collapse;
- should remain the main spendable currency for a long portion of the game.

Object categories may use flavour language such as “cellular matter” or “stellar matter”, but these should not automatically become separate currencies.

### 7.3 Genesis Energy — permanent Collapse currency

**Genesis Energy** is gained when the player performs a Matter Collapse.

Genesis Energy:

- survives resets;
- purchases permanent upgrades;
- rewards reaching farther Mass thresholds;
- may receive milestone bonuses;
- should be scarce enough to create meaningful choices.

If later testing finds the name too generic, it may change while preserving the same mechanic.

### 7.4 Optional boost resource

A fourth resource should only be introduced if it creates a distinct decision.

If a boost token exists, it can be earned through gameplay as well as optional rewarded ads.

Do not introduce multiple premium-looking resources simply to increase monetisation surfaces.

---

## 8. Absorption model

### 8.1 Object eligibility

Every object has an economic threshold.

```text
playerMass >= object.requiredMass
→ object is absorbable

playerMass < object.requiredMass
→ object is aspirational/non-absorbable
```

A small tolerance or smooth transition may be used if strict thresholds feel visually frustrating.

### 8.2 Object rewards

Each object definition should include at least:

```text
id
name
family
scaleBand
requiredMass
massReward
matterReward
spawnWeight
visualScale
assetKey
absorptionProfile
rarity
```

### 8.3 Absorption animation

Do not depend on general-purpose physics for ordinary absorption.

Preferred animation sequence:

1. object becomes targeted;
2. attraction begins;
3. object accelerates toward Core;
4. optional curved/orbital path;
5. object stretches or compresses subtly;
6. scale reduces near the Core;
7. impact/pulse/particle effect;
8. reward is confirmed;
9. object returns to pool or is replaced.

This gives predictable, polished motion with lower runtime cost.

### 8.4 Representative rendering

Economic production and visible object count are separate.

At very high production rates, the simulation may produce thousands or millions of equivalent absorption events per second while the renderer displays only enough representative events to make that production feel convincing.

Do not attempt to render every economic event.

---

## 9. Scale bands

The fantasy appears continuous, but content is internally divided into discrete scale bands.

### 9.1 Initial scale roadmap

| Band | Working name | Example content |
|---|---|---|
| 1 | Primordial | motes, dust, fragments, strange particles |
| 2 | Cellular | microbes, cells, fibres, droplets |
| 3 | Tiny | grains, crumbs, seeds, insects |
| 4 | Familiar | stationery, food, tools, toys, furniture |
| 5 | Human | people, bikes, bins, cars, trees |
| 6 | Massive | houses, towers, blocks, bridges, mountains |
| 7 | Planetary | asteroids, moons, planets, rings |
| 8 | Stellar | gas giants, stars, solar systems, nebulae |
| 9 | Galactic | clusters, galaxies, superstructures |
| 10 | Cosmic | galaxy groups, large-scale structures |
| 11 | Reality | universes, dimensional structures, timelines |
| 12+ | Beyond | invented reality cores, voids, multiversal abstractions |

These are gameplay scales, not scientific claims.

### 9.2 Scale transition behaviour

Near the top of a band:

- next-band objects can begin appearing faintly in the distance;
- current large objects become increasingly ordinary;
- background changes foreshadow the next environment.

At the threshold:

1. pause major spawning for a short beat;
2. pulse the Core;
3. smoothly zoom the visual world out;
4. shrink/fade obsolete objects;
5. reveal/load next-band content;
6. update ambience/audio;
7. resume absorption.

A scale transition is a major reward and should not be skipped casually.

### 9.3 Offline scale discoveries

Offline progress may numerically reach a new scale, but the visual reveal should wait until the player returns.

Return example:

```text
WHILE YOU WERE AWAY
+4.21T Matter
+6.30B Mass

NEW SCALE REACHED
[ EXPAND ]
```

The player then triggers the transition and sees the reveal.

---

## 10. Spawning and scene composition

### 10.1 Visible object mix

The scene should usually contain:

- many objects comfortably below the threshold;
- several objects near the threshold;
- a few aspirational objects above the threshold;
- background hints of the next scale.

The exact proportions can be dynamic.

### 10.2 Spawn illusion

Objects can enter through:

- slow drifting paths;
- parallax movement;
- orbital arcs;
- background-to-foreground scaling;
- material streams;
- cluster spawning;
- special milestone events.

The scene should feel alive without requiring a navigable world.

### 10.3 Object pooling

Repeated objects should be pooled and reused. Avoid continuous allocation/destruction during high production.

### 10.4 Obsolete objects

When objects become economically irrelevant:

- reduce their visual spawn frequency;
- aggregate them into streams/particles;
- preserve occasional appearance for scale contrast;
- remove them from expensive interaction checks.

---

## 11. Run upgrades

Run upgrades reset on Matter Collapse unless a permanent effect says otherwise.

### 11.1 Core upgrade families

Initial families:

1. **Density** — increases Matter/Mass reward from absorption.
2. **Gravity** — increases attraction/absorption speed.
3. **Influence** — increases effective attraction radius.
4. **Assimilation** — increases passive targeting/absorption throughput.
5. **Compression** — strengthens Gravity Pulse.
6. **Pulse Recovery** — reduces Pulse downtime or increases charges.
7. **Autonomy** — improves unattended/idle collection.

Not every category must be available immediately.

### 11.2 Upgrade cost model

Typical first model:

```text
cost(level) = baseCost × growthRate^level
```

Later upgrades may use stepped or super-exponential costs when needed to create prestige walls.

### 11.3 Upgrade visual feedback

Important upgrade categories should alter the visible scene.

Examples:

- Gravity: objects visibly accelerate faster;
- Influence: attraction field grows;
- Assimilation: more simultaneous objects are captured;
- Compression: Pulse becomes visually stronger;
- Density milestones: Core material/effects evolve.

### 11.4 Milestone levels

Infinite or high-level upgrades should contain milestone breakpoints.

Examples:

```text
Gravity 10
→ Orbital Capture
Nearby matter can enter stable orbit before absorption.

Assimilation 25
→ Chain Absorption
Absorbing one target pulls nearby eligible matter inward.

Density 50
→ Critical State
Matter gain ×10 and the Core gains a new visual form.
```

Milestones create anticipation beyond percentage increases.

### 11.5 Bulk purchasing

Unlock progressively:

- Buy 1;
- Buy 10;
- Buy 25;
- Buy Max;
- later, configurable auto-buy.

Auto-buy should not appear before the player understands the upgrades it automates.

---

## 12. Milestones and unlocks

Milestones should be meaningful and relatively sparse.

Possible milestone categories:

- Mass threshold;
- first absorption of an object family;
- first scale transition;
- first Matter Collapse;
- upgrade level breakpoint;
- lifetime Collapse count;
- highest scale reached;
- Genesis Energy lifetime total.

Milestone rewards can unlock:

- new upgrade categories;
- stronger Pulse behaviour;
- automation;
- Core forms;
- offline improvements;
- Fundamental Law tiers;
- new scale bands.

Avoid turning the game into a checklist of dozens of trivial notifications.

---

## 13. Matter Collapse — prestige layer

### 13.1 Theme

The first prestige system is officially themed as **Matter Collapse**.

The Matter Core becomes too massive/unstable to continue normal growth, compresses into a singular state, and creates a new universe-like run through an explosive restart.

### 13.2 Player-facing flow

A Collapse sequence should roughly be:

1. player opens Collapse panel;
2. panel shows current permanent reward and next reward breakpoint;
3. player confirms;
4. nearby visible matter accelerates into the Core;
5. Core shakes/compresses;
6. playfield darkens;
7. Core collapses to a tiny singular point;
8. short dramatic pause;
9. explosive shockwave / Big-Bang-like event;
10. new run initializes;
11. permanent bonuses become immediately noticeable.

This should become one of the game’s signature visual sequences.

### 13.3 What resets

Matter Collapse normally resets:

- current Mass;
- current Matter;
- temporary run upgrades;
- current scale-band progress;
- temporary run boosts;
- most per-run automation levels.

### 13.4 What persists

Matter Collapse preserves:

- Genesis Energy;
- Fundamental Law purchases;
- discovered-object catalogue;
- achievements;
- lifetime statistics;
- settings;
- permanent unlocks;
- platform/ad state that should legally/technically persist.

### 13.5 Collapse reward shape

Initial conceptual formula:

```text
GenesisEnergy = floor(
  (peakMass / collapseThreshold)^prestigeExponent
  × milestoneModifier
)
```

The exact formula is **not locked** until balance simulation exists.

### 13.6 Soft walls

Do not block the next stage with a literal message saying Collapse is mandatory unless a narrative unlock truly requires it.

Instead, use economic walls:

- the next meaningful upgrade becomes extremely expensive;
- production growth slows visibly;
- Collapse reward becomes attractive;
- permanent multipliers make the next attempt much faster.

The player should conclude “I should Collapse now” rather than “the game refuses to let me continue.”

### 13.7 Immediate proof of value

A new run must demonstrate permanent power quickly.

Targets to validate later:

- first post-Collapse minute reaches several previous milestones rapidly;
- early upgrades can often be bought in batches;
- attraction/absorption visibly feels stronger;
- the player reaches the previous wall in a fraction of the time.

---

## 14. Fundamental Laws — permanent upgrade system

Genesis Energy is spent on permanent effects themed as changes to the laws of the new universe.

Working category name: **Fundamental Laws**.

Candidate permanent upgrades:

- **Conservation Distortion** — universal Matter multiplier;
- **Primordial Density** — higher starting Mass;
- **Strong Gravity** — stronger attraction baseline;
- **Expanded Influence** — larger starting field;
- **Rapid Formation** — early upgrade cost reduction / free levels;
- **Persistent Motion** — stronger idle production;
- **Temporal Reservoir** — longer offline cap;
- **Residual Memory** — retain selected run upgrades or milestones;
- **Genesis Echo** — reward multiplier for later Collapses;
- **Scale Familiarity** — reduce friction in completed scale bands.

Exact names can change as the art/lore identity matures.

### 14.1 Permanent choice quality

The tree should avoid a single obvious mandatory path.

A player might prioritize:

- raw production;
- faster starting progression;
- idle strength;
- active Pulse strength;
- Collapse reward scaling;
- convenience/automation.

The optimal path can shift by progression stage.

---

## 15. First-Collapse pacing

The exact timing remains a balance target rather than a fixed promise.

Initial design intent:

- first meaningful choices appear within the first few minutes;
- automation begins before the first Collapse;
- first major scale transition occurs early enough to prove the central visual fantasy;
- first Collapse should happen within a normal first-session window rather than requiring hours of passive waiting.

Proposed simulation target range for first Collapse: **15–35 minutes** for a new active player.

This range must be validated with a headless simulator and browser playtests before being locked.

Subsequent early Collapses should become faster until deeper scale walls become the new focus.

---

## 16. Idle and offline progression

### 16.1 Live idle production

The game continues to absorb matter automatically while open.

The amount of visible activity is decoupled from economic throughput.

### 16.2 Offline progress

Do not simulate per-object movement while offline.

Store stable production state and calculate an aggregate reward.

Initial placeholder targets:

- starting offline efficiency: 20–30%;
- starting cap: ~4 hours;
- permanent upgrades can increase efficiency/cap;
- later cap may reach 12–24 hours.

These values require tuning.

### 16.3 Offline safety

Offline calculations must:

- clamp negative time;
- cap implausible elapsed durations;
- avoid iterating one second at a time;
- survive browser clock changes;
- remain testable deterministically;
- never corrupt saves when timestamps are invalid.

### 16.4 Return summary

Show a compact return panel with:

- time away;
- Mass gained;
- Matter gained;
- milestones reached;
- pending scale transition if any;
- optional rewarded-ad enhanced claim where platform policy permits.

The normal claim must always remain available.

---

## 17. Large-number system

The game is designed to reach absurd values beyond ordinary floating-point readability.

### 17.1 Library direction

Use **break_eternity.js** or another validated large-number library behind a project-owned numeric abstraction.

The rest of the game must not depend directly on third-party numeric APIs.

Working wrapper concept:

```text
GameNumber
```

Required operations include:

- construction/parsing;
- compare;
- add/subtract;
- multiply/divide;
- powers/logarithms;
- min/max/clamp where supported;
- deterministic serialization;
- display formatting helpers outside the core numeric state.

### 17.2 Number formatting

Early game:

```text
999
1.20K
12.5M
3.40B
```

Later:

```text
1.23e45
7.81e620
```

Extreme notation may evolve later, but display formatting must remain separate from economic state.

### 17.3 Test requirements

Tests must cover:

- boundary comparisons;
- serialization round-trips;
- multiplier chains;
- exponent operations;
- affordability checks;
- invalid/NaN-like input handling;
- save migration of numeric values.

---

## 18. UI/UX direction

### 18.1 Visual style

Use:

- solid opaque surfaces;
- simple rounded corners;
- restrained shadows;
- clear readable type;
- semantic accent colours;
- uncluttered spacing;
- original iconography.

Avoid:

- yellow/orange global filtering;
- excessive neon;
- glassmorphism as the primary UI style;
- heavy transparency;
- cluttered permanent sidebars;
- direct visual imitation of reference games.

### 18.2 Main HUD

Keep permanently visible information minimal:

- Mass;
- Matter;
- current scale;
- Pulse readiness;
- upgrade shortcut;
- Collapse shortcut when unlocked;
- small current objective/next milestone.

### 18.3 Panels

Large systems should open as responsive overlays/drawers/panels rather than permanently shrinking the playfield.

Primary panels:

- Upgrades;
- Matter Collapse;
- Fundamental Laws;
- Object Catalogue;
- Achievements;
- Settings;
- Statistics.

### 18.4 UI technology

Use normal HTML/CSS for most interface elements, positioned around/over a Phaser canvas.

Benefits:

- responsive layout;
- accessibility;
- text rendering;
- easier forms/settings;
- easier automated UI testing;
- separation between gameplay rendering and interface.

### 18.5 Responsive target

Design desktop-first but support touch and smaller landscape browser sizes.

A key test size is around **907 × 510**, along with common laptop and mobile-landscape sizes.

Portrait support is not a launch requirement unless later testing justifies it; menus should still fail gracefully rather than break.

---

## 19. Animation and feel

Because the mechanical input is intentionally simple, polish is a major part of the product value.

### 19.1 Absorb

Small event:

- curved pull;
- short squash/stretch;
- inward acceleration;
- tiny impact flash;
- subtle Core response.

### 19.2 New edible category

Medium event:

- short highlight on newly eligible objects;
- small text toast;
- sound cue;
- no blocking modal.

### 19.3 Mass milestone

Medium event:

- Core expansion pulse;
- field ripple;
- slight camera/world easing;
- optional new particle layer.

### 19.4 Scale transition

Large event:

- eased zoom-out illusion;
- world replacement;
- stronger sound transition;
- new ambience/background;
- meaningful reveal of new aspirational targets.

### 19.5 Matter Collapse

Major event:

- staged compression;
- gravitational intake;
- darkening;
- singularity pause;
- explosive restart;
- new-run visual payoff.

### 19.6 Reduced motion

A reduced-motion option should shorten/replace:

- large zooms;
- strong screen shakes;
- heavy parallax;
- long Collapse animation;
- flashing particles.

Gameplay timing must remain correct regardless of motion setting.

---

## 20. Audio direction

Audio should scale with the fantasy.

Early:

- soft ticks;
- granular particles;
- light pulses.

Mid:

- stronger whooshes;
- heavier absorption impacts;
- low-end layer on milestones.

Late:

- deep gravitational tones;
- cosmic ambience;
- large-scale transition cues.

Do not play a sound for every simulated economic event. Aggregate/throttle repeated absorption audio.

---

## 21. Technical framework

Approved high-level stack:

- **TypeScript** — application/game language;
- **Vite** — development/build tooling;
- **Phaser 4** — 2D visual renderer/game-loop layer;
- **HTML/CSS DOM UI** — interface panels and HUD where practical;
- **Vitest** — deterministic unit/integration tests;
- **Playwright** — browser/E2E tests;
- **break_eternity.js** behind a project-owned wrapper — extreme number support.

Dependency versions should be pinned through the lockfile and updated intentionally rather than automatically drifting.

### 21.1 Phaser responsibilities

Phaser owns:

- Matter Core rendering;
- object rendering;
- tweens;
- particles;
- parallax;
- scale transitions;
- visual effects;
- pointer/touch game input;
- scene lifecycle.

Phaser does **not** own authoritative economic formulas.

### 21.2 DOM UI responsibilities

HTML/CSS owns most:

- currency labels;
- upgrade menus;
- Collapse panel;
- Fundamental Law tree;
- settings;
- tooltips;
- accessibility-friendly controls;
- modal/confirmation UI.

### 21.3 Deterministic simulation responsibilities

The core TypeScript simulation owns:

- Mass;
- Matter;
- production rates;
- affordability;
- upgrade effects;
- milestone rules;
- Matter Collapse reward;
- permanent bonuses;
- offline progress;
- save transforms.

The simulation must be runnable with **no renderer**.

---

## 22. Proposed code architecture

```text
src/
  app/
    bootstrap/
    lifecycle/

  core/
    numbers/
    economy/
    upgrades/
    progression/
    collapse/
    milestones/
    offline/
    save/
    simulation/

  game/
    scenes/
    core-visual/
    objects/
    spawning/
    absorption/
    camera/
    effects/
    audio/
    input/

  ui/
    hud/
    panels/
    components/
    formatters/

  platform/
    platform-api.ts
    local-platform.ts
    crazygames-platform.ts

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
    unit/
    integration/
    e2e/

scripts/
  balance/
  validate-data/
```

Exact folder names can evolve, but dependency direction should remain controlled.

### 22.1 Dependency rule

Preferred direction:

```text
core simulation
    ↑
application services
    ↑
renderer / UI / platform adapters
```

The core layer must not import Phaser, DOM globals, CrazyGames APIs or visual assets.

---

## 23. State flow

Conceptual runtime flow:

```text
Input / timer
    ↓
Application command
    ↓
Core simulation updates authoritative state
    ↓
State snapshot/events
   ↙            ↘
Phaser view      DOM UI
```

Visual effects respond to state/events. They do not decide rewards.

Example:

```text
Core says:
Absorption completed → +250 Matter, +10 Mass

Renderer says:
Play spiral animation and particle burst
```

If the animation is skipped, slowed or reduced for accessibility, the economy remains correct.

---

## 24. Data-driven content

Do not hard-code hundreds of objects into scene classes.

Scale bands, objects, upgrades and milestones should be data-driven and validated at build/test time.

Example object data:

```ts
{
  id: 'tiny_seed_01',
  name: 'Seed',
  family: 'organic-small',
  scaleBand: 'tiny',
  requiredMass: '1.5e4',
  massReward: '100',
  matterReward: '220',
  spawnWeight: 1.2,
  assetKey: 'seed-01',
  absorptionProfile: 'light'
}
```

Economic numbers may be stored as strings to preserve exact parsing into `GameNumber`.

---

## 25. Save architecture

Save data is explicit and versioned from the first playable build.

Example shape:

```text
saveVersion
createdAt
lastSavedAt
currentRun
permanentProgress
unlocks
catalogue
achievements
settings
statistics
platformState
```

### 25.1 Save rules

- never serialize renderer objects;
- validate loaded data;
- provide migrations between versions;
- preserve a local fallback where platform APIs permit;
- throttle writes;
- save after important transactions;
- save before/after Matter Collapse carefully;
- test migration paths.

### 25.2 Save repository abstraction

Use one interface for persistence with implementations such as:

- browser local storage;
- CrazyGames data/cloud layer;
- test in-memory repository.

Game logic should not know which storage provider is active.

---

## 26. CrazyGames / platform integration

All portal-specific behaviour must sit behind a project-owned platform adapter.

Possible interface responsibilities:

```text
initialize
signalGameplayStart
signalGameplayStop
requestRewardedAd
requestMidgameAd
loadSave
saveData
readUserWhenAvailable
submitOptionalEvent
```

### 26.1 Rewarded ads

Candidate rewards:

- temporary x2 Matter production;
- short automation boost;
- enhanced offline claim;
- limited bonus Genesis-related reward only if carefully balanced;
- gameplay-earned boost tokens.

Rules:

- grant only after confirmed completion;
- cancel/unavailable returns normally;
- no core progression lock;
- meaningful reward types need non-ad alternatives.

### 26.2 Midgame ads

If enabled, request only at natural breaks such as:

- after a scale transition;
- after a Collapse sequence;
- after returning to a menu state.

Never interrupt an active absorption moment unexpectedly.

### 26.3 Asset loading

Load the first playable scale quickly. Later scale-band assets should be lazy-loaded or bundled separately where practical.

Do not load galaxy/reality content on the first screen.

---

## 27. Performance strategy

### 27.1 General target

The game should run smoothly on modest browser hardware, not only gaming desktops.

### 27.2 Rendering budget philosophy

Prefer convincing illusion over brute-force simulation.

Examples:

- render dozens of representative objects, not every economic event;
- pool objects;
- batch trivial particles;
- limit expensive filters;
- avoid full-screen shader effects as a permanent baseline;
- throttle offscreen/inactive visual updates;
- use deterministic aggregate production for idle systems.

### 27.3 No unnecessary physics engine dependence

Ordinary attraction/absorption uses custom curves/tweens rather than rigid-body physics.

Collision/physics should only be introduced for a mechanic that clearly benefits from it.

### 27.4 Performance tests

Track at minimum:

- FPS/frame time during busy scenes;
- object count;
- pooled entity count;
- memory growth over long idle sessions;
- scale-transition spikes;
- load time / initial payload;
- mobile-landscape behaviour.

---

## 28. Testing strategy

### 28.1 Unit tests

Test deterministic core rules:

- number wrapper;
- upgrade cost formulas;
- reward calculations;
- affordability;
- milestones;
- scale-band unlocks;
- Collapse rewards;
- permanent effects;
- offline calculation;
- save serialization/migration.

### 28.2 Integration tests

Test:

- simulation plus data tables;
- purchase flows;
- Collapse transaction safety;
- save/load continuity;
- platform adapter fallbacks;
- offline return flows.

### 28.3 E2E tests

Playwright should cover critical browser flows:

- launch and load;
- first purchase;
- Pulse interaction;
- opening panels;
- simulated scale transition;
- save/reload;
- Matter Collapse confirmation;
- no-ad fallback;
- responsive layout at key sizes.

### 28.4 Regression rule

When practical, a reproducible gameplay bug receives a failing automated test before the fix.

---

## 29. Headless balance simulator

A dedicated balance tool is required before economy values are treated as final.

The simulator should reuse production formulas from the actual core modules.

It should support scenarios such as:

```text
new player
→ buy recommended cheapest-value upgrades
→ run for 20 minutes
→ trigger first Collapse
→ spend Genesis Energy
→ run again
→ compare time to previous wall
```

### 29.1 Metrics

Track:

- time to first upgrade;
- time between meaningful upgrades;
- time to each scale band;
- time to first Collapse;
- Collapse reward;
- time to recover previous peak;
- percentage of run spent waiting without decisions;
- active versus idle production difference;
- offline progress value;
- upgrade dominance.

### 29.2 Balance goals

Avoid:

- long early dead zones;
- one mandatory upgrade order forever;
- Collapse rewards that barely matter;
- Collapse rewards so strong that runs become meaningless;
- idle play making active play irrelevant immediately;
- active clicking being orders of magnitude stronger than automation.

---

## 30. Content pacing philosophy

### Early game

Priorities:

- immediate visible absorption;
- explain Mass versus Matter naturally;
- first upgrade within a short time;
- first “new object now edible” moment quickly;
- first automatic attraction quickly;
- first major zoom/scale reveal in the first session.

### Mid game

Priorities:

- increasingly meaningful upgrade milestones;
- visible automation;
- more dramatic Core evolution;
- Matter Collapse planning;
- increasingly large scale jumps.

### Late game

Priorities:

- extreme numbers;
- cosmic/abstract visuals;
- strategic permanent-upgrade specialization;
- automation and bulk management;
- deeper Collapse optimization;
- new mechanics rather than only larger multipliers.

---

## 31. Anti-frustration rules

- Never require rapid clicking.
- Never hide why progress has slowed.
- Always show the next meaningful goal.
- Avoid upgrade buttons that look affordable but fail due to rounding.
- Do not make the player rewatch long animations every few minutes; allow shortening/skipping after first viewing where sensible.
- Do not let offline progress silently skip major spectacle.
- Do not create a prestige reset that takes too long to recover from.
- Do not clutter the screen with dozens of floating numbers; aggregate them.
- Do not introduce currencies without a distinct purpose.

---

## 32. Accessibility

Minimum launch goals:

- UI understandable without colour alone;
- keyboard-accessible menus where practical;
- touch-friendly controls;
- reduced motion;
- scalable/readable text;
- master/music/SFX controls;
- sufficient contrast;
- no critical information conveyed only through particles/animation;
- pause or safe state when browser loses focus where appropriate.

---

## 33. Analytics / balancing telemetry philosophy

If platform and privacy requirements permit lightweight analytics, useful anonymous events may include:

- scale reached;
- Collapse performed;
- time to first Collapse;
- upgrade purchases;
- return-session duration;
- rewarded-ad opt-in/completion;
- point of session exit.

Analytics should be used to identify balance/friction, not to create manipulative dark patterns.

The game must remain functional without analytics.

---

## 34. MVP scope

The MVP should prove the complete loop before huge content production.

Minimum vertical slice:

- central Matter Core;
- 2D layered playfield;
- automatic attraction/absorption;
- Gravity Pulse;
- Mass and Matter;
- several run upgrades;
- upgrade milestones;
- at least 2–3 distinct scale bands;
- smooth scale transition;
- Matter Collapse;
- Genesis Energy;
- small Fundamental Law set;
- save/load;
- offline progress;
- basic responsive UI;
- local platform adapter;
- CrazyGames adapter stub/integration boundary;
- deterministic tests;
- balance simulator.

Do **not** build all cosmic bands before this loop is fun.

---

## 35. Production phases

### Phase 0 — foundation

- initialize approved toolchain;
- create core numeric abstraction;
- create deterministic state model;
- create test harness;
- create data validation;
- create platform interfaces;
- establish CI.

### Phase 1 — greybox growth loop

- render placeholder Core;
- spawn placeholder objects;
- implement attraction/absorption;
- implement Mass/Matter;
- implement Pulse;
- show simple HUD;
- prove performance.

### Phase 2 — upgrades and scaling

- run upgrades;
- milestone upgrades;
- 2–3 scale bands;
- zoom/world replacement transition;
- headless balance simulator.

### Phase 3 — Matter Collapse

- Collapse reward;
- Genesis Energy;
- Fundamental Laws;
- Collapse animation;
- recovery pacing tests.

### Phase 4 — idle persistence

- save migrations;
- offline progress;
- return summary;
- account/platform persistence adapter.

### Phase 5 — polish/content

- original art direction;
- audio;
- polished animation;
- accessibility;
- broader object catalogue;
- performance tuning.

### Phase 6 — CrazyGames preparation

- SDK integration;
- rewarded ads;
- optional midgame ads at natural breaks;
- payload auditing;
- browser/device QA;
- portal-specific requirements validation;
- launch build.

---

## 36. Open design questions

These are intentionally unresolved and should be answered through prototypes/playtests rather than guesses:

1. Exact first-Collapse timing within the 15–35 minute target range.
2. Exact active Pulse advantage versus idle production.
3. How much the Core changes visual size before camera scaling compensates.
4. Exact number of scale bands in launch content.
5. Whether permanent upgrades use a branching tree, categories, or hybrid structure.
6. Whether an optional gameplay-earned boost token is actually needed.
7. How soon auto-buy should unlock.
8. Whether some late-game scale bands introduce entirely new interaction modes.
9. Final game title and final Matter Core visual identity.
10. Final numeric notation at values beyond ordinary scientific notation.

---

## 37. Decisions now considered locked unless deliberately revisited

The following have been approved for the next implementation stage:

- 2D browser game;
- central stationary Matter Core as the main interactive avatar;
- world/camera visually scales around the Core;
- discrete scale bands create the illusion of continuous growth;
- no standard WASD/world-navigation gameplay;
- Mass is non-spendable physical progression;
- Matter is temporary spendable run currency;
- Matter Collapse is the first prestige layer;
- Genesis Energy is the working permanent currency;
- permanent upgrades are themed as Fundamental Laws;
- soft economic walls encourage Collapse;
- Phaser 4 handles the animated 2D playfield;
- HTML/CSS handles most UI;
- deterministic economy remains independent from rendering;
- break_eternity.js is wrapped behind project-owned `GameNumber` logic;
- Vitest and Playwright form the primary automated test stack;
- visual rendering represents economic activity rather than simulating every event;
- normal absorption should use controlled motion/tweens rather than heavyweight rigid-body physics;
- major scale reveals should not be silently skipped by offline progress.

Any change to these decisions should be recorded in `docs/DECISIONS.md` before implementation diverges.
