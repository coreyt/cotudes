# STE-003: The Delegation Matrix

> **Axiom**: Delegate what's easily verified, not what's boring.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff Software Engineer |
| **Number** | STE-003 |
| **Primary Competency** | Delegation Judgment |
| **Secondary Competency** | Output Evaluation |
| **Trap Severity** | 4 (Expert) |
| **Prerequisites** | STE-001 (The CLAUDE.md), STE-002 (Spec-Driven Development) |
| **Duration** | 120-150 minutes |
| **Stack** | Go |

## Overview

You face a realistic day of work: implement a rate-limiting algorithm, build three
CRUD API endpoints, write a database migration script, and improve test coverage
for an existing package. You will delegate some of these to an agent and do the
rest yourself. Which tasks you delegate -- and why -- determines the outcome.

## Why Your Coding Agent Cares

Experienced engineers have a reliable heuristic for what is "interesting" vs.
"boring" work. Algorithms are interesting. CRUD endpoints are boring. Migration
scripts are boring. Test coverage is tedious. The instinct is to delegate the
boring parts and keep the interesting parts.

This heuristic is backwards for agent delegation.

An agent excels at tasks with two properties: **easy to specify** and **easy to
verify**. CRUD endpoints are both. You can describe them in a sentence ("create a
REST endpoint for the `teams` resource with standard CRUD operations"). You can
verify them in seconds (run the tests, hit the endpoint, check the response).
Migration scripts are similar: the schema is the spec, the migration is the
implementation, and `go test` verifies it.

A rate-limiting algorithm is neither. Specifying a token bucket with sliding
window, burst handling, and distributed state requires a level of precision that
approaches writing the code itself. Verifying correctness requires reasoning about
edge cases: what happens at exactly the burst boundary? What if two requests
arrive in the same nanosecond? What is the behavior under clock skew? You cannot
verify these by glancing at the output -- you have to think deeply about each case.
That is the work you are good at. That is the work you should keep.

The delegation error is conflating "what I find tedious" with "what the agent
handles well." They are orthogonal axes. The matrix has four quadrants, and most
engineers only see two.

## The Setup

The `starter/` directory contains **taskflow** with a new requirement set. You
have four tasks to complete today:

**Task A -- Rate Limiter**: Implement a token bucket rate limiter with sliding
window support for the API. Requirements: per-client limiting, configurable burst
size, distributed-safe (must work behind a load balancer with shared Redis state),
graceful degradation when Redis is unavailable. The algorithm must handle edge
cases around window boundaries and concurrent access.

**Task B -- Three API Endpoints**: Add CRUD endpoints for a new `labels` resource.
Labels have a name, color (hex string), and project association. Standard REST
patterns: create, read, list-with-filter, update, delete. Follow existing
conventions from the `tasks` and `projects` resources.

**Task C -- Migration Script**: Write a migration that adds the `labels` table,
a `task_labels` join table, and backfills a `default` label for every existing
project. Must be idempotent and include a rollback.

**Task D -- Test Coverage**: The `internal/store/` package has 45% test coverage.
Add table-driven tests to bring it to 80%+. Tests must cover error paths, not
just happy paths.

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
go test -cover ./internal/store/...
```

All four tasks must be completed. You have approximately 2 hours of implementation
time (not counting evaluation). Plan your time accordingly.

## Part 1: The Natural Approach

Look at the four tasks. Decide which ones to delegate to the agent and which to
do yourself. Spend no more than 2 minutes deciding -- go with your gut.

Write down your delegation decision before starting:
- Task A (Rate Limiter): Agent / Self
- Task B (API Endpoints): Agent / Self
- Task C (Migration): Agent / Self
- Task D (Test Coverage): Agent / Self

Now execute. For the tasks you delegated, prompt the agent and review the output.
For the tasks you kept, write the code yourself. Track time spent on each task,
including review and correction time for agent-generated work.

Record in your interaction log:
1. Your delegation decision and reasoning
2. Time spent on each task (implementation + review + correction)
3. Number of issues found in agent output that required rework
4. Your confidence in the correctness of each deliverable

### Checkpoint

- [ ] Which delegated tasks required significant rework?
- [ ] Which self-implemented tasks could the agent have done as well or better?
- [ ] For the rate limiter: if you delegated it, how many edge case bugs did you
      find? If you kept it, how long did it take vs. the CRUD endpoints?
- [ ] For the CRUD endpoints: if you kept them, was that time well spent?
- [ ] What was your total time? How much was implementation vs. review/correction?
- [ ] Did the agent struggle with any task you expected it to handle easily?

## Part 2: The Effective Approach

Reset the codebase. This time, delegate using the verification-cost heuristic:
**delegate tasks where you can verify correctness quickly; keep tasks where
verification requires deep reasoning.**

The delegation matrix:

| Task | Specify | Verify | Delegate? |
|------|---------|--------|-----------|
| A: Rate Limiter | Hard (edge cases, distributed semantics) | Hard (concurrency, boundary conditions) | **Self** |
| B: API Endpoints | Easy (follow existing patterns) | Easy (run tests, hit endpoints) | **Agent** |
| C: Migration | Easy (schema is the spec) | Easy (run migration, check schema) | **Agent** |
| D: Test Coverage | Medium (need to identify gaps) | Easy (run coverage tool) | **Agent** |

For each delegated task, write a brief spec (2-5 sentences) that the agent can
implement against. Reference existing patterns in the codebase. For Tasks B and C,
include the exact field names and types from your data model.

For Task A, implement the rate limiter yourself. You are the right person for
this: you can reason about the edge cases as you write, adjust the design in
real time, and verify correctness through your understanding of the algorithm.

For Task D, give the agent the current coverage report and ask it to target
the uncovered paths. Review the tests it generates -- you are checking that the
tests are meaningful, not just that they pass.

Track the same metrics as Part 1.

### Checkpoint

- [ ] Compare total time between Part 1 and Part 2.
- [ ] Compare rework time on agent-delegated tasks.
- [ ] For the rate limiter: compare your confidence in correctness between
      approaches. If you delegated it in Part 1, did you catch all the edge cases?
- [ ] For the CRUD endpoints: compare quality when agent-generated with a spec
      vs. your initial approach.
- [ ] How much review time did the easily-verified tasks require?
- [ ] Did you finish all four tasks? In which part did you finish faster?

## The Principle

The delegation instinct of a staff engineer is shaped by years of individual
contribution. You delegate what you find tedious because you want to spend your
time on the hard problems. This is rational when the person you delegate to
has the same context you do -- a junior engineer can ask clarifying questions,
notice ambiguity, push back on underspecified requirements.

An agent cannot. It will produce output for any task, regardless of how well
specified. The difference is in what it produces. For a well-specified task
(CRUD endpoints matching existing patterns), the output is reliably correct.
For an underspecified task (a rate limiter with subtle concurrency requirements),
the output is confidently wrong -- it compiles, it passes basic tests, and it
fails in production under edge cases you did not think to test.

The verification cost is the key variable. After the agent delivers:
- CRUD endpoints: run tests, check response format, done. 5 minutes.
- Rate limiter: reason about burst boundaries, concurrent access, clock skew,
  Redis failure modes, window edge cases. 45 minutes -- if you catch everything.

When verification costs approach implementation costs, delegation saves nothing.
When verification is fast and reliable, delegation multiplies your throughput.

Map your daily work onto two axes: specification difficulty and verification
cost. Delegate the bottom-left quadrant (easy to specify, easy to verify).
Keep the top-right quadrant (hard to specify, hard to verify). The other two
quadrants require judgment, but the extremes are clear.

> **Delegate what's easily verified, not what's boring.**

## Reflection

Record in your interaction log:

1. **Decision audit**: What was your gut delegation in Part 1? How did it map
   to the specification/verification matrix?
2. **Verification time**: For each delegated task, how long did verification
   take? Was the time proportional to the task's position on the matrix?
3. **Confidence gap**: For the rate limiter, compare your confidence in the
   agent's implementation vs. your own. What specifically drives the difference?
4. **Work inventory**: List five tasks from your last week at work. Place each
   on the specification/verification matrix. Which should you delegate?
5. **Ego check**: Did you resist delegating the CRUD endpoints because they
   felt "too easy"? Did you resist keeping the algorithm because it felt like
   the agent "should" handle hard things?

## Going Further

- Apply the delegation matrix to a full day of actual work. Track which tasks
  you delegate and the rework rate. After a week, review the pattern.
- Try delegating Task A (the rate limiter) with a comprehensive spec that
  covers every edge case. Measure: is the spec harder to write than the code?
  This is the threshold where delegation stops saving time.
- Identify a task at work that sits in the ambiguous middle of the matrix.
  Try it both ways (self-implement and agent-delegated) and measure the
  difference in total time including verification.
