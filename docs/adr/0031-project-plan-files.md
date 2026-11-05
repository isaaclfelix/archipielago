# ADR-0031: Project plan files for agent planning

- **Status:** Accepted
- **Date:** 2026-10-31
- **Tags:** agents, planning, git

## Context

Desktop Plan mode writes a plan under `~/.cursor/plans` and can move it into
the workspace with **Save to workspace** (`.cursor/plans/`). Cloud Agent and
the web composer have no Plan mode picker, so a plan that exists only in the
transcript is easy to lose, and a plan written on the agent machine's home
directory never shows up on the pull request.

We want a plan a reviewer can open on the GitHub pull request, including from
the commits after the file is gone from the branch tip. We do not want those
plans to remain in the tree of `main` after release.

## Decision

Clarified on 2026-11-04. Context and alternatives from 2026-10-31 stay as
written. The bullets below are the current plan-lifecycle policy.

- **Authoring stays on the tool that context already has.** In the desktop IDE
  and the CLI, use built-in Plan mode, then **Save to workspace** so the file
  is under `.cursor/plans/`. Do not run
  [plan-mode-for-cloud](../../.agents/skills/plan-mode-for-cloud/SKILL.md)
  there. On a Cloud Agent or at cursor.com/agents, that skill writes
  `.cursor/plans/<date>-<slug>.md` and waits for approval before product
  edits.
- **One workspace file is the source of truth.** After **Save to workspace**
  or the first cloud write, the canonical plan is
  `.cursor/plans/YYYY-MM-DD-kebab-slug.md`. That file is the handoff across
  devices and between the IDE and the web. Iterate by editing it. Do not
  CreatePlan-hydrate a second copy for the same effort, including to regain
  Plan UI.
- **The gitops lifecycle is the same in every context.** Commit the plan on
  the working branch so the pull request commits show it. Plan revisions are
  normal git changes: commit them, and push them to the open pull request,
  while the file exists. Delete it in a later commit before merge. Do not
  drop or rewrite the commit that added the file, and do not gitignore
  `.cursor/plans/`. A pull request that never had a plan does not need one.
- **Workspace plans carry a body checklist.** A trailing `## Todos` mirrors
  the YAML `todos` (same ids, order, and status: `pending`, `in_progress`,
  `completed`, or `cancelled`). Agents update both. Markdown preview plus
  that checklist is enough to resume a paused effort. CreatePlan-only files
  under `~/.cursor/plans` before **Save to workspace** do not need the body
  checklist; the Plan UI already shows those todos.
- **Day-to-day enforcement** is [AGENTS.md](../../AGENTS.md) §6 and
  [plan-mode-for-cloud](../../.agents/skills/plan-mode-for-cloud/SKILL.md).
  Repo-wide wording also lives in
  [workflow.md](../archipielago/workflow.md#agent-plans).
- **CI rejects a tip that still has a plan.** The `plan-files` job runs
  `scripts/check-no-plan-files.sh` on the merge commit. It fails while any
  file remains under `.cursor/plans/`. The PR template spotcheck has a
  matching checkbox. Repository merge settings are unchanged: a merge commit
  keeps the blob reachable from `main`'s history; a squash merge leaves it on
  the pull request commits.

## Consequences

- Pull request review can open the plan from the branch commits after the
  delete commit removes it from the tip. `plan-files` stays red until that
  delete is in the tree that would merge.
- Reviewers and a returning session can resume from the workspace file in
  Markdown preview. A second CreatePlan file is not required for that.
- Mid-plan commits keep progress on the pull request when a session stops
  before the delete.
- A missed delete fails CI instead of landing quietly on `main`. GitHub
  hides the merge button only after an admin requires the `plan-files`
  check.
- Plan text that lands in a merge commit stays in the repository history of
  every clone. Do not put secrets in plan files.
- Desktop and CLI Plan mode stay the planning path in those environments.
  Their default file is still `~/.cursor/plans` until **Save to workspace**.
  The cloud skill does not replace that mode.

## Alternatives considered

- One planning skill for the IDE and the cloud — rejected; the IDE and CLI
  already have Plan mode, and this skill must not stand in for it.
- Chat-only plans — rejected; the web transcript is not the pull request
  record.
- `~/.cursor/plans` only — rejected; that directory is the developer machine
  or the cloud VM, not the clone reviewers fetch.
- Leave plans on `main` — rejected; the release tree should not keep them.
- Gitignore `.cursor/plans/` — rejected; ignored files never enter the commit
  history the pull request can show.
