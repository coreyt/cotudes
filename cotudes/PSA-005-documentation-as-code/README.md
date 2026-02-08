# PSA-005: Documentation as Code

> **Axiom**: Documentation the agent can't find is documentation that doesn't exist.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Principal Software Architect |
| **Number** | PSA-005 |
| **Primary Competency** | Context Engineering |
| **Trap Severity** | 3 (Intermediate) |
| **Prerequisites** | PSA-001, PSA-002 |
| **Duration** | 2-3 sessions |
| **Stack** | Any (Go / TypeScript examples) |

## Overview

You will add a feature to a system whose architecture is thoroughly documented
-- in a wiki the agent cannot access. The documentation is accurate, detailed,
and completely invisible to the agent. The agent will violate documented
patterns because, from its perspective, those patterns do not exist. Then you
will move the documentation into the codebase and watch the same agent follow
every pattern without being told.

## Why Your Coding Agent Cares

Most organizations have good documentation. It lives in Confluence, Notion,
Google Docs, or a SharePoint site. It describes module responsibilities, data
flow invariants, deployment constraints, and cross-cutting concerns. Senior
engineers wrote it carefully and keep it reasonably current. The problem is not
quality. The problem is location.

When an agent begins work on a codebase, it reads what is in front of it: source
files, configuration, tests, and any documentation committed alongside the code.
It does not have credentials to your wiki. It does not know the wiki exists. If
you paste excerpts into the prompt, the agent gets a snapshot -- frozen in time,
stripped of cross-references, missing the three paragraphs of context that
surround the excerpt. The agent operates on what it can see, and what it can see
is incomplete.

The failure is quiet. The agent produces code that is internally consistent,
passes tests, and violates an architectural pattern described on page four of
your Confluence space. In review, you catch it -- because you read the
Confluence page last month. Next quarter a new hire misses the same violation,
because they did not read the Confluence page either. The documentation exists.
It just does not exist where it matters.

Documentation as code means architecture documentation lives in the repository,
versioned alongside the code it describes. ARCHITECTURE.md at the repo root.
ADRs in `docs/decisions/`. README files in each package describing
responsibilities and constraints. Type-level encodings of invariants that make
illegal states unrepresentable. When the agent explores the codebase, it finds
these files automatically as part of context discovery. No special instructions,
no pasted excerpts, no wiki credentials. The documentation is where the work
happens.

## The Setup

The `starter/` directory contains **clairvoy**, an event analytics pipeline
with three services: an ingestion API, a stream processor, and a query engine.
The system processes clickstream events, enriches them with session data, and
serves aggregated metrics through a REST API.

```bash
cd starter/
# Go variant
go build ./...
go test -race -count=1 ./...

# TypeScript variant
npm install && npm test
```

The codebase works. The tests pass. The architecture documentation lives
in `wiki/` -- a directory containing Markdown files that simulate an external
wiki. These files describe:

- **Service boundaries**: which service owns which data, and what crosses
  service boundaries via events vs. API calls
- **Event schema conventions**: all events use CloudEvents envelope format,
  with `type` field following `com.clairvoy.<domain>.<action>` naming
- **Idempotency requirements**: every event handler must be idempotent;
  the stream processor guarantees at-least-once delivery
- **Query engine constraints**: aggregation queries must use pre-computed
  materialized views, never scan raw events at query time
- **Deployment invariant**: the ingestion API and stream processor share no
  runtime state; all coordination happens through the event bus

The wiki documentation is accurate. It is also outside the agent's natural
discovery path.

**Your assignment**: Add a new "user journey" analytics feature. The ingestion
API receives a new `JourneyStepCompleted` event type. The stream processor
enriches it with session context and emits a `JourneyAnalyzed` event. The
query engine serves journey completion funnels through a new endpoint.

## Part 1: The Natural Approach

Start your agent in the `starter/` directory. Describe the feature:

> "Add a user journey analytics feature. The ingestion API should accept
> JourneyStepCompleted events. The stream processor should enrich them with
> session context and emit JourneyAnalyzed events. The query engine should
> serve journey completion funnels through a new REST endpoint."

Do not mention the wiki. Do not paste excerpts. Let the agent work with what
it finds in the codebase.

Run the tests. They will likely pass.

### Checkpoint

Inspect the agent's implementation against the wiki documentation:

- [ ] Does the new event use CloudEvents envelope format with the correct
  `type` field naming convention (`com.clairvoy.journey.step-completed`)?
- [ ] Is the stream processor handler idempotent? Can it safely process the
  same event twice without double-counting journey steps?
- [ ] Does the query engine endpoint use a materialized view, or does it scan
  raw events at query time?
- [ ] Does the implementation respect service boundaries -- no shared runtime
  state between ingestion and stream processor?
- [ ] Does the event schema follow the conventions described in the wiki?

Now try the halfway measure. Paste the relevant wiki sections into the agent's
context and ask it to fix the violations:

> "Here are our architecture docs: [paste]. Please update the implementation
> to follow these patterns."

Observe: does the agent fix the specific violations you highlighted while
introducing new ones from the context it still lacks? Does it treat the pasted
excerpts as suggestions or constraints?

## Part 2: The Effective Approach

Reset the codebase. Before starting a new session, move the documentation into
the repository:

1. Create `ARCHITECTURE.md` at the repo root summarizing service boundaries,
   data flow, and cross-cutting invariants.

2. Create `docs/decisions/` with ADRs for the key architectural choices:
   - `ADR-001-cloudevents-envelope.md` -- why CloudEvents, the naming convention,
     the envelope structure
   - `ADR-002-idempotent-handlers.md` -- at-least-once delivery guarantee,
     idempotency key strategy, deduplication window
   - `ADR-003-materialized-views.md` -- no raw event scans at query time,
     materialized view refresh strategy, consistency tradeoffs

3. Add a `README.md` to each service directory describing that service's
   responsibilities, its public interface, and what it must never do.

4. Where possible, encode constraints as types: an `EventEnvelope` struct
   that enforces the CloudEvents shape, an `IdempotencyKey` type that the
   handler signature requires, a query builder that only accepts materialized
   view references.

Delete the `wiki/` directory. The documentation now lives where the code lives.

Start a new agent session. Give the identical feature request. Do not mention
the documentation -- the agent will find it.

### Checkpoint

- [ ] How many architectural violations remain compared to Part 1?
- [ ] Did the agent discover and reference ARCHITECTURE.md, the ADRs, or the
  package READMEs without being told to?
- [ ] Did the type-level constraints prevent violations at compile time rather
  than requiring documentation to be read?
- [ ] Compare: same feature, same agent, same prompt. The only variable is
  where the documentation lives. What changed?

## The Principle

Documentation has two audiences: the person deciding whether the architecture
is correct, and the person (or agent) implementing within it. Wiki-based
documentation serves the first audience well. It is browsable, searchable for
humans, and supports rich cross-linking. It is invisible to the second audience
when that audience is an agent.

This is not an argument against wikis. It is an argument for redundancy in the
right direction. The canonical architecture documentation belongs in the
repository because that is where implementation happens. A wiki can mirror it,
summarize it, or link to it. But the source of truth must be where the
implementer -- human or agent -- will find it without being told where to look.

The deeper principle is about context discovery. Agents do not ask clarifying
questions about documentation they do not know exists. They do not search wikis
they cannot access. They work with what they find. If your architecture depends
on documentation that requires a login, a bookmark, or institutional knowledge
to locate, it depends on documentation that does not exist for an agent.

The fix is not "tell the agent about the wiki." The fix is to make the
documentation discoverable by default: in the repo, at predictable paths,
following conventions the agent already knows to look for. ARCHITECTURE.md,
ADRs, package-level READMEs, type-level constraints. These are not novel ideas.
They are standard practice that most teams skip because the wiki was good
enough for humans.

It was. It is not good enough for agents. And if you are honest, it was not
good enough for the new hire on their second week either.

> **Documentation the agent can't find is documentation that doesn't exist.**

## Reflection

Record in your interaction log:

1. **Audit**: Where does your architecture documentation live right now? How
   many clicks, logins, or bookmarks does it take to get from the code to the
   relevant doc? That is the distance the agent cannot cross.
2. **Discovery test**: Clone your repo into a fresh environment. Without any
   external access, can you determine the architectural constraints? If you
   cannot, neither can the agent.
3. **Excerpt fragility**: When you pasted wiki excerpts in Part 1, what
   context was lost? Cross-references to other docs? Version history showing
   why a decision was made? Related constraints on the same page?
4. **Type vs. doc**: Which constraints were more effectively communicated
   through types than through documentation? Where did types make documentation
   redundant?
5. **Maintenance cost**: What is the ongoing cost of keeping in-repo
   documentation current? How does it compare to the cost of wiki documentation
   drift -- which is the same cost, just invisible until someone (or something)
   violates a stale doc?

## Going Further

- Run the discovery test on your three most critical services. For each,
  catalog: what architectural knowledge is only in the wiki? What is only in
  people's heads? What is in the repo? Create a migration plan to move the
  critical subset into the codebase.
- Design an ADR template that serves both human reviewers and agent
  implementers. Include: decision, constraints (as checkable assertions),
  examples (as concrete input/output pairs), and anti-patterns (what the
  implementation must NOT do).
- Measure the impact: have an agent implement the same feature in a repo
  with wiki-only docs, then with in-repo docs, then with in-repo docs plus
  type-level constraints. Track invariant violations across the three runs.
  Plot the curve. Show it to your team.
