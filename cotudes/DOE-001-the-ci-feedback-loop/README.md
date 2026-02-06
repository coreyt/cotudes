# DOE-001: The CI Feedback Loop

> **Axiom**: CI output designed for humans to read is CI output agents can't use -- design for both audiences.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff DevOps / CI/CD Engineer |
| **Number** | DOE-001 |
| **Primary Competency** | Feedback Loop Design |
| **Trap Severity** | 4 (Common) |
| **Prerequisites** | DOE-000 (Environment Setup) |
| **Duration** | 2-3 sessions |
| **Stack** | GitHub Actions / YAML, TypeScript |

## Overview

You will fix a failing CI pipeline for a TypeScript library, then redesign the
pipeline to provide structured, agent-parseable output. The first time, you
will watch the agent struggle with opaque error messages. The second time, you
will watch it fix the same issues in a single pass.

## Why Your Coding Agent Cares

When CI output is a wall of unstructured text, the agent has to parse
human-readable error messages, distinguish root causes from cascading failures,
and guess which file and line caused the problem. It can do this, but
imperfectly. Each failed guess costs another round-trip.

Structured CI output with file paths, line numbers, and error codes lets the
agent fix issues in a single pass. This isn't a marginal improvement -- it's
the difference between "agent iterates 4 times burning tokens" and "agent fixes
it in one shot."

The most frustrating CI output for an agent is "FAIL" with a test name but no
stack trace, or a TypeScript error buried in 200 lines of npm output. When the
agent sees `::error file=src/metrics.ts,line=42,col=5,code=TS2345::Argument of
type 'string' is not assignable...`, it fixes it immediately. The structured
format is a direct input to the agent's reasoning, not something it has to
extract from noise.

## The Setup

The `starter/` directory contains **metrics-lib**, a TypeScript library for
application metrics with intentional issues:

- A type error in one file
- A lint violation in another
- A failing test
- A missing type annotation

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`)
that runs build, lint, and test in a single job. The workflow is functional
but produces human-readable output only -- no structured error reporting, no
annotations, no machine-readable results.

```bash
cd starter/
npm install
npm run ci    # This will fail -- that's intentional
```

**Your assignment in two phases**:

1. Use an agent to fix all CI failures
2. Redesign the CI pipeline to provide structured, agent-friendly output

## Part 1: The Natural Approach

Start your agent. Show it the CI output:

```bash
npm run ci 2>&1 | head -100
```

Ask the agent:

> "The CI pipeline is failing. Fix all the issues so it passes."

Observe how the agent works. It will see error output, attempt a fix, re-run
CI, see new errors (or the same ones described differently), and iterate.

### Checkpoint

Record in your interaction log:

- [ ] How many CI runs did the agent need before all checks passed?
- [ ] Did the agent fix issues in the correct order, or did it chase errors
  caused by earlier failures?
- [ ] How much of the CI output was useful to the agent vs. noise?
- [ ] Did the agent misinterpret any error messages?
- [ ] Count the total tokens/time spent on the iterative fix cycle.

## Part 2: The Effective Approach

Reset the codebase to the broken state. Now, before asking the agent to fix
anything, redesign the CI pipeline.

Create a new `.github/workflows/ci.yml` with these properties:

1. **Separate jobs** for build, lint, and test (run in parallel where possible)
2. **Structured error output** for each step:
   - File path, line number, column, error code, and message
   - GitHub Actions annotations (`::error file=...::message`)
3. **Machine-readable test results** (JUnit XML or JSON reporter)
4. **Summary step** that aggregates all results into a structured report
5. **Exit codes** that distinguish between "failed" and "errored"

You can design this yourself or use the reference at
`reference/.github/workflows/ci.yml` as a starting point.

Also create a local CI runner script (`ci-local.sh`) that produces the same
structured output without needing GitHub Actions:

```bash
#!/bin/bash
# Structured CI output for agent consumption
echo "=== BUILD ==="
npm run build 2>&1 | while IFS= read -r line; do
  # Parse TypeScript errors into structured format
  if [[ "$line" =~ ^(src/[^:]+):([0-9]+):([0-9]+).*error\ TS([0-9]+):\ (.*) ]]; then
    echo "::error file=${BASH_REMATCH[1]},line=${BASH_REMATCH[2]},col=${BASH_REMATCH[3]},code=TS${BASH_REMATCH[4]}::${BASH_REMATCH[5]}"
  fi
done
# ... similar for lint and test
```

Now start a fresh agent session. Run the structured CI and show the output:

```bash
bash ci-local.sh
```

Ask the agent to fix the issues.

### Checkpoint

- [ ] How many iterations did the agent need this time?
- [ ] Did it fix all issues in a single pass?
- [ ] Did it correctly interpret the structured error locations?
- [ ] Compare total tokens/time to Part 1.

## The Principle

CI pipelines evolved to serve human developers. A human reads "FAIL" and
scrolls up to find the red text. A human recognizes that the test failure on
line 47 is probably related to the build error on line 12. A human knows to
fix the type error first because the test failure might be a cascade.

An agent processing the same output sees a wall of text. It cannot
distinguish error messages from status messages. It cannot tell which errors
are root causes and which are cascades. It cannot find the file and line
number buried in a stack trace formatted for human eyes.

When you design CI output, you are designing a **feedback loop**. For human
developers, an imprecise feedback loop costs minutes of scrolling. For agents
iterating in a loop, an imprecise feedback loop costs multiple round-trips --
each one burning tokens and time.

Structured CI output is not just an agent optimization. It benefits every
consumer of CI results: dashboards, alerting systems, IDE integrations, and
yes, AI agents. The agent use case simply makes the cost of unstructured
output visible.

As the DevOps engineer, you build the feedback loops that make agents
effective for everyone on the team. A CI pipeline that agents can parse is
a CI pipeline that accelerates the entire development cycle.

> **CI output designed for humans to read is CI output agents can't use -- design for both audiences.**

## Reflection

Record in your interaction log:

1. **Iteration cost**: How many agent iterations did Part 1 require vs. Part
   2? What was the cost difference (tokens, time, frustration)?
2. **Error parsing**: What specific CI output formats confused the agent in
   Part 1? How did structured output eliminate the confusion?
3. **Dual audience**: Who else besides agents benefits from structured CI
   output? How does it change your team's debugging workflow?
4. **Your pipelines**: Look at your actual CI/CD pipelines at work. What
   would it take to add structured output? What's the first step?

## Going Further

- Add a security scanning step (e.g., `npm audit`) to the structured CI.
  Design the output format so an agent can determine which vulnerabilities
  are actionable vs. informational.
- Create a CI output parser that converts your existing CI logs into
  structured annotations. Run it as a post-processing step.
- Review DOE-003 (Pipeline as Agent Guardrail): this etude addresses CI
  output format; DOE-003 addresses designing CI stages that catch specific
  categories of agent mistakes.
