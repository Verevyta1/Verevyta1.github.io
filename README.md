# Project Scale

Browser-first 2D idle/incremental growth game currently in **pre-production**.

The player controls a central **Matter Core** that automatically absorbs increasingly large forms of matter. As Mass rises, the surrounding world appears to shrink and new scale bands are revealed: microscopic matter can eventually give way to objects, cities, planets, stars, galaxies, universes and invented post-universal structures.

When a run slows against an economic wall, the player can trigger **Matter Collapse**. The Core compresses into a singular state and restarts through a Big-Bang-like explosion, awarding permanent **Genesis Energy** that is spent on **Fundamental Laws** for future runs.

## Current status

The staging preview now includes the Matter Core greybox and the first Matter upgrade loop. Matter objects drift toward the stationary Core; Density, Gravity, Influence, Assimilation, and Compression change deterministic simulation behaviour. Matter purchases are atomic, and upgrade levels save locally. Existing v1 Mass/Matter saves migrate automatically.

The object thresholds and rewards in this first playable build are provisional tuning values. It uses code-drawn placeholder geometry; there is no commissioned art or final balance yet.

## Playable greybox build

Successful GitHub Actions runs attach a downloadable artifact named project-scale-greybox. Download and unzip it, open a terminal in the extracted artifact folder, then serve it locally:

    py -m http.server 4173

Open http://localhost:4173 in your browser. This build is a pre-production preview and is not deployed to main.

## Source of truth

- [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) — authoritative living game design and progression plan.
- [`docs/TECHNICAL_ARCHITECTURE.md`](docs/TECHNICAL_ARCHITECTURE.md) — approved framework, module boundaries and implementation constraints.
- [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) — branches, pull requests, testing, releases, bug fixes and Codex workflow.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — accepted architecture/design decisions and unresolved decisions.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution standards.

## Branch model

- `main` — production/release branch. Only tested release candidates should reach this branch.
- `staging` — long-lived integration and pre-production branch. Feature and bug-fix branches merge here first.
- `feature/<short-name>` — normal feature work, created from `staging`.
- `fix/<short-name>` — normal bug fixes, created from `staging`.
- `hotfix/<short-name>` — urgent production fixes. Start from `main`, then merge the fix back into `staging`.
- `docs/<short-name>` / `chore/<short-name>` — documentation or maintenance work.

Normal flow:

```text
feature/* or fix/*
        ↓
     staging
        ↓
 release pull request
        ↓
       main
```

Direct feature work on `main` should be avoided.

## Approved technical baseline

- TypeScript
- Vite
- Phaser 4 for the animated 2D playfield
- HTML/CSS DOM UI for most HUD/panels
- Vitest for unit/integration tests
- Playwright for browser/E2E tests
- `break_eternity.js` behind a project-owned `GameNumber` abstraction
- CrazyGames SDK behind a project-owned platform adapter

The deterministic economy remains independent from Phaser, the DOM and portal APIs.

## Core design rules

- The Matter Core remains near the centre of the main playfield.
- The player does not normally navigate a large map with WASD.
- The world visually scales and zooms around the Core.
- Internal scale bands create the illusion of continuous growth.
- Mass is non-spendable physical progression.
- Matter is the temporary spendable run currency.
- Genesis Energy is the working Matter Collapse currency.
- Permanent upgrades are themed as Fundamental Laws.
- Active Gravity Pulse accelerates progress without rewarding frantic clicking.
- Economic throughput and visible object count are intentionally separate.
- Major scale reveals should remain visual events even when earned offline.
- Matter Collapse should be encouraged by soft economic walls rather than arbitrary forced-reset messages.

## UI direction

Use a clean, light/simple interface influenced only by the usability of the supplied references, not their distinctive artwork or branding:

- solid opaque panels;
- simple rounded buttons/cards;
- restrained shadows and borders;
- readable typography;
- clear hierarchy;
- large central playfield;
- minimal permanent side UI;
- no yellow/orange overall filter;
- no excessive neon;
- no glass/translucent HUD as the primary style.

## Commercial target

The first intended distribution target is CrazyGames. Platform integrations must be isolated behind adapters so the game also runs locally and can later support another web portal without rewriting gameplay systems.

Rewarded ads should provide optional acceleration or convenience. The non-ad progression loop must remain complete and enjoyable when ads are unavailable.

## Development rule

For deterministic systems, use test-driven development where practical:

1. define acceptance criteria;
2. add or update the test;
3. implement the smallest correct behaviour;
4. refactor while tests remain green;
5. run type-checking, linting, unit/integration tests and relevant browser tests;
6. update design/decision docs if behaviour changed.

The game should be developed as small reviewable vertical slices. Codex tasks should receive narrow acceptance criteria and explicit files/modules to change rather than a broad instruction to “build the game.”
