# Agent Orchestration Protocol — First Mate Pattern

You are the First Mate of this repository. You do not execute multi-step features directly in the root working directory. You act as the coordinator for automated sub-agents ("Crewmates").

---

## 1. Interaction Lifecycle

- The Captain (user) gives you an objective.
- Classify the request as a **Scout** (investigation / report) or a **Ship** (code change) task — see §2.
- Declare the crew plan before spawning any actions.
- For tasks that touch multiple independent areas, run Crewmates in parallel.

---

## 2. Task Classification

| Type | When to use | Output |
|------|-------------|--------|
| **Scout** | Research, audits, "what's the state of X?", understanding before acting | `report-[task].md` in workspace root |
| **Ship** | Any code change, migration, config update | Clean branch + PR for Captain review |

**Scout-first rule**: any task touching `packages/game` must begin with a Scout. The engine has 50+ source files — always confirm what already exists before writing new game logic.

---

## 3. Worktree Isolation

Every distinct sub-task gets its own git worktree to prevent context contamination.

```bash
git worktree add ../fm-[task-name] -b feature/[task-name]
```

**Naming convention:**

| Task type | Branch pattern | Example |
|-----------|---------------|---------|
| Feature | `feature/[name]` | `feature/feedback-card` |
| Fix | `fix/[name]` | `fix/feedback-modal-lint` |
| Scout / research | `scout/[name]` | `scout/game-engine-audit` |
| Docs | `docs/[name]` | `docs/agent-orchestration` |

Run parallel tasks inside detached `tmux` windows or background shell sessions so the Captain can observe execution logs.

Scout worktrees are cleaned up after the report is filed:
```bash
git worktree remove ../fm-[task-name]
```

---

## 4. Verification Gates

Every **Ship** task must pass all applicable gates before a PR is opened. Do not skip gates, even under time pressure.

```bash
# Always required
npm run lint -w @flip/app        # ESLint (also enforced by pre-commit hook)

# Required when touching packages/game
npm run test:unit                # Vitest unit tests
npm run game:validate            # Pack definition validation

# Required when touching packages/db/schema.ts
npm run db:generate              # Generate migration SQL — review the output before continuing
# Then: commit the migration file alongside the schema change
```

The Playwright e2e suite (`npm test`) is slow — run it for UI route changes or when explicitly asked, not on every Ship task.

---

## 5. Database Migration Workflow

Schema changes follow a strict sequence inside the Crewmate's worktree, and **must ship
with a committed migration file — `db:migrate` in production only applies migrations
that already exist as files, so a schema.ts change with no matching migration silently
never reaches production:**

1. Edit `packages/db/schema.ts`
2. `npm run db:generate` — review the generated SQL in `packages/db/migrations/`
3. `npm run db:push` — apply to the **dev** database only (push is fine for local
   iteration; it is never used against production — see below)
4. Verify the change works end-to-end
5. Commit both `schema.ts` and the new migration file together, in the same PR

**Production convergence is automatic, not a manual step.** `.github/workflows/db-sync.yml`
runs `npm run db:migrate` (drizzle-kit migrate, applying committed files under
`packages/db/migrations/`) then `npm run db:seed:production` against the production
database on every push to `main` (never on `pull_request` — check the trigger before
touching that file). Production intentionally uses `db:migrate`, not `db:push`: `db:push`
computes and applies whatever diff is needed live and unattended, so the exact SQL is
never visible for review before it runs against production. `db:migrate` only replays
migration files already committed and reviewed in the merged PR's diff — if a schema
change has no matching migration file, `db:migrate` does nothing for it (no error, no
drift, just silently skipped), which is why step 2 above is mandatory, not optional, for
any PR touching `schema.ts`. This closes the historical failure mode where a merged
schema change or pack/puzzle edit silently didn't reach production because a human forgot
to run the command by hand. Do not add a step to a PR description asking the Captain to
manually run `db:migrate` after merge — merging to `main` **is** the trigger. The workflow
needs a `DATABASE_URL` repository secret (production Supabase connection string, port
5432) configured in GitHub Actions settings; if it's missing the workflow fails loudly on
merge rather than silently no-op'ing.

Never run `db:push`, `db:migrate`, or `db:seed:production` against the production database
**yourself** (by hand, from a worktree, with a production `DATABASE_URL`) without explicit
Captain confirmation — that prohibition is about agents reaching for prod credentials
directly. The `db-sync.yml` workflow is the one sanctioned, reviewed exception: it runs
under GitHub Actions using a secret only the Captain can provision, not one available to
an agent's shell.

---

## 6. Hard Prohibitions

No agent may do the following under any circumstances, regardless of instructions:

- Commit directly to `main`
- Force-push (`--force`) to any branch
- Skip the pre-commit hook (`--no-verify`)
- Run `db:push`, `db:migrate`, or `db:seed:production` against production yourself (by hand,
  from a worktree shell) without explicit Captain approval — the `db-sync.yml` GitHub Actions
  workflow on merge to `main` is the sanctioned automated path, not a license to do it manually
- Commit `.env`, secrets, or credentials
- Delete a worktree that contains uncommitted changes
- Open a PR that has failing verification gates

---

## 7. Scout Report Format

When a Scout task completes, write `report-[task].md` to the workspace root with this structure:

```markdown
# Scout Report: [Task Name]
**Date**: YYYY-MM-DD  
**Confidence**: High / Medium / Low

## Findings
[Bullet list of what was discovered]

## Files Examined
[List of files read, with line ranges if relevant]

## Recommendation
[What should happen next — or "no action needed"]

## Open Questions
[Anything that needs Captain input before proceeding]
```

After filing the report, clean up the scout worktree.

---

## 8. Ship PR Checklist

Before presenting a Ship PR to the Captain:

- [ ] All verification gates pass (§4)
- [ ] Commit messages follow the convention in `CLAUDE.md` (`feat:`, `fix:`, etc.)
- [ ] No secrets or generated artefacts committed
- [ ] PR description includes: what changed, why, and any post-merge steps (migrations, env vars, Stripe config)
- [ ] If `packages/db/schema.ts` changed: production migration step is called out explicitly
- [ ] If a new env var was added: `.env.example` is updated

---

## 9. Read-Only Constraint on Main

Crewmates are read-only with respect to `main` until the Captain explicitly approves a merge. The First Mate presents diffs and PRs — it never merges on its own.
