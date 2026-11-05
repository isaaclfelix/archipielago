---
name: Plan lifecycle polish
overview: Tighten ADR-0031 workspace plan lifecycle—one file SSOT, body Todos mirror for human preview/resume, commit mid-plan diffs to the PR; update AGENTS, cloud skill, workflow, and architecture Agent plans. Separate from product-docs framing.
todos:
  - id: branch-plan
    content: Create docs/plan-lifecycle-workspace-todos branch; commit this plan under .cursor/plans/
    status: completed
  - id: amend-adr-0031
    content: Amend ADR-0031 Decision/Consequences for SSOT, commit plan diffs, body Todos (workspace only)
    status: completed
  - id: agents-plan-rules
    content: Update AGENTS.md §6—edit existing workspace plan only; sync frontmatter + body Todos
    status: completed
  - id: cloud-skill-template
    content: Update plan-mode-for-cloud SKILL—resume same file; require body ## Todos; commit iterations
    status: completed
  - id: workflow-iteration
    content: Update docs/archipielago/workflow.md Planning/Iteration—commit plan updates; body Todos
    status: completed
  - id: architecture-agent-plans
    content: Align docs/architecture.md Agent plans section with ADR-0031 clarifications
    status: pending
  - id: delete-plan-before-merge
    content: Delete this plan file in a later commit before merge (ADR-0031 / plan-files CI)
    status: pending
isProject: true
---

# Plan lifecycle polish (ADR-0031 + body Todos)

## Goal

Make workspace plan files reliably resumable across IDE / web / devices without forking CreatePlan copies, and make progress visible under Markdown preview / GitHub via a bottom `## Todos` checklist that mirrors frontmatter.

Split out of the product-docs framing PR ([`2026-11-01-archipielago-product-repo-framing.md`](2026-11-01-archipielago-product-repo-framing.md)) to keep that PR cognitively focused on Archipielago framing.

Out of scope: product README/guide reframes, TD-034/035/036, ADR-0033, scaffolder extraction, CreatePlan product changes (Cursor app). In scope: ADR-0031 clarifications + AGENTS + cloud skill + workflow + architecture Agent plans.

## Decisions

- Canonical plan after Save to workspace / first cloud write: `.cursor/plans/YYYY-MM-DD-kebab-slug.md` only.
- Iterate by editing that file; never CreatePlan-hydrate a second copy for the same effort.
- Plan revisions are normal git changes—commit and push to the open PR until delete-before-merge.
- **Body Todos (workspace plans only):** trailing `## Todos` mirrors YAML `todos` (same ids/order/status). Agents update both. Not required on CreatePlan-only `~/.cursor/plans/*.plan.md` before Save to workspace (Plan UI already shows todos).

## Approach

### 1. Amend [`docs/adr/0031-project-plan-files.md`](docs/adr/0031-project-plan-files.md)

Clarify Decision/Consequences (do not rewrite unrelated history—this ADR is the living plan-lifecycle policy):

- One workspace file as SSOT across devices and IDE↔web handoff.
- Expect commit-worthy plan diffs while the file exists on the PR.
- Body Todos for human-in-the-loop / mid-execution resume; Markdown preview + body Todos are enough—do not re-author via a new CreatePlan file to regain Plan UI.
- Point at AGENTS / cloud skill as the day-to-day enforcement paths.

### 2. [`AGENTS.md`](AGENTS.md) §6

- If the effort already has a workspace plan on the branch, edit it; never spawn a duplicate.
- Keep frontmatter + bottom `## Todos` in sync while executing; commit progress when pausing mid-plan.

### 3. [`.agents/skills/plan-mode-for-cloud/SKILL.md`](.agents/skills/plan-mode-for-cloud/SKILL.md)

- Resume existing plan on the branch / same dated slug; do not create a second file.
- Require body `## Todos` in the plan-file template (cloud writes straight to workspace).
- Commit plan iterations to the PR.

### 4. [`docs/archipielago/workflow.md`](docs/archipielago/workflow.md)

- Planning / Iteration: commit plan updates during iteration, not only the initial add; body Todos for resume visibility.

### 5. [`docs/architecture.md`](docs/architecture.md) **Agent plans**

- Align with the ADR-0031 clarifications (same wording as AGENTS/workflow, short).

## Suggested body checklist shape

```markdown
## Todos

- [x] `branch-plan` — … (completed)
- [ ] `amend-adr-0031` — … (pending)
- [ ] `…` — … (in_progress)
```

Status words match YAML: `pending` / `in_progress` / `completed` / `cancelled`.

## Branch and delivery

1. Branch (suggested): `docs/plan-lifecycle-workspace-todos` from `main` (or from framing after merge if preferred).
2. Commit this plan file first; do not commit it on the framing PR.
3. Implement the five file groups above; format if needed.
4. Delete this plan before merge (`plan-files` CI).

No new ADR number—amend ADR-0031. ADR-0033 (historical ADR immutability) stays on the framing PR if not already merged.

## Todos

- [x] `branch-plan` — Create docs/plan-lifecycle-workspace-todos branch; commit this plan under .cursor/plans/ (completed)
- [x] `amend-adr-0031` — Amend ADR-0031 Decision/Consequences for SSOT, commit plan diffs, body Todos (workspace only) (completed)
- [x] `agents-plan-rules` — Update AGENTS.md §6—edit existing workspace plan only; sync frontmatter + body Todos (completed)
- [x] `cloud-skill-template` — Update plan-mode-for-cloud SKILL—resume same file; require body ## Todos; commit iterations (completed)
- [x] `workflow-iteration` — Update docs/archipielago/workflow.md Planning/Iteration—commit plan updates; body Todos (completed)
- [ ] `architecture-agent-plans` — Align docs/architecture.md Agent plans section with ADR-0031 clarifications (pending)
- [ ] `delete-plan-before-merge` — Delete this plan file in a later commit before merge (ADR-0031 / plan-files CI) (pending)
