# Teemo: Nexus Launch

A browser launch-run game prototype set on a colorful League of Legends lane. Launch Teemo toward the enemy Nexus, bounce through minion waves, collect gold, and buy upgrades between attempts.

## Play

The current playable build is hosted at [https://verevyta1.github.io/](https://verevyta1.github.io/). Click **Launch Teemo**, then tap/click the playfield or use **Noxious Boost** to send Teemo forward. Minions smashed on impact award persistent gold. Spend it between runs on launch power, bounce power, bounty, and mushroom thrust.

The first slice uses original code-drawn cartoon shapes for Teemo, lane minions, and the Nexus. It is an early playable prototype; balance, animation, audio, mobile polish, and the full upgrade journey remain in progress.

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

The simulation is deterministic and renderer-independent. Phaser displays the lane and cartoon characters; DOM UI handles resources, upgrades, and controls. Local saves keep gold, best distance, and upgrade levels.
