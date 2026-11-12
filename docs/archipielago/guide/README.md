# Archipielago guide

Host-agnostic integration and authoring for `@archipielago/*`. Walk through in
this order—see Nest working first, then either stay on Nest or wire another host,
then keep the authoring cheat sheet for ongoing UI:

| Order | Doc                            | Purpose                                                                                           |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1     | [concepts.md](./concepts.md)   | Primitives and ownership split                                                                    |
| 2     | [install.md](./install.md)     | Workspace install today; future `0.0.1` publish                                                   |
| 3     | [nestjs.md](./nestjs.md)       | **Demonstration + Nest host recipe**—how the concepts look when connected in this repo            |
| 4a    | Stay on Nest                   | Nest adapter from [nestjs.md](./nestjs.md); then [authoring.md](./authoring.md)                   |
| 4b    | Other host                     | [wiring.md](./wiring.md) (DIY transfer of the host contract); then [authoring.md](./authoring.md) |
| 5     | [authoring.md](./authoring.md) | Post-connect quick reference (pages vs islands, required island shape, props)                     |

`examples/nestjs` is both the documented Nest recipe and the future dogfood
website host. Those roles share a tree; they do not share every doc lane.

### In this monorepo / dogfood website UI

[how-to-web-ui.md](../../how-to-web-ui.md) is the maintainer cookbook for HTML UI
under `examples/nestjs` (pages, islands, styles, scaffold). It is **not** a
required step on the package-consumer spine. If you choose Nest and want this
example’s folder conventions, feel free to follow it—that workflow is how the
site is built day to day.

Mission, vision, workflow, and roadmap: [docs/archipielago/README.md](../README.md).
