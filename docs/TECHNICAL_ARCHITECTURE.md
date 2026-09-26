# Technical Architecture

## Stack and boundaries

- TypeScript and Vite build the browser game.
- Phaser 4 draws and animates the horizontal launch lane.
- HTML/CSS provides the HUD, launch/boost buttons, status, and upgrades.
- Vitest tests pure simulation and save rules; Playwright covers browser gameplay.
- LocalPlatform isolates browser behavior; future portal APIs remain adapters.

The simulation in src/core/launch/launch-game.ts owns authoritative run state. It uses a fixed 50 ms step, caps frame catch-up, and computes minion collision rewards without Phaser or DOM imports. Rendering displays frames and cannot award gold.

## State and persistence

Persistent state contains gold, best distance, and upgrade levels. A run contains phase, distance, height, velocity, elapsed time, minion wave index, collision count, boost cooldown, and fixed-step remainder. Saves are versioned and validate numeric values; gold uses the project GameNumber wrapper.

The new save key is independent of the retired Matter Core prototype key. Invalid Teemo-run saves start fresh without changing other browser storage.

## Rendering and UI

The Phaser scene draws the lane, scenery, Teemo, minion silhouettes, impact feedback, and Nexus. It follows Teemo horizontally and keeps nearby minions in a bounded pool. DOM UI owns accessible resource and upgrade controls; callbacks connect those controls to the pure simulation.

## Verification and performance

CI runs typecheck, lint, formatting, unit tests, production build, Chromium install, and browser smoke tests. Avoid per-frame DOM work, keep visible entities bounded, and tune simulation separately from animation timing.
