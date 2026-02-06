# STE-001: The CLAUDE.md

> **Axiom**: Every correction you repeat is a CLAUDE.md entry you haven't written.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff Software Engineer |
| **Number** | STE-001 |
| **Primary Competency** | Context Engineering |
| **Secondary Competency** | Session Management |
| **Trap Severity** | 5 (Instinctive) |
| **Prerequisites** | STE-000 (Environment Setup) |
| **Duration** | 90-120 minutes |
| **Stack** | Go (standard library) |

## Overview

You will add a new API resource to an existing Go HTTP service across multiple
agent sessions. The service has specific conventions for logging, error handling,
testing, and response formatting. Your task is straightforward. How you manage
context across sessions is the variable.

## Why Your Coding Agent Cares

Agents have no memory between sessions. Every session starts cold. If you
correct the agent to use `go test -race -count=1 ./...` instead of
`go test ./...`, that correction is gone next session. You know this
intellectually, but it feels like the agent should remember -- because humans
don't lose context this way.

A CLAUDE.md transforms the cold start. Instead of inferring conventions from
code patterns (which agents do imperfectly), the agent reads explicit rules and
follows them. The time you spend writing 30 lines of CLAUDE.md saves you 15+
corrections across future sessions.

When an agent reads a CLAUDE.md, it doesn't just "follow rules" -- it uses it
to disambiguate decisions throughout the session. A CLAUDE.md entry like
`error wrapping: fmt.Errorf("operation: %w", err)` means every error the agent
writes in that session will follow the pattern. Without it, the agent will pick
a reasonable pattern that might not match yours.

## The Setup

The `starter/` directory contains **taskflow**, a task management API built with
Go's standard library. The service manages two resources -- users and tasks --
with conventions the team has established over time.

Familiarize yourself with the codebase. Read the existing code, run the tests,
understand the patterns.

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
```

The codebase has specific conventions:

- Structured logging with `slog` (JSON format, specific field names)
- Error handling: `fmt.Errorf("operation: %w", err)` wrapping pattern
- HTTP responses: JSON envelope `{"data": ..., "error": ...}`
- Test style: table-driven tests exclusively
- Handler naming: `Handle<Resource><Action>` (e.g., `HandleUserCreate`)
- Package layout: all domain logic in `internal/` packages

**Your assignment**: Add a **projects** resource to the API. Projects have a
name, description, owner (user ID), and status. Implement:

- `POST /projects` -- create a project
- `GET /projects/{id}` -- get a project by ID
- `GET /projects` -- list all projects
- `PUT /projects/{id}` -- update a project
- `DELETE /projects/{id}` -- delete a project

The new code must follow every convention the existing code follows.

## Part 1: The Natural Approach

Open three separate agent sessions (or simulate three by starting fresh each
time). In each session, ask the agent to implement the projects resource.

**Session 1**: Start your agent in the `starter/` directory. Ask it to add the
projects resource with CRUD operations. Do not provide any context beyond the
task description. When the agent produces code, review it against the existing
codebase. Note every deviation from conventions. Correct each one.

**Session 2**: Start a fresh agent session. Same task, same codebase (reset to
the original state first). Same approach. Review. Note deviations. Correct.

**Session 3**: One more fresh session. Same task. Review and correct.

After each session, record in your interaction log:
1. What conventions did the agent get wrong?
2. What corrections did you make?
3. How long did each correction cycle take?

### Checkpoint

Before proceeding, answer honestly:

- [ ] Did the agent make the same category of mistake across sessions?
- [ ] Did you find yourself giving the same correction more than twice?
- [ ] Could you predict what the agent would get wrong before it happened?
- [ ] How much of your time was spent on corrections vs. new work?

If you corrected the same thing three times, you have found the trap.

## Part 2: The Effective Approach

Reset the codebase to its original state.

Before starting a new agent session, create a `CLAUDE.md` file in the project
root. This file is read by the agent at the start of every session. It is your
persistent context -- the accumulated knowledge that prevents repeated mistakes.

Write your CLAUDE.md based on the corrections from Part 1. Every correction
you repeated is an entry. Include:

- The exact commands to build, test, and lint
- The error handling pattern (with example)
- The logging format (with example)
- The response envelope structure
- The test style requirement (table-driven)
- The handler naming convention
- The package layout rules
- Anything the agent assumed incorrectly

Start a fresh agent session with your CLAUDE.md in place. Give the same task.
Compare the output.

### Checkpoint

- [ ] How many corrections did you need to make this time?
- [ ] Did the agent follow conventions from the first prompt?
- [ ] How does time-to-working-code compare to Part 1's sessions?
- [ ] Is the output consistent with the existing codebase?

Compare your CLAUDE.md against `reference/CLAUDE.md`.

## The Principle

The instinct of an experienced engineer is to hold project conventions in
their head and correct deviations as they appear. This works when you write
the code yourself. It fails when you direct an agent, because:

1. **The agent has no memory between sessions.** Every session starts from
   zero.
2. **Your corrections are ephemeral.** They fix the current output but do
   not prevent the next session's mistakes.
3. **The cost of repetition compounds.** Three sessions with five corrections
   each is fifteen interruptions a single document eliminates.

A CLAUDE.md is not documentation. It is not a style guide. It is a **context
injection point** -- the minimal set of information that transforms an agent
from a generic code generator into one that fits your project. The effort to
write it is paid once. The return is collected every session.

The METR study found experienced developers initially took 19% longer with
agents. Repeated corrections without persistent context is a primary cause.

> **Every correction you repeat is a CLAUDE.md entry you haven't written.**

## Reflection

Record in your interaction log:

1. **Mapping**: List the corrections from Session 1 alongside the CLAUDE.md
   entries that eliminated them. How close is the mapping?
2. **Resistance**: Did you feel that writing the CLAUDE.md was "extra work"?
   Compare the time spent writing it against the cumulative correction time
   across three sessions.
3. **Coverage**: What did your CLAUDE.md miss that the reference included?
   What did you include that the reference did not?
4. **Transfer**: What are the first five CLAUDE.md entries you would write
   for your actual codebase at work?

## Going Further

- Add a sixth convention to the codebase (e.g., a required HTTP header, a
  specific middleware pattern). Test whether one more CLAUDE.md entry prevents
  one more category of mistake.
- Try removing one entry from your CLAUDE.md and running a fresh session.
  Does the agent regress to the old mistake?
- Review STE-002 (Spec-Driven Development): a CLAUDE.md tells the agent
  *how* you build; a spec tells it *what* to build. These are complementary.
