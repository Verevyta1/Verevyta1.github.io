# Contributing

This project uses a staged workflow to protect progression logic, save compatibility and production releases.

## Before changing code

1. Read `docs/GAME_DESIGN.md`.
2. Read relevant entries in `docs/DECISIONS.md`.
3. Confirm the goal and acceptance criteria.
4. If a design decision is unresolved, do not silently invent the answer. Raise the decision first.

## Branching

Create normal work from `staging`:

```text
feature/<name>
fix/<name>
docs/<name>
chore/<name>
refactor/<name>
test/<name>
```

Use `hotfix/<name>` from `main` only for urgent production defects.

## Coding principles

- Follow TypeScript/language rules and configured linting strictly.
- Prefer simple, cohesive modules.
- Keep deterministic economy/progression separate from rendering.
- Prefer pure functions for calculations.
- Avoid duplicated business formulas.
- Use named configuration values instead of unexplained magic numbers.
- Comments should explain constraints, assumptions and rationale rather than restating syntax.
- Do not introduce a dependency without a concrete benefit.
- Keep platform SDK calls behind adapters.
- Never commit secrets.

## Tests

For deterministic features, start by defining behaviour and add tests before/with implementation.

At minimum, changes should include the relevant combination of:

- unit tests;
- integration tests;
- browser/E2E tests;
- balance-simulation checks;
- manual QA steps.

Bug fixes should include a regression test when practical.

## Save compatibility

Any change touching persisted state must document:

- whether `saveVersion` changes;
- migration behaviour;
- malformed/old save handling;
- whether the change is reversible;
- whether large-number serialization is affected.

Never change a production save shape silently.

## Pull requests

Target `staging` for normal work.

A PR should be focused and include:

- summary/problem;
- acceptance criteria;
- tests;
- manual verification;
- performance impact;
- save-data impact;
- screenshots/video for visible changes;
- documentation updates where needed.

Avoid bundling unrelated cleanup into a feature PR.

## Production releases

Production changes normally reach `main` through a release PR from `staging` after integrated testing.

Do not deploy an uncommitted local build. Release artifacts should map to an exact commit/tag.

## Codex-assisted changes

When asking Codex to implement work, provide a bounded task with:

- goal;
- relevant design sections;
- allowed files;
- acceptance criteria;
- required tests;
- performance constraints;
- save compatibility;
- explicit non-goals.

Review generated code like human-written code. Compilation alone is not acceptance.

## Style/design changes

UI work should preserve the approved direction:

- clean and simple;
- solid/opaque surfaces;
- simple rounded controls;
- strong readability;
- no global yellow/orange filter;
- no excessive neon/glass UI;
- no copying reference-game assets, branding or distinctive layout.

## Definition of done

A change is done when behaviour matches acceptance criteria, relevant tests/checks pass, documentation is accurate, save/performance implications are understood and the integrated staging build has been verified where applicable.