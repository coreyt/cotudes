# Path: Staff Software Engineer

## Profile

**Experience**: 8+ years. Deep technical skills with leadership responsibilities.
Sets technical direction for a team. Years of solo-coding muscle memory.

**Daily Work**: API design, cross-service architecture, code review, mentoring,
build-vs-buy decisions, technical debt management, incident response leadership.

**Unique Challenge**: Their expertise makes them faster at writing code than
reviewing agent output, creating resistance. The METR study found experienced
developers initially took 19% longer with agents -- this path addresses why and
how to overcome it.

**Anti-goal**: A staff engineer who dismisses agents because "I can do it faster
myself," or one who adopts agents without adapting their workflow, gaining
neither the speed benefits nor maintaining their review standards.

## Primary Competencies

1. **Context Engineering** -- Mastering persistent context and targeted information
2. **Parallel Orchestration** -- Running multiple agent workflows effectively
3. **Delegation Judgment** -- Matching tasks to agent strengths at scale
4. **Architecture for Agents** -- Designing systems agents can work in

## Etude Sequence

### Foundation (STE-001 to STE-003)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| STE-001 | The CLAUDE.md | Context Engineering | No persistent context; repeating corrections (5) | Go |
| STE-002 | Spec-Driven Development | Specification Writing | Jumping straight to code without a spec (4) | Go |
| STE-003 | The Delegation Matrix | Delegation Judgment | Delegating design; keeping typing (4) | Go |

**STE-001: The CLAUDE.md**
The learner works in a codebase across multiple sessions. In each session, the
agent makes the same mistakes: wrong test runner invocation, non-standard error
handling, ignoring the project's logging conventions. The learner corrects these
every time. The contrast: creating a CLAUDE.md that captures conventions,
commands, and constraints. Subsequent sessions produce code that fits the project
from the first prompt. **Axiom: Every correction you repeat is a CLAUDE.md entry
you haven't written.**

**STE-002: Spec-Driven Development**
A cross-service feature requiring API changes, database migration, and frontend
updates. The learner's instinct (as an experienced engineer) is to start coding
immediately -- they know what to build. The agent produces code that individually
works for each piece but doesn't integrate (mismatched field names, inconsistent
error handling, different date formats). The contrast: a spec document that
defines the contract first, then implementation against the spec. **Axiom: The
spec isn't overhead -- it's the interface between your intent and the agent's
execution.**

**STE-003: The Delegation Matrix**
A day's work includes a complex algorithm, three API endpoints, a migration
script, and test coverage improvement. The learner's instinct is to delegate the
"boring" parts (tests, migration) and keep the "interesting" parts (algorithm).
The contrast reveals that the algorithm is poorly suited to delegation (hard to
specify, hard to verify) while the endpoints are ideal (well-defined, easily
tested). **Axiom: Delegate what's easily verified, not what's boring.**

### Fluency (STE-004 to STE-007)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| STE-004 | Context Window Economics | Context Engineering | Overloading context; signal drowned by noise (3) | Go |
| STE-005 | The Parallel Sprint | Parallel Orchestration | 5 agents on interdependent tasks (3) | Go |
| STE-006 | Agent-Friendly Architecture | Architecture for Agents | Clever abstractions confusing agents (3) | Go |
| STE-007 | The Review Protocol | Output Evaluation | Reviewing AI output with AI (echo chamber) (3) | Go |

**STE-004**: Learner provides the agent with 50 files of context for a change in
one module. Agent output quality degrades because relevant signals are diluted.
The contrast: targeted context (only the files the agent needs + interface
contracts) produces markedly better output. **Axiom: The agent's context window
is not a database -- every token competes for attention.**

**STE-005**: Learner launches 5 agents on different parts of a feature. Two
agents make conflicting assumptions about a shared interface. Merging produces
integration failures. The contrast: independent tasks in parallel, dependent
tasks sequentially, shared contracts defined upfront. **Axiom: Parallelize
independent work; serialize shared interfaces.**

**STE-006**: A codebase with metaprogramming, decorator patterns, and DRY
abstractions. The agent consistently misuses the abstractions or duplicates
their functionality. The contrast: a simpler, more explicit architecture that
the agent navigates easily. **Axiom: Code that impresses humans can confuse
agents -- optimize for both audiences.**

**STE-007**: Learner uses a second AI to review the first AI's output. The
reviewer misses the same class of errors the generator made. The contrast:
human review focused on the specific risks of agent-generated code (hallucinated
APIs, subtle incorrectness, missing edge cases) with automated verification.
**Axiom: AI cannot reliably catch its own class of errors -- human review and
automated verification serve different purposes.**

### Application (STE-008 to STE-014)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| STE-008 | Recovery and Restart | Recovery Patterns | Sunk-cost on a failing thread (4) | Go |
| STE-009 | The Feedback Machine | Feedback Loop Design | CI as agent iteration loop (2) | Go |
| STE-010 | Session Continuity | Session Management | Multi-day feature across sessions (3) | Go |
| STE-011 | The Migration | Task Decomposition | Large codebase migration with agents (2) | Go |
| STE-012 | Cross-Cutting Concerns | Context Engineering | Agent unaware of system constraints (3) | Go |
| STE-013 | The Performance Review | Output Evaluation | Evaluating non-functional quality (2) | Go |
| STE-014 | Team Patterns | Delegation Judgment | Establishing agent practices for a team (2) | Go |

### Capstone (STE-015)

| # | Title | Competency | Stack |
|---|-------|-----------|-------|
| STE-015 | System Feature | All | Go |

End-to-end system feature across multiple services, requiring spec-driven
development, context engineering, delegation decisions, and team-level review
practices. The capstone requires both working code and a documented workflow
that could be shared with a team.

## Prerequisites

```
STE-000 (Setup)
    └── STE-001 (Context Engineering)
    └── STE-002 (Specification Writing)
    └── STE-003 (Delegation Judgment)
            └── STE-004 through STE-007 (Fluency)
                    └── STE-008 through STE-014 (Application)
                            └── STE-015 (Capstone)
```

## Recommended Cross-Training

Complete ASE-001 through ASE-003 from the Associate path before starting. The
basics still apply, and experienced engineers benefit from the humility check of
encountering the traps in a low-stakes context.
