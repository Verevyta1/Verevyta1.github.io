import type { LaunchUpgradeDefinition } from "../core/launch/launch-game";

export const LAUNCH_UPGRADES: readonly LaunchUpgradeDefinition[] = Object.freeze([
  Object.freeze({ id: "launchPower", name: "Bandlewood Launcher", description: "Start every run with more forward speed and lift.", baseCost: "20", costMultiplier: "1.55" }),
  Object.freeze({ id: "bouncePower", name: "Bounce Training", description: "Minion hits and ground bounces send Teemo farther.", baseCost: "25", costMultiplier: "1.6" }),
  Object.freeze({ id: "goldBounty", name: "Scout's Spoils", description: "Earn more gold every time a minion is smashed.", baseCost: "30", costMultiplier: "1.65" }),
  Object.freeze({ id: "mushroomBoost", name: "Noxious Boost", description: "Teemo's mushroom dash gains more thrust and recovers faster.", baseCost: "40", costMultiplier: "1.7" }),
]);
