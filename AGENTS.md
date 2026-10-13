# Agent Working Rules

- Work only within this project/repository root. In the original multi-project workspace, that root is `HITM_Blueprint/`; never touch sibling projects.
- Read `doc/source_of_truth_hitm_blueprint.md` before changing product behaviour; it is authoritative.
- Preserve V1's deterministic, local-first scope. Do not add backend services, accounts, cloud persistence, or live AI integrations without explicit approval.
- Use pnpm. Before handoff, run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. For changes to user flows or release assets, also build the static export and run the relevant browser tests.
- Preserve existing user changes. Do not commit, deploy, add dependencies, or modify generated files unless explicitly requested.
- Maintain the calm, responsive workspace: accessible controls, no clipping or horizontal overflow, and no hydration errors.
- Record completed milestones and material product decisions in the SOT.
