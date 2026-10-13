# Working personas

Status: provisional, based on the intended use cases in the source of truth. These are design hypotheses and simulation roles, not findings from interviews. The initial release uses [scripted persona simulations](testing.md) under the available time and budget.

## 1. Small-team lead — primary first-release user

- **Trigger:** a team of 3–10 people is experimenting with AI and has inconsistent review practices.
- **Outcome:** an agreed pilot workflow with named people, clear approval points, and a shareable report.
- **Technical confidence:** comfortable with office software; little experience with AI architecture or diagrams.
- **Concern:** losing control, extra administration, or asking colleagues to use an unfamiliar tool.
- **First successful task:** describe a recurring document-review task, generate a draft, assign actual owners, and export a backup/report.
- **Scenario:** internal training summaries for five colleagues; AI drafts, a human checks sources and approves.
- **Test:** can they explain who may release an output and recover the blueprint next day without help?

## 2. Independent consultant

- **Trigger:** a client asks which parts of a service can be assisted by AI.
- **Outcome:** a concrete proposal with options, responsibilities, tradeoffs, and excluded decisions.
- **Technical confidence:** varies; confident in facilitation and presenting to clients.
- **Concern:** generic recommendations, vendor bias, and changes that overwrite a carefully designed flow.
- **First successful task:** adapt a template, compare a privacy-first alternative, and restore the original before presenting.
- **Scenario:** a client requests a customer-support triage pilot; final commitments remain human-owned.
- **Test:** can they distinguish generated suggestions from agreed client decisions and describe what adoption changes?

## 3. Educator or facilitator

- **Trigger:** a workshop needs a practical exercise in responsible AI use.
- **Outcome:** learners can explain human ownership, source boundaries, and revision/escalation paths.
- **Technical confidence:** comfortable teaching; learners may have none.
- **Concern:** jargon, overconfidence from green checks, and setup consuming the workshop.
- **First successful task:** load a template, create a deliberately unsafe AI-to-output connection, identify the warning, and repair it.
- **Scenario:** a 30-minute German-language workshop using fictional documents.
- **Test:** can a learner explain why passing checks is not a certificate of safety?

## 4. Founder or product builder

- **Trigger:** an AI feature is proposed before implementation or funding.
- **Outcome:** a design brief that identifies data flow, review, exceptions, and implementation questions.
- **Technical confidence:** comfortable with product concepts; may also code.
- **Concern:** shallow diagrams, missing operational dependencies, or confusing planning with execution.
- **First successful task:** map a feature, document ownership, choose a stack pattern, and hand a report to an engineer.
- **Scenario:** document-based knowledge assistant with a source-review process.
- **Test:** can they identify unresolved operational work outside the studio's structural checks?

## 5. Privacy-conscious operations or compliance lead

- **Trigger:** a proposed workflow handles internal or sensitive data.
- **Outcome:** explicit source/data boundaries, owners, approval requirements, and review evidence.
- **Technical confidence:** good process/domain knowledge; SQL or infrastructure knowledge varies.
- **Concern:** silent data transfer, unclear logging, and promises the software cannot verify.
- **First successful task:** compare data-handling options, check local storage/export behavior, and record an exception with a reason.
- **Scenario:** onboarding-document review using descriptions and fictional records.
- **Test:** can they locate the privacy explanation and recognize the limits of a privacy-first recommendation?

## Simulation priority

Simulate all five roles with fictional data, prioritizing the small-team lead and German-language use. Cover a complete workflow, warning diagnosis, explicit data approval, alternatives/restoration, and backup recovery. Record scripted behavior and test outcomes without attributing it to real participants.

The first-release task is a complete, recoverable blueprint for a small team. Advanced SQL users are a later audience. Mobile review is secondary to laptop workflow editing; test both.
