# Technical Architecture

## Stack and boundaries

- TypeScript and Vite build the browser game.
- Phaser 4 draws the launch lane, sling, Teemo, minion waves, and Nexus defenses.
- HTML/CSS provides the HUD, Rocket Slam control, status, and upgrade shop.
- Vitest tests pure simulation and save rules; Playwright covers drag, flight, rewards, and shop persistence.
- LocalPlatform isolates browser behavior; future portal APIs remain adapters.

The simulation in src/core/launch/launch-game.ts owns authoritative run state. It uses a fixed 50 ms step, caps frame catch-up, and computes minion collision rewards without Phaser or DOM imports. The renderer sends validated drag-and-release and Rocket Slam actions to the simulation; it cannot award gold.

## State and persistence

Persistent state contains gold, best distance, and seven upgrade levels. Each upgrade has five levels. A run contains phase, distance, height, velocity, elapsed time, minion wave index, collision count, Rocket Slam charges, Nexus shield result, and fixed-step remainder. Saves are versioned and validate numeric values; gold uses the project GameNumber wrapper.

Save version 2 migrates version 1 Teemo progress: gold and best distance remain, while the former launch, bounce, bounty, and boost levels map onto their closest new tracks. The save key remains stable so returning players keep their progress.

## Rendering and UI

The Phaser scene draws the lane, elastic sling, Teemo, red/blue melee/caster/siege minions, impact feedback, a Nexus shield, and the Nexus beyond it. It follows Teemo horizontally and keeps nearby minions in a bounded pool. Dragging Teemo begins a run; clicking or tapping during flight activates Rocket Slam. DOM UI owns accessible resource, slam, mastery, and upgrade controls.

The shield stops runs at the gate until all seven upgrade tracks reach level five. Only then can a run cross the shield and reach the Nexus.

## Verification and performance

CI runs typecheck, lint, formatting, unit tests, production build, Chromium install, and browser smoke tests. Avoid per-frame DOM work, keep visible entities bounded, and tune simulation separately from animation timing.
