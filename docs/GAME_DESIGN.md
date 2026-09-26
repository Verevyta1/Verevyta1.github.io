# Teemo: Nexus Launch — Game Design

## Product direction

A side-view launch-run game inspired by the launch, flight, slam, bounce, reward, and upgrade loop in Burrito Bison: Launcha Libre. The player drags Teemo backward in a Bandle sling, releases him down Summoner’s Rift, smashes minions for gold, and builds enough upgrades to break through to the enemy Nexus.

The playable prototype uses original code-drawn cartoon shapes and independently created game code, UI, progression, and effects.

## Core run loop

1. Drag Teemo backward from the sling, then release. Pull distance controls throw force; pull angle affects lift.
2. Teemo travels automatically down the lane under deterministic gravity and momentum loss.
3. Click or tap during flight to use a Rocket Slam charge and dive toward the minion wave.
4. Minion impacts and ground bounces add lift and forward momentum. Every smashed minion pays gold; siege minions pay a larger bounty.
5. The run ends when Teemo loses momentum or reaches the Nexus shield.
6. Spend gold between runs on seven upgrade tracks, each with five levels.
7. Master every track to open the Nexus shield. The Nexus is only reachable during a later run after all seven tracks are fully upgraded.

## Upgrades and progression

- **Bandle Sling Tension** — more launch force and lift;
- **Noxious Dive Charges** — more Rocket Slam uses per run;
- **Blast Cone Bounce** — higher minion and ground rebounds;
- **Swift Scout Speedometer** — raises Teemo’s top speed cap;
- **Soft Landing** — reduces speed lost when landing on the ground;
- **Minion Momentum** — preserves forward speed through minion impacts;
- **Lane Plunder** — increases gold from smashed minions.

Gold and best distance persist in the browser. Save version 1 progress is migrated when the upgrade names and levels change. The upgrade cap gives the Nexus requirement a visible, finite goal: seven of seven tracks at level five.

## Controls and presentation

Drag Teemo backward and down from the sling, then release to throw him forward and upward. In flight, click or tap the lane or press the Rocket Slam button to dive. The HUD shows gold, best distance, smashed minions, run distance, slam charges, upgrade mastery, and Nexus shield status. The camera follows Teemo through a colorful Summoner’s Rift lane.

## Next development slices

Missions, run-result reward cards, unlockable special minions, additional Nexus defenses, balance simulation, art and sound polish, and portal integrations can follow the complete drag-launch progression slice. They remain separate from the current seven-track gate so the core loop stays readable and testable.
