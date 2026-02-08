# STE-002: Spec-Driven Development

> **Axiom**: The spec isn't overhead -- it's the interface between your intent and the agent's execution.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff Software Engineer |
| **Number** | STE-002 |
| **Primary Competency** | Specification Writing |
| **Secondary Competency** | Context Engineering |
| **Trap Severity** | 4 (Expert) |
| **Prerequisites** | STE-001 (The CLAUDE.md) |
| **Duration** | 120-180 minutes |
| **Stack** | Go |

## Overview

You will implement a cross-service feature -- adding a "team assignment" capability
that touches an API service, a database migration, and a notification worker. The
feature requires coordinated changes across three packages with shared data
contracts. How you communicate intent to the agent determines whether the pieces
integrate.

## Why Your Coding Agent Cares

An agent given the instruction "add team assignment to the project service" will
produce working code. It will pick reasonable field names, sensible types, and
plausible error handling. The problem is that "reasonable" choices made independently
across three components almost never align. The API returns `team_id` as a string;
the migration creates it as an integer. The notification worker expects
`assigned_at` as RFC 3339; the API serializes it as Unix epoch. Each piece compiles.
Each piece passes its own tests. Integration fails.

This happens because agents optimize locally. When generating the API handler, the
agent's context is the handler code. When generating the migration, the context is
the schema. There is no shared contract binding the two unless you provide one. The
agent doesn't "forget" the API when writing the migration -- it never had the API's
decisions as hard constraints in the first place.

A spec document changes the agent's relationship to each component. Instead of
inventing conventions per-component, the agent implements against an explicit
contract: field names, types, formats, error codes, and validation rules defined
once. The spec becomes the source of truth the agent references for every decision.
You write the spec in 15 minutes. It saves you 90 minutes of integration debugging.

This is the same principle as writing interface contracts between teams -- except
your "teams" are separate agent sessions (or separate prompts within a session),
and they cannot coordinate with each other. The spec is their only communication
channel.

## The Setup

The `starter/` directory contains **taskflow**, the same task management service
from STE-001, now extended with three packages:

- `internal/api/` -- HTTP handlers for the REST API
- `internal/store/` -- Database access layer (SQLite)
- `internal/notify/` -- Notification worker that processes events

The service currently supports users, tasks, and projects. Your assignment is to
add **team assignment**: the ability to assign a team of users to a project, with
notifications sent when assignments change.

This requires:

1. **API changes**: New endpoints for team management (`POST /projects/{id}/team`,
   `GET /projects/{id}/team`, `DELETE /projects/{id}/team/{user_id}`)
2. **Database migration**: New `project_teams` table with membership tracking and
   timestamps
3. **Notification worker**: Events emitted on team changes, consumed by the
   notification worker to send assignment notifications

Acceptance criteria:
- All three components use identical field names and types for shared data
- Timestamps are consistently formatted across all components
- Error codes from the API match what the notification worker expects
- The migration schema matches what the store layer queries
- All existing tests continue to pass; new tests cover the team feature

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
```

## Part 1: The Natural Approach

You know what team assignment looks like. You have built features like this many
times. Start implementing.

Open your agent and give it the full task: add team assignment to the project
service, covering the API, database, and notification components. Let the agent
work through each component. You can do this in a single session or across
multiple prompts -- whatever feels natural.

Do not write a spec or contract document first. You are an experienced engineer;
you can describe the feature clearly enough. Let the agent interpret your intent
for each component.

When the agent finishes all three components, integrate them. Run the tests.
Attempt to exercise the full flow: create a team assignment via the API, verify
it is persisted correctly, confirm the notification worker processes the event.

Record in your interaction log:
1. The exact field names each component uses for the same concept
2. The timestamp format each component uses
3. The error handling pattern in each component
4. How many integration issues you found
5. How long you spent fixing integration mismatches

### Checkpoint

- [ ] Do the API response field names exactly match the database column names
      where they should?
- [ ] Does the notification worker parse the event payload without type
      conversion or field renaming?
- [ ] Are timestamps in the same format across all three components?
- [ ] Did error codes from the API layer match what the worker expects?
- [ ] How many "glue code" fixes did you need to make the pieces fit?
- [ ] How many of those fixes were the agent's fault vs. ambiguity in your
      instructions?

## Part 2: The Effective Approach

Reset the codebase to its original state.

Before touching any code, write a **feature spec** document. This is not a product
requirements document -- it is a technical contract. Create a file called
`specs/team-assignment.md` in the project root.

Your spec must define:

1. **Data model**: Exact field names, types, and constraints for the
   `project_teams` table. Column names, Go struct field names, and JSON field
   names -- all three.
2. **API contract**: Request/response schemas for each endpoint. Exact JSON
   field names, types, status codes, and error response format.
3. **Event contract**: The exact payload structure for team change events.
   Field names, types, timestamp format (pick one: RFC 3339).
4. **Shared constants**: Error codes, status values, any enumerated types.
5. **Validation rules**: Which fields are required, length limits, foreign key
   constraints.

The spec should be 40-80 lines. Dense, no prose. Tables and code blocks.

Now implement the feature. For each component, include the spec in your prompt:
"Implement the API endpoints defined in this spec" with the relevant sections
pasted or referenced. The agent implements against the contract, not against its
own interpretation of the feature.

After all components are built, integrate and test.

### Checkpoint

- [ ] Do field names match across all three components without manual fixes?
- [ ] Do timestamp formats match without conversion code?
- [ ] Did the notification worker parse API events without modification?
- [ ] How many integration fixes were needed? (Compare to Part 1.)
- [ ] How long did the spec take to write vs. how much integration time it saved?
- [ ] Did the agent ever deviate from the spec? If so, was the spec ambiguous?

Compare your spec against `reference/specs/team-assignment.md`.

## The Principle

Staff engineers carry system design in their heads. You know how the pieces
connect because you have built systems like this before. That mental model is
precise enough to write correct code yourself. It is not precise enough to
transfer to an agent through natural language instructions.

The gap is not intelligence -- it is context. When you tell an agent to "add team
assignment," the agent has no access to the decisions you have already made in
your head: that `user_id` is a UUID string, that timestamps are RFC 3339, that
error responses use a `code` field. The agent makes its own decisions. They are
reasonable. They are different from yours. And they are different from each other
across components.

A spec externalizes your mental model into a document the agent can reference.
It turns implicit decisions into explicit constraints. The cost is 15-20 minutes
of writing. The return is integration that works on the first attempt.

This pattern scales. A spec for a two-component feature saves you an hour. A spec
for a six-service feature saves you a day. The larger the system, the more the
spec pays for itself -- because the number of implicit decisions grows
combinatorially with the number of components.

> **The spec isn't overhead -- it's the interface between your intent and the agent's execution.**

## Reflection

Record in your interaction log:

1. **Integration delta**: Count the integration issues in Part 1 vs. Part 2.
   What is the ratio?
2. **Spec as debugging tool**: When an integration issue occurred in Part 2,
   was it because the agent deviated from the spec or because the spec was
   incomplete? Which is easier to fix?
3. **Spec granularity**: Which parts of your spec were most valuable? Which
   were unnecessary? What is the minimum viable spec for this feature?
4. **Mental model audit**: What decisions did you not realize you had made
   until writing the spec? List them.
5. **Resistance check**: Did writing the spec feel like unnecessary overhead?
   How do you feel about it now?

## Going Further

- Take the feature spec and ask the agent to implement the same feature in a
  language you do not know well. Does the spec transfer across language barriers?
- Write a spec for a feature you are currently building at work. Use it with
  your agent. Measure integration issues against your last unspecced feature.
- Try having the agent write the first draft of the spec from a product
  requirements description, then review and tighten it yourself. Compare the
  quality of output when the agent writes against its own spec vs. yours.
