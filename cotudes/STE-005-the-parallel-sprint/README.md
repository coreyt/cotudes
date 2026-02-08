# STE-005: The Parallel Sprint

> **Axiom**: Parallelize independent work; serialize shared interfaces.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff Software Engineer |
| **Number** | STE-005 |
| **Primary Competency** | Parallel Orchestration |
| **Secondary Competency** | Specification Writing |
| **Trap Severity** | 3 (Practiced) |
| **Prerequisites** | STE-002 (Spec-Driven Development), STE-003 (The Delegation Matrix) |
| **Duration** | 150-180 minutes |
| **Stack** | Go |

## Overview

You will implement a feature across five components by launching multiple agent
sessions in parallel. The feature has both independent and interdependent parts.
How you partition the work -- and when you synchronize -- determines whether the
pieces merge cleanly or produce integration failures.

## Why Your Coding Agent Cares

Parallel agent sessions are the staff engineer's throughput multiplier. Instead
of implementing five components sequentially in one session, you launch five
sessions and get results in the time it takes to do one. The math is compelling.
The reality is more complicated.

Each agent session is isolated. Session A does not know what Session B decided.
If both sessions touch a shared interface -- say, the event payload structure
that component A emits and component B consumes -- they will each invent their
own version. Session A decides events have a `timestamp` field (Unix epoch).
Session B decides they have a `created_at` field (RFC 3339). Both are reasonable.
Both are different. You discover this when you merge and the consumer cannot
parse the producer's output.

This is not a bug in the agent. It is a fundamental property of independent
processes without shared state. Distributed systems engineers know this
intuitively: you cannot have consistency without coordination. The same
principle applies to parallel agent sessions. Independent sessions that touch
shared interfaces will diverge unless you provide a coordination mechanism.

The coordination mechanism is the contract. Before launching parallel sessions,
define every shared interface: event schemas, API contracts, shared types,
database schemas. Each session receives the contract as context. Each session
implements against the contract, not against its own interpretation. The sessions
remain independent in execution but aligned on interfaces.

The partition strategy matters equally. Some tasks are genuinely independent:
adding a new endpoint and writing documentation for an existing one share no
interface. Others are deeply coupled: the API handler and the database migration
for the same feature share field names, types, and constraints. Independent
tasks parallelize safely. Coupled tasks need sequential execution or a shared
contract.

## The Setup

The `starter/` directory contains **taskflow** with a new feature request:
**Audit Logging**. Every significant action in the system should produce an
audit log entry that is stored, queryable, and exportable.

The feature has five components:

**Component 1 -- Audit Event Model**: Define the audit event type in
`internal/models/audit.go`. Fields: event ID, actor (user ID), action (string
enum), resource type, resource ID, timestamp, metadata (JSON blob).

**Component 2 -- Audit Store**: Implement `internal/store/audit.go` with
database operations: insert event, query events by filter (actor, action,
resource, time range), count events.

**Component 3 -- Audit Middleware**: Implement `internal/middleware/audit.go`
that intercepts API requests and emits audit events for mutating operations
(POST, PUT, DELETE).

**Component 4 -- Audit API**: Implement `internal/api/audit.go` with endpoints:
`GET /audit` (list with filters), `GET /audit/{id}` (single event),
`GET /audit/export` (CSV export).

**Component 5 -- Audit Worker**: Implement `internal/audit/worker.go` that
processes audit events asynchronously: enrichment (resolve user ID to name),
retention policy enforcement (delete events older than 90 days), and aggregation
(daily summary counts).

Dependencies between components:
- Components 2, 3, 4, and 5 all depend on the event model (Component 1)
- Component 3 (middleware) produces events that Component 2 (store) persists
- Component 4 (API) reads from Component 2 (store)
- Component 5 (worker) reads from and writes to Component 2 (store)
- Components 3, 4, and 5 are otherwise independent of each other

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
```

## Part 1: The Natural Approach

Five components. Five agent sessions. Launch them all.

Open five separate agent sessions (or use five separate prompts in parallel-capable
tooling). Assign one component to each session. Give each session the full task
description for its component and access to the existing codebase.

Do not write a shared contract. Do not define the audit event type upfront. Let
each session determine what it needs from the shared model based on its own
component's requirements.

When all five sessions complete, merge the outputs into the codebase. Attempt
to build and test.

Record in your interaction log:
1. How you described each component to its session
2. The exact field names and types each session used for the audit event
3. Build errors after merging
4. Test failures after merging
5. Time spent resolving conflicts and integration issues

### Checkpoint

- [ ] Did the project compile after merging all five components?
- [ ] Did all sessions agree on the audit event field names?
- [ ] Did all sessions agree on the audit event field types?
- [ ] Did the middleware produce events the store could persist?
- [ ] Did the API query the store using the schema the store created?
- [ ] Did the worker parse events in the format the middleware emits?
- [ ] How many integration issues did you find? How long did they take to fix?
- [ ] Could you have predicted which components would conflict?

## Part 2: The Effective Approach

Reset the codebase. This time, plan the parallelization.

**Step 1: Define the contract (sequential, you do this first)**

Before launching any agent session, define the shared interfaces. Create
`specs/audit-contract.md`:

```markdown
## Audit Event Model

| Field        | Go Type    | JSON Key       | DB Column      |
|--------------|-----------|----------------|----------------|
| ID           | string    | "id"           | id             |
| ActorID      | string    | "actor_id"     | actor_id       |
| Action       | string    | "action"       | action         |
| ResourceType | string    | "resource_type"| resource_type  |
| ResourceID   | string    | "resource_id"  | resource_id    |
| Timestamp    | time.Time | "timestamp"    | timestamp      |
| Metadata     | json.RawMessage | "metadata" | metadata    |

## Action Enum Values
"create", "update", "delete", "export"

## Store Interface
[Define the exact function signatures the store must implement]

## Query Filter
[Define the filter struct with exact field names]
```

Fill in every detail. Every field name, every type, every enum value. This is
the coordination mechanism.

**Step 2: Implement the model (sequential, one session)**

Launch one agent session to implement Component 1 (the audit event model)
against the contract. Review and commit. This is the foundation -- it must
be correct before anything builds on it.

**Step 3: Implement independent components (parallel, three sessions)**

Now launch three sessions in parallel for Components 3, 4, and 5 (middleware,
API, worker). Each session receives:
- The contract document
- The committed audit event model (Component 1)
- The store interface from the contract (not the implementation)
- The existing codebase files relevant to its package

These three components are independent of each other. They only share the
event model and store interface, both of which are defined.

**Step 4: Implement the store (sequential or parallel)**

Component 2 (the store) can run in parallel with Step 3 if the store interface
is fully defined in the contract. If you are confident in the interface, launch
it with the parallel batch. If not, run it sequentially after the model is
committed.

Merge all outputs. Build and test.

### Checkpoint

- [ ] Did the project compile after merging?
- [ ] Were there any field name or type mismatches?
- [ ] Did the contract cover all shared interfaces?
- [ ] How many integration issues vs. Part 1?
- [ ] How much time did the contract take to write?
- [ ] What was the total wall-clock time (contract + parallel execution +
      merge) vs. Part 1 (parallel execution + conflict resolution)?
- [ ] Did any session deviate from the contract? If so, was the contract
      ambiguous or did the agent ignore it?

## The Principle

Parallel execution is a concurrency problem, and concurrency problems have a
known solution: shared state must be synchronized. In agent orchestration,
shared state is shared interfaces -- types, schemas, contracts, and conventions
that multiple sessions depend on.

The naive approach treats agent sessions like independent microservices that
will "figure it out" at integration time. This works for truly independent
tasks (writing tests for module A while adding a feature to module B). It
fails for coupled tasks, and the failure mode is expensive: you discover
mismatches only after all sessions complete, the merge is manual, and fixing
one component's assumptions often cascades into changes in others.

The effective approach applies the same dependency analysis you use for
distributed systems. Draw the dependency graph. Identify shared interfaces.
Define those interfaces first (this is sequential and cannot be parallelized).
Then parallelize the implementations against the defined interfaces.

The throughput gain is real but not 5x. If a feature has five components,
two sequential dependency-definition steps, and three parallelizable
implementations, your wall-clock time is roughly: contract time + max(three
implementations) + merge time. This is significantly faster than sequential,
and -- critically -- the merge step is trivial because the interfaces were
defined upfront.

The skill is dependency analysis. Before launching parallel sessions, ask:
"If these two sessions make different assumptions about X, will the merge
break?" If yes, X must be defined before both sessions launch.

> **Parallelize independent work; serialize shared interfaces.**

## Reflection

Record in your interaction log:

1. **Dependency graph**: Draw the dependency graph for the five components.
   Which edges did you miss in Part 1? Which edges did the contract cover
   in Part 2?
2. **Contract completeness**: What did the contract miss? Did any integration
   issue in Part 2 trace back to a gap in the contract?
3. **Partition quality**: Were the three parallel components truly independent?
   Did any pair share an implicit dependency the contract did not capture?
4. **Time accounting**: Break down wall-clock time: contract writing, parallel
   execution (wall-clock, not sum), merge/fix. Compare to Part 1's breakdown:
   parallel execution, merge/fix.
5. **Scaling intuition**: If this feature had 10 components instead of 5, how
   would the contract approach scale? What about the uncoordinated approach?

## Going Further

- Take a real feature from your backlog. Decompose it into components. Draw
  the dependency graph. Identify which components can parallelize and which
  must serialize. Execute the plan with parallel agent sessions.
- Experiment with contract granularity: try a minimal contract (just type
  names and field names) vs. a detailed contract (full function signatures,
  error codes, validation rules). Where is the sweet spot?
- Try having one "architect" agent session generate the contract from a feature
  description, then use that contract to coordinate implementation sessions.
  Does the agent-generated contract cover the right interfaces?
