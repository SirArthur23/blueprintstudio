# Persona simulation report

Date: 2026-10-13. Scope: five fictional scenarios using deterministic unit tests and actual browser controls against the static `/blueprintstudio/` export. No people were recruited and no real-user understanding, confidence, timing, or satisfaction was measured.

## Scenario outcomes

| Simulated role | Priority exercised | Scripted outcome |
| --- | --- | --- |
| Small-team lead | Internal team workflow, ownership, German handoff | Generated workflow passes structural checks; an AI final-owner mistake triggers a German warning; corrected ownership, Markdown export, and restored JSON pass. |
| Consultant | Confidential sources, alternatives, recovery | Sensitive data starts unreviewed; an explicit approval clears that warning. A new privacy alternative does not inherit approval. The browser adopts/restores the previous plan and exports/restores German artifacts. |
| Educator | Public fictional material and human decisions | A mistaken AI decision owner is diagnosed and corrected through the matrix. The unit simulation also detects an unsafe AI-to-output branch. German prompt boundaries and restored reports pass. |
| Product builder | Complex automated design with escalation/audit | The generated forward paths include accountable gate, escalation, and audit nodes. Unsafe final ownership triggers a warning. Separate rule fixtures cover actual tool gate bypasses and missing change-control placement. |
| Privacy/operations lead | Sensitive-data boundary and evidence | Missing data-use approval blocks a clear check state. Approval is explicitly recorded, survives export/reload, and is not silently carried into a newly generated alternative. |

All five unit persona scenarios and all 20 persona browser runs passed (five roles × Chromium, Firefox, WebKit, and phone-sized Chromium). The companion suite covers the general guided journey, import rejection, storage errors, long German text, printing, assets, and inspector resizing. Final verification totals are recorded in the release checklist.

## Findings and changes

- Sensitive-data paths previously had no explicit node-level approval declaration. AI/tool inspectors now distinguish unreviewed, approved, and rejected data use; generation never grants it.
- Existence-only governance could miss an unrelated audit/escalation node or an ungated entry into an automated action. Graph checks now inspect the affected paths and bypasses, including cycles.
- A human role such as “AI lead” must not be confused with an AI-system owner; recognition is limited to common AI/tool labels. Identity and real permissions are not verified.
- The two sensitive browser scenarios initially timed out on exact label selection because the dropdown label included option text in the automation lookup. Adding an explicit accessible label made the approval control unambiguous; both scenarios then passed in all four configurations.
- German prompts, their quality checks, reports, fallbacks, and Markdown exports are tested independently of the English output. Custom project text and stored snapshots remain intact.

## Limits and deferred evidence

The scripts are written by the same development process that implements the product. Their predefined actions cannot prove that a newcomer would discover those actions or interpret the controls correctly. Persona descriptions remain assumptions. The main workflow is selected as the largest connected component; separated components may be intentional and need review or a documented exception.

The checks examine a planning graph and declarations. They cannot inspect real source records, authenticate approvers, execute an audit log, or verify actual tool permissions. Human studies, physical-phone checks, and real screen-reader sessions are deferred under the current time/budget decision, not represented as passed simulations.
