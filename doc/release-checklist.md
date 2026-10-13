# Public beta release checklist

Status: preparation in progress. This document tracks evidence; completed coding milestones alone are not release acceptance.

## Materials and ownership

- [x] MIT license and copyright holder: Arthur Schmidt-Pabst.
- [x] README, contribution guide, draft conduct policy, security-reporting preparation, privacy explanation.
- [x] Provisional personas and usability protocol.
- [x] Draft English/German manual and five recording outlines.
- [x] English/German manuals reviewed against the scripted task journeys; twelve actual UI screenshots use an isolated fictional training project. Images, captions, alt text and full-size links are included in local help, source and static output; no real-user records/profile were captured.
- [x] Maintainer-created public repository selected: `https://github.com/SirArthur23/blueprintstudio`. Private vulnerability reporting enabled and verified by GitHub API on 2026-10-13; no test report submitted.
- [x] Maintainer/community feedback contact configured: Arthur Schmidt-Pabst, `blueprintstudio@schmidtpabst.com`. Mailbox provisioning/delivery is not tested by the app.
- [x] Arthur approved the dedicated-origin operator/privacy/imprint notice and access-log retention; configured and verified during the 2026-10-13 launch.
- [x] Bundled font OFL notices retained; installed dependency inventory and supplied upstream license/README text included in source and static artifacts. See `doc/dependency-licenses.md` for scope and limits (486 installed name/version pairs after security refresh on this host; native tools excluded, metadata-only/absent optional references flagged).

## Verification

- [x] 2026-10-13: typecheck, lint, 192 unit tests, production and static builds passed. Exported-build browser suite: 35 passed across Chromium, Firefox, WebKit, and phone-sized Chromium; one desktop-resize case intentionally skipped on mobile.
- [x] 2026-10-13: updated verification passes: 210 unit tests, 55 browser tests across Chromium/Firefox/WebKit/phone-sized Chromium; desktop resize intentionally skipped on mobile. Typecheck, lint, production and static builds pass.
- [x] Five unit persona scenarios and 20 persona browser runs pass; evidence and findings are in `doc/simulation-report.md`. Real-user/real-device testing is deferred per the budget decision, not a release requirement.
- [x] German generated prompt/report prose, metadata, quality checks, default labels, and Markdown export implemented; custom text is preserved.
- [x] All ten source-of-truth HITM rule families implemented with graph-path checks and bilingual explanations; controls/approvals are planning declarations, not verified real-world permissions.
- [x] English/German dialog focus containment/return, safe cancellation, disclosure keys/dismissal, and exception creation/report/export/import/reopening verified in 24 keyboard browser runs. WebKit uses its native Option/Alt+Tab outside dialogs; no machine preferences changed.
- [x] 2026-10-13 final preparation pass: 229 unit tests, 83 browser tests passed; one desktop-resize test intentionally skipped on the simulated phone. Typecheck, lint, normal production/static builds and whitespace checks pass. This is scripted browser evidence, not a comprehensive accessibility certification.

## Hosting and publication

- [x] Static export and local preview prepared for `/blueprintstudio/`.
- [x] Dedicated `blueprintstudio.schmidtpabst.com` DNS and HTTPS verified on 2026-10-13; the Ghost origin is separate.
- [x] Dedicated origin, unencrypted browser storage, JSON transfers and the configured daily log rotation/retention documented and approved.
- [x] Prepared a standalone source candidate at `release/source/hitm-blueprint/` and `release/hitm-blueprint-0.1.0-source.tar.gz`, using an explicit allowlist with per-file/whole-archive SHA-256 checks. Conversation history, private material, Git history, sibling projects, dependencies and caches excluded. No Git repository or remote created.
- [x] Bilingual beta/version label, MIT attribution/license links, illustrated help and privacy-conscious feedback templates implemented and tested. Manual and source-feedback help links follow the selected language.
- [x] Maintainer-approved repository and feedback defaults configured and browser-tested, with optional build-time overrides for forks. No project data is attached to either link.
- [x] Apply the maintainer-approved compatible security update and repeat release checks. Production audit reports no known vulnerabilities; full audit retains one unpatched development-only advisory, disclosed in `doc/security-audit.md`.
- [x] Maintainer explicitly approved source publication with the residual development-tool advisory documented on 2026-10-13.
- [x] Upload the reviewed standalone source and verify remote files/blob hashes (`81a0edc`, 91 files, initial commit preserved); hosting is not included in this approval.
- [x] Verify the published source in GitHub Actions on a clean Linux runner: [run 38432478264](https://github.com/SirArthur23/blueprintstudio/actions/runs/38432478264), commit `81a0edc`, passed.
- [x] Arthur approved and the root static artifact was published on 2026-10-13. All 64 live hashes and 103 live browser checks pass (existing mobile resize skip only); see the launch record in doc/deployment.md.
- [ ] Record the five short videos after the interface/manual are stable; add captions and German/English language labels.

SQL/data-source connections are scheduled after this release and require separate design and approval.

## First-pass findings resolved

- Invalid JSON backups and alternative snapshots are rejected before project replacement.
- Corrupt browser data is preserved; storage failures no longer claim a successful local save.
- Alternative adoption keeps a restorable previous workflow/settings snapshot and never increases assistive automation.
- Menu printing opens the report first.
- The narrow-screen shell now grows vertically so the inspector remains reachable; all six tabs scroll within the inspector when needed.

German generated content and the remaining HITM rules are implemented. Initial-release validation uses the scripted persona protocol. Human sessions and real-device studies are deferred; recordings, public contacts, public-facing polish and publication remain pending. Distribution-specific license evidence is prepared with the limits below.

## Keyboard and source-package pass, 2026-10-13

- Repaired missing dialog focus containment/return, background interactivity, Escape dismissal of More/Templates, and focus loss after documenting/reopening warnings. Canvas delete/undo shortcuts are inactive inside dialogs. Check filters support keyboard arrow/Home/End navigation.
- The initial WebKit run exposed native Tab skipping buttons. Dialogs now traverse all controls explicitly; non-modal tests use WebKit's native all-controls shortcut, documented in both manuals. The full corrected browser run passes.
- License inventory collects 385 installed name/version pairs, including 127 Next compiled notices. Eighteen packages omit separate notices; ten supply README attribution/terms and eight have metadata only. There are 117 absent optional/peer references on this host. These are disclosed, not filled with invented copyright text. Native/build/test binaries are not distributed. New/unknown declared license identifiers fail packaging until reviewed.
- Source candidate includes 65 release files plus its own manifest. All file digests, exact staged file list, archive exclusions and archive digest verified. Cache-free staged TypeScript checking passes using the existing local dependency installation; a separate clean-machine install was not performed or claimed.
- Publication remains gated on contacts/security reporting, repository selection, host/privacy configuration, public beta/source/feedback details and approval. The source/static package is not permission to redistribute arbitrary third-party binaries.

## Illustrated manuals and beta presentation, 2026-10-13

- Six screenshots per language show brief, complete example workflow, a deliberate ownership warning, an unadopted privacy alternative, report summary and backup menu. The capture script corrects the intentional error before reporting and verifies that comparison did not replace current work. All examples are invented.
- Both Markdown manuals and in-app help have explanations/alt text; deployed Markdown image paths are rewritten without changing the source manuals. Source includes the images explicitly. Feedback templates send nothing and warn against sharing confidential exports or public security reports.
- Public destinations remain unchosen. Optional `NEXT_PUBLIC_BLUEPRINT_SOURCE_URL` / `NEXT_PUBLIC_BLUEPRINT_FEEDBACK_URL` accept explicit HTTPS URLs or a bare feedback mailbox, reject unsafe protocols/embedded credentials/mail queries, and never append project data. Release preparation is not publication.
- New unit/browser coverage checks image dimensions, source inclusion, fictional ownership diagnosis, safe links, version labels, language anchors, responsive help and deployed image/document paths. Final verification: 245 unit tests, 91 browser tests pass; one desktop-resize test intentionally skipped on the simulated phone. Both Chromium screenshot capture cases pass. Typecheck, lint, normal/static production builds and whitespace checks pass.
- Source candidate now contains 88 release files plus its SHA-256 manifest, including twelve PNGs. The earlier 65-file record describes the preceding package pass. No new dependencies, Git commits/remotes, publishing or hosting changes were made.

## Repository/contact setup and security hold, 2026-10-13

- Confirmed the new public repository contains only starter README/license, with an initial commit `27a6a5d`. An isolated clone is under `.publish/blueprintstudio/`, ignored and excluded from the source package. Parent workspace Git history remains untouched; no app-source commit or push has occurred.
- Added tracked public-link defaults, real email feedback links, contribution/conduct contacts and private GitHub security-reporting instructions. Default links work in English/German; the app does not send mail or provision the mailbox.
- Functional verification passes: 247 unit tests, 91 browser tests (one intentional mobile resize skip), typecheck, lint and both builds. Dependency audit nevertheless reports 3 critical/23 high/15 moderate/4 low findings in the locked production graph. Passing functional checks does not resolve those advisories.
- The verified critical Next.js advisories involve server features outside the planned static export; remaining advisories still need review/remediation. Source upload is held pending the maintainer's dependency-update/publication choice. Hosting and videos remain separate pending work.

## Compatible security refresh and verification, 2026-10-13

- Maintainer approved updating and verifying before upload. Next.js and its matching lint configuration are pinned to 16.3.8; compatible transitive dependencies and type declarations refreshed. No major ESLint/React/TypeScript migration, backend or live-AI service was added.
- Dependency downloads/installations used the ignored project-local `.pnpm-store/`, not another workspace folder or the global store. The explicit source guard now rejects that store as well as Git/private/build material.
- Production advisory check reports no known vulnerabilities. Full audit reports one high, zero critical/moderate/low: unpatched braces 3.0.3 in the Next ESLint plugin's glob tooling. No findings are suppressed. An explicit residual-risk publication choice has been requested; no app-source upload has occurred.
- Typecheck, lint, 249 unit tests, normal/static production builds, and 91 exported-build browser tests pass; one desktop-only resize test intentionally skipped on the simulated phone. Browser coverage includes both languages, fictional personas, backup/import, long German text, dialogs, help/assets and runtime errors.
- Regenerated inventory records 486 installed name/version pairs, 69 without separate notice files (50 without README terms either), and 28 absent optional/peer references. Sharp 0.35.5 combined declarations were reviewed for the source/static-only scope; supplemental README library notices are retained even when LICENSE exists. No native/WebAssembly dependency binaries are included in either distribution. These counts describe this installation, including platform packages downloaded during reinstall, not all clean-machine installations.
- GitHub CI now includes a production advisory check; remote CI cannot be verified until source publication. Hosting, legal/privacy host details and video recordings remain separate pending work.
- Prepared source package has 90 files plus its manifest; exact file-list, per-file SHA-256 and archive SHA-256 checks pass. Cache-free staged typechecking passes against the existing installation; no clean-machine installation is claimed. The isolated publishing clone remains clean at the maintainer's initial commit.

## Source publication approval, 2026-10-13

- Maintainer explicitly chose “Upload with documented limitation” after the clean production audit and disclosure of the remaining development-only advisory. The source security record and README retain the warning; no audit finding is suppressed.
- Approved scope is the reviewed standalone source in `SirArthur23/blueprintstudio`, preserving its initial commit and excluding parent workspace history/private material. Hosted deployment remains separately pending.

## Source publication, 2026-10-13

- Published reviewed source as `81a0edc` to the existing public repository, preserving `27a6a5d` without a force push. Exact remote file list and all Git blob hashes match the reviewed snapshot: 90 files plus its manifest. Binaries included are only the reviewed fonts and fictional manual screenshots, not dependency/build tooling.
- Private GitHub vulnerability reporting remains enabled. Production advisory gate, builds and checks run through the included GitHub workflow; its result is recorded separately from local verification.
- Source packaging manifest status now describes a prepared snapshot without claiming that the repository is unpublished. The packager itself still performs no publication.
- Only the isolated project-local checkout was committed/pushed; the surrounding workspace repository and private history are untouched. No hosted deployment, release tag, GitHub Release or video recording was created.
- Clean Linux GitHub verification passed: frozen-lockfile installation, production advisory check, typecheck, lint, 249 unit tests, normal/static builds, 91 browser tests (one intentional mobile resize skip) and source packaging. Linux inventory recorded 389 installed name/version pairs, 22 without separate notices (11 without README terms either), and 114 absent optional/peer references; platform-dependent counts differ from the local reinstall as disclosed. This is independent clean-runner evidence, not just reuse of the local dependency installation. The source workflow performs no hosting deployment.

## Dedicated-origin preparation, 2026-10-13

Planned URL: `https://blueprintstudio.schmidtpabst.com/`. Prepared in a permitted clean checkout based on public commit `6d830bead2c5f7750f8cf5777117af5b5e611c7b`, with a disclosed local testing/documentation/hosting-notice patch. Node 22.22.1 and project-selected pnpm 10.0.0. Frozen install, fresh production audit (no known findings), typecheck, lint, 249 unit tests and ordinary/static production builds pass. The expanded browser suite passes at both root and `/blueprintstudio/`: 103 passed per build, with only the existing phone-viewport desktop-resize skip. Each suite uses isolated fictional projects and checks runtime/console/network errors, same-origin static traffic, EN/DE, long text, governance, alternatives/restoration, JSON backups, persistence, help/notices, MIME types and genuine unknown-path 404s. The original retained-path 91-test suite also passed before expansion.

The verified root `out/` artifact was preserved before the separate path regression build. Hosting is not deployed: DNS points to IONOS parking and TLS fails. Operator/logging/privacy notice, isolated vhost, certificate, artifact/configuration rollback and DNS changes require Arthur's approval in the infrastructure session. The original published README still names the old path; the updated source patch is prepared locally and has not been pushed. No owner browser profile or private records were used. Feedback delivery remains unverified, real-user/device work remains deferred, videos remain outlines and SQL is post-release.

## Hosted launch, 2026-10-13

The approved dedicated-origin beta is live at `https://blueprintstudio.schmidtpabst.com/`. Deployed application commit `7b025e497822e035503bfe24074be87757549a0b` and artifact SHA-256 `8e0308bd68103b7d532a443095fc47a1e7b734a12935b71bcf438042f16c2fb2` are recorded in doc/deployment.md. Live HTTPS validation, MIME/caching/304/404 checks, all 64 file hashes, and 103 isolated fictional-project browser checks passed. No private records or owner's browser profile were used. Source launch URL/privacy/testing updates were approved and published. The following CI matrix retains path coverage and adds root coverage on clean Linux; its result is separately verified rather than assumed. Prior preparation entries above record the state at their dates, not current unresolved infrastructure tasks.
