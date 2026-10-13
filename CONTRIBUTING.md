# Contributing

Thank you for helping people design AI workflows with clear human responsibility.

Use a supported Node.js version (22.12+ in 22.x, 24.x, or 26+) and pnpm 10. Install with `pnpm install --frozen-lockfile`. Follow [AGENTS.md](AGENTS.md) and read [the source of truth](doc/source_of_truth_hitm_blueprint.md) before changing product behavior.

## Changes

- Explain the problem, expected behavior, and steps to reproduce it. Use fictional or anonymized project data in issues, screenshots, and tests.
- Keep changes focused. Preserve local-first operation and explicit human choices. Discuss accounts, live AI, backend services, database connections, or telemetry before implementation.
- Add meaningful regression coverage for data handling, rules, and interactions. Include English and German strings and check long text on laptop and phone layouts.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and the relevant browser tests. The release pipeline also validates the exported build at `/blueprintstudio/`.
- Document material product decisions in the source of truth. Update the manual if the user flow changes.

Submit a focused pull request to [SirArthur23/blueprintstudio](https://github.com/SirArthur23/blueprintstudio). Describe the resulting behavior and checks performed. Please do not commit generated exports, build caches, browser test output, secrets, or real project backups.

General feedback: [blueprintstudio@schmidtpabst.com](mailto:blueprintstudio@schmidtpabst.com). Use the English/German feedback templates and fictional examples. Security vulnerabilities belong in the private reporting route described in [SECURITY.md](SECURITY.md), not public issues.

Contributions are accepted under the project's MIT License. Third-party assets must retain their own license and attribution.
