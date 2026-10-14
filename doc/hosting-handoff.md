# Blueprint Studio — hosting handoff

Historical handoff prepared 2026-10-13 for the session in the `schmidtpabst.com` workspace. Its preflight failures and old test limitations below describe that preparation stage, not the live site. The deployment session subsequently launched the beta and published source updates through `8ef9b8f`; see `doc/deployment.md` for current evidence. These original notes are preserved rather than discarded during synchronization.

## Copy-paste brief

Prepare the static public beta of Blueprint Studio for **https://blueprintstudio.schmidtpabst.com/**. Arthur created this subdomain and chose a separate origin to isolate local project storage from the Ghost site. Hosting is **IONOS, accessed via SSH**. Inspect the existing setup, present a scoped deployment/rollback plan, and obtain approval before live server changes. Preserve Ghost and all other sites; do not add analytics, accounts, a database or an AI backend.

Use the public standalone source: [SirArthur23/blueprintstudio](https://github.com/SirArthur23/blueprintstudio), verified commit **`6d830bead2c5f7750f8cf5777117af5b5e611c7b`**. [Its clean Linux CI run passed](https://github.com/SirArthur23/blueprintstudio/actions/runs/38433293814): production advisory gate, typecheck, lint, 249 unit tests, production/static builds, 91 browser tests and source packaging. One desktop-only resize test is intentionally skipped on the phone-sized viewport. This evidence covers the previous `/blueprintstudio/` build, not the new root deployment.

The app is MIT-licensed (Arthur Schmidt-Pabst), bilingual EN/DE and browser-local; no project upload, runtime AI, accounts or database. Feedback: `blueprintstudio@schmidtpabst.com` (delivery unverified). Private GitHub vulnerability reporting is enabled. One unpatched development-only braces/lint advisory remains documented in `doc/security-audit.md`; publication was approved with that limitation. Recheck the production audit before deployment.

## Build the correct artifact

Use a permitted clean checkout pinned to that commit, Node 22.12+ (22.x), and pnpm 10. No API key is needed; never copy the original surrounding workspace/history.

```sh
pnpm install --frozen-lockfile
pnpm audit --prod --audit-level low
pnpm typecheck
pnpm lint
pnpm test
NEXT_PUBLIC_BASE_PATH='' pnpm build:release
NEXT_PUBLIC_BASE_PATH='' pnpm preview:release
```

Preview at **http://127.0.0.1:3031/**. The explicit empty base path is essential; otherwise the build defaults to `/blueprintstudio`. Deploy **only the newly built contents of `out/`**, including assets, fonts, manuals/help and notices—not the old path-based artifact. Serve statically; do not expose Next.js or the preview server.

**Testing caveat:** `playwright.config.ts` and several URL assertions hardcode `/blueprintstudio/`. Setting the environment variable alone does not adapt them. Coordinate root-aware browser coverage in the Blueprint project/permitted checkout; retain path coverage and real assertions rather than skipping failures.

## Host checks and launch gate

- Verify DNS, isolated nginx vhost and certificate. The 2026-10-13 read-only check failed during TLS handshake; working HTTPS is **not verified**. Never bypass certificate validation.
- Preserve Ghost/other sites, review configuration before reload, and retain configuration/artifact rollback. Keep credentials out of chat/source. The existing [site policy](https://ai.schmidtpabst.com/impressum/) identifies IONOS/Ghost; actual SSH settings remain uninspected.
- Confirm log fields/retention/rotation and applicable operator/contact/privacy/imprint details. Do not claim no logging or inherit Ghost membership/CDN scripts. Coordinate launch-URL/privacy updates: the published README still names the old AI-site path.
- Verify HTTPS/HTTP redirects, correct asset MIME types, caching, root app/help/manual/license URLs and genuine unknown-path 404s.
- Run isolated fictional-project browser checks: EN/DE, long text, governance, alternatives/restoration, JSON export/import, reload persistence and narrow viewport; inspect runtime/network errors. Never use private records or the owner's browser profile. Real-user/device studies remain deferred.
- Separate origins isolate local storage, not encrypt it. Users need JSON backups to transfer localhost/preview work. Report deployed commit/artifact checksum, actual changes, live checks and rollback before declaring launch complete. Videos are outlined, not recorded; SQL remains post-release.

## Ownership boundary

Original Blueprint work stays inside `HITM_Blueprint/`. Infrastructure belongs in the `schmidtpabst.com` session under its instructions; coordinate application-source changes here. This handoff does not itself authorize live deployment, DNS/server mutations or cross-session messaging.
