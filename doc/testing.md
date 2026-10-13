# Testing and persona simulation protocol

Decision, 2026-10-13: use simulated persona testing for the initial release. Real-world UX recruitment is outside the available time and budget and is not a release requirement.

## Automated verification

Run `pnpm test` for deterministic generation across sensitivity, complexity, automation, capacity, and languages; warning paths and loops; explicit data approvals/stops; alternatives/restoration; German generated artifacts; backup validation and migrations.

Run `pnpm build:release`, then `pnpm test:e2e`. The suite uses isolated browser contexts against `/blueprintstudio/`, including the guided journey, storage failures, malformed imports, long German text, printing, language persistence, and exported assets. Install test browsers with `pnpm exec playwright install chromium firefox webkit`. Use `pnpm test:e2e --project=chromium` for a focused pass.

Projects cover Chromium, Firefox, WebKit, and phone-sized Chromium. The phone case uses a simulated device. WebKit automation is not evidence from a real Safari/iPhone. Desktop resizing is deliberately skipped in the stacked phone layout.

`tests/e2e/keyboard.spec.ts` exercises English/German disclosure controls (Enter, arrows, Home/End, Escape, Tab-out and outside dismissal), quick-guide/replacement dialog focus containment and return, safe initial cancel focus, disabled canvas shortcuts inside dialogs, and justified exception creation/persistence/reporting/backup/reopening. Check filters support Left/Right/Home/End; removing a warning returns focus to the selected filter. Run `pnpm test:e2e --grep 'en:|de:'` for these cases alone. This scripted coverage is not a comprehensive WCAG audit or screen-reader study.

WebKit native all-control traversal uses Option/Alt+Tab in the scripted cases; dialogs handle Tab explicitly. Safari's default Tab behavior depends on keyboard settings. See [Apple's Safari keyboard guidance](https://support.apple.com/en-gb/guide/safari/cpsh003/mac). No machine/browser preferences are changed by the tests.

`pnpm package:source` generates an allowlisted, checksummed repository candidate and dependency notices. Unit tests reject private/generated/traversal paths and common credential markers. Verify the staged candidate without a compiler cache and confirm every manifest checksum before handoff; building a package is not publication approval.

`pnpm manual:screenshots` is a separate two-case Chromium capture run, not a real-user study. It uses the fictional bilingual training fixture, verifies the intended ownership warning and its correction, and writes six screenshots per language plus dimensions. The normal suite checks screenshot dimensions/source inclusion, captions, live beta version/routes, local help image paths and static Markdown image links. Refresh and visually inspect these assets when the interface changes.

## Five scripted personas

The fixtures in `tests/fixtures/personas.ts` represent team lead, consultant, educator, product builder, and privacy/operations lead. Each has a fictional German project, risk posture, sources, ownership, and a goal from `doc/personas.md`.

Unit simulations generate and validate a workflow, detect an unsafe AI-to-output branch, repair it, create/adopt an alternative, restore previous work, and validate report/JSON continuity. Sensitive scenarios require an explicit simulated human data-approval action; approval is never generated or inherited into a new alternative draft.

Browser simulations import the fictional scenario, investigate and repair data-use warnings, make and correct an AI-owned final-decision assignment through the matrix, review German prompts/reports, export Markdown/JSON, restore the backup, and refresh. The consultant also compares/adopts/restores an alternative through the interface.

These are predefined tasks and role assumptions. They test whether controls and artifacts work. They cannot establish how an unfamiliar person interprets the interface, learns it, or feels about it. No completion-time, satisfaction, participant, or coaching statistics should be reported as real-user findings.

## Release acceptance under the simulation plan

- No failing data-loss, import-validation, storage-status, or runtime-error tests.
- All five simulated primary tasks and recovery actions pass.
- Positive and negative fixtures cover each HITM rule family, including bypasses, cycles, disconnected components, missing human owners, and explicit stopping points.
- German display/export content and user-text preservation pass.
- Production/static builds, typecheck, lint, and browser suites pass.
- Record simulation results, limitations, and unresolved release findings in the release checklist and simulation report.

Actual-user studies and real-device checks are deferred, not simulated into existence. If community feedback becomes available, add it as a separate evidence source and revise the personas accordingly.
