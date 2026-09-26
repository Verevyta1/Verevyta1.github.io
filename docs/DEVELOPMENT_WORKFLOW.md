# Development Workflow

This document defines how changes move from an idea to production. It is intentionally conservative because the game will contain long-term save data and economy rules where regressions can permanently damage player progress.

## 1. Long-lived branches

### `main`
Production/release branch.

Rules:
- represents the version intended for public distribution;
- no ordinary feature development directly on `main`;
- normal changes arrive through a release PR from `staging`;
- emergency production fixes may use a `hotfix/*` branch based on `main`;
- every production release should be tagged.

### `staging`
Integration and pre-production branch.

Rules:
- feature/fix branches are normally created from `staging`;
- completed work merges back to `staging` through PRs;
- staging is where combined features are tested before release;
- a build from `staging` is not automatically production-ready.

Recommended GitHub branch protection once repository settings permit it:
- require pull requests for `main` and `staging`;
- require CI checks;
- prevent force pushes;
- prevent deletion;
- require branch to be up to date before merge where practical;
- prefer squash merge for small feature branches to keep history readable.

## 2. Short-lived branches

Naming conventions:

```text
feature/<short-description>
fix/<short-description>
hotfix/<short-description>
docs/<short-description>
chore/<short-description>
refactor/<short-description>
test/<short-description>
```

Examples:

```text
feature/drag-launch-progression
feature/microscopic-zone
fix/offline-time-clamp
hotfix/save-load-crash
docs/rocket-slam-input
```

Branch names use lower-case kebab-case and describe one coherent change.

## 3. Normal feature flow

1. Confirm the design requirement and acceptance criteria.
2. Create/update a GitHub issue when the work is non-trivial.
3. Create `feature/<name>` from the current `staging` branch.
4. Implement the smallest coherent vertical change.
5. Add/modify tests first for deterministic logic where practical.
6. Run local checks.
7. Open a PR into `staging`.
8. Review code, tests, performance impact and save compatibility.
9. Merge only when required checks pass.
10. Verify the integrated staging build.
11. Include in a later `staging -> main` release PR.

Do not bypass `staging` for convenience.

## 4. Bug-fix flow

1. Reproduce the issue on the affected version.
2. Record browser/device/build/save details.
3. Add a failing regression test where practical.
4. Create `fix/<name>` from `staging`.
5. Implement the smallest correction.
6. Run targeted and full relevant tests.
7. Open PR into `staging`.
8. Verify in the integrated staging build.
9. Ship through the normal release PR.

### Production emergency

For a severe production bug:

1. create `hotfix/<name>` from `main`;
2. reproduce and test the production issue;
3. make the minimum safe fix;
4. PR into `main`;
5. test the production artifact;
6. merge/release/tag;
7. merge or cherry-pick the same fix back into `staging` immediately so branches do not diverge.

A hotfix should not include unrelated refactors.

## 5. Pull request requirements

Every PR should state:

- problem/goal;
- scope;
- design sections affected;
- acceptance criteria;
- tests added/updated;
- manual verification performed;
- performance impact;
- save-data impact;
- screenshots/video for visible UI changes;
- explicit non-goals if scope could be ambiguous.

A PR is not ready because it compiles. It is ready when its documented behaviour is tested and reviewed.

## 6. Commit conventions

Use concise conventional prefixes where practical:

```text
feat: add drag-launch force calculation
fix: clamp negative offline duration
test: add save migration regression coverage
refactor: isolate platform ad adapter
docs: define upgrade economy
chore: update build tooling
perf: reuse world object pool
```

Commits should be logically scoped. Avoid drive-by formatting or unrelated file changes in feature commits.

## 7. Test pyramid

### Unit tests — mandatory for deterministic logic

Cover:
- number operations/formatting;
- progression formulas;
- upgrade costs/effects;
- drag-launch vectors and fixed-step movement;
- bounce, slam, minion rewards, and upgrade effects;
- Nexus distance progression and save migrations;
- platform adapter state machines.

### Integration tests

Cover interactions between deterministic modules:
- consumption -> rewards -> unlocks;
- upgrade purchase -> production effects;
- minion impact -> gold reward -> upgrade purchase;
- save/load round trip;
- platform adapter -> gameplay reward result.

### Browser/E2E tests

Keep a smaller set for critical journeys:
- application boots;
- drag and release starts a run;
- minion impacts award gold;
- purchase an upgrade and reload persisted progress;
- first runs end short of the Nexus, while upgraded runs can reach it without full mastery;
- touch controls work at a narrow viewport.

### Manual QA

Still required for:
- feel/balance;
- responsive UI;
- rendering issues;
- audio;
- touch controls;
- browser/platform SDK behaviours.

## 8. Planned CI gates

Once implementation starts, GitHub Actions should run for PRs to `staging` and `main`:

```text
install from lockfile
type-check
lint
unit tests
integration tests
balance validation
production build
```

Playwright tests may run on every PR if fast enough, otherwise at least on staging/release candidates.

A failing required check blocks the merge.

## 9. Release process

### Prepare release candidate

1. stop merging unrelated features into the release candidate if necessary;
2. ensure `staging` CI is green;
3. generate a staging build artifact;
4. run manual smoke tests;
5. test the target portal preview once platform integration exists;
6. verify save migration from the previous production version;
7. update changelog/release notes.

### Promote to production

1. open PR `staging -> main`;
2. review the full release diff;
3. run required CI again;
4. merge after approval;
5. tag version, e.g. `v0.1.0`;
6. build/upload from the exact approved commit/tag;
7. perform post-release smoke checks;
8. monitor errors/progression metrics.

Never upload an untracked local build that does not correspond to a known commit.

## 10. Versioning

Use semantic versioning once playable builds begin:

- `MAJOR`: intentionally incompatible architecture/save/player-facing platform shift;
- `MINOR`: backward-compatible feature/content expansion;
- `PATCH`: backward-compatible bug/balance fixes.

Before 1.0, versions may use `0.x.y` while core design remains experimental.

Save versioning is separate from application versioning. A patch can still require a save migration.

## 11. Save compatibility checklist

Any PR touching economy/progression/save state must answer:

- Does the save schema change?
- Can old values still be parsed?
- Is a migration needed?
- Is the migration idempotent?
- What happens to malformed/partial data?
- Do numeric-library serialized values remain compatible?
- Does a upgrade changes preserve the intended gold and best-distance fields?

Add fixture saves from older versions to regression tests once production versions exist.

## 12. Balance-change process

Balance is code/data with player-facing consequences.

For any meaningful balance change:

1. document the goal (e.g. first run reaches two minion waves instead of one);
2. change data/formulas in one focused PR;
3. run simulator profiles;
4. compare before/after milestone timing;
5. manually play representative sections;
6. note whether existing saves are affected.

Do not make unexplained “feel” changes to multiple unrelated multipliers in one PR.

## 13. Performance-change process

Performance-sensitive PRs should include a reproducible measurement where possible:

- entity count;
- browser/device;
- FPS/frame time;
- memory behaviour;
- build size;
- load time.

Optimisations must not silently change deterministic economy results unless the PR explicitly includes that behavioural change.

## 14. Codex task workflow

Codex is most reliable when tasks are small and bounded.

### Required task format

```text
Goal:
Relevant design sections:
Allowed files/directories:
Acceptance criteria:
Tests required:
Performance constraints:
Save compatibility:
Non-goals:
```

### Example

```text
Goal:
Implement a deterministic drag-to-launch calculation.

Relevant design sections:
docs/GAME_DESIGN.md -> Core run loop.

Allowed files:
src/core/launch/**
tests/core/launch/**

Acceptance criteria:
- backward pull increases forward speed;
- vertical pull changes launch lift;
- values clamp to a documented range;
- no Phaser or DOM imports;
- no mutation of persistent state.

Tests required:
- minimum and maximum pull;
- angle and strength effects;
- invalid non-finite input.

Non-goals:
- Phaser input handling;
- launch UI;
- animations.
```

### Review Codex output

Always inspect:
- unexpected dependencies;
- unrelated file changes;
- missing edge cases;
- duplicated formulas;
- hidden save format changes;
- excessive abstraction;
- performance regressions;
- tests that merely mirror the implementation rather than behaviour.

## 15. Issue lifecycle

Suggested states can be handled with labels/projects later:

```text
idea -> specified -> ready -> in progress -> review -> staging QA -> released
```

A bug should include:

- app/build version;
- browser and OS/device;
- reproduction steps;
- expected behaviour;
- actual behaviour;
- console errors;
- screenshots/video where useful;
- save/test seed when relevant.

## 16. Definition of done

A change is done when:

- acceptance criteria are satisfied;
- relevant tests pass;
- type/lint/build checks pass;
- no unrelated files changed;
- design/decision docs are updated when behaviour changed;
- save migration is handled if needed;
- performance impact is understood where relevant;
- staging verification is complete for user-facing changes.

## 17. Repository hygiene

- never commit secrets/API keys;
- keep generated build output out of source control unless explicitly needed for deployment;
- use lockfiles;
- keep assets licensed and traceable;
- prefer deterministic generated data over manually duplicated tables;
- remove dead experimental code rather than leaving disabled branches throughout production files;
- document third-party licenses before release.

## 18. Branch cleanup

Short-lived branches should be deleted after merge when practical. Long-lived branches are only `main` and `staging` unless a deliberate release strategy changes this rule.
