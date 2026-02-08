# PSA-011: System Redesign (CAPSTONE DRAFT)

> **Axiom**: A system designed for agent collaboration is a system designed for clarity. There is no difference.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Principal Software Architect |
| **Number** | PSA-011 |
| **Primary Competency** | All |
| **Trap Severity** | N/A (Capstone) |
| **Prerequisites** | PSA-001 through PSA-010 |
| **Duration** | 5-8 sessions |
| **Stack** | Architecture + Code |

## Overview

You will take an existing production system -- one you know well, with real
complexity, real history, and real scars -- and redesign it as if agent
collaboration were a first-class architectural concern. Not a retrofit. Not
"add ARCHITECTURE.md and call it done." A redesign that reconsiders module
boundaries, specification formats, documentation placement, invariant
enforcement, observability, and evolution strategy through the lens of
everything you have practiced in PSA-001 through PSA-010.

This is a capstone. It synthesizes every competency in the path. The output is
not a toy system -- it is a redesign proposal and partial implementation for a
system that matters to you.

## Scenario

You are the principal architect on a system that was designed before agent-
assisted development was a serious consideration. The system works. It has
users, SLAs, and an on-call rotation. It also has:

- Module boundaries that evolved organically around team ownership rather
  than cognitive or context-window coherence
- Architecture documentation in a wiki, partially stale, partially excellent
- Invariants enforced by convention, tribal knowledge, and code review
- Specifications written as prose RFCs aimed at architecture review boards
- Observability designed for human operators reading dashboards, not for
  agents interpreting telemetry programmatically
- A change history that makes sense to people who were there and is opaque
  to anyone (or anything) arriving fresh

Your CTO asks: "If we were designing this system today, knowing that half of
feature development will involve agent collaboration within a year, what would
we change?" Not "rewrite from scratch." Not "add AI features." What structural
changes to the architecture would make the system fundamentally more effective
to work on with agents?

You have 5-8 sessions to answer that question with a redesign proposal and
enough implementation to prove the critical ideas work.

## Deliverables

### 1. System Assessment (Session 1-2)

Analyze your chosen system against the competencies from PSA-001 through
PSA-010. For each, score the current state and identify the highest-leverage
change.

| Competency | Current State | Key Gap | Proposed Change |
|-----------|---------------|---------|-----------------|
| Implicit vs. explicit invariants (PSA-001) | | | |
| Specification as contract (PSA-002) | | | |
| Module boundary coherence (PSA-003) | | | |
| Evolutionary architecture (PSA-004) | | | |
| Documentation as code (PSA-005) | | | |
| [PSA-006 through PSA-010] | | | |

Be ruthless. Score against what an agent would experience, not what your
team has learned to work around.

### 2. Redesign Proposal (Session 2-3)

An architecture document -- in the repo, not a wiki -- covering:

**Module boundaries**: Redraw the module map with two constraints in mind.
First, each module should be comprehensible within a single agent context
window (today: ~200K tokens of source, tests, and documentation). Second,
module interfaces should be explicit enough that an agent working in module A
never needs to read module B's internals to use it correctly.

**Documented invariants**: For every invariant currently enforced by tribal
knowledge, choose one of three strategies: encode it in the type system,
enforce it with a test, or document it in an ADR. Rank by blast radius --
start with the invariants whose violation causes the worst production
incidents.

**ADRs as implementation contracts**: Rewrite the three most critical
architectural decisions as contract-style ADRs (per PSA-002). Include:
interface signatures, constraint boundaries, error behavior, concrete
examples, and anti-patterns. These ADRs are not just records of decisions --
they are implementation specs an agent can follow.

**Observability for agent-generated code**: Design an observability strategy
that answers: "Did the code the agent wrote behave correctly in production?"
This means structured telemetry that can be queried programmatically, not
dashboards designed for human pattern recognition. Specific signals: error
rates by code author (human vs. agent), latency distributions for new code
paths, invariant violation counters that fire before the customer notices.

**Evolution strategy**: Define review triggers for every major decision in the
proposal. "Revisit module boundary sizes when agent context windows reach X."
"Revisit type-level invariant encoding when agents can Y." The redesign should
be stable for 2 years but explicitly designed to be revised.

### 3. Proof of Concept (Session 3-6)

Pick the two highest-leverage changes from the proposal and implement them
against the real system (or a representative subset). The implementation
should be real enough that you can:

- Start an agent session in the redesigned module and have it add a feature
- Compare the agent's output against the same feature added in the original
  architecture
- Measure the difference in invariant violations, implementation accuracy,
  and time to correct output

This is not a complete rewrite. It is a surgical proof that the redesign
ideas work in practice, not just on paper.

### 4. Agent Validation (Session 5-7)

Use an agent to implement a non-trivial feature in the redesigned portion
of the system. Document:

- What the agent discovered on its own (ARCHITECTURE.md, ADRs, package
  READMEs, type constraints)
- What the agent got right without guidance
- What the agent still got wrong, and whether the failure was a gap in the
  redesign or a current agent limitation
- How the observability signals performed: did they catch the agent's
  mistakes? How quickly?

Run the same feature request against the original architecture as a control.
The comparison is the evidence.

### 5. Retrospective Document (Session 7-8)

A written retrospective covering:

- Which redesign ideas had the highest impact? Which were surprisingly
  irrelevant?
- What did you learn about your system's architecture by evaluating it
  through the agent collaboration lens?
- What would you prioritize if you could only make three changes to the
  production system next quarter?
- Where did your instincts as an architect conflict with what the evidence
  showed? When were your instincts right anyway?

## Constraints

- **Use a real system.** A toy project will not surface the hard problems:
  organic module boundaries, stale documentation, tribal knowledge, historical
  decisions that made sense at the time. If you cannot use your production
  system, use the most complex open-source system you actively contribute to.

- **Do not boil the ocean.** The redesign proposal covers the full system.
  The implementation covers two modules. The agent validation covers one
  feature. Scope ruthlessly. A narrow proof that works is worth more than a
  broad proposal that stays on paper.

- **Keep the redesign deployable.** Every change you propose must be
  incrementally adoptable. "Rewrite in Rust" is not a redesign -- it is a
  fantasy. "Introduce explicit interfaces between the billing and accounts
  modules, documented with contract-style ADRs" is a redesign that can ship
  next sprint.

- **Version everything.** The assessment, proposal, ADRs, implementation, and
  retrospective all live in the repository. Commit history should tell the
  story of the redesign.

## Evaluation Criteria

This is a self-evaluated capstone. Score yourself honestly.

| Criterion | Question |
|-----------|----------|
| **Depth of assessment** | Did you identify invariants and gaps that surprised you, or only the obvious ones? |
| **Specificity of proposal** | Could another architect implement your proposal without asking clarifying questions? |
| **Contract quality** | Are the ADRs precise enough that an agent could implement against them without prose interpretation? |
| **Proof of concept rigor** | Does the implementation prove the ideas work, with measurable before/after comparison? |
| **Agent validation honesty** | Did you report what the agent actually did, including where the redesign failed to help? |
| **Incrementalism** | Can every proposed change ship independently, without requiring a coordinated rewrite? |
| **Evolution awareness** | Does the proposal include explicit review triggers, or does it assume the redesign is permanent? |

## Reflection

Record in your interaction log:

1. **Hardest decision**: What was the single hardest architectural decision
   in the redesign? Not the most complex -- the one where the tradeoffs were
   most finely balanced. What did you choose, and what did you give up?
2. **Tribal knowledge inventory**: How many invariants did you discover that
   existed only in people's heads? How many of those had caused production
   incidents? How many will you actually move into the codebase?
3. **Module boundary surprise**: When you redrew module boundaries for context
   window coherence, did the new boundaries align with team ownership
   boundaries? If not, what does that tell you about how your teams are
   organized?
4. **Observability gap**: What did the agent-oriented observability strategy
   reveal about your current observability? Are you monitoring for the right
   signals, or for the signals that were easy to add?
5. **Honest assessment**: If you shipped this redesign, how much of the
   benefit accrues to agent collaboration specifically, and how much is just
   better architecture that helps everyone? Is there a difference?
