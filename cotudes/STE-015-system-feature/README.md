# STE-015: System Feature

> **Axiom**: Your workflow is a distributed system -- design it like one.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff Software Engineer |
| **Number** | STE-015 |
| **Primary Competency** | All |
| **Trap Severity** | N/A (Capstone) |
| **Prerequisites** | STE-001 through STE-014 |
| **Duration** | 16-24 hours (3-4 working days) |
| **Stack** | Go |

## Overview

You will design and implement a webhook delivery system across four Go services
in the taskflow platform. The feature spans service boundaries, requires shared
contracts, involves both delegatable and non-delegatable components, and must be
delivered across multiple agent sessions over multiple days. You produce two
artifacts: working code and a documented workflow playbook that another staff
engineer on your team could follow to deliver a comparably scoped feature using
agents.

This capstone does not teach a new competency. It tests whether the competencies
from STE-001 through STE-014 have become reflexive. There is no Part 1 / Part 2
contrast. You execute once, applying everything you have learned, and evaluate the
result against the rubric.

## The Scenario

Taskflow has grown. The monolithic service from earlier etudes has been decomposed
into four services that communicate via an internal event bus:

```
services/
  gateway/         -- API gateway, route registration, auth middleware
  projects/        -- Project and task domain logic, primary data store
  events/          -- Event ingestion, routing, fan-out
  workers/         -- Async job processing (notifications, cleanup, aggregation)
```

Each service has its own `internal/` packages, its own test suite, its own
conventions (some shared, some divergent -- the team grew and conventions
drifted). A shared `pkg/` directory contains common types and interfaces.

**The feature**: Webhook Delivery.

Users can register webhook URLs for their projects. When significant events occur
(task created, task completed, project archived, team membership changed), the
system delivers an HTTP POST to the registered URL with a signed JSON payload.
Delivery includes retry logic with exponential backoff, a dead-letter queue for
persistent failures, and an admin API for inspecting delivery status and manually
retrigering failed deliveries.

The feature touches all four services:

1. **Gateway** -- New endpoints: webhook registration CRUD
   (`POST/GET/PUT/DELETE /projects/{id}/webhooks`), delivery status query
   (`GET /projects/{id}/webhooks/{wid}/deliveries`), manual retry trigger
   (`POST /deliveries/{did}/retry`).

2. **Projects** -- New domain model: `Webhook` (URL, secret, event filters,
   active flag). Persistence layer for webhook configurations. Validation logic
   (URL reachability check, secret generation, event filter validation against
   known event types).

3. **Events** -- New routing logic: when an event arrives, check for matching
   webhook subscriptions, fan out delivery jobs. New event types for webhook
   lifecycle events (webhook.registered, webhook.delivery.succeeded,
   webhook.delivery.failed).

4. **Workers** -- New job type: webhook delivery. HTTP POST with HMAC-SHA256
   signature, configurable timeout, exponential backoff (initial 1s, max 1h,
   jitter), circuit breaker per destination URL, dead-letter after 8 attempts.
   Delivery logging with full request/response capture for debugging.

Cross-cutting concerns:
- The HMAC signing algorithm must be identical in the workers service (which
  signs) and documented in a way that external consumers can verify.
- Event payloads must be serialized identically regardless of which service
  originates the event.
- Retry state must be queryable from the gateway but is owned by the workers
  service. This requires a defined interface between services.
- Webhook secrets must be stored encrypted at rest in the projects service
  and transmitted to the workers service only at delivery time, never exposed
  in any API response.

### Why This Feature

This is not a contrived exercise. Webhook delivery is a common system feature
that exposes exactly the challenges of multi-service development with agents:
shared contracts (payload schemas, signing protocols), mixed delegation suitability
(CRUD endpoints vs. retry algorithms), parallelizable components with shared
interfaces, context management across service boundaries, and subtle correctness
requirements that agents handle poorly without human oversight (cryptographic
signing, backoff jitter, circuit breaker state machines).

## Deliverables

### A. Working Code

All four services extended with the webhook feature. Specifically:

1. **Gateway endpoints** -- All six endpoints listed above, following the
   gateway service's existing conventions for routing, middleware, error
   responses, and request validation.

2. **Projects domain model** -- `Webhook` type, store layer, validation.
   Migration script for the webhooks table. Tests.

3. **Events routing** -- Fan-out logic, webhook lifecycle events. Tests
   covering event matching with filters.

4. **Workers delivery job** -- HTTP delivery with signing, retry with backoff
   and jitter, circuit breaker, dead-letter queue, delivery logging. Tests
   covering the retry state machine, signature correctness, and circuit breaker
   transitions.

5. **Integration test** -- At least one end-to-end test that registers a webhook,
   triggers an event, and asserts that the delivery arrives with a valid
   signature and correct payload.

6. **Shared contract** -- `pkg/webhook/` with types and interfaces used across
   services. Event payload schema. Delivery status enum. Signing utility (used
   by workers, importable by external consumers for verification).

All existing tests pass. New tests cover the new code. `go build ./...` succeeds
for every service. `go test -race -count=1 ./...` passes for every service.

### B. Workflow Playbook

A document (`PLAYBOOK.md` in the repo root) that records the workflow you used to
deliver this feature. Not a journal or narrative -- a playbook another engineer
could follow. It must contain:

1. **CLAUDE.md decisions** -- What you put in each service's CLAUDE.md and why.
   What you put in the root CLAUDE.md vs. service-level ones. What you learned
   about context layering across a multi-service repo.

2. **Specification artifacts** -- The specs and contracts you wrote before
   implementation. The order you wrote them. Which specs were worth the time
   and which were over-specified.

3. **Delegation log** -- Which components you delegated to agents and which you
   implemented yourself. Your reasoning for each decision, mapped to the
   delegation matrix from STE-003.

4. **Parallelization plan** -- Which agent sessions ran in parallel, which ran
   sequentially, and why. The dependency graph you used to make this decision.
   Where parallelization saved time and where it created integration overhead.

5. **Context budgets** -- For each major agent session, what context you
   provided. What you excluded. Approximate token counts if you tracked them.
   Any evidence of context pollution (agent borrowing patterns from the wrong
   service).

6. **Review protocol** -- How you reviewed agent output. What you checked first.
   What categories of errors you found. Whether you used automated verification
   (tests, linting, type checking) vs. manual review, and for which components.

7. **Recovery incidents** -- Any sessions that went sideways. How you detected
   the problem, what you did (restart, narrow scope, take over manually), and
   what you would do differently.

8. **Session map** -- A timeline of sessions: how many, what each one
   accomplished, how context was transferred between sessions, and where
   session boundaries caused friction.

The playbook is evaluated on whether a peer could follow it, not on polish.

## Constraints

These constraints exist to ensure every prior competency is exercised. They are
not artificial restrictions -- they reflect the realities of multi-service
development at scale.

1. **Multi-session mandate**. You may not complete this in a single agent session.
   The feature must span at least 6 distinct sessions (simulating work across
   multiple days). Each session must start cold -- no relying on an open session's
   accumulated context. This forces STE-001 (CLAUDE.md) and STE-010 (Session
   Continuity).

2. **Spec-first**. No implementation may begin on any component until you have
   written a specification for the shared contracts (event payload schema, signing
   protocol, delivery status types, store interfaces). The spec is a deliverable
   and will be evaluated. This forces STE-002 (Spec-Driven Development).

3. **Delegation decision log**. For every component, you must record before
   starting whether you will delegate it to an agent or implement it yourself,
   with a one-sentence justification. You may change your mind during execution
   but must record why. This forces STE-003 (The Delegation Matrix).

4. **Context budget per session**. For each agent session, document the files
   and context you provided. At least two sessions must use deliberately curated
   context (not "give the agent everything"). This forces STE-004 (Context
   Window Economics).

5. **Parallel execution**. At least two agent sessions must run in parallel on
   independent components, coordinated by a shared contract. This forces STE-005
   (The Parallel Sprint).

6. **Architecture constraint**. The `pkg/webhook/` shared package must define
   interfaces, not implementations. Services depend on the interfaces. This
   forces STE-006 (Agent-Friendly Architecture) -- the agent must navigate the
   abstraction boundary correctly.

7. **Human review required**. The HMAC signing implementation and the retry
   state machine must be reviewed line-by-line by you, with annotations in the
   playbook on what you checked and why. You may not rely solely on tests for
   these components. This forces STE-007 (The Review Protocol) and STE-013
   (The Performance Review).

8. **At least one recovery**. If every session succeeds perfectly on the first
   attempt, you are either extraordinarily well-prepared or not pushing hard
   enough. The playbook must include at least one recovery incident -- a session
   that required course correction. If none occur naturally, deliberately attempt
   one component with insufficient context and document the recovery. This forces
   STE-008 (Recovery and Restart).

9. **CI verification loop**. Every component must pass `go build` and `go test`
   before the next component begins. No "I'll fix it at integration." This
   forces STE-009 (The Feedback Machine).

10. **Team-shareable output**. The playbook must be written as if you are
    establishing a pattern for your team. It should include reusable templates
    (CLAUDE.md template, spec template, delegation checklist). This forces
    STE-014 (Team Patterns).

## Evaluation Criteria

### Code Quality (40%)

| Criterion | Exceeds | Meets | Below |
|-----------|---------|-------|-------|
| **Compiles and passes tests** | All services pass with race detector, >80% coverage on new code | All services pass, reasonable coverage | Build failures or test gaps |
| **Convention adherence** | New code is indistinguishable from existing code in each service | Minor convention drift, easily correctable | Obvious style mismatches across services |
| **Contract fidelity** | Implementation matches spec exactly across all service boundaries | Minor deviations, no integration failures | Spec and implementation diverge; integration issues |
| **Correctness of critical paths** | HMAC signing is correct and tested; retry logic handles all edge cases; circuit breaker transitions are sound | Signing works; retry has basic coverage; circuit breaker is present | Signing has subtle bugs; retry lacks jitter or has off-by-one; no circuit breaker |
| **Integration** | End-to-end test passes; services communicate correctly | Most paths work; minor integration fixes needed | Services do not integrate without significant rework |

### Workflow Quality (40%)

| Criterion | Exceeds | Meets | Below |
|-----------|---------|-------|-------|
| **CLAUDE.md effectiveness** | Service-level CLAUDE.md files show evidence of iteration; entries trace to specific correction incidents | CLAUDE.md files exist and cover key conventions | Generic or copied CLAUDE.md files |
| **Specification value** | Specs are minimal but sufficient; no over-specification; integration issues traceable to spec gaps, not spec absence | Specs exist and were used; some over- or under-specification | Specs written after implementation or not used |
| **Delegation accuracy** | Delegation decisions match the verification-cost heuristic; human-implemented components are the correct ones | Mostly correct delegation; one or two suboptimal choices | Delegation based on interest/boredom rather than verifiability |
| **Parallelization efficiency** | Clear dependency graph; parallel sessions merge without integration issues; wall-clock savings documented | Some parallelization; minor merge issues | No parallelization, or parallel sessions conflict |
| **Context curation** | Evidence of deliberate context selection; no context pollution in output; budget documented per session | Context considered; some curation | Agent given entire repo every session |
| **Review rigor** | Critical components reviewed with specific annotations; error categories documented; automated + manual verification combined | Review performed; some documentation | Cursory review or no documentation |

### Playbook Quality (20%)

| Criterion | Exceeds | Meets | Below |
|-----------|---------|-------|-------|
| **Reproducibility** | A peer could follow the playbook to deliver a similar feature; templates are reusable | Playbook describes the workflow; a peer could learn from it | Journal entries, not a playbook |
| **Honesty** | Recovery incidents documented with genuine reflection; mistakes are visible | Some reflection on what worked and didn't | Only successes documented |
| **Completeness** | All eight playbook sections present and substantive | Most sections present | Major sections missing |

### Overall Scoring

- **Exceeds across all categories**: You have internalized the STE path competencies. The workflow is yours, not a checklist.
- **Meets across all categories**: You can apply the competencies when prompted. Practice will make them automatic.
- **Mixed**: Review the specific categories where you scored Below. Revisit the corresponding etude.
- **Below across multiple categories**: Revisit STE-008 through STE-014 before reattempting.

## Reflection

These questions look backward across the entire STE path. Take them seriously.
Write full answers, not bullet points.

1. **The CLAUDE.md audit**. Open the CLAUDE.md files you created for this
   capstone. Compare them to the CLAUDE.md you wrote in STE-001. What changed
   in how you think about persistent context? What would you tell the version
   of yourself that started this path?

2. **The spec ROI**. You wrote specs before implementation. Estimate the time
   you spent on specs vs. the integration time they saved. Is spec-driven
   development now a reflex or still a discipline you impose on yourself? When
   would you skip it?

3. **The delegation instinct**. Look at your delegation log. Did your gut
   instinct for what to delegate match the verification-cost heuristic, or did
   you still have to override your instincts? Has the heuristic become
   intuitive?

4. **The parallelization judgment**. You ran parallel sessions. How did your
   dependency analysis compare to what you would have done in STE-005? Are you
   better at identifying shared interfaces before they cause merge conflicts?

5. **The context skill**. Across all sessions, where did context curation most
   obviously improve output quality? Where did you still get it wrong? What is
   your personal heuristic for "enough context" now?

6. **The review evolution**. Compare how you reviewed agent output in this
   capstone to how you reviewed it before the path. What do you check first?
   What do you trust? What do you never trust?

7. **The workflow as artifact**. You produced a playbook. Is this how you
   actually work now, or is it aspirational? What parts of the playbook would
   you actually share with your team on Monday?

8. **The 19% question**. The METR study found experienced developers initially
   took 19% longer with agents. After completing this path, are you faster with
   agents than without? On which types of work? On which types are you still
   faster alone? Be specific.

9. **The axiom stack**. List the axioms from STE-001 through STE-014 that you
   actually used during this capstone. Which ones have become part of your
   thinking? Which ones did you forget and had to relearn? Which ones do you
   disagree with?

10. **The next engineer**. A new staff engineer joins your team next week. They
    are skeptical of agents. They can write Go faster than they can review
    agent-generated Go. What is the first thing you would have them do? What is
    the one sentence you would tell them?
