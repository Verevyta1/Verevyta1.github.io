# Burrito Bison Reference Game Audit

This audit informs the Teemo launch loop and upgrade mapping. It distinguishes mechanics directly seen in the supplied video or a playable session from names/effects gathered from player guides.

## Directly observed gameplay

- **Input:** drag the character and elastic cables backward, then release to launch. The Kongregate listing describes “Click and drag to launch, click to stomp.”
- **Flight:** side-scrolling launch with gravity, speed, a progress strip, gummy/minion-like groups, and coin rewards for impacts.
- **Active move:** click during flight to use Rocket Slam, which drives the character downward with rocket flames. A hit can bounce into another stretch of flight.
- **Run end:** distance, new-record status, coins earned, and mission/reward cards appear before returning to the shop.
- **Repeat progression:** spend run coins on upgrades, improve future launches, and progress through cake walls/doors over multiple attempts.
- **Special rides:** the special-gummy shop included Puncheus Pilot (upward punch ride), Teddy Flare (rocket height), Robbear (cash recovery), and Jelly Roger (explosive launch).

The supplied video shows a short run reaching 413 metres before the results screen. The Nexus-mastery condition in Teemo’s version is the user’s requested progression rule; it is not a mechanic copied from the reference.

## Upgrade mapping

These first seven upgrade descriptions and next-level prices were directly read in the shop during play. Prices are reference snapshots, not Teemo balance targets.

| Reference upgrade | Observed effect | Observed price | Teemo / League adaptation |
| --- | --- | ---: | --- |
| Elastic Cables | Increase launch power | 400 | Bandle Sling Tension: stronger throw on release |
| Rocket Slam | Add body-slam uses | 200 | Noxious Dive Charges: add midair slams |
| Bounciness | Bounce higher from contact | 1,350 | Blast Cone Bounce: stronger minion and ground rebounds |
| Speedometer | Raise the speed limit | 2,000 | Swift Scout Speedometer: raise Teemo’s top speed |
| Slippery Lotion | Lose less speed on ground impact | 1,350 | Soft Landing: reduce speed loss on landing |
| Flavour Master | Keep more speed when landing on gummies | 1,500 | Minion Momentum: preserve speed through minion hits |
| Pickpocket | Earn more coins from gummies | 900 | Lane Plunder: increase minion gold |

The first playable Teemo slice implements these seven functional tracks with five levels each. The Nexus shield requires all seven at level five.

## Other reported skills

Player-written guides report additional upgrades that were not unlocked or directly tested in the short playthrough: Bodybuilding, Cake Eater, Doors Destroyer, Luck, Aerodynamics, Cakesplosion, Gummy Booster, and Police Control. Their effects can guide future systems, but names, exact behavior, and the total catalog should be verified before adding them.

Other special entities in community guides include explosive, gift, treasure, balloon, tunnel, rolling, piñata, cash, and candy-shard encounters. League adaptations could use explosive minions, Blast Cone rides, gold carriers, and other special lane units. The current build only uses standard and siege minions.

## Sources

- [User-supplied gameplay video](https://www.youtube.com/watch?v=hFL1TC1-x4Q)
- [Kongregate listing and controls](https://www.kongregate.com/en/games/juicybeast/burrito-bison-launcha-libre)
- [Juicy Beast feature page](https://www.burritobison.com/)
- [Player guide for additional upgrade names](https://www.reddit.com/r/BurritoBison/comments/9x66ex/burrito_bison_launcha_libre_noob_guide/)
- [Speedrun guide](https://www.speedrun.com/de-DE/burrito_bison_launcha_libre/guides/5gdqj)
