# Decision Log

## ADR-001 — Browser-first TypeScript game
Accepted 2026-09-25. Use TypeScript, Vite, Phaser 4, Vitest, and Playwright. Keep simulation rules separate from rendering/platform APIs. Deploy GitHub Pages from main only after CI passes.

## ADR-002 — staging release flow
Accepted 2026-09-25. Feature/fix branches merge into staging first. Promote tested releases to main by pull request. Do not develop directly on main.

## ADR-003 — Deterministic run simulation
Accepted 2026-09-25. Run state, upgrade prices, collision rewards, and save transformations are pure renderer-independent TypeScript. Phaser displays state but does not grant gold.

## ADR-004 — Gold is permanent progression
Accepted 2026-09-25. Minion impacts award gold. Gold is retained between runs and spent on upgrades through atomic affordability transactions. Save values use canonical GameNumber serialization.

## ADR-005 — Teemo launch-run pivot
Accepted 2026-09-26. The approved direction is a fan-made cartoon launch-run game: launch Teemo from the left, bounce and smash League minions for gold, improve future launches, and reach the enemy Nexus at the far right. The former Matter Core/Mass/Matter/Collapse concept is superseded.

## ADR-006 — Original code-drawn first art slice
Accepted 2026-09-26. Initial Teemo, lane minions, and Nexus are drawn from project-owned Phaser vector shapes. External image assets are not required for the first playable slice.


## ADR-007 — Drag launch and full-upgrade Nexus gate
Superseded by ADR-008. The first version required all seven upgrade tracks at maximum level before the Nexus could be reached.

## ADR-008 — Momentum-based Nexus progression
Accepted 2026-09-26. Teemo launches from a continuous elastic pull vector. Distance comes from throw force, flight momentum, minion impacts, ground bounces, and timed Rocket Slams. Every upgrade helps travel or earn gold, but there is no shield or upgrade prerequisite at the Nexus. Early runs end short of the goal; a well-upgraded run can win before all tracks are maxed.
