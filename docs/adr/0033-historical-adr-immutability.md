# ADR-0033: Historical ADR narrative immutability

- **Status:** Accepted
- **Date:** 2026-11-02
- **Tags:** docs, adr, agents

## Context

Living docs (architecture, product guides, READMEs) must track present-tense product framing—for example “Nest sample” → “Nest example” after the monorepo. Accepted ADR files are also history: they record what we believed and chose when the decision was made. Silently rewriting those bodies for branding or tone erases that record and encourages agents to “clean up” old ADRs whenever vocabulary shifts.

[`docs/adr/README.md`](./README.md) already said not to silently rewrite history when superseding. That one-liner was easy to miss when a framing PR tempted mass edits of ADR-0029/0032 “Nest sample” language.

## Decision

- Accepted ADR **bodies** (Context, Decision, Consequences narrative, Alternatives) are **historical records**. Do **not** mass-edit them for branding, tone, or present-tense product framing.
- When a tradeoff changes: write a **new** ADR; set the old Status to `Superseded by ADR-…` (or “in part” / “amended by” as already practiced). Optionally add a short Status or Consequences pointer—**not** a rewrite of the old Context/Decision story.
- Allowed on an Accepted ADR without a full supersede: factual errata (broken links, paths that never matched the decision), Status line updates, and thin “see ADR-NNNN” cross-links.
- Living docs (`architecture.md`, `docs/archipielago/**`, READMEs, how-tos) **do** get present-tense updates; that is where current framing lives.

## Consequences

- Framing and rename PRs leave historical ADR wording alone and update guides/READMEs instead.
- Agents have an explicit rule ([AGENTS.md](../../AGENTS.md) §6) instead of only a README tip.
- Readers must follow Status links and newer ADRs for current law; older bodies stay period pieces.

## Alternatives considered

- Rewrite Accepted ADRs whenever living vocabulary changes — rejected; destroys decision archaeology.
- README-only policy forever — rejected; too easy to overlook during large framing edits.
- Freeze ADRs with zero edits including Status — rejected; supersede and errata still need Status/link updates.
