# Implementation Roadmap

## Current slice — Teemo: Nexus Launch

Prove the complete short loop: launch, bounce, smash minions for gold, buy upgrades between runs, and progress toward the Nexus. Keep the simulation deterministic and retain the Vite/Phaser/DOM architecture.

## Next milestones

### A. Launch loop
- Complete deterministic run state, fixed-step movement, minion rewards, run end, and Nexus victory.
- Add Teemo, red/blue melee/caster/siege minions, lane art, and Nexus.
- Save gold and best distance; verify the browser loop.

### B. Upgrade balance
- Tune first-run distance and minion timing.
- Add an ROI simulator for upgrade choices.
- Ensure every upgrade visibly changes play.
- Test keyboard, pointer, touch-sized layouts, and save recovery.

### C. More launch choices
- Add launch charge/angle only if playtesting improves agency.
- Add Teemo boost variants, wave patterns, missions, and satisfying Nexus impact.

### D. Art and sound
- Refine vector characters, impact/bounce feedback, lane depth, Nexus presentation, accessibility, and audio.
- Profile assets and performance.

### E. Release integration
- Add portal adapter integrations after local play is stable.
- Keep optional ads non-blocking.
- Promote tested changes from staging to main.
