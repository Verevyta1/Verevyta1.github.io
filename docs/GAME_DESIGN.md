# Teemo: Nexus Launch — Game Design

## Product direction

A colorful side-view launch-run game inspired by the reference video, Burrito Bison: Launcha Libre. Launch Teemo from the left side of a Summoner's Rift lane and try to reach the enemy Nexus at the far right.

This fan-made prototype uses original code-drawn cartoon shapes. The UI, scene composition, progression values, effects, and implementation are independently created for this project.

## Core run loop

1. Launch Teemo with a forward-and-upward burst.
2. Teemo follows a deterministic arc across the lane.
3. Ground bounces and smashing into League minions add lift and forward momentum.
4. Each minion impact grants gold; siege minions give a larger bounty.
5. During flight, the player can trigger Noxious Boost with its button, Space, or a tap/click on the playfield.
6. A run ends when Teemo loses momentum, or is won when he reaches the Nexus.
7. Spend gold between attempts, then launch again.

## Goal and progression

The Nexus is 5,000 metres from the launch point. Gold and best distance persist in the browser. Four repeatable upgrade lines improve future attempts:

- Bandlewood Launcher — initial launch speed and lift;
- Bounce Training — momentum from minion impacts and ground bounces;
- Scout's Spoils — gold earned from minions;
- Noxious Boost — active boost strength and cooldown.

Distances, rewards, and prices are provisional. Balance should be tuned with repeatable simulation and playtesting.

## Inputs and art direction

A launch button starts each run. During flight, mouse/tap or Space activates Noxious Boost. There is no map navigation. The HUD shows gold, best distance, minion count, Nexus distance, and upgrades.

Use friendly cartoon silhouettes: a small scout with a green cap, goggles, feather, and blowgun; red/blue melee, caster, and siege minions; a bright lane, rolling hills, and glowing Nexus crystal. Build the first slice from original Phaser vector shapes; add project art later where it improves readability or impact.

## Out of scope for the first slice

Full League combat, steering, online features, ad integration, the full champion roster, and final balance are not part of this prototype.
