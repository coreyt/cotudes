# Etude Authoring Pipeline

## Overview

This document defines the multi-agent pipeline for creating new cotudes. It
mirrors the approach used in cpptudes: multiple specialist agents contribute
their expertise, then a writer synthesizes the inputs into the final etude.

## The 6-Stage Pipeline

### Stage 1: Curriculum Designer → Etude Specification
**Input**: The path, etude number, target competency, and trap from the curriculum map.
**Output**: A complete etude specification (see curriculum-designer agent for format).

The curriculum designer produces the blueprint: what the learner builds, what
trap they'll encounter, what the effective approach looks like, and what axiom
emerges.

### Stage 2: Agent Expert → Agent Behavior Analysis
**Input**: The etude specification from Stage 1.
**Output**: Requirement A analysis -- detailed assessment of the trap's
authenticity, the skill's transferability, and the axiom's accuracy.

The agent expert validates that the trap is a real, documented anti-pattern and
that the effective approach actually works with current agents.

### Stage 3: Engineering Practice Expert → Engineering Context Analysis
**Input**: The etude specification from Stage 1.
**Output**: Requirement B analysis -- detailed assessment of the engineering
task's realism, the role-appropriate complexity, and the starter codebase design.

The engineering practice expert validates that the task is real work for the
target role and that the starter codebase is sound.

**Stages 2 and 3 run in parallel.** Both receive Stage 1 output and work
independently.

### Stage 4: Etude Writer → Complete Cotude
**Input**: Outputs from Stages 1, 2, and 3.
**Output**: The complete cotude directory: README.md, starter codebase,
reference solution, and verification script.

The etude writer synthesizes all expert inputs into the final learning
experience.

### Stage 5: Agent Expert → Requirement A Review
**Input**: The complete cotude from Stage 4.
**Output**: PASS, NEEDS REVISION, or FAIL verdict with specific issues.

### Stage 6: Engineering Practice Expert → Requirement B Review
**Input**: The complete cotude from Stage 4.
**Output**: PASS, NEEDS REVISION, or FAIL verdict with specific issues.

**Stages 5 and 6 run in parallel.**

### Revision Loop

If either review fails:
1. The etude writer receives the specific issues from the failing review(s)
2. The writer produces a targeted revision
3. Only the failing review stage(s) re-run
4. Maximum 2 revision cycles -- if still failing, escalate to curriculum designer
   for specification adjustment

## Stage Prompts

### Stage 1 Prompt (Curriculum Designer)

```
You are the Curriculum Designer for cotudes. Using the curriculum map, produce
a complete etude specification for:

Path: [PATH]
Etude: [NUMBER]
Title: [TITLE]
Primary Competency: [COMPETENCY]
Trap: [TRAP DESCRIPTION]

Follow the specification format defined in your agent definition. Ensure both
Requirement A (agent skill) and Requirement B (real engineering) are addressed
in the specification.

Reference the curriculum map (dev/curriculum-map.md) and the relevant path
document (paths/[path].md) for context on sequencing and prerequisites.
```

### Stage 2 Prompt (Agent Expert)

```
You are the Agent Expert for cotudes. Review the following etude specification
for Requirement A compliance:

[SPECIFICATION FROM STAGE 1]

Produce a complete Requirement A analysis following the format in your skill
definition. Specifically assess:
- Is the trap a documented anti-pattern? Cite your source.
- Rate trap severity 1-5 with justification.
- Does the skill transfer across different agent tools?
- Is the axiom supported by practitioner evidence?
```

### Stage 3 Prompt (Engineering Practice Expert)

```
You are the Engineering Practice Expert for cotudes. Review the following etude
specification for Requirement B compliance:

[SPECIFICATION FROM STAGE 1]

Produce a complete Requirement B analysis following the format in your skill
definition. Specifically assess:
- Would someone in the [ROLE] role encounter this task?
- Is the complexity appropriate for the experience level?
- Are acceptance criteria clear and automatable?
- What specific solo-coding instinct triggers the trap?
```

### Stage 4 Prompt (Etude Writer)

```
You are the Etude Writer for cotudes. Synthesize the following inputs into a
complete cotude:

SPECIFICATION:
[OUTPUT FROM STAGE 1]

AGENT BEHAVIOR ANALYSIS:
[OUTPUT FROM STAGE 2]

ENGINEERING CONTEXT ANALYSIS:
[OUTPUT FROM STAGE 3]

Produce the complete cotude directory following the template in your agent
definition. Ensure:
- The README follows the structural template exactly
- The starter codebase compiles and passes tests
- The trap is NOT revealed in Part 1
- The contrast between Part 1 and Part 2 is dramatic and measurable
- Reflection prompts are specific, comparative, metacognitive, and forward-looking
```

### Stage 5-6 Review Prompts

```
You are the [Agent Expert / Engineering Practice Expert] for cotudes. Review
the following complete cotude for Requirement [A / B] compliance:

[COMPLETE COTUDE FROM STAGE 4]

Produce a verdict: PASS, NEEDS REVISION, or FAIL.
If not PASS, list specific issues that must be addressed.
```

## Pipeline Execution

For a single etude:
```
Stage 1 → [Stage 2 + Stage 3 in parallel] → Stage 4 → [Stage 5 + Stage 6 in parallel]
```

For batch creation (multiple etudes in a path):
- Stages 1-3 for all etudes can run in parallel
- Stage 4 should run sequentially to maintain voice consistency
- Stages 5-6 can run in parallel across etudes
