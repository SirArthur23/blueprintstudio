# Static release deployment

Live public beta: `https://blueprintstudio.schmidtpabst.com/`, a dedicated origin for browser-local projects. Arthur approved the operator notice, logging policy and infrastructure deployment on 13 October 2026; HTTPS and live acceptance checks passed. Infrastructure work belongs in the schmidtpabst repository/session and requires explicit approval before DNS or server changes. Build with an explicit empty base path. The [original hosting handoff](hosting-handoff.md) is retained as historical preparation evidence, not current launch status.

## Build and preview (retained path variant)

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build:release
pnpm preview:release
```

Open `http://127.0.0.1:3031/blueprintstudio/`. The build has `/blueprintstudio` compiled as its base path. Deploy the contents of `out/` to that URL path, including `_next`, fonts, license notices, and `help/`. Do not deploy the whole source workspace. A Node server is not required in production.

For another path, set `NEXT_PUBLIC_BASE_PATH` to that path without a trailing slash for both build and preview. For a dedicated hostname root:

```sh
NEXT_PUBLIC_BASE_PATH='' pnpm build:release
NEXT_PUBLIC_BASE_PATH='' pnpm preview:release
```

Path changes require rebuilding. The usual `pnpm dev` remains at the root of localhost:3021. Next exports to `.next-release/`; the build script copies the export and public documentation into `out/`, which is recreated on each successful build. Next manages its compiler cache under `.next/`.

## Host preparation

### Public beta links

The workspace shows “Beta preview / Beta-Vorschau” and the package version. **More → Source & feedback** opens the local bilingual help section, with MIT attribution, privacy guidance and a feedback template. It does not upload the current project.

Forks can override the maintainer-approved public destinations with these build-time variables:

- `NEXT_PUBLIC_BLUEPRINT_SOURCE_URL`: the chosen HTTPS repository URL.
- `NEXT_PUBLIC_BLUEPRINT_FEEDBACK_URL`: the chosen HTTPS feedback page or a bare `mailto:address` (no prefilled subject/body or multiple recipients).

Maintainer-approved defaults are in `src/lib/public-release-config.json`: source `https://github.com/SirArthur23/blueprintstudio` and feedback `mailto:blueprintstudio@schmidtpabst.com`, selected on 2026-10-13. Environment values override these; an explicit empty value disables that link and shows pending text. Invalid protocols/embedded credentials fail the build. Values are public, compiled into the app; never put secrets or private invitations in them. Changing them requires a rebuild. No blueprint data is appended to a destination. Link configuration does not enable private security reporting; it was separately enabled and verified for the chosen repository. Mailbox provisioning/delivery has not been tested.

### Illustrated manuals

The supplied `public/brand/BlueprintStudio_lores.png` replaces the studio header logo and favicon; `BlueprintStudio_hires.png` appears in the welcome, Help and both manuals. Both are local, unchanged copies of Arthur's supplied graphics and are explicitly included in source packaging. Static manual paths are rewritten to `../brand/`; root and retained-path browser coverage checks actual image loading. Artwork is not placed behind working canvas content.

`public/manual/` contains twelve screenshots from isolated Chromium contexts: six views each in English and German. The fixture in `tests/fixtures/manual-example.ts` uses invented training material and no real records. The warning screenshot intentionally assigns final decisions to AI for demonstration, then the capture script corrects that assignment before reporting. The alternative is compared, not adopted.

To refresh screenshots after a UI change, run `pnpm build:release`, `pnpm manual:screenshots`, then `pnpm build:release` again to ship the updated PNGs and metadata. The capture command requires the installed Chromium test browser and writes only the known `public/manual/` images/metadata. It does not use the user's normal browser profile. Review the images before handoff. The static build rewrites manual image paths from source-repository paths to the actual deployed `manual/` directory; originals remain unchanged.

Screenshot metadata stores intrinsic dimensions; captions/alt text are bilingual. Local help provides full-size image links. Feedback templates and `SECURITY.md` are included in the static output. Private GitHub vulnerability reporting is enabled; feedback mailbox delivery remains untested.

Use HTTPS. Preserve directory index serving and trailing-slash redirects. Unknown paths should return 404. Serve hashed `_next/static/` assets with long-lived caching and HTML with revalidation. Confirm all URLs work under the configured path, especially locally bundled font files and help.

Browser local storage is tied to scheme/hostname/port, not URL path. `http://localhost:3021`, the local preview, and the public hostname each have different storage. Users need JSON backups to transfer work. The dedicated public origin isolates project storage from the Ghost sites. It does not encrypt local storage. Applications on the same hostname still share an origin.

Confirm the operator's access-log retention and contact/privacy/legal notices before publishing. The app adds no analytics or project-upload endpoint. Do not silently add analytics during host setup.

## Reproducible public source

Run `pnpm package:source` to prepare `release/source/hitm-blueprint/` as the standalone repository candidate. `scripts/source-files.json` is an explicit reviewed allowlist: new files are not silently swept into publication. The packager refuses traversal, private/generated paths, symlinks, and common credential markers. It copies no Git history, conversation DOCX, environment files, backups, sibling folders, node_modules, or build caches. This is a hygiene guard, not an exhaustive secret or privacy scanner; inspect the final contents before publishing.

`SOURCE_MANIFEST.json` records file sizes and SHA-256 digests. The only source normalization removes the generated `.next` route-types import from the staged `next-env.d.ts`, so cache-free typechecking works; the manifest records both the original hash and transformation. The live working file is not changed. Install dependencies with `pnpm install --frozen-lockfile` inside the new source checkout. Keep `pnpm-lock.yaml` and the included `third-party/` notices.

The same command uses the host's `tar` utility to create `release/hitm-blueprint-0.1.0-source.tar.gz` and `release/source-package.sha256` for handoff. The archive contains the staged directory, not the workspace. Re-run packaging after changing any release-approved source or documentation.

The included `.github/workflows/verify.yml` applies when `.github/` is at the standalone repository root. It runs checks and prepares source, but does not deploy. The packager itself creates no Git repository, remote, tag, or commit. Source publication is a separate approved operation; the maintainer-selected public repository and security/conduct contacts are configured.

`pnpm audit:licenses` inventories the installed graph and supplied upstream notices without registry access. Static builds include those notices automatically. See `doc/dependency-licenses.md` for scope, platform limits, README-only/metadata-only packages, and the distinction between shipped browser assets and native/build/test tooling.

## Pending welcome/branding update (2026-10-14)

The app working copy incorporated the infrastructure session's published `8ef9b8f` changes and adds the bilingual welcome and supplied branding. The publishing checkout was verified clean at that commit before preparation. Arthur approved publishing this verified update and sending the exact resulting commit to the deployment chat. Source publication is separate from deployment; this preparation record does not claim that the updated welcome/branding is live.

Keep the app/UI work in this project and the SSH/vhost/TLS deployment in the infrastructure chat. After approved source publication, that chat should consume the exact new commit, build with `NEXT_PUBLIC_BASE_PATH=''`, verify the artifact and perform the normal live acceptance/rollback checks. Before publication or a later app change, compare public main/SOT with the last reconciled commit so changes from the other chat are not overwritten. No automatic cross-chat sync or messaging is configured.

## Acceptance and rollback

Run the exported-build browser suite before upload. After approved publication, verify the live path/assets and fictional-project export/import/refresh through scripted checks in the configured browser engines and phone-sized viewport; inspect console/network errors, manual and public feedback/source links. Actual-user/real-device studies remain deferred under the budget decision, not required for initial release.

Retain the previous verified static artifact for rollback. Reverting assets does not revert browser data; keep storage-schema migrations compatible and ask users to export backups before a breaking upgrade. Record artifact version, date, build commands, and actual host checks in the release record.

References: [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [Next.js basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath).

## Root and retained path verification

`NEXT_PUBLIC_BASE_PATH='' pnpm test:e2e` uses the root preview and real root asset/help assertions. Leave the variable unset to retain `/blueprintstudio/` coverage with a matching path build. Rebuild before changing modes. For approved live checks, set `BLUEPRINT_E2E_BASE_URL=https://blueprintstudio.schmidtpabst.com/` plus the empty base path; this disables the preview startup and retains normal TLS validation. Browser profiles are isolated and fictional fixtures remain mandatory.

## Launch record, 2026-10-13

Deployed application source: `7b025e497822e035503bfe24074be87757549a0b`, the approved testing/documentation/hosting-notice patch on top of pinned public commit `6d830bead2c5f7750f8cf5777117af5b5e611c7b`. Static archive SHA-256: `8e0308bd68103b7d532a443095fc47a1e7b734a12935b71bcf438042f16c2fb2`; all 64 live file hashes match the approved artifact. The full suite against the live HTTPS origin passed 103 checks in isolated Chromium, Firefox, WebKit and phone-sized Chromium, with only the existing desktop-resize skip on mobile. Root/path local suites also passed 103 each. Production audit reports no known vulnerabilities; the disclosed development-only advisory remains.

HTTPS validates with a dedicated Let's Encrypt certificate expiring 11 January 2027. HTTP redirects, help/notice slash redirects, static MIME types, caching/304s, manuals/fonts/licenses and genuine 404s were checked. Access logging records IP, time, method, path without query string, status, bytes and user-agent. Error diagnostics may include URLs/referrers. Both logs rotate daily, retaining 14 archives plus current; their actual modes are 0640 www-data:adm. The renewal and rotation timers are enabled. No Ghost container or existing site configuration was changed.

The infrastructure repository records the exact server snapshot and rollback procedure. A first-release rollback preserves the isolated HTTPS origin with a maintenance response; later artifact rollback restores the previous immutable release. Asset rollback does not restore browser data. Mailbox delivery and real-user/device studies remain unverified/deferred. This follow-up changes launch documentation and adds a clean-Linux CI matrix for root and retained-path builds; it does not change the deployed artifact.

## Infrastructure attempt and rollback, 2026-10-14

Arthur approved deploying published welcome/branding commit `90c7c1fb3b88ae42363ecb2394fab90d966fa82c`. The infrastructure chat built and sealed its root artifact, SHA-256 `f524649ffd6799f4002d601ebf3386fbbd15f60829a7c6b74f20bd965fbc3e53`, and verified all 66 files after switching the static release link. HTTPS, MIME/cache/redirect/304/404 and image byte-range checks passed. Server vhost/TLS/logging policy, Ghost containers and other-site baselines were preserved.

The strict live browser run did not pass: 113 passed, 14 runtime-guard failures, one existing mobile resize skip. Traces showed image requests cancelled during scripted navigation/reload, with native Firefox image diagnostics. All PNG bytes matched the pinned source. An infrastructure-only image-readiness test copy, retaining every assertion/error check, passed 125 with two remaining Firefox `NS_BINDING_ABORTED` branding/favicon cache cancellations. A further buffering diagnostic introduced routing/teardown errors and was not accepted as application evidence. No runtime source or artwork was changed.

The infrastructure chat restored the preceding `7b025e4` release and verified all 64 old public file hashes. The welcome/branding update is therefore **not currently live**; its immutable artifact is retained for later approved work. A test-only readiness/cancellation-classification proposal awaits separate agreement before adoption/publication; no passing direct live suite is claimed. The original handoff source-change boundary remains in force. The infrastructure workspace records exact logs, proposal and rollback snapshot. This metadata follow-up changes documentation only.

## Approved test-readiness adjustment, 2026-10-14

Arthur separately approved applying/publishing the reviewed test-only proposal and repeating live acceptance. The runtime fixture waits for visible image decoding and settled transfers around scripted navigation/reload. Only Firefox `NS_BINDING_ABORTED` for the exact branding/favicon URL after successful decoding is classified as a native cancellation and attached as a diagnostic. HTTP failures, other request failures, console/page errors and image-decode failures still fail. No test assertions are removed and no app runtime, artwork, storage, dependency or hosting-policy change is included.

Typecheck, lint, 262 unit tests and the production advisory gate passed before publication. Local/browser/clean-Linux verification and a repeated deployment attempt are recorded separately when complete; this source publication does not claim the welcome update is live. The previous release remains current until those gates pass.

### Live cache-revalidation refinement

The first approved-fixture live run passed 126 with one remaining Firefox welcome-artwork flag. Explicit decoding/transfer waits were added when reopening welcome. A retained trace establishes a complete 200 image transfer followed by Firefox cancelling a redundant 304 cache validation. The test-only diagnostic classifier now requires Firefox, the exact `NS_BINDING_ABORTED` code, HTTP 304, one of the two supplied image URLs and prior successful decoding. HTTP failures, first-load/decode failures, other URLs, non-304 responses, other browsers/codes and console/page errors remain failures. Nine regression cases cover the classification boundary; 271 unit tests, typecheck and lint pass. App/runtime assets and the deployed 66-file `9b2943d` artifact are unchanged; final browser/CI acceptance is recorded when complete.
