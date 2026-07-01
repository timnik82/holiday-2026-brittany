# AGENTS.md

Project memory for agents working on this repository (timnik82/holiday-2026-brittany).

## Git identity for commits

Always commit using the repo owner's GitHub identity (no local git identity is
configured in this environment; do not run `git config --global`):

```bash
git -c user.name="Timur" \
    -c user.email="206328117+timnik82@users.noreply.github.com" \
    commit -m "..."
```

If a `git push` over HTTPS fails with "could not read Username", authenticate the
single push with an ephemeral credential helper backed by `GH_TOKEN` (do not
persist it):

```bash
git -c credential.helper='!f() { echo username=timnik82; echo "password=${GH_TOKEN}"; }; f' \
    push origin <branch>
```

## Project context

- Private English-language family travel guide for Brittany (Next.js App Router,
  React 19, TypeScript, Vitest, Playwright). See
  `docs/superpowers/plans/2026-06-30-brittany-family-guide.md` for the full plan.
- Testing follows a risk-based strategy (high-risk subsystems get focused
  automated tests; static/presentational content relies on shared validators and
  representative manual checks). Do not manufacture tests just to raise count.
- `npm run check` = lint + typecheck + test + validate:content + build.
