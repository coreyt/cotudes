# STE-004: Context Window Economics

> **Axiom**: The agent's context window is not a database -- every token competes for attention.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff Software Engineer |
| **Number** | STE-004 |
| **Primary Competency** | Context Engineering |
| **Secondary Competency** | Specification Writing |
| **Trap Severity** | 3 (Practiced) |
| **Prerequisites** | STE-001 (The CLAUDE.md), STE-002 (Spec-Driven Development) |
| **Duration** | 90-120 minutes |
| **Stack** | Go |

## Overview

You will make a targeted change to one module in a multi-package Go service. The
codebase has 50+ files. How much of it you feed to the agent -- and which parts --
directly determines output quality. You will measure the difference between
flooding the context and curating it.

## Why Your Coding Agent Cares

When you work in a large codebase, you mentally filter. You know which files
matter for a given change and which are irrelevant. You do not hold the entire
codebase in your head -- you hold a working set of 3-8 files plus a rough map
of the rest.

Agents have a context window, not a working memory. Everything you put in the
window receives attention -- literally. The transformer architecture distributes
attention across all tokens. When you include 50 files, the agent attends to
patterns, names, and structures in all of them. The signal from the 3 files that
actually matter is diluted by the noise from the 47 that do not.

This manifests as specific, observable degradation. The agent starts borrowing
patterns from unrelated files: it uses the error handling from the auth package
in the billing module, it names variables after conventions in the CLI layer
when writing API code, it imports packages it saw in the context but does not
need. The output compiles, but it is a chimera -- pieces of the entire codebase
stitched together rather than a focused implementation in the target module.

The fix is curation, not restriction. The agent needs context -- but the right
context. For a change in the billing module, it needs: the billing module itself,
the interfaces it depends on (not the implementations), and any shared types or
contracts. This is typically 5-8 files, totaling a few hundred lines. The rest
is noise.

The economics are real. Context window tokens cost money and latency. More
importantly, they cost quality. There is a measurable inflection point where
adding more context starts reducing output quality rather than improving it.
Finding that point is a skill.

## The Setup

The `starter/` directory contains **taskflow**, now grown to a realistic size:
50+ files across multiple packages.

```
internal/
  api/        -- HTTP handlers (8 files)
  store/      -- Database layer (6 files)
  notify/     -- Notification worker (4 files)
  auth/       -- Authentication middleware (5 files)
  billing/    -- Billing and usage tracking (6 files)
  metrics/    -- Metrics collection (3 files)
  queue/      -- Job queue (4 files)
  config/     -- Configuration loading (3 files)
  models/     -- Shared types (4 files)
  middleware/ -- HTTP middleware chain (5 files)
```

Your assignment: Add **usage-based billing** to the billing module. When a user
makes an API request, the billing module should track the request, categorize it
by endpoint type, and update the user's usage counter. This change primarily
touches `internal/billing/` and `internal/models/usage.go`, with a minor
integration point in `internal/middleware/`.

Acceptance criteria:
- `internal/billing/tracker.go` -- new file implementing usage tracking
- `internal/billing/tracker_test.go` -- table-driven tests
- `internal/models/usage.go` -- new usage event type
- `internal/middleware/billing.go` -- middleware that calls the tracker
- Existing tests pass; new tests cover the billing tracker
- The implementation follows the billing package's existing patterns, not
  patterns from other packages

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
wc -l internal/**/*.go | tail -1  # see total codebase size
```

## Part 1: The Natural Approach

You want the agent to understand the full codebase so it can make informed
decisions. Provide comprehensive context.

Give the agent the complete codebase. You can do this by opening a session in
the project root and telling the agent to read all Go files, or by pasting the
contents of every package. The goal is to ensure the agent "knows everything"
before it starts.

Then ask it to implement usage-based billing as described in the acceptance
criteria. Let the agent work.

Review the output carefully. For each file the agent produces, note:

1. Which package's patterns it follows (billing, or something else?)
2. What imports it includes (are they all necessary?)
3. What naming conventions it uses (do they match the billing package?)
4. Whether it introduces any types, patterns, or abstractions borrowed from
   unrelated packages

Record in your interaction log:
1. Total lines of context provided to the agent
2. Files produced and their quality
3. Patterns borrowed from unrelated packages
4. Time spent reviewing and correcting

### Checkpoint

- [ ] Does `tracker.go` follow the patterns in `internal/billing/`, or does it
      borrow patterns from `internal/auth/` or `internal/queue/`?
- [ ] Does the middleware follow `internal/middleware/` conventions, or does it
      introduce patterns from other packages?
- [ ] Are there unnecessary imports from packages the billing module should not
      depend on?
- [ ] Does the agent's variable naming match the billing package or the
      codebase at large?
- [ ] Did the agent introduce any abstractions (interfaces, factories, wrappers)
      that exist elsewhere in the codebase but are not needed here?
- [ ] How confident are you that the output fits the billing module specifically?

## Part 2: The Effective Approach

Reset the codebase. This time, curate the context deliberately.

Identify the minimal context the agent needs:

**Essential (include)**:
- `internal/billing/` -- all existing files (the agent needs the package's
  patterns, types, and conventions)
- `internal/models/` -- shared types the billing module depends on
- `internal/middleware/billing.go` (if it exists) or one existing middleware
  file as a pattern reference
- The interface that `billing` exposes to other packages (not the consumers'
  implementations)

**Useful (include as summaries)**:
- The API route registration (so the agent understands where middleware hooks in)
- The billing package's test file (so the agent matches test patterns)

**Noise (exclude)**:
- `internal/auth/` -- different domain, different patterns
- `internal/queue/` -- irrelevant to this change
- `internal/notify/` -- irrelevant to this change
- `internal/metrics/` -- the billing module has its own metrics approach
- `internal/config/` -- unless billing reads config directly

Provide only the essential and useful context. For the useful items, consider
providing just the interface signatures rather than full implementations.

Write a brief prompt that frames the task within the billing package:
"Implement usage tracking in the billing package. Follow the existing patterns
in this package. Here are the files..." Then include only the curated context.

Review the output against the same criteria as Part 1.

### Checkpoint

- [ ] Does the output match billing package patterns more closely than Part 1?
- [ ] Are there fewer unnecessary imports?
- [ ] Is the naming more consistent with the target package?
- [ ] Did the agent avoid introducing patterns from packages it never saw?
- [ ] Compare the total review/correction time to Part 1.
- [ ] How many lines of context did you provide vs. Part 1? What was the ratio
      of quality improvement to context reduction?

## The Principle

The context window is an economic system. Every token has an opportunity cost.
Including a file means every other file in the context receives proportionally
less attention. This is not a metaphor -- it is how transformer attention works.

Staff engineers accumulate context naturally: years in a codebase build a mental
map that lets you filter without thinking. The instinct to give the agent "all
the context" is an attempt to replicate your mental map in the agent. But your
mental map has structure -- foreground and background, relevant and irrelevant,
active and dormant. The context window is flat. Everything in it is equally
available to the attention mechanism.

The practical rule: for a change in module X, the agent needs:
1. **Module X itself** -- full files, all conventions and patterns
2. **Interfaces X depends on** -- signatures only, not implementations
3. **Shared types** -- data structures that cross module boundaries
4. **One example** -- of any new pattern you want the agent to follow

This is typically 10-20% of a medium codebase. The other 80% is noise that
actively degrades output.

The skill is curation. You already do this for junior engineers: "You only need
to look at these files for this change." Do the same for the agent. The agent
is better than a junior at following patterns -- but only the patterns you show
it.

> **The agent's context window is not a database -- every token competes for attention.**

## Reflection

Record in your interaction log:

1. **Attention audit**: In Part 1, which unrelated package most influenced the
   agent's output? Can you trace specific patterns in the output to specific
   files in the context?
2. **Curation cost**: How long did it take to curate context in Part 2? Is this
   cost justified by the quality improvement?
3. **The 80/20 point**: Estimate the percentage of the codebase that was
   relevant to this change. How close was your curated set to this ideal?
4. **Signal density**: Compare the ratio of useful-context-tokens to
   total-context-tokens in Part 1 vs. Part 2. What was the signal density in
   each case?
5. **Transfer**: For your actual codebase at work, what is the typical module
   boundary? How would you curate context for a change within that boundary?

## Going Further

- Run the same task three times with increasing context: (a) just the billing
  package, (b) billing + interfaces, (c) the full codebase. Score output quality
  on a 1-5 scale for each. Plot the curve. Where is the inflection point?
- Experiment with context summaries: instead of including full files from
  related packages, write 2-3 sentence summaries. Compare output quality to
  full-file inclusion. Is the summary sufficient?
- Try a change that genuinely requires broad context (a cross-cutting refactor).
  Does the curated approach still work, or does the nature of the task demand
  a wider window? What is the threshold?
