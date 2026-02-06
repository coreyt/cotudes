# Path: Associate Software Engineer

## Profile

**Experience**: 0-2 years. Early-career engineers learning both software
engineering and agent collaboration simultaneously.

**Daily Work**: Implementing features within established patterns. Writing tests.
Fixing bugs. Reviewing PRs from peers. Working within a single service or
component.

**Unique Challenge**: Must develop engineering judgment and agent collaboration
skills in parallel. The risk is that the agent becomes a crutch that prevents
learning fundamentals -- the learner ships working code without understanding why
it works.

**Anti-goal**: An associate who can "get the agent to produce code" but can't
explain the code, debug it when it breaks, or recognize when it's subtly wrong.

## Primary Competencies

1. **Specification Writing** -- Learning to externalize requirements before coding
2. **Task Decomposition** -- Breaking features into agent-sized pieces
3. **Output Evaluation** -- Critically reviewing agent-generated code
4. **Feedback Loop Design** -- Using tests and types as guardrails

## Etude Sequence

### Foundation (ASE-001 to ASE-003)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| ASE-001 | The Vague Request | Specification Writing | Asking "build me a TODO app" with no spec (5) | TypeScript |
| ASE-002 | Reading Before Writing | Output Evaluation | Accepting first agent output without review (5) | TypeScript |
| ASE-003 | The Test First | Feedback Loop Design | Writing code without tests, debugging blind (4) | TypeScript |

**ASE-001: The Vague Request**
The learner is asked to build a REST API endpoint. Their instinct is to describe
it in one sentence to the agent. The agent produces something that "works" but
makes wrong assumptions about validation, error codes, data types, and edge
cases. The contrast: the same task with a structured specification (inputs,
outputs, error cases, constraints) produces dramatically better code. **Axiom:
Agents don't read your mind -- the spec IS the product.**

**ASE-002: Reading Before Writing**
The learner receives agent-generated code for a data processing function. It
passes the existing tests. Their instinct is to accept it. The checkpoint reveals
subtle issues: an O(n²) loop where O(n) is possible, missing null checks at
the API boundary, and a variable name that misleads about its contents. The
contrast: systematic review with a checklist catches all three issues before
they become bugs. **Axiom: If you didn't write it, you must read it twice as
carefully.**

**ASE-003: The Test First**
The learner is asked to add a feature to an existing module. Their instinct is
to describe the feature and let the agent write code + tests together. The agent
produces code that passes its own tests -- but the tests are weak (happy path
only, no edge cases). The contrast: writing tests first (specifying behavior
before implementation) produces better tests AND better code. **Axiom: Tests
written after implementation verify what was built; tests written before
implementation specify what should be built.**

### Fluency (ASE-004 to ASE-007)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| ASE-004 | One Bite at a Time | Task Decomposition | Requesting entire feature in one prompt (5) | TypeScript |
| ASE-005 | The Missing Context | Context Engineering | Agent hallucinating APIs lacking project context (4) | TypeScript |
| ASE-006 | Know What You Don't Know | Delegation Judgment | Delegating a task you can't evaluate (3) | TypeScript |
| ASE-007 | The Debug Loop | Recovery Patterns | Letting agent loop on its own errors (4) | TypeScript |

**ASE-004: One Bite at a Time**
A moderately complex feature (user authentication with JWT, refresh tokens,
and role-based access). The learner's instinct is to describe all of it at once.
The agent produces a monolithic blob with inconsistencies between components.
The contrast: decomposed into 5 sequential steps, each verified before
proceeding, producing clean, integrated code. **Axiom: An agent working on a
verified foundation builds higher than one working on assumptions.**

**ASE-005: The Missing Context**
The learner works in a codebase with established patterns (specific ORM usage,
custom error handling middleware, naming conventions). Without being told, the
agent invents its own patterns that clash with the existing code. The contrast:
providing a CLAUDE.md with project conventions produces code that fits
seamlessly. **Axiom: The agent's default is to invent; your job is to constrain.**

**ASE-006: Know What You Don't Know**
The learner is asked to implement a caching layer. They have no experience with
caching. Their instinct is to delegate the entire design to the agent. The agent
produces a solution using patterns the learner can't evaluate (cache
invalidation strategy, TTL decisions, race conditions). The contrast: researching
caching fundamentals first, then collaborating with the agent on implementation
details. **Axiom: If you can't evaluate the output, you shouldn't delegate
the task -- delegate the research first.**

**ASE-007: The Debug Loop**
A function the agent wrote has a bug. The learner describes the bug to the agent.
The agent "fixes" it by changing something that introduces a new bug. The learner
reports the new bug. The agent reverts to the original. This loops. The contrast:
the learner diagnoses the root cause themselves, provides a precise description,
and the agent fixes it in one pass. **Axiom: Agents fix symptoms; engineers
diagnose root causes.**

### Application (ASE-008 to ASE-014)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| ASE-008 | The Specification | Specification Writing | Requirements → structured spec conversion (3) | TypeScript |
| ASE-009 | Type Safety Net | Feedback Loop Design | Untyped code producing subtle runtime errors (4) | TypeScript → Python |
| ASE-010 | The Code Review | Output Evaluation | Systematic review of multi-file agent output (3) | TypeScript |
| ASE-011 | Building on Foundation | Session Management | Context loss between sessions (4) | TypeScript |
| ASE-012 | The Refactor | Task Decomposition | Refactoring without incremental verification (3) | TypeScript |
| ASE-013 | Edge Cases | Output Evaluation | Agent code missing boundary conditions (3) | TypeScript |
| ASE-014 | The Integration | Task Decomposition | Integrating agent code into existing systems (3) | TypeScript |

### Capstone (ASE-015)

| # | Title | Competency | Trap | Stack |
|---|-------|-----------|------|-------|
| ASE-015 | Feature Build | All | End-to-end feature using all competencies | TypeScript |

The capstone requires the learner to build a complete feature from requirements
through deployment-ready code, using all competencies learned in the path. They
must produce both working code and an annotated interaction log demonstrating
effective agent collaboration at each stage.

## Prerequisites

```
ASE-000 (Setup)
    └── ASE-001 (Specification Writing)
    └── ASE-002 (Output Evaluation)
    └── ASE-003 (Feedback Loops)
            └── ASE-004 (Task Decomposition)
            └── ASE-005 (Context Engineering)
            └── ASE-006 (Delegation Judgment)
            └── ASE-007 (Recovery Patterns)
                    └── ASE-008 through ASE-014 (Application)
                            └── ASE-015 (Capstone)
```

## Assessment Criteria

For each etude, the learner demonstrates competency by:

1. **Experiencing the trap** -- They must attempt Part 1 and see the failure
2. **Applying the approach** -- Part 2 produces measurably better results
3. **Articulating the axiom** -- They can explain the principle in their own words
4. **Producing working code** -- The software meets acceptance criteria
5. **Reflecting on the process** -- Interaction log shows metacognitive awareness
