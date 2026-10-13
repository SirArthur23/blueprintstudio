# HITM Blueprint Studio: Source of Truth

Last updated: 2026-10-13

## Purpose

**HITM Blueprint Studio** is a deterministic planning tool for anyone designing an AI-assisted project with the Human-in-the-Middle approach.

It helps a project owner turn a rough AI idea into a concrete HITM blueprint: what is being built, who it serves, where AI may assist, what humans must control, where approval gates sit, which workflow pattern fits the situation, and what starter prompts can safely begin the work.

This is not a tool that claims to know the "best stack" or the "right" AI architecture. It is a structured design studio that presents transparent patterns, tradeoffs, governance gates, and report-ready planning artifacts.

## Product Position

HITM Blueprint Studio is the general-purpose HITM design studio.

It is related to `HITM_NGO`, but it is not the same product:

- `HITM_NGO` is the civic case-file product for NGOs and civil-society organisations evaluating AI adoption decisions.
- `HITM_Blueprint` is the general-purpose planning studio for founders, consultants, educators, internal teams, product builders, researchers, and organisations designing AI-assisted projects.

Both products share the same philosophy: human judgment stays in the middle. They should feel friendly, warm, easy to use, and professional. They should not look identical or very similar.

## Core Flow

The app should guide users through the following flow.

### 1. Project Intake

The user describes:

- What they are building
- Who it is for
- What AI should help with
- What AI must not decide
- What humans must keep control over
- What data, context, or source material is involved
- What level of risk, sensitivity, and operational complexity is present

### 2. HITM Ownership Model

The app helps define ownership for:

- Goal
- Prompts
- Data
- Source material
- Review process
- Governance gates
- Deployment
- Updates
- Model or tool changes
- Final decisions

This should become an ownership matrix in the final report.

### 3. Governance Gates

The app defines approval points, especially:

- Before generation
- Before publishing
- Before sending to users
- Before automation
- Before model or tool changes
- Before deployment
- Before using sensitive data
- Before removing human review

The gates should be explicit, readable, and connected to the workflow blueprint.

### 4. Workflow Blueprint

The user produces a clear HITM process map:

- Human input
- AI assistance
- Review loops
- Escalation points
- Approval gates
- Audit trail
- Output handoff
- Deployment or publishing step

This is where the infinite canvas becomes central.

### 5. Software Stack Guide

The app deterministically suggests stack patterns with tradeoffs. It must not pretend to know the universal best stack.

The guide should present patterns such as:

- Fast prototype path
- Simple no-code path
- Local-first privacy path
- Self-hosted sovereignty path
- API-based product path
- RAG/document workflow path
- Agent workflow path
- Team workflow path
- Canvas/knowledge workflow path

Every pattern should include:

- When it fits
- What it gives you
- What it costs in complexity
- Where human review must stay active
- Common failure modes
- What to avoid

### 6. Starter Prompts

The app generates first prompts for:

- Role definition
- Context gathering
- Source-grounded work
- Review criteria
- Critique
- Red-team checks
- Escalation
- Final approval

These prompts are starter material, not magic answers. The report should make clear that prompts remain under human ownership and should evolve with the project.

### 7. Infinite Canvas

The canvas is the differentiator.

It must be a genuine workflow-building environment, not merely a prebuilt HITM diagram with movable cards. The current example diagram belongs in the template and demo system. It must not be the default contents of a new blank blueprint.

#### Canvas Starting Paths

Users should have three explicit starting paths:

1. **Blank canvas**
   Starts with no nodes or connections. This is for users who already understand their process or want to think spatially from scratch.
2. **Generate from intake**
   The deterministic engine converts the project intake, ownership choices, and governance gates into a first draft workflow. This should be the primary guided path.
3. **Use a template**
   Starts with an editable workflow pattern such as document review, content publishing, RAG/document workflow, agent workflow, customer support, or the HITM reference workflow.

The existing example workflow should become the **HITM reference workflow** template. The **Demo** action should continue to load a complete example project. The **Blank** action must create a truly empty canvas.

#### Canvas Node Types

The node library should include:

- Human action
- AI assistance
- Review
- Approval gate
- Decision
- Data or source
- Tool or system
- Escalation
- Audit event
- Output

Each node should support:

- Title and description
- Human owner
- AI role, where applicable
- Inputs and outputs
- Approval criteria
- Escalation destination
- Audit requirement
- Optional notes for the final report

Node numbering should represent readable workflow order, not the visual type or color of the node. Branches and loops should remain understandable through connection labels and flow direction rather than misleading type-based numbers.

#### Canvas Connections

Connections must be functional workflow objects, not only decorative lines.

The connection system should support:

- Normal sequence
- Feedback loop
- Escalation
- Data flow
- Approval branch
- Rejection or revision branch

The basic interaction should be:

1. Activate Connect mode.
2. Select a source node.
3. Select a destination node.
4. Choose or confirm the connection type.
5. Optionally add a visible label such as "Approved", "Needs revision", or "Escalate".

Connections should be selectable, editable, and removable. Direction and meaning must remain clear after nodes are moved.

#### Core Canvas Controls

The canvas should provide:

- Select and drag
- Pan
- Zoom in and out
- Fit workflow
- Add node menu
- Connect mode
- Delete selected object
- Undo and redo
- Reset view
- Template or draft generation action

Panning, zooming, node movement, and node creation must work across the full canvas rather than inside a small hidden coordinate rectangle.

Users should be able to:

- Visualize the HITM workflow
- Create a mind map
- Drag nodes around
- Connect roles, tools, gates, data, reviews, and outputs
- Mark human-only decisions
- Mark AI-assisted steps
- Add escalation paths
- Add audit trail points
- Turn the canvas into a report section

The canvas should be stored locally as part of the blueprint file and exported into the final report.

#### HITM Canvas Checks

The canvas must provide deterministic HITM checks that distinguish the product from a generic diagram editor.

The checks should identify conditions such as:

- AI produces an external output without human review.
- A final decision is assigned to AI.
- Sensitive data enters an unapproved tool or service.
- An automated action has no governance gate.
- A consequential node has no accountable human owner.
- A model, prompt, provider, or tool change has no approval point.
- A high-risk path has no escalation route.
- A consequential decision has no audit event.
- A workflow branch ends without an output, owner, or explicit stop.
- A node or sub-flow is disconnected from the main workflow.

Checks should be transparent and actionable. They should explain which workflow structure triggered the warning and what human decision or governance control is missing. Users may resolve a warning or explicitly document a justified exception.

#### Canvas-To-Report Relationship

The canvas is not an isolated drawing surface. It should feed:

- Workflow blueprint section
- Ownership matrix
- Governance gate list
- Escalation summary
- Audit trail design
- Suggested stack patterns
- Starter prompt context
- Final HITM diagram or canvas snapshot

Changes made on the canvas should update these report sections where the data relationship is explicit.

#### Intended Canvas Product Flow

1. Complete or partially complete project intake.
2. Define human ownership and required gates.
3. Choose Blank, Generate from intake, or Template.
4. Build or edit the workflow on the canvas.
5. Run deterministic HITM checks.
6. Resolve warnings or document exceptions.
7. Approve the workflow for inclusion in the report.

Once a canvas exists, the left-side workspace should be able to switch between:

- Project intake
- Node library
- Workflow or layer list
- HITM checks

This prevents the intake form from permanently competing with the canvas for space.

#### Canvas Terminology

- **Blank** means a genuinely empty canvas.
- **Generate draft** creates a deterministic first workflow from structured intake data.
- **Templates** opens the workflow-pattern library.
- **Demo** loads the complete demonstration project.
- **HITM reference workflow** is the current prebuilt example diagram, available as a template rather than the default blank state.

### 8. Final HITM Blueprint Report

The output is a polished, practical planning document:

- Project summary
- HITM diagram or canvas snapshot
- Ownership matrix
- Governance gates
- Workflow blueprint
- Suggested stack patterns with tradeoffs
- Prompt pack
- Next steps
- Optional services or support route

The report should be useful as a free artifact and naturally show where someone may want help without becoming a disguised sales funnel.

## Why This Product Exists

HITM Blueprint Studio solves three things at once.

### Teaching Tool

It explains HITM by making people apply it. Users learn the framework by designing a real project, not by reading a manifesto.

### Portfolio Piece

It shows the Human-in-the-Middle framework, design taste, product thinking, and implementation style in a concrete usable interface.

### Lead Magnet

It is useful for free, but it naturally reveals where someone may need help: workflow design, local-first setup, self-hosting, RAG architecture, agent design, governance, prompt systems, or implementation support.

The product must remain commercially honest. Recommendations should be based on the user's stated situation, not on pushing paid help.

## Relationship To HITM_NGO

`HITM_NGO` is a read-only reference for this project. We may copy and adapt from it into `HITM_Blueprint`, but we must not write to the `HITM_NGO` path.

Reusable bones from `HITM_NGO`:

- Next.js, React, TypeScript, Tailwind app shell
- Local-first state model using local storage
- Typed case-file style data model
- Deterministic recommendation logic
- Workflow progress spine
- Human approval gate pattern
- Printable final document pattern
- JSON export pattern
- Friendly guided flow with professional language

Parts that should be replaced or heavily adapted:

- NGO-specific profile fields
- Civic case-file language
- NGO setup path logic
- NGO agent identities
- Civic desk visual system
- NGO report content
- Tutorial route content

New parts needed for `HITM_Blueprint`:

- General-purpose project intake model
- Ownership matrix model
- Governance gate library
- Stack pattern guide
- Starter prompt pack generator
- Infinite canvas with draggable nodes and connections
- Canvas-to-report section

## Architecture Direction

The first version should stay frontend-local and deterministic.

Suggested structure:

- `src/lib/blueprint-data.ts`
- `src/lib/blueprint-engine.ts`
- `src/components/blueprint-studio.tsx`
- `src/components/blueprint-canvas.tsx`
- `src/components/blueprint-report.tsx`
- `src/components/starter-prompts.tsx`

The deterministic engine should handle:

- Completion checks
- Stack pattern recommendations
- Gate recommendations
- Ownership matrix defaults
- Draft canvas generation from intake
- Canvas structure validation
- HITM workflow warnings and exception records
- Prompt pack generation
- Report data assembly

The app should be useful without any connected AI model.

## Design Direction

HITM Blueprint Studio should not be identical or very similar to `HITM_NGO`.

Shared feel:

- Easy to use
- Friendly
- Warm
- Professional
- Trustworthy
- Calm rather than flashy
- Serious when decisions, risk, data, and governance are involved

Distinct visual direction:

- Use different colors from `HITM_NGO`
- Use different fonts
- Use a slightly different layout
- Avoid the civic file desk / official stamp look as the main visual identity
- Keep the interface more like a studio, map room, or planning table
- Make the infinite canvas feel central, not like an add-on

Possible design language:

- Blueprint paper, planning surface, studio tools, clear process lines
- Warm neutrals balanced with distinct accent colors
- Tool-like controls rather than decorative cards
- Dense enough for serious planning, but not intimidating
- Clear separation between intake, canvas, matrix, stack guide, prompts, and report

Important constraint:

The product may share a family resemblance with `HITM_NGO`, but users should immediately understand that this is a different tool for a different audience.

## Roadmap

### Milestone 1: Project Foundation

Goal: Create the standalone `HITM_Blueprint` app without touching `HITM_NGO`.

Work:

- Copy the safe app scaffold from `HITM_NGO`
- Exclude `.next`, `node_modules`, `.DS_Store`, and old NGO-specific docs
- Rename package, metadata, app shell, and storage keys
- Create the core Blueprint data model
- Create first global design tokens distinct from `HITM_NGO`

Success criteria:

- App runs locally
- No writes to `HITM_NGO`
- First screen clearly says HITM Blueprint Studio
- Visual identity is already distinct

### Milestone 2: Deterministic Blueprint Flow

Goal: Implement the main planning flow.

Work:

- Project intake form
- HITM ownership model
- Governance gate selection
- Workflow step completion logic
- Deterministic stack pattern recommendation
- Local storage persistence
- Reset, demo, and blank blueprint states

Success criteria:

- User can create a complete blueprint without an AI model
- Stack guide presents patterns and tradeoffs, not a single "best" stack
- Governance gates are explicit and report-ready

### Milestone 3: Blank Canvas And Connections

Goal: Establish the canvas as a real workflow-building tool before automating its contents.

Status: Completed on 2026-06-18.

Implemented:

- Blank now creates and persists a genuinely empty canvas.
- The left workspace switches between Project, Nodes, and Workflow panels.
- The node library includes all agreed HITM node types.
- Connect mode creates typed, directed connections with optional visible labels.
- Nodes and connections are selectable, editable, and removable.
- Node deletion also removes its attached connections.
- Undo and redo cover canvas creation, movement, connection, deletion, and template actions.
- Reset view, fit workflow, pan, zoom, and zoom-aware dragging work across the 7000 x 5000 canvas.
- The previous example workflow is available as the HITM reference workflow template.
- Canvas state persists locally with migration support for the previous storage format.

Work:

- Make Blank create an empty canvas
- Add a node library with the agreed HITM node types
- Add draggable nodes
- Add functional Connect mode with source and destination selection
- Add connection types and editable labels
- Add selection and deletion for nodes and connections
- Keep pan, zoom, fit, and node creation working across the full canvas
- Add undo, redo, and reset-view controls
- Store canvas state in the blueprint file

Success criteria:

- Blank canvas contains no prebuilt nodes
- User can build a workflow from scratch
- Nodes and connections can be created, edited, moved, and removed
- Workflow order and branch direction are readable
- Canvas state persists locally
- The current HITM diagram is available as a template, not as the blank state

### Milestone 4: Guided Canvas Generation And HITM Checks

Goal: Turn structured project decisions into a useful draft workflow and validate it deterministically.

Status: Completed on 2026-06-26.

Work:

- Add Blank, Generate from intake, and Templates starting paths
- Add the HITM reference workflow template
- Add initial workflow templates for document review, publishing, RAG, agents, and support
- Generate draft nodes and connections from intake, ownership, and governance gates
- Add deterministic HITM canvas checks
- Add warning resolution and documented exceptions
- Connect canvas data to ownership, governance, prompts, and report sections

Implemented:

- Added a persisted v5 blueprint schema for warning resolutions, with migration support for v4 and v3 local files.
- Added a deterministic Generate from intake path that creates human intake, source/data, AI assistance, review, approval, decision, output, audit, escalation, and change-gate nodes based on intake and governance settings.
- Added workflow templates for document review, publishing, RAG/knowledge workflows, agent workflows, and support triage, in addition to the HITM reference workflow.
- Added deterministic HITM checks for empty workflows, missing AI control points, AI-to-output paths without human control, missing approval paths, missing decision fallbacks, automated workflows without approval branches, sensitive/internal data handling gaps, required gates absent from the canvas, tool-change governance gaps, and missing audit trails.
- Added a Checks tab with open/resolved/exception states and required exception notes before documenting an exception.
- Connected canvas ownership into the ownership matrix, canvas workflow steps into starter prompts, and workflow connections plus warning status into the report.
- Verified generated and template workflows remain editable through the existing canvas selection, inspector, connection, deletion, undo/redo, pan, and zoom controls.

Success criteria:

- A beginner can move from intake to a credible first workflow without drawing everything manually
- Generated workflows remain editable
- HITM warnings explain the triggering structure and missing control
- The tool does not silently make governance decisions for the user

### Milestone 5: Prompt Pack

Goal: Generate useful starter prompts from the structured blueprint.

Status: Completed on 2026-06-26.

Work:

- Role definition prompt
- Context gathering prompt
- Review criteria prompt
- Critique prompt
- Red-team prompt
- Escalation prompt
- Final approval prompt

Implemented:

- Upgraded starter prompts into a deterministic prompt-pack model with prompt IDs, purpose, owner, when-to-use guidance, required inputs, expected output, prompt text, and quality checks.
- Added all seven prompt types: role definition, context gathering, review criteria, critique, red-team check, escalation, and final approval.
- Connected prompt content to project intake, source material, ownership matrix, required governance gates, workflow canvas nodes, open warnings, and documented exceptions.
- Added per-prompt quality checks for human ownership, decision boundary, source boundary, approval boundary, escalation boundary when required, and missing blueprint owner/source data.
- Added copy-per-prompt, copy-full-pack, and Markdown export controls.
- Added explicit language that prompts are starter material and do not give AI approval, final-decision, exception, publication, deployment, or governance authority.

Success criteria:

- Prompts reflect the project intake, ownership, gates, and workflow
- Prompts do not imply that AI owns decisions
- Prompts are clearly starter material for human-owned workflows

### Milestone 6: Final HITM Blueprint Report

Goal: Produce a polished report artifact.

Status: Completed on 2026-06-26.

Work:

- Project summary
- Ownership matrix
- Governance gates
- Workflow blueprint section
- Canvas summary or diagram
- Stack pattern guide
- Prompt pack
- Next steps
- Optional services section
- Print styling
- JSON export

Implemented:

- Made `Continue` and `Save & Continue` context-aware: empty canvases generate from intake, generated workflows move to checks, open warnings route to the Checks tab, clean workflows advance to Prompts, prompt review advances to Report, and Report continue triggers print.
- Made the stepper reflect the current stage instead of always highlighting workflow.
- Expanded the report data model with project boundaries, risk posture, ownership details, governance gate details, workflow node/edge details, stack pattern guidance, warning status, prompt-pack summary, next steps, and optional support language.
- Added a polished report UI with project summary, ownership matrix, governance gates, workflow blueprint, workflow connections, stack guide, warning status, prompt pack, next steps, and optional support sections.
- Added report-level Markdown export and preserved local JSON export.
- Added print-specific styling so the report prints as a document and hides interactive controls.
- Kept optional services present but explicitly non-coercive.

Success criteria:

- Report reads like a professional planning document
- Report is printable
- Report can be exported as local JSON
- Optional services are present but not coercive

### Milestone 7: Polish And Verification

Goal: Make the app feel production-worthy as a portfolio piece.

Work:

- Responsive layout pass
- Canvas usability pass
- Copy pass
- Accessibility pass
- Empty states
- Demo blueprint
- Lint, typecheck, and production build
- Browser verification

Success criteria:

- App feels complete enough to show
- No layout overlap on desktop or mobile
- The design is distinct from `HITM_NGO`
- The core flow is understandable without explanation text overload

Status: Completed 2026-08-18.

Implemented:

- Made the top Continue action context-aware with labels that describe the next action: generate, review checks, open prompts, open report, or print.
- Converted the flow stepper and side rail from passive controls into working navigation.
- Added accessible labels, selected tab state, pressed state, and clearer keyboard/canvas affordances.
- Added a canvas status strip with node count, connection count, check status, selected item, and core shortcuts.
- Improved empty workflow states with direct generate and add-node actions.
- Tightened mobile layout so the studio stacks rail, intake, canvas, and inspector without horizontal page overflow.
- Constrained the desktop shell to the viewport so long reports scroll in the inspector instead of stretching the canvas.
- Verified lint, typecheck, production build, whitespace, and browser smoke coverage.

### Milestone 7.5: Calm Workspace

Goal: Keep the full planning capability while making the default laptop workspace feel focused and approachable.

Status: Completed 2026-08-18.

Implemented:

- Reduced the persistent header to Project brief, More, and the context-aware next action; demo, reset, generation, export, and print remain available under More.
- Made the project brief collapsible and collapsed by default, giving the workflow canvas the visual priority.
- Reduced the flow navigation to a compact progress strip and removed the redundant permanent left navigation rail.
- Quieted supporting UI: condensed canvas status, tighter controls, and governance gates now open on demand in the inspector.
- Verified the focused layout at a 1440px laptop viewport and the responsive layout at a 390px mobile viewport with no horizontal overflow.

### Milestone 8: Guided Project Progression

Goal: Turn the six planning stages into a clear, one-decision-at-a-time path through the blueprint.

Status: Completed 2026-08-18.

Implemented:

- Made the primary next-action button advance through context, workflow, ownership, governance, validation, prompt pack, and report in order.
- Connected each stage to its relevant workspace: project brief, canvas, ownership matrix, expanded governance gates, HITM checks, prompts, and report.
- Kept the stage selection coherent when users navigate through the workspace tabs directly.
- Changed generated and template workflows to land in Map Workflow, where users can inspect and edit the draft before validating it.

### Milestone 8.5: Resizable Inspector

Goal: Keep detailed workspace views usable when their content needs more room.

Status: Completed 2026-08-18.

Implemented:

- Added a draggable left-edge resize handle for the inspector on desktop layouts.
- Added keyboard resizing: focus the handle and use Left/Right arrows, Home, or End.
- Kept the workflow canvas fluid as the inspector grows or shrinks.
- Constrained ownership-matrix content to the inspector and made genuinely wide matrix data scroll within its own viewport.

### Milestone 9: Local Project Continuity

Goal: Make it clear that project work is retained locally and portable without adding accounts or a backend.

Status: Completed 2026-08-18.

Implemented:

- Added a visible local-save status beneath the active project name.
- Added Import blueprint to the More menu.
- Imports accept Blueprint Studio JSON exports (and direct blueprint JSON), validate the expected shape, and restore the result to the editable workflow.
- Kept the export/import workflow entirely local to the browser.

### Milestone 10: Adaptive Canvas Controls

Goal: Preserve full canvas capability on phones without making the workspace feel like a wall of controls.

Status: Completed 2026-08-18.

Implemented:

- Kept Add node, Connect, Templates, and a Canvas controls reveal visible on small screens.
- Moved undo, redo, delete, zoom, reset, and fit into the expandable Canvas controls row on small screens only.
- Simplified the mobile canvas status strip to the essential workflow and check information.
- Verified the compact state at 390px wide: no horizontal overflow and a materially shorter toolbar, with all secondary controls available on demand.

### Milestone 11: In-Product Guidance

Goal: Help a first-time user understand the Studio without adding permanent instructional clutter.

Status: Completed 2026-08-18.

Implemented:

- Added a concise Quick guide under More.
- Explained the four essential phases: describe, map, assign ownership/gates, and check/document/share.
- Made each guide item a direct path into the relevant stage.
- Kept the guide dismissible by clicking outside or pressing Escape.

### Milestone 12: Safer Project Resets

Goal: Prevent an accidental replacement of the active locally saved project.

Status: Completed 2026-08-18.

Implemented:

- Added a confirmation dialog before loading the demo project or starting blank.
- Clearly explains that the current local blueprint will be replaced and points to JSON export for a backup.
- Provides cancel, close, and Escape routes without changing the project.

### Milestone 13: Handoff Readiness

Goal: Give report readers an immediate, reliable view of what is ready and what needs attention before sharing.

Status: Completed 2026-08-18.

Implemented:

- Added a concise handoff overview to the final report.
- Summarizes completion, workflow structure, open deterministic checks, and required governance gates.
- Uses a conservative Ready to share state only for complete blueprints with a workflow and no open warnings.

### Milestone 14: Faster Report Handoff

Goal: Make it easy to carry the complete report into another document or collaboration channel.

Status: Completed 2026-08-18.

Implemented:

- Added Copy report beside Markdown export and print.
- Copies the complete report Markdown to the clipboard.
- Provides a visible success confirmation or a clear browser-availability message.

### Milestone 15: Focused HITM Review

Goal: Let reviewers focus on what needs action without losing resolved and exception history.

Status: Completed 2026-08-18.

Implemented:

- Added filters for open, resolved, exception, and all HITM checks.
- Defaults the review view to open warnings when checks exist.
- Keeps clear empty states for workflows with no active warnings.

### Milestone 16: Persistent Workspace Preferences

Goal: Let the workspace retain a reviewer’s chosen inspector width across visits without introducing accounts or cloud state.

Status: Completed 2026-08-18.

Implemented:

- Stores the desktop inspector width locally after a user resizes it.
- Restores that preference after the workspace is safely hydrated.
- Clamps the saved width to the available space when the browser window changes size.

### Milestone 17: Clearer Local Artifacts

Goal: Make exported files understandable and distinguish a portable project backup from final handoff formats.

Status: Completed 2026-08-18.

Implemented:

- Renamed Export JSON to Export backup (JSON).
- Uses a clean project-name stem in JSON backup, prompt-pack, and report Markdown filenames.
- Updated reset guidance to point to a JSON backup in plain language.

### Milestone 18: Calmer Project Brief

Goal: Keep the project intake approachable while retaining the detail needed for responsible HITM design.

Status: Completed 2026-08-18.

Implemented:

- Leads with project name, audience, and intended outcome.
- Keeps draft, blank, and template starting paths immediately available.
- Groups AI boundaries, human control, source material, and operating settings under a clear Operating details disclosure.

### Milestone 19: Final Acceptance

Goal: Confirm that the completed V1 is reliable, contained, and comfortable to use across desktop and phone-sized screens.

Status: Completed 2026-08-18.

Verified:

- Type checking, linting, production build, and whitespace validation pass.
- The desktop workspace remains within its viewport; the quick guide, project brief, and stage navigation work as expected.
- The phone-sized workspace has no horizontal page overflow, and compact canvas controls expand on demand.
- A fresh browser-console review is clear of application errors.

### Milestone 20: Bilingual Workspace

Goal: Let English- and German-speaking teams use the studio comfortably now, with a clear foundation for additional languages later.

Status: Completed 2026-08-26.

Implemented:

- Added an accessible English/Deutsch switcher in the header.
- Localized the guided flow, project intake, canvas controls, inspector, checks, prompt-pack UI, and report interface.
- Localized node and connection libraries, stack-path guidance, and deterministic HITM warning status for German use.
- Localized the template menu and every template's node, owner, detail, and connection-label copy when it is applied in German.
- Expanded canvas cards and bounded title, detail, and owner-chip text so long localized or user-entered values never spill beyond a card.
- Stores the selected language locally and restores it safely after refresh without a hydration mismatch.
- Centralized interface text in `src/lib/i18n.ts` so future languages can be added without rewriting the workspace.

### Milestone 21: Explainable Alternatives

Goal: Make the studio semi-smart in a transparent, human-controlled way by helping teams explore credible alternative blueprint designs.

Status: Completed 2026-10-12.

Scope:

- Let a user create explicit alternatives such as a privacy-first plan, a stronger-human-review plan, or a small-team plan.
- Keep alternatives editable, visibly distinct from the current blueprint, and easy to compare before adopting.
- Explain every suggested change in terms of the project intake, risk posture, ownership, and governance rules that caused it.
- Preserve the local-first, deterministic product model: the user remains in control and no recommendation becomes an automatic decision.

Implemented:

- Added a local, versioned alternative-snapshot model with migration support for existing v5, v4, and v3 browser data.
- Added three explicit deterministic starting alternatives: privacy-first, stronger human review, and small team.
- Each alternative records its generated workflow, gates, ownership, operating settings, a plain-language rationale, and a visible list of rule-based changes.
- Added an Alternatives inspector view that compares the option's sensitivity, automation, and team capacity with the current blueprint before adoption.
- Creating an alternative never changes the current blueprint. Adoption is an explicit action; it makes the selected snapshot the normal editable canvas while retaining the saved option for later comparison.
- Localized the M21 controls and explanations for English and German.

Release-preparation hardening on 2026-10-13:

- Alternative adoption preserves the previous working workflow/settings as a restorable snapshot; snapshots do not nest the alternative collection.
- Alternatives never increase an assistive workflow's automation. The stronger-review option always includes an escalation path.
- Change lists disclose draft regeneration, custom-step replacement, and reevaluation of warning resolutions; rationale includes the actual starting settings and names scenario assumptions.

### Future Direction: Optional SQL and Data-Source Module

For projects that genuinely rely on structured operational data, Blueprint Studio may later offer an optional data-source module. It is not part of the core planning experience or V1.

- It may support local files and, only after separate approval, carefully governed database connections.
- It should help users inspect a schema, identify likely sensitive fields, and translate those findings into data boundaries, ownership, review gates, and audit requirements in the blueprint.
- SQL should be inspectable and available to advanced users, but never required: non-technical users should work through clear, visual controls and explanations.
- Any future connection or query capability must be read-only by default, transparent, securely scoped, and designed around data minimization, credentials safety, and human approval.

## Public Release Plan

Blueprint Studio is intended to be released free and open source under the MIT License. The optional SQL/data-source module follows the initial public release, after real usage feedback has established where structured-data support adds value.

### Release Position

- Host the public app at `ai.schmidtpabst.com/blueprintstudio` as a useful community resource and a portfolio demonstration.
- Keep the hosted experience local-first: no account, telemetry, AI API call, server-side project storage, or required external service.
- Begin as a clearly labelled public beta, then decide on a 1.0 release after representative testing and feedback.
- Before publishing the license, confirm the copyright-holder name and add a separate brand/trademark note if the product name or logo should not be freely reused.

Copyright holder confirmed on 2026-10-13: Arthur Schmidt-Pabst. MIT license and package metadata are now present; no separate trademark restriction has been adopted.

### Release Materials

- Add `LICENSE` (MIT), `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and a concise privacy statement.
- The README and manual should explain: what the studio does and does not decide; first blueprint in ten minutes; blank/generate/template starting paths; workflow and governance editing; HITM checks and exceptions; alternatives; backup/export/import; local-data behaviour; and known limitations.
- Create short task-led screen recordings after the scripted persona checks: product overview; first blueprint; canvas/ownership/gates; checks and alternatives; backup, restore, and local-first privacy.

### Intended Users And Validation

Create concise personas and simulate their primary tasks before finalising documentation or promotional copy:

- Small-team lead introducing AI into an internal workflow.
- Independent consultant designing an AI-assisted service for a client.
- Educator or facilitator teaching responsible AI use.
- Founder or product builder mapping an AI feature before implementation.
- Privacy-conscious operations or compliance lead.

Each persona states its trigger, desired outcome, technical confidence, concerns, and first successful task. Decision on 2026-10-13: real-world UX testing is outside the available money/time budget. The initial release uses scripted simulations of all five personas, with separate unit and browser evidence. These are role assumptions and technical task tests, not interviews or measurements of actual user understanding. Community feedback can be added later; real-user recruitment is not a release gate.

### Release Quality Gate

Add automated coverage before public release for:

- Deterministic workflow generation across risk, automation, and capacity settings.
- HITM warnings, resolutions, documented exceptions, and alternative creation/adoption.
- JSON export/import, malformed-file handling, and browser-storage migration.
- English/German content, long localized text, keyboard use, resize behaviour, and responsive layouts.
- The essential browser journey: intake or template → workflow → checks → prompts → report → backup/export/import.

Run automated checks in Chromium, Firefox, WebKit, and phone-sized Chromium for local storage, print/report behavior, keyboard controls, and runtime errors. Actual-user studies and real-device checks are deferred under the current budget. Record those limits without claiming simulated browsers establish real-user learnability or satisfaction. Configure and test static hosting, HTTPS, the custom subdomain, and attribution before launch.

### Release Preparation: First Implementation Pass

Started 2026-10-13. Public release remains pending the evidence and external setup recorded in `doc/release-checklist.md`.

- Added provisional user personas, a 5–8 participant usability protocol, and an explicit release checklist. Personas have not yet been validated with users.
- Added MIT licensing, README, contribution guidance, draft community conduct policy, security reporting preparation, privacy information, and bundled font notices.
- Added draft English/German manuals, a bilingual in-app help page, an attribution link, and outlines for five short screen recordings. Videos have not been recorded.
- Added Vitest unit coverage and Playwright tests for generation, checks, alternatives/restoration, JSON continuity, invalid imports, storage errors, long German text, keyboard resizing, deployed assets, and the core user journey. Added verification CI for a future standalone repository.
- Strengthened backup parsing before import and local restore; invalid imported data leaves current work intact. Corrupt browser data is preserved until explicit replacement. Save failure status is visible and accurately reflects browser-storage errors.
- Prepared a static export and local preview at `/blueprintstudio/`, staging exports in `.next-release/` and assembling the handoff artifact in `out/`, with locally bundled fonts compatible with the URL path. No publication or live hosting changes have been performed.
- Identified remaining release work: mostly-English generated prompt/report prose, broader HITM-rule coverage, manual accessibility/real-device checks, user testing, public contacts/repository, hosting privacy details, and final videos. Completed coding milestones must not be treated as proof that these release gates are met.
- Verification on 2026-10-13: 192 unit tests and 35 exported-build browser tests passed (Chromium, Firefox, WebKit, phone-sized Chromium; desktop resize intentionally skipped on mobile). Typecheck, lint, production build, and static build passed. Browser tests exposed and verified repairs for the inaccessible stacked mobile inspector and print-from-menu behavior.

### Release Preparation: German Artifacts, HITM Rules, And Persona Simulations

Implemented on 2026-10-13:

- Locale-aware German prompt text, metadata, quality checks, report prose, default ownership/gates, stack guidance, status labels, and Markdown exports. Known app-supplied default/demo content is translated in output projections; stored projects and custom text are preserved. German source vocabulary participates in deterministic stack recommendations.
- Added optional node fields `dataApproval` (unreviewed/approved/rejected) and `explicitStop`, editable in the inspector and retained by JSON backups and alternative snapshots. Existing v6 and legacy files remain compatible. Generated drafts never approve sensitive data use.
- Completed the ten HITM rule families: uncontrolled AI output, AI-owned final decisions, unapproved sensitive-data paths, automated actions without gates, missing human owners, absent model/tool-change control, unreachable high-risk escalation, missing decision audit paths, unfinished branches/loops, and disconnected components. Checks use human-owned control nodes, actual graph paths, and bilingual explanations; an unrelated gate or audit node does not satisfy the affected path.
- Sensitive-data classification is a project setting; tool/data approvals and stop points are human-recorded planning declarations. Owner recognition uses labels and cannot verify people's identities, actual tool permissions, or real-world approval. The largest connected component is treated as the main workflow; intentional separate sub-flows can be documented as exceptions.
- Added five fictional persona fixtures and unit/browser simulations covering warning diagnosis and repair, German artifacts, backup continuity, and alternative restoration. Updated the testing protocol and release plan to use simulations within the stated budget.
- Verification results are recorded in `doc/release-checklist.md` and `doc/simulation-report.md`. Earlier references to human recruitment in the first-pass history describe the superseded plan.
- Final verification: 210 unit tests and 55 browser tests pass, including 20 persona browser runs; desktop resizing is intentionally skipped on the simulated phone. Typecheck, lint, standard production build and static export pass.

### Release Preparation: Keyboard Acceptance And Clean Source Package

Implemented on 2026-10-13:

- Quick-guide and project-replacement dialogs contain keyboard focus, make the background inert, return focus to their opener, and suppress canvas shortcuts. Replacement initially focuses Cancel. Modal Tab traversal is explicit, including in WebKit when native Tab skips buttons.
- More/Templates disclosures support arrow/Home/End navigation, Escape, Tab-out and outside dismissal. Check filters have roving keyboard focus; recording or reopening a warning returns focus to the filter rather than losing it when a card disappears.
- Added bilingual browser cases for justified exceptions, including rejection of blank/whitespace notes, persisted status/justification/timestamp, report disclosure, JSON round-trip and reopening. Added source-boundary and license-evidence unit coverage.
- Added `pnpm audit:licenses`: inventories project-local installed manifests and supplied licenses/notices, including Next's compiled notices and README terms, without registry requests or store-index repairs. The 385-package host inventory flags missing texts and absent optional/peer references; it is not a legal certification or vulnerability audit. Native/build/test executables are not distributed. New/unknown declared license identifiers require review before packaging.
- Added `pnpm package:source`: explicit reviewed file allowlist, private/generated-path and common credential-marker rejection, checked file copies, license notices, SHA-256 manifest, standalone staging directory and source archive. The staged Next environment file is normalized to remove a generated route-types import; no live source or Git history is rewritten. No repository, remote, commit or publication is created.
- Verified 229 unit tests and 83 browser tests across Chromium, Firefox, WebKit and phone-sized Chromium; one desktop-only resize test intentionally skipped. Typecheck, lint, production/static builds, archive/file hashes, exact source list and cache-free staged typechecking pass. Staged typechecking uses the current dependency installation, not a claimed fresh-machine install. Testing remains simulated; no real-user/accessibility certification claim is made.
- Public contacts/security reporting, hosting/legal/privacy details, beta/source/feedback polish and publication approval remain separate release gates. SQL remains post-release.

### Release Preparation: Illustrated Manuals And Public Beta Presentation

Implemented on 2026-10-13:

- Added six actual UI screenshots per language from isolated Chromium contexts and an invented training project: brief, full workflow, intentional AI-owned decision warning, unadopted privacy alternative, report summary and backup menu. No normal browser profile, real source records or user project data are captured. The capture run verifies warning/correction and non-adoption before writing screenshot metadata.
- Reviewed English/German task instructions against the scripted journeys. Both manuals and local help include captions/alt text and fictional-data boundaries; help offers full-size image links. Exported Markdown image paths are normalized for `/blueprintstudio/` without editing original manuals. Source packaging explicitly includes all twelve PNGs and their dimension metadata.
- Added a bilingual beta-preview/version label and local source/feedback section with MIT attribution and privacy-conscious reporting templates. Manual/source-feedback links follow the selected language. Public repository and feedback destinations remain visibly pending until the maintainer chooses them; no live URL or reporting address is fabricated.
- Optional explicit build-time source/feedback links reject unsafe protocols, embedded credentials, multiple mail recipients and mail subject/body queries. The studio never attaches project content to feedback links. Configuring links does not configure private security reporting, publish the site or change hosting privacy notices.
- Localized alternative dates explicitly by app language with a stable UTC calendar day and safe invalid-date fallback. Kept the expanded More disclosure bounded/scrollable on small viewports.
- Added image/source-boundary, fictional-fixture, public-link and responsive/deployment browser tests; retained simulation limits. Current source candidate includes 88 files plus its checksum manifest. Final verification: 245 unit tests, 91 browser tests pass, with one desktop-only mobile skip; both screenshot capture cases, typecheck, lint, normal/static builds and whitespace checks pass. Publishing, real contacts/security setup, host configuration and videos remain pending. No dependencies, Git commits or external writes were added.

### Repository And Feedback Selection; Pre-Upload Security Hold

2026-10-13:

- Maintainer created the public repository `https://github.com/SirArthur23/blueprintstudio` and chose `blueprintstudio@schmidtpabst.com` for feedback. Added these as tracked, explicit public defaults, retaining build-time overrides/disablement for forks. Updated both manuals/help and contribution/contact documents. Mailbox provisioning/delivery is not performed or claimed.
- Enabled and verified GitHub private vulnerability reporting on the chosen repository. Arthur Schmidt-Pabst/SirArthur23 is identified as maintainer; security reports are directed privately rather than to public feedback.
- Inspected the initial README/license and preserved the existing public initial commit. Isolated publishing checkout is inside this project at `.publish/blueprintstudio/`; it and parent workspace history are excluded from source packaging. No app-source commit/push or hosting deployment has occurred yet.
- Functional checks pass (247 unit tests, 91 browser tests with one intentional mobile skip, typecheck, lint and both builds). A separate registry audit flags 3 critical, 23 high, 15 moderate and 4 low findings in the locked production graph. These are not all demonstrated application vulnerabilities; scope and primary critical-advisory references are in `doc/security-audit.md`.
- The reported critical Next.js issues concern server features outside the planned static export, but the source still pins an affected framework version. Upload is held for a maintainer decision about updating existing dependencies/retesting before publication versus explicitly publishing development source with warnings. No dependency change is silently made. Static hosting/privacy details and videos remain pending.

### Approved Compatible Security Refresh; Residual Publication Gate

2026-10-13:

- Maintainer chose to update and verify before uploading. Next.js and eslint-config-next are now pinned to 16.3.8; compatible transitive resolutions/type declarations were refreshed, without a major framework/tooling migration or new product services.
- Installs/downloads use an ignored `.pnpm-store/` inside `HITM_Blueprint`; neither sibling projects nor the parent workspace Git history/store is modified. Source packaging explicitly refuses this store.
- The production dependency audit now reports no known vulnerabilities. The full audit retains one high advisory in development-only braces 3.0.3 through Next's ESLint/glob tooling; upstream has no patched release. No advisory is suppressed. The exact chain, scope and limits are disclosed in `doc/security-audit.md`; publication with that residual limitation requires the maintainer's choice.
- Reverification passes: typecheck, lint, 249 unit tests, normal/static builds and 91 browser tests; one desktop-only resize case intentionally skipped on the simulated phone. Updated license evidence retains supplemental README terms and the reviewed combined Sharp declarations for source/static distribution only; native/WebAssembly tooling binaries are not redistributed.
- The standalone source is prepared and verified: 90 files plus its manifest, exact file-list/per-file/archive SHA-256 checks, and cache-free staged typechecking using the existing dependency installation (not a clean-machine install). No app-source commit/push or hosting deployment has occurred at this record. CI now includes the production advisory check; remote CI remains unverified until upload. Hosting and video recording remain separate next steps.

### Source Publication Approved With Disclosed Limitation

2026-10-13:

- Maintainer explicitly chose “Upload with documented limitation” after compatible updates, the clean production audit and passing release checks. The unpatched development-only lint advisory remains disclosed in README and `doc/security-audit.md`; approval is not a claim that the full dependency graph is clean.
- Publish only the reviewed standalone source to `SirArthur23/blueprintstudio`, preserving the maintainer's initial commit. Do not publish parent workspace history, private conversation files, backups, environment files or dependency/build caches.
- Hosted deployment is not part of this approval; host privacy/legal review, live-site checks and video recordings remain separate work.

### Standalone Source Published

2026-10-13:

- Published the approved standalone snapshot to `https://github.com/SirArthur23/blueprintstudio` as commit `81a0edc`, preserving initial commit `27a6a5d` without rewriting history. Verified the exact 91-file remote tree and every Git blob hash against the reviewed package.
- MIT attribution, bilingual manuals/screenshots, fictional persona/browser tests, private security-reporting instructions, production audit gate and disclosed development-only advisory are included. Private reporting remains enabled; mailbox delivery is not claimed.
- Source-packaging manifest status distinguishes preparing a snapshot from publishing it; packaging never creates external commits or deploys. GitHub CI is verified separately from local checks.
- Committed/pushed only the project-local standalone checkout. Parent workspace Git history, private conversation/backups, siblings and dependency/build caches were not published. No hosting deployment, release tag or GitHub Release was made. Host/privacy/legal review and videos remain next steps.
- Clean Linux GitHub Actions verification passed for published commit `81a0edc`: frozen-lockfile install, clean production advisory result, typecheck, lint, unit tests, normal/static builds, browser tests and source packaging. Evidence: `https://github.com/SirArthur23/blueprintstudio/actions/runs/38432478264`. This adds a separate clean-runner install to the earlier local evidence; it is not a security or real-user UX certification.

## Non-Goals For V1

V1 should not include:

- Cloud AI integration
- Accounts
- Backend persistence
- Multi-user collaboration
- PDF generation beyond print support
- Real-time sync
- Complex diagram editor features
- Claims that one stack is objectively best

Those can be considered later only if they strengthen the HITM planning use case.

## Guiding Principle

Judgment before automation.

The app should help people design AI-assisted systems where humans own the goals, context, approvals, changes, and final decisions. AI can assist, draft, classify, suggest, critique, and organize. It does not own the project.

## Dedicated-origin beta preparation, 2026-10-13

Prepared from the public standalone commit `6d830bead2c5f7750f8cf5777117af5b5e611c7b` in a clean checkout. The planned launch URL is `https://blueprintstudio.schmidtpabst.com/`; the root static build requires explicit `NEXT_PUBLIC_BASE_PATH=''`. Project behavior, dependencies and lockfile are unchanged. Browser configuration and real URL assertions now cover root and retained path builds, with isolated runtime/network monitoring and hosting checks. A bilingual operator/privacy/imprint notice is linked from Help; its operator details and proposed logging policy require Arthur's launch approval. Read-only DNS inspection found A `217.160.0.203` and AAAA `2001:8d8:100f:f000::200`, rather than the existing VPS `217.154.1.70`. No infrastructure changes or hosted launch are authorized by these preparation edits. Root/path verification and artifact checksums are recorded by the infrastructure session before requesting approval. Feedback delivery and real-device/user studies remain unverified/deferred; videos remain outlines and SQL remains post-release.
