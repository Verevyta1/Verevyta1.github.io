# Project Scale

Browser-first 2D idle/incremental growth game, now with a playable greybox Matter Core loop.

The player guides a central Matter Core that automatically absorbs eligible matter. As Mass rises, the surrounding world will eventually scale around it. Matter Collapse will later restart a run and award Genesis Energy for permanent Fundamental Laws.

## Current build

The current prototype is the Milestone B greybox slice:

- objects drift around a stationary Core and eligible objects are absorbed automatically;
- Mass is physical progression and is never spent;
- Matter is temporary run currency;
- Gravity Pulse briefly accelerates eligible attraction and has a cooldown;
- Mass and Matter save locally in this browser;
- object requirements and rewards are provisional tuning values, not final balance;
- the playfield uses original code-drawn geometry and does not need art downloads.

A downloadable production build is attached to successful GitHub Actions runs. Open the latest CI run for this repository, then download the artifact named project-scale-greybox. Unzip it, open a terminal in the extracted artifact folder, and start Python's built-in static server:

    py -m http.server 4173

Then open http://localhost:4173 in a browser. This prototype is not deployed to main or published as a finished game.

## Source of truth

- docs/GAME_DESIGN.md — approved game design and progression.
- docs/TECHNICAL_ARCHITECTURE.md — framework, module boundaries, and constraints.
- docs/IMPLEMENTATION_ROADMAP.md — staged delivery plan.
- docs/DEVELOPMENT_WORKFLOW.md — branches, pull requests, testing, and releases.
- docs/DECISIONS.md — accepted decisions and unresolved questions.
- CONTRIBUTING.md — contribution standards.

## Branch model

- main — production/release branch. Only tested release candidates should reach this branch.
- staging — long-lived integration and pre-production branch.
- feature/<short-name> — feature work, created from staging.

Normal flow:

    feature/* → staging → release pull request → main

## Approved technical baseline

- TypeScript and Vite
- Phaser 4 for the animated 2D playfield
- HTML/CSS DOM UI
- Vitest and Playwright
- break_eternity.js behind the GameNumber boundary
- CrazyGames behind the platform adapter, later in the roadmap

Deterministic economy code remains independent from Phaser, the DOM, and portal APIs.

## Core design rules

- The Matter Core stays near the playfield centre.
- The player does not navigate a map with WASD.
- Mass cannot be spent; Matter is the temporary run currency.
- Genesis Energy is the working Matter Collapse currency.
- Permanent upgrades are themed as Fundamental Laws.
- Gravity Pulse supports active play without frantic clicking.
- Art, upgrades, scale transitions, balance simulation, Collapse, offline progression, and portal integration remain future roadmap work.
