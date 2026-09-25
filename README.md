# Project Scale

Browser-first idle/incremental growth game currently in **pre-production**.

The project combines an active consume-and-grow loop with long-term idle progression. The player starts microscopic, consumes objects that are small enough, grows into larger scale bands, unlocks automation and upgrades, then uses a rebirth/prestige system to begin stronger and reach farther on later runs.

## Current status

No game implementation should be added yet. The current phase is for defining the design, technical architecture, production workflow, balance model, monetisation rules, and test strategy before coding begins.

## Source of truth

- [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) — living game design and technical plan.
- [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) — branches, pull requests, testing, releases, bug fixes, and Codex workflow.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — architecture/design decisions and unresolved decisions.
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

## Planned technical baseline

The current proposal is:

- TypeScript
- Vite
- Phaser for rendering/gameplay
- Vitest for unit/integration tests
- Playwright for browser/E2E tests
- a large-number library behind a project-owned numeric wrapper
- CrazyGames HTML5 SDK behind an adapter layer

These are **proposals, not implementation approval**. Framework and architecture decisions are recorded in `docs/DECISIONS.md` before production code is created.

## Design principles

- Visible size growth is the main reward.
- Active play and idle progress reinforce one another.
- The player should regularly unlock previously impossible objects.
- Rebirth should make the next run visibly faster.
- Rewarded ads are optional accelerators, never mandatory progression gates.
- Core economy logic must be deterministic and testable independently of rendering.
- Save data must be versioned and migratable.
- Browser performance and download size are first-class requirements.
- The final game must have original art, naming, progression, level layouts, sounds, UI and copy.

## UI direction

Use a clean, light/simple interface influenced only by the usability of the supplied references, not their distinctive artwork or branding:

- solid opaque panels;
- simple rounded buttons/cards;
- restrained shadows and borders;
- readable typography;
- clear hierarchy;
- no yellow/orange overall filter;
- no excessive neon;
- no glass/translucent HUD as the primary style.

## Commercial target

The first intended distribution target is CrazyGames. Platform integrations must be isolated behind adapters so the game also runs locally and can later support another web portal without rewriting gameplay systems.

Rewarded ads should provide optional boosts such as temporary multipliers or convenience rewards. The non-ad progression loop must remain complete and enjoyable when ads are unavailable.

## Development rule

For deterministic systems, use test-driven development where practical:

1. define acceptance criteria;
2. add or update the test;
3. implement the smallest correct behaviour;
4. refactor while tests remain green;
5. run type-checking, linting, unit/integration tests and relevant browser tests;
6. update the design/decision docs if behaviour changed.

The project will be developed incrementally rather than generated as one monolithic Codex task.