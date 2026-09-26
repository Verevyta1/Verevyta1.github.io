# Implementation Roadmap

## Current milestone — drag, throw, and progression gate

- Replace the launch button with mouse/touch drag and release on Teemo.
- Add the in-flight Rocket Slam action, minion impacts, bounce, and gold rewards.
- Make seven upgrade tracks data-driven, finite, and visibly effective.
- Keep runs short enough to require repeat attempts.
- Hold Teemo at the Nexus shield until every upgrade track is mastered.
- Persist gold and upgrades, migrate the previous save schema, and cover the loop with unit and browser tests.

## Next milestones

### B. Run results and missions

- Add a clear run summary with distance, gold gained, and optional mission rewards.
- Add deterministic missions such as smashing minions, using Rocket Slam, and reaching the Nexus shield.

### C. Special minions and defense layers

- Add readable special minion encounters: explosive forward boost, Blast Cone lift, and gold carrier.
- Add staged Nexus defenses that act as distance gates and become traversable through progression.

### D. Balance and polish

- Add a repeatable simulator for drag force, upgrades, minion spacing, prices, and run distance.
- Tune early runs so players earn enough gold to make visible progress without reaching the Nexus in one attempt.
- Refine Teemo and minion silhouettes, lane depth, impact effects, mobile layout, accessibility, and audio.

### E. Release integration

- Profile the browser build and keep frame work bounded.
- Add portal adapters after local play is stable.
- Keep optional ads non-blocking.
- Promote tested changes from staging to main.
