# Teemo: Nexus Launch

A side-view League-themed launch game. Pull Teemo back in a Bandle sling and release him toward the Nexus, Rocket Slam into minion waves, collect gold, and upgrade between attempts.

## Play

The live build is hosted at [https://verevyta1.github.io/](https://verevyta1.github.io/). **Drag Teemo backward and release to throw him.** Click or tap the lane, or press the Rocket Slam button, while he is airborne to dive into minions. Minion impacts and bounces carry the run forward and award persistent gold.

Seven upgrade tracks improve throw strength, slams, bounce height, speed cap, ground grip, minion momentum, and gold bounty. Each track has five levels. The Nexus shield opens only after all seven tracks are fully upgraded, so the final goal takes progression across multiple runs.

The prototype uses original code-drawn cartoon shapes for Teemo, lane minions, the sling, and Nexus defenses. Browser saves migrate existing gold, best distance, and upgrade progress.

## Development

The project uses TypeScript, Vite, Phaser 4, Vitest, and Playwright. Node.js 20.19+ is required.

- npm install
- npm run dev
- npm run typecheck
- npm run lint
- npm run format:check
- npm test
- npm run build
- npm run test:e2e

## Branch model

- main is the release branch.
- staging is the integration branch.
- feature/* and fix/* branches start from staging and merge there first.
- Tested staging changes are promoted to main through a release pull request.
- GitHub Pages deploys from main only after CI passes.

The simulation is deterministic and renderer-independent. Phaser displays the sling, minion waves, Teemo, and Nexus defenses; DOM UI handles resources, upgrades, and controls. Local saves keep gold, best distance, and upgrade levels.
