# FND-001: The Failure Map

> **Axiom**: Agent failures follow predictable patterns. Map them before you start.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Common Foundation |
| **Number** | FND-001 |
| **Primary Competency** | LLM Failure Mode Reasoning |
| **Secondary Competencies** | Context Engineering, Output Evaluation |
| **Trap Severity** | 4 (Predictable) |
| **Prerequisites** | None |
| **Duration** | 60–90 minutes |
| **Stack** | TypeScript (Node.js, Vitest) |

## Overview

You will add a `priority` field to a TypeScript task management CLI. The task
is a vehicle for three agent failure modes that occur naturally in the course of
a real implementation session. In Part 1, you encounter them. In Part 2, you
name them in a failure map and prevent them.

## Why Your Coding Agent Cares

Three failure modes account for most frustrating agent sessions:

1. **Context degradation** — A constraint stated early in a long conversation
   gets buried as the exchange grows. The agent's final output doesn't honor it.
   The constraint was never removed; it was crowded out.

2. **Hallucination under ambiguity** — When a domain is underspecified, the
   agent fills gaps confidently. It may describe a package API that doesn't
   exist, suggest a function with the wrong signature, or produce code that
   looks correct and fails at runtime.

3. **Error propagation** — A test or type error triggers a local fix that
   addresses the symptom. The underlying cause remains. A second failure
   appears. The agent fixes that. The cascade grows.

These are not random. They follow patterns. Once you can name them, you can
predict which tasks are at risk for which failure mode, and design the
interaction to prevent each one.

## The Setup

The `starter/` directory contains **taskman**, a TypeScript CLI that stores
tasks in a local `tasks.json` file. Install dependencies and verify the
baseline:

```bash
cd starter/
npm install
npm test       # all tests should pass
```

Familiarize yourself with the code. The task type, storage layer, four
commands (`add`, `list`, `done`, `remove`), and test suite are all small
enough to read in a few minutes.

**Your assignment**: Add a `priority` field (1–5) to tasks. Business rules:

- Priority defaults to `3` if not specified at creation
- Tasks tagged `#urgent` must have priority `4` or `5`; the `add` command
  must enforce this and reject invalid combinations
- The `list` command must display the priority value for each task

## Part 1: The Natural Approach

Start a fresh agent session in the `starter/` directory. Describe the task in
full, including the business rules. Tell the agent about the `#urgent`
constraint. Ask it to implement the priority feature with tests.

Let the agent work. When it finishes, run `npm test`.

### Checkpoint

Evaluate the output against these specific scenarios. For each, run a test or
inspect the code and record pass/fail:

- [ ] Run `npm test`. Do all tests pass, including new priority tests?
- [ ] In `src/types.ts`: does the `Task` interface include `priority: number`?
- [ ] In `src/commands.ts`: does `addTask` enforce the `#urgent` + priority
      constraint? Find the validation code.
- [ ] Run `node -e "require('./dist/commands').addTask('test', ['#urgent'], 2)"`
      (after building). Does it throw an error?
- [ ] Ask your agent: "What package did you use for UUID generation?" Run
      `npm ls <package>`. Is it actually installed?
- [ ] Did the agent suggest any package or function that produced a runtime
      error or "is not a function" message?
- [ ] Run `npm test` again after the agent's first error-fix cycle. Did fixing
      one failure introduce another?

Record which of the three failure modes each failure corresponds to. Some
failures may not fit any category -- note those too.

## Part 2: The Effective Approach

Reset the starter to its original state (`git checkout starter/` or reinstall
from scratch). Before starting a new agent session, create a file called
`failure-map.md` in the `starter/` directory:

```markdown
# Failure Map: Priority Feature

## Context Degradation Risk
**Constraint at risk**:
**Where in the conversation it appears**:
**Mitigation**:

## Hallucination Risk
**Ambiguous area**:
**Signal to watch for**:
**Mitigation**:

## Error Propagation Risk
**Tool output most likely to mislead**:
**Mitigation**:
```

Fill in each section based on what you observed in Part 1. Be specific: name
the exact constraint, the exact ambiguous area, the exact tool output. A
vague mitigation ("be careful") is not a mitigation.

Then re-approach the task with those mitigations active before you send your
first prompt.

### Checkpoint

- [ ] Does `npm test` pass with the new feature, including all original tests?
- [ ] Does the `#urgent` + priority validation work correctly?
- [ ] Did you encounter the same hallucination? Did your mitigation help you
      catch it before or right after it appeared?
- [ ] Did any errors cascade the way they did in Part 1?
- [ ] How many correction cycles did Part 2 require vs. Part 1?

## The Principle

The instinct when an agent produces bad output is to correct it. This works
for a single session on a simple task. It fails to generalize because the
corrections are reactive -- they address the output, not the conditions that
produced it.

A failure map is a two-minute pre-flight check. You read the task, identify
the three risk zones, and write one mitigation for each. The act of writing
the map changes how you structure the session: you pin the constraint that
would get lost, you resolve the ambiguity before the agent guesses at it, and
you commit to reading tool output yourself before handing it back.

None of this prevents the agent from being imperfect. It prevents the
imperfection from compounding.

> **Agent failures follow predictable patterns. Map them before you start.**

## Reflection

Record in your interaction log:

1. **Prediction accuracy**: Did Part 1 produce the failure modes you expected?
   Were there failure modes you didn't anticipate in your map?

2. **Mitigation effectiveness**: Which mitigation had the highest impact on
   Part 2? Which was hardest to execute in practice?

3. **Transferability**: For a task you are working on right now, write a
   failure map -- three sections, three mitigations. Does the act of writing
   it change how you would structure the session?

4. **Meta-question**: Is a failure map a form of specification writing? How
   does naming the risks differ from specifying the requirements?

## Going Further

- Add a second business rule: tasks tagged `#blocked` cannot be marked done
  unless their `dependsOn` tasks are complete. Write a failure map before
  engaging the agent. Does the map reduce correction cycles?
- Try the same task with a different agent tool. Do the failure modes appear
  in the same places?
- Review FND-002 (The Workflow Contract): a failure map names the risks; a
  workflow contract structures the interaction to systematically contain them.
