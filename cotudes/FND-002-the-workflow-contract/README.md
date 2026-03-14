# FND-002: The Workflow Contract

> **Axiom**: Structure the collaboration before you start. The contract is the plan; the plan survives contact with the agent.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Common Foundation |
| **Number** | FND-002 |
| **Primary Competency** | Workflow Architecture |
| **Secondary Competencies** | Task Decomposition, Recovery Patterns |
| **Trap Severity** | 3 (Structural) |
| **Prerequisites** | FND-001 (The Failure Map) |
| **Duration** | 90–120 minutes |
| **Stack** | TypeScript (Node.js, Vitest) |

## Overview

You will implement a `migrate` command for the taskman CLI -- a multi-step
data processing operation that reads, validates, transforms, reports, and
writes. In Part 1, you ask the agent to produce it in one shot. In Part 2,
you define a workflow contract and execute phase by phase.

## Why Your Coding Agent Cares

When you ask an agent to implement a multi-step operation as a single request,
it writes everything at once. You receive a large block of output. If step 3
is wrong, the agent has already built step 4 on top of it. By the time you
discover the error, the cost of correction is proportional to everything that
followed it.

A workflow contract defines the collaboration structure before you start:

- **Scope**: which files and data the agent may touch without asking
- **Phases**: discrete units of work, each with a clear input and output
- **Checkpoints**: what you verify at each phase boundary before proceeding
- **Approval gates**: decisions that require your judgment before the agent
  continues
- **Restart conditions**: what triggers stopping and rethinking

The agent follows whatever structure you define. If you define none, it
improvises one. Your contract is better than its improvisation because it
reflects your knowledge of the domain, the risks, and the correct sequencing.

This is not micromanagement. You don't write less code than the agent. You
don't review more. You verify earlier, when errors are cheap to fix.

## The Setup

The `starter/` directory contains **taskman** with the priority feature from
FND-001 already implemented. Install and verify:

```bash
cd starter/
npm install
npm test       # all tests should pass
```

The task type now includes `priority: number`. The `addTask` function enforces
the `#urgent` + priority constraint. The existing tests cover this behavior.

**Your assignment**: Add a `migrate` command that handles tasks.json files
that may not have the `priority` field (written by an older version of the
tool). The command must:

1. **Read**: load tasks.json
2. **Validate**: check each task for missing required fields and invalid values
3. **Transform**: for tasks missing `priority`, apply the default (3); for
   tasks tagged `#urgent` with `priority < 4`, flag them as invalid rather
   than silently overwriting
4. **Report**: print a summary of how many tasks were migrated, skipped, or
   flagged as invalid
5. **Write**: only if all tasks are either valid or migratable, write the
   updated tasks.json atomically (write to `tasks.json.tmp`, then rename)

The command must not write if any task is invalid. It must not modify tasks
that are already valid.

## Part 1: The Natural Approach

Start a fresh agent session in the `starter/` directory. Describe the full
`migrate` command -- all five steps -- and ask the agent to implement it with
tests.

Let the agent work. When it finishes, run `npm test`.

### Checkpoint

Test with a `tasks.json` containing these cases (create the file manually or
ask the agent to generate a fixture):

```json
[
  { "id": "a1", "title": "Normal task", "tags": [], "done": false, "createdAt": "2024-01-01T00:00:00Z" },
  { "id": "a2", "title": "Urgent no priority", "tags": ["#urgent"], "done": false, "createdAt": "2024-01-01T00:00:00Z" },
  { "id": "a3", "title": "Urgent low priority", "tags": ["#urgent"], "done": false, "createdAt": "2024-01-01T00:00:00Z", "priority": 2 },
  { "id": "a4", "title": "Null date task", "tags": [], "done": false, "createdAt": null }
]
```

Evaluate:

- [ ] Does the command detect that `a3` (urgent + priority 2) is invalid and
      stop without writing?
- [ ] Does it handle `a4` (null createdAt) without crashing?
- [ ] Does it correctly migrate `a1` (add priority: 3) and `a2` (add
      priority: 4, since it's urgent)?
- [ ] Is the write atomic? (temp file + rename, not direct overwrite)
- [ ] Can you clearly identify which lines of code are step 3 (transform) vs.
      step 5 (write)? Could you change step 3 without touching step 5?
- [ ] If the agent's first version was wrong, how much code did you need to
      re-examine to find the bug?

## Part 2: The Effective Approach

Reset the starter to its original state. Before starting a new agent session,
create `workflow-contract.md` in the `starter/` directory. Use this structure
and fill it in before you write a single prompt:

```markdown
# Workflow Contract: migrate command

## Scope
The agent may modify:
- [list files]

The agent may NOT modify without asking:
- [list files and why]

## Phases

### Phase 1: Read and parse
Input:
Output:
The agent implements only this phase. I verify it before proceeding.

### Phase 2: Validate
Input:
Output: { valid: Task[], invalid: { task: unknown, reason: string }[] }
The agent implements only this phase. I verify each error case before proceeding.

### Phase 3: Transform
Input:
Output:
The agent implements only this phase. I verify the transformation rules before proceeding.

### Phase 4: Report
Input:
Output:
The agent implements only this phase.

### Phase 5: Write
Input:
Output:
The agent implements only this phase. I verify the atomic write before accepting.

## Approval Gates
- [condition]: I will [action] before the agent proceeds.

## Restart Conditions
- [condition]: stop, discuss, restart that phase.
```

Execute one phase at a time. After each phase, verify before issuing the next
prompt. Do not proceed to Phase 5 until every earlier phase is correct.

### Checkpoint

- [ ] How many lines of code did you review at each phase boundary vs. all
      at once in Part 1?
- [ ] Did an approval gate catch anything that would have been a problem?
- [ ] Was the code for each phase easier to verify in isolation?
- [ ] How many total correction cycles did Part 2 require vs. Part 1?
- [ ] Run `npm test`. Do all tests pass?

## The Principle

The instinct when starting a multi-step task is to describe everything and let
the agent produce a complete implementation. This feels efficient -- one
prompt, one output. In practice, a large output is hard to verify and
expensive to correct. A bug in phase 2 propagates undetected into phases 3
through 5. By the time you find it, the fix touches everything downstream.

A workflow contract gives the agent a structure to follow and gives you
checkpoints to catch problems early. Each phase is small enough to understand
completely. Phase boundaries are where you apply judgment: does this look
right? Should I proceed?

The agent doesn't resist structure. It follows whatever structure you define.
If you define none, it improvises one -- usually the structure that requires
the fewest clarifying questions. Your contract is built from domain knowledge
the agent doesn't have.

> **Structure the collaboration before you start. The contract is the plan; the plan survives contact with the agent.**

## Reflection

Record in your interaction log:

1. **Early catch**: At which phase boundary did you catch something you would
   have missed until the end in Part 1? What would the fix have cost?

2. **Gate value**: Did an approval gate trigger? What decision did it force
   you to make explicitly? Would the agent have made the same decision?

3. **Honest overhead**: How long did it take to write the workflow contract?
   How much time did it save in Part 2 vs. Part 1 correction cycles?

4. **Scope boundary**: Did the agent attempt to modify anything outside the
   defined scope? What does that tell you about what to put in scope definitions?

## Going Further

- Add a `--dry-run` flag: runs phases 1–4 but skips the write. Write a
  workflow contract before implementing the extension. Time the contract vs.
  correction time.
- Take a multi-step feature you are currently working on. Write a workflow
  contract for it before your next agent session. Measure the correction cycles.
- The CI/CD feedback cluster (DOE-001, DOE-003, STE-009) applies workflow
  architecture at the pipeline level. A pipeline is a workflow contract made
  executable.
