# Dependency advisory check and remediation

Checked 2026-10-13 against the npm advisory registry, before and after the maintainer-approved compatible dependency update. This is separate from license evidence and functional tests; a clean result describes that registry snapshot, not a security certification.

## Result and upload decision

The initial production audit returned 3 critical, 23 high, 15 moderate and 4 low findings. These registry counts did not establish that each issue was exploitable in Blueprint Studio. The maintainer chose to update and verify before uploading.

Next.js and eslint-config-next are now pinned to 16.3.8. React/React DOM remain 19.2.5 and Lucide React remains 1.11.0. Compatible transitive resolutions were refreshed, including Sharp 0.35.5, Babel core 7.29.7, PostCSS 8.5.23/8.5.30, Nanoid 3.3.20, brace-expansion 1.1.21/5.0.12, js-yaml 4.3.2, Browserslist 4.29.3, baseline-browser-mapping 2.11.28 and source-map-js 1.2.2. No advisory was hidden with an audit ignore or replaced with an unreviewed fork.

After refresh, `pnpm audit --prod --audit-level low` reports **no known vulnerabilities**. The full `pnpm audit --json` reports **one high, zero critical/moderate/low**. The remaining issue is described below. CI now checks the production dependency audit as well as functional checks; this is explicitly not a claim of a clean full development audit.

### Residual development-only advisory

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects braces through 3.0.3: deeply nested glob patterns can exhaust the Node stack. The advisory and publisher registry list **no patched version** as of this check. Updating fast-glob or the latest Next lint plugin would not remove the affected parser; their published dependency chains still use it.

Observed chain: `eslint-config-next@16.3.8 → @next/eslint-plugin-next@16.3.8 → fast-glob@3.3.1 → micromatch@4.0.8 → braces@3.0.3`. The inventory identifies this as development-only; the production audit does not include it. The lint plugin's root-directory utility accepts configuration glob patterns. Blueprint app source has no direct braces/fast-glob/micromatch imports and does not pass imported project text to lint tooling.

Do not run lint/build tooling against untrusted repository configuration or glob patterns outside an isolated environment. Static app users do not run this lint dependency. This scope distinction is not a fix or an assertion that developer tooling is safe. On 2026-10-13 the maintainer explicitly approved uploading the verified source with this limitation documented. This approval does not waive future advisory review or authorize hosted deployment.

## Verified critical Next.js advisories

| Advisory | Reported affected area | Maintainer-listed patch |
| --- | --- | --- |
| [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j) | Node `next/og` ImageResponse with attacker-controlled SVG content/attributes/styles | 16.3.6 |
| [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) | Server image optimization of AVIF files via native image libraries | 16.3.3 |
| [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36) | Windows-hosted Next.js servers | 16.3.3 |

These are public maintainer advisories, not new vulnerabilities discovered by this project. The audit also reports later Next.js advisories with patch ranges starting at 16.3.8; do not assume that fixing only the three critical rows completes remediation.

## Present distribution scope

Observed in this repository: the release uses static export, its images are explicitly unoptimized, and application source has no `next/og`/ImageResponse route. Static hosting does not run a Next.js server or expose its image-optimization API. This limits applicability of the three reported server issues to the planned hosted artifact. It is not a blanket assertion that every advisory is irrelevant or that developer/server deployments are safe.

Keep development servers bound to loopback. Do not expose `next dev` or substitute a public Next.js server for the documented static deployment. Hosting has not been deployed.

## Required follow-up

- Dependency-update approval received; compatible publisher versions and transitive refresh applied inside the project only. The new project-local pnpm store is ignored and refused by the source packager.
- Advisory and license checks repeated; new Sharp combined license declarations and README library notices retained. Native/WebAssembly build-tool binaries are not redistributed.
- Typecheck, lint, 249 unit tests, both builds and 91 browser tests pass (one intentional mobile resize skip). Source package file/manifest/archive hashes and cache-free staged typechecking verified; see the release checklist.
- Maintainer approved source publication with the disclosed development-tool limitation; do not describe the full graph as clean.
- Reviewed source package contains 90 files plus its SHA-256 manifest, excluding private history/workspace material. Repackage after any further approved change.
- Upload only after the chosen review gate; separately verify GitHub CI and hosted deployment when authorized.

Private GitHub vulnerability reporting is enabled on `SirArthur23/blueprintstudio`. The feedback mailbox is configured but not provisioned or delivery-tested by the app.
