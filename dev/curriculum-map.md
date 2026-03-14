# cotudes Curriculum Map

## Philosophy

The name **cotudes** (co + etudes) follows the tradition of Peter Norvig's
[pytudes](https://github.com/norvig/pytudes) and
[cpptudes](https://github.com/coreyt/cpptudes), themselves inspired by Charles
Wetherell's 1978 book *Etudes for Programmers*. An etude is a musical exercise
designed to develop a specific technical skill through deliberate practice.

Each **cotude** is a structured coding exercise designed to develop a specific
skill for working effectively with an agentic coding partner. The exercises
involve real engineering tasks -- not toy examples -- where the learner must
collaborate with an AI agent to produce working software.

## Core Thesis

Knowing how to use a tool is easy. Knowing how to *collaborate effectively* with
an autonomous coding agent is a distinct skill set that must be developed through
practice. Just as cpptudes targets C# habits that fail in C++, cotudes targets
**solo-coding habits that fail with agents**.

The hard part is not learning commands or prompts. It is:

- Shifting from **code writer** to **engineering director**
- Learning when to delegate and when to intervene
- Developing judgment about agent output quality
- Building workflows that compound agent effectiveness

## Pedagogical Model: Trap-Then-Correct

Adapted from cpptudes, each cotude follows a deliberate pattern:

1. **Bait** -- A real coding task structured so the learner's natural
   solo-coding instinct leads to an ineffective agent interaction
2. **Failure Signal** -- The agent produces poor output, goes in circles, burns
   excessive tokens, or takes far longer than necessary
3. **Contrast** -- A well-structured interaction approach is demonstrated that
   produces dramatically better results on the same task
4. **Axiom** -- The underlying principle of effective agent collaboration is
   articulated

### Example

**Cotude: "The Monolith Prompt"**
- Bait: Learner is given a moderately complex feature to implement. Their instinct
  is to describe the entire feature in one prompt.
- Failure Signal: Agent produces a 500-line monolithic output with subtle bugs,
  inconsistencies, and code that doesn't integrate with the existing codebase.
- Contrast: Same feature, decomposed into 6 sequential prompts with incremental
  verification. Each step builds on tested, working code.
- Axiom: **Incremental decomposition with verification gates produces
  dramatically better agent output than monolithic requests.**

## Dual Requirement Framework

Every cotude must satisfy both requirements:

- **Requirement A (Agent Skill)**: The etude must teach a genuine, transferable
  agent collaboration skill that practitioners have identified as critical.
- **Requirement B (Real Engineering)**: The etude must involve a real, non-trivial
  coding task. The learner must produce working software, not just practice
  prompting in the abstract.

Neither requirement is optional. An etude that teaches prompting through toy
examples fails Requirement B. An etude that is just a coding exercise without
agent collaboration patterns fails Requirement A.

## The 10 Core Competencies

Derived from practitioner experience across Claude Code, Codex, Jules, and
Antigravity, these are the skills that distinguish effective agent collaborators:

| # | Competency | Description | Importance |
|---|-----------|-------------|------------|
| 1 | **Specification Writing** | Writing clear specs before prompting. Defining what, why, how, and constraints. | Critical |
| 2 | **Context Engineering** | Providing the right information at the right time. CLAUDE.md, targeted context, avoiding overload. | Critical |
| 3 | **Task Decomposition** | Breaking work into agent-sized pieces with verification gates between steps. | Critical |
| 4 | **Delegation Judgment** | Knowing what to delegate vs. do yourself. Matching task characteristics to agent strengths. | Critical |
| 5 | **Output Evaluation** | Reviewing agent-generated code critically. Catching subtle errors, hallucinations, and silent failures. | Critical |
| 6 | **Feedback Loop Design** | Using tests, linters, type checkers, and CI as automated agent guardrails. | High |
| 7 | **Session Management** | Maintaining state across sessions. Persistent context, knowing when to start fresh. | High |
| 8 | **Parallel Orchestration** | Running multiple agent workflows on independent tasks. Managing cognitive overhead. | Medium |
| 9 | **Recovery Patterns** | Handling agent failures, circular reasoning, and dead ends. Knowing when to abandon. | High |
| 10 | **Architecture for Agents** | Designing systems that are agent-friendly: simple patterns, explicit types, good test coverage. | High |

## The 6 Learning Paths

Each path targets a specific engineering role with etudes calibrated to their
experience level, daily responsibilities, and unique challenges.

### Path 1: Associate Software Engineer (16 etudes)

**Profile**: 0-2 years experience. Learning both software engineering and agent
collaboration simultaneously. May not yet have strong instincts about what "good
code" looks like.

**Unique Challenge**: They need to develop engineering judgment *and* agent
collaboration skills in parallel, without letting the agent become a crutch that
prevents learning fundamentals.

**Primary Competencies**: Specification Writing, Task Decomposition, Output
Evaluation, Feedback Loop Design

**Etude Sequence**:

| # | Title | Competency | Trap |
|---|-------|-----------|------|
| ASE-000 | Environment Setup | Setup | None -- infrastructure |
| ASE-001 | The Vague Request | Specification Writing | Asking "build me a TODO app" with no spec |
| ASE-002 | Reading Before Writing | Output Evaluation | Accepting first output without review |
| ASE-003 | The Test First | Feedback Loop Design | Writing code without tests, then debugging blind |
| ASE-004 | One Bite at a Time | Task Decomposition | Requesting an entire feature in one prompt |
| ASE-005 | The Missing Context | Context Engineering | Agent hallucinating APIs because it lacks project context |
| ASE-006 | Know What You Don't Know | Delegation Judgment | Delegating a task you can't evaluate |
| ASE-007 | The Debug Loop | Recovery Patterns | Letting the agent loop on its own errors |
| ASE-008 | The Specification | Specification Writing | Converting requirements to a structured spec |
| ASE-009 | Type Safety Net | Feedback Loop Design | Untyped code producing subtle runtime errors |
| ASE-010 | The Code Review | Output Evaluation | Systematic review of agent-generated code |
| ASE-011 | Building on Foundation | Session Management | Context loss between sessions |
| ASE-012 | The Refactor | Task Decomposition | Refactoring without incremental verification |
| ASE-013 | Edge Cases | Output Evaluation | Agent-generated code missing boundary conditions |
| ASE-014 | The Integration | Task Decomposition | Integrating agent code into existing systems |
| ASE-015 | Capstone: Feature Build | All | End-to-end feature using all competencies |

### Path 2: Staff Software Engineer (16 etudes)

**Profile**: 8+ years experience. Deep technical skills. Leads technical
direction for a team. Years of solo-coding muscle memory to override.

**Unique Challenge**: Their expertise makes them faster at writing code than
reviewing agent output, creating resistance to adoption. The METR study found
experienced developers initially took 19% longer with agents.

**Primary Competencies**: Context Engineering, Parallel Orchestration, Delegation
Judgment, Architecture for Agents

**Etude Sequence**:

| # | Title | Competency | Trap |
|---|-------|-----------|------|
| STE-000 | Environment Setup | Setup | None -- infrastructure |
| STE-001 | The CLAUDE.md | Context Engineering | No persistent context; same corrections every session |
| STE-002 | Spec-Driven Development | Specification Writing | Jumping to code without a spec |
| STE-003 | The Delegation Matrix | Delegation Judgment | Delegating design decisions; keeping typing |
| STE-004 | Context Window Economics | Context Engineering | Overloading context; signal drowned by noise |
| STE-005 | The Parallel Sprint | Parallel Orchestration | Running 5 agents on interdependent tasks |
| STE-006 | Agent-Friendly Architecture | Architecture for Agents | Clever abstractions that confuse agents |
| STE-007 | The Review Protocol | Output Evaluation | Reviewing AI output with AI (echo chamber) |
| STE-008 | Recovery and Restart | Recovery Patterns | Sunk-cost fallacy on a failing agent thread |
| STE-009 | The Feedback Machine | Feedback Loop Design | CI pipeline as agent iteration loop |
| STE-010 | Session Continuity | Session Management | Multi-day features across session boundaries |
| STE-011 | The Migration | Task Decomposition | Large codebase migration with agents |
| STE-012 | Cross-Cutting Concerns | Context Engineering | Agent unaware of system-wide constraints |
| STE-013 | The Performance Review | Output Evaluation | Evaluating non-functional agent output quality |
| STE-014 | Team Patterns | Delegation Judgment | Establishing agent practices for a team |
| STE-015 | Capstone: System Feature | All | End-to-end system feature across multiple services |

### Path 3: Principal Software Engineer (12 etudes)

**Profile**: 12+ years experience. Sets technical direction across multiple
teams. Evaluates architectural trade-offs. Responsible for long-term code health.

**Unique Challenge**: Must make decisions about agent adoption that affect entire
organizations, with limited historical precedent. Must balance productivity gains
against maintainability and skill development risks.

**Primary Competencies**: Architecture for Agents, Delegation Judgment, Output
Evaluation, Context Engineering

**Etude Sequence**:

| # | Title | Competency | Trap |
|---|-------|-----------|------|
| PSE-000 | Environment Setup | Setup | None -- infrastructure |
| PSE-001 | The Architecture Review | Architecture for Agents | Reviewing agent-proposed architecture uncritically |
| PSE-002 | Technical Debt Triage | Output Evaluation | Agent code that works but accumulates debt |
| PSE-003 | The Standards Document | Context Engineering | Writing agent guidelines that are too vague or too rigid |
| PSE-004 | Measuring Agent ROI | Delegation Judgment | Measuring lines-of-code instead of outcomes |
| PSE-005 | The Legacy System | Architecture for Agents | Agent struggling with undocumented legacy code |
| PSE-006 | Design Review Protocol | Output Evaluation | Establishing review standards for agent output |
| PSE-007 | The Prototype vs. Production | Delegation Judgment | Agent prototype mistaken for production-ready code |
| PSE-008 | Cross-Team Consistency | Context Engineering | Different teams using agents with incompatible patterns |
| PSE-009 | The Skill Preservation | Delegation Judgment | Team skills atrophying from over-reliance |
| PSE-010 | Security Surface Review | Output Evaluation | Agent-introduced vulnerabilities in subtle patterns |
| PSE-011 | Capstone: Org-Wide Practice | All | Establishing agent practices across an engineering org |

### Path 4: Principal Software Architect (12 etudes)

**Profile**: 15+ years experience. Responsible for system design decisions that
span years and teams. Evaluates technology strategy.

**Unique Challenge**: Architectural decisions made now must account for rapidly
evolving agent capabilities. Over-optimizing for current agents may be as
costly as ignoring them entirely.

**Primary Competencies**: Architecture for Agents, Context Engineering,
Delegation Judgment, Specification Writing

**Etude Sequence**:

| # | Title | Competency | Trap |
|---|-------|-----------|------|
| PSA-000 | Environment Setup | Setup | None -- infrastructure |
| PSA-001 | Agent-Friendly System Design | Architecture for Agents | System with implicit knowledge that agents can't discover |
| PSA-002 | The Specification as Contract | Specification Writing | ADRs and RFCs that agents can consume and implement |
| PSA-003 | Modular Boundaries | Architecture for Agents | Designing module boundaries for agent-sized work units |
| PSA-004 | The Evolutionary Architecture | Architecture for Agents | Designing for agent capabilities that don't exist yet |
| PSA-005 | Documentation as Code | Context Engineering | Self-documenting architecture for both humans and agents |
| PSA-006 | The Platform Decision | Delegation Judgment | Evaluating build-with-agent vs. buy vs. build-yourself |
| PSA-007 | Observability Design | Feedback Loop Design | Monitoring agent-generated system behavior |
| PSA-008 | The Data Architecture | Architecture for Agents | Schema design that agents can reason about |
| PSA-009 | Compliance and Governance | Output Evaluation | Ensuring agent output meets regulatory requirements |
| PSA-010 | The Migration Strategy | Task Decomposition | Planning large-scale migrations for agent execution |
| PSA-011 | Capstone: System Redesign | All | Redesigning a system with agent collaboration in mind |

### Path 5: Staff DevOps / CI/CD Engineer (12 etudes)

**Profile**: 8+ years experience in infrastructure, deployment, and operational
systems. Responsible for the pipelines that all code -- including agent-generated
code -- flows through.

**Unique Challenge**: Infrastructure mistakes can be catastrophic and difficult
to reverse. Agent-generated IaC must be reviewed with extreme care. The DevOps
engineer also builds the feedback loops that make agents effective for everyone.

**Primary Competencies**: Feedback Loop Design, Output Evaluation, Context
Engineering, Architecture for Agents

**Etude Sequence**:

| # | Title | Competency | Trap |
|---|-------|-----------|------|
| DOE-000 | Environment Setup | Setup | None -- infrastructure |
| DOE-001 | The CI Feedback Loop | Feedback Loop Design | CI that reports pass/fail but no actionable detail |
| DOE-002 | IaC with Agents | Output Evaluation | Agent-generated Terraform with security misconfigs |
| DOE-003 | Pipeline as Agent Guardrail | Feedback Loop Design | Designing CI stages that catch agent mistakes |
| DOE-004 | The Dockerfile | Context Engineering | Agent building images without understanding constraints |
| DOE-005 | Security Scanning | Output Evaluation | Hallucinated dependencies and supply-chain risks |
| DOE-006 | The Deployment Strategy | Task Decomposition | Agent-assisted rollout with incremental verification |
| DOE-007 | Monitoring and Alerting | Feedback Loop Design | Agent-generated monitoring that misses critical signals |
| DOE-008 | The Incident Response | Recovery Patterns | Using agents during incidents (speed vs. risk) |
| DOE-009 | Platform Engineering | Architecture for Agents | Building internal platforms that agents can operate |
| DOE-010 | Cost and Resource Management | Delegation Judgment | Agent-provisioned resources without cost awareness |
| DOE-011 | Capstone: Pipeline Overhaul | All | End-to-end CI/CD redesign for agent-augmented teams |

### Path 6: Staff Data Management Engineer (12 etudes)

**Profile**: 8+ years in data engineering, database administration, or data
platform work. Responsible for schemas, pipelines, data quality, and governance.

**Unique Challenge**: Data correctness is harder to verify than code correctness.
A function that compiles and passes tests might still silently corrupt data.
Agent-generated SQL or pipeline code requires domain-specific review that goes
beyond syntax checking.

**Primary Competencies**: Output Evaluation, Specification Writing, Feedback Loop
Design, Context Engineering

**Etude Sequence**:

| # | Title | Competency | Trap |
|---|-------|-----------|------|
| DME-000 | Environment Setup | Setup | None -- infrastructure |
| DME-001 | The Schema Design | Specification Writing | Agent-designed schema missing domain constraints |
| DME-002 | Migration Safety | Output Evaluation | Agent-generated migration that loses data silently |
| DME-003 | The Query Review | Output Evaluation | Agent SQL that returns results but is subtly wrong |
| DME-004 | Pipeline Specification | Specification Writing | Vague ETL requirements producing fragile pipelines |
| DME-005 | Data Quality Gates | Feedback Loop Design | Pipelines without data validation checkpoints |
| DME-006 | The Context Problem | Context Engineering | Agent unaware of data lineage and dependencies |
| DME-007 | Idempotency and Recovery | Recovery Patterns | Agent pipelines that can't safely re-run |
| DME-008 | Performance at Scale | Output Evaluation | Agent queries that work on dev but fail at prod scale |
| DME-009 | The Access Pattern | Architecture for Agents | Designing data APIs that agents can reason about |
| DME-010 | Data Governance | Specification Writing | Ensuring agent output respects PII and retention policies |
| DME-011 | Capstone: Data Platform | All | End-to-end data platform feature with agent collaboration |

## Prerequisite Dependencies

### Within Each Path

```
000 (Setup) → 001-003 (Foundation) → 004-007 (Fluency) → 008-011+ (Application) → Capstone
```

Foundation etudes must be completed before Fluency. Fluency before Application.
Capstones require all prior etudes in the path.

### Cross-Path Prerequisites

None required. Each path is self-contained. However, recommended cross-training:

- Staff Engineers benefit from completing ASE-001 through ASE-005 first (as a
  humility check -- the basics still apply)
- Principal Engineers should complete at least one path's Foundation tier
- Architects should complete STE-006 (Agent-Friendly Architecture) from the
  Staff path

## Cross-Path Lesson Sharing

Several lessons across different paths teach the same core skill, differing only in
context or framing. Rather than authoring each independently, these can be structured
as a **shared exercise with role-specific lenses** -- one canonical scenario, one
`practice.json`, one `verify.sh`, with a brief framing note for each adopting path.

A shared lesson still appears in each path's sequence as its own entry. The work
reduction is in authoring and maintenance, not in the learner's experience.

### Cluster 1: CI as Agent Feedback (DOE-001, DOE-003, STE-009)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| DOE-001 The CI Feedback Loop | DOE | Make CI output actionable |
| DOE-003 Pipeline as Agent Guardrail | DOE | Design CI stages to catch agent mistakes |
| STE-009 The Feedback Machine | STE | Use CI as the agent's iteration loop |

**Recommendation**: DOE-001 is complete. DOE-003 and STE-009 extend the same scenario.
Author as a single three-part exercise: Part 1 = actionable output (DOE-001, done),
Part 2 = guardrail stage design (DOE-003), Part 3 = CI-as-iteration-loop (STE-009).
All three share one codebase and one CI config. Each path's entry points to the
relevant part.

### Cluster 2: Agent-Friendly Architecture (STE-006, PSA-001, PSA-003)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| STE-006 Agent-Friendly Architecture | STE | Avoid clever abstractions agents can't navigate |
| PSA-001 Agent-Friendly System Design | PSA | Eliminate implicit knowledge agents can't discover |
| PSA-003 Modular Boundaries | PSA | Design module boundaries sized for agent work units |

**Recommendation**: PSA-001 is complete. STE-006 and PSA-003 address facets of the same
system design question. The cross-path prerequisite note already points STE to PSA-001;
formalize this by making STE-006 a lens on PSA-001 (tactical code-level patterns) and
PSA-003 a lens on PSA-001 (structural decomposition). One shared codebase scenario.

### Cluster 3: Context Calibration (ASE-005, STE-004)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| ASE-005 The Missing Context | ASE | Agent hallucinates because it lacks project context |
| STE-004 Context Window Economics | STE | Agent loses signal because context is overloaded |

**Recommendation**: These are the two sides of the same failure mode -- starvation vs.
overload. Author as one shared scenario where learners encounter both failure modes in
sequence: first under-context (the ASE trap), then over-context (the STE trap). The
contrast makes both lessons sharper. One `practice.json`, two path entries.

### Cluster 4: Delegation Judgment (ASE-006, STE-003)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| ASE-006 Know What You Don't Know | ASE | Don't delegate what you can't evaluate |
| STE-003 The Delegation Matrix | STE | A framework for deciding what to delegate |

**Recommendation**: ASE-006 introduces the problem; STE-003 formalizes the solution.
The "delegation matrix" artifact produced in STE-003 is directly the answer to the
ASE-006 trap. Author STE-003 with the matrix as a reusable artifact, then ASE-006
can reference it in its resolution phase. Shared artifact, independent scenarios.

### Cluster 5: Recovery Patterns (ASE-007, STE-008)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| ASE-007 The Debug Loop | ASE | Break out of agent error loops |
| STE-008 Recovery and Restart | STE | Recognize and abandon failing agent threads |

**Recommendation**: Same root behavior (the agent is stuck) at different scales.
ASE-007 is a single file/function loop; STE-008 is a multi-hour architectural dead
end. Author as a shared "agent failure recognition" heuristic document that both
exercises reference. The scenarios differ but the decision framework is identical.

### Cluster 6: Large-Scale Migration (STE-011, PSA-010)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| STE-011 The Migration | STE | Tactical execution of a large migration with agents |
| PSA-010 The Migration Strategy | PSA | Architectural planning for agent-executed migration |

**Recommendation**: Use the same migration scenario. PSA-010 is the planning exercise
(produce the migration spec, decompose the work, define the verification gates).
STE-011 is the execution exercise (run the migration using that spec). If a learner
does both paths, they author the plan in PSA-010 and execute it in STE-011 -- a
uniquely coherent learning arc. If they do only one, each stands alone.

### Cluster 7: Security Evaluation (DOE-005, PSE-010)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| DOE-005 Security Scanning | DOE | Hallucinated dependencies and supply-chain risk |
| PSE-010 Security Surface Review | PSE | Agent-introduced code-level vulnerabilities |

**Recommendation**: Share a security review checklist artifact. DOE-005 covers the
dependency/supply-chain surface; PSE-010 covers the code-level surface. Both paths
produce the same artifact (an annotated security review), applied to different scope.
One checklist template to maintain.

### Cluster 8: Specification Writing Progression (ASE-001, ASE-008, STE-002, DME-001, DME-004, PSA-002)

| Lesson | Path | Core Lesson |
|--------|------|-------------|
| ASE-001 The Vague Request | ASE | Write a spec before prompting |
| ASE-008 The Specification | ASE | Convert requirements to a structured spec |
| STE-002 Spec-Driven Development | STE | Spec first, always, for complex work |
| DME-001 The Schema Design | DME | Domain constraints belong in the spec, not discovered later |
| DME-004 Pipeline Specification | DME | Vague ETL specs produce fragile pipelines |
| PSA-002 The Specification as Contract | PSA | Specs as machine-consumable contracts |

**Recommendation**: These are not shareable as single exercises (they're domain-specific),
but they should share a **canonical spec template** artifact. Author a structured spec
format in ASE-001 (already complete); all subsequent spec lessons use and extend the
same template. The progression is: write a spec (ASE-001) → write a domain spec (ASE-008,
DME-001) → write a team spec (STE-002) → write a system contract (PSA-002). One template,
six etudes, compounding familiarity.

### Cluster 9: Setup (ASE-000, STE-000, PSE-000, PSA-000, DOE-000, DME-000)

All six paths begin with an environment setup etude. These share:
- Installing Claude Code and configuring API keys
- Setting up the path-specific toolchain
- Verifying the environment with a trivial first interaction

**Recommendation**: Author a shared setup core that covers the common first two steps.
Each path's `000` etude is then: (shared core) + (path-specific toolchain setup). One
setup script to maintain for the common parts.

### Summary: Authoring Reduction

By applying the sharing strategy above, the 65 total planned etudes reduce to roughly
**50 unique authoring efforts** -- the 15-etude reduction comes from shared scenarios,
shared artifacts, and shared setup infrastructure, not from removing content.

| Cluster | Etudes Affected | Authoring Reduction |
|---------|----------------|---------------------|
| CI Feedback | DOE-001, DOE-003, STE-009 | 3 → 1 scenario (parts) |
| Agent-Friendly Architecture | STE-006, PSA-001, PSA-003 | 3 → 1 codebase |
| Context Calibration | ASE-005, STE-004 | 2 → 1 scenario |
| Delegation Judgment | ASE-006, STE-003 | shared artifact |
| Recovery Patterns | ASE-007, STE-008 | shared framework doc |
| Migration | STE-011, PSA-010 | 2 → 1 scenario (phases) |
| Security | DOE-005, PSE-010 | shared checklist |
| Spec Template | 6 etudes | shared template artifact |
| Setup | 6 x -000 | shared core script |

## Assessment Model

Each etude produces two artifacts:

1. **The Code** -- Working software produced through agent collaboration
2. **The Interaction Log** -- The actual conversation/session with the agent,
   annotated by the learner with reflections on what worked and what didn't

Assessment criteria:

- Did the learner identify and avoid the trap?
- Does the code meet the engineering requirements?
- Did the agent interaction demonstrate the target competency?
- Can the learner articulate the underlying principle (axiom)?

## Technology Stack

Cotudes are **language-agnostic by design**. The agent collaboration skills
transfer across any language or framework. However, each etude specifies a
recommended stack chosen for:

1. **Agent-friendliness** -- Languages with strong type systems and fast feedback
   loops (Go, TypeScript, Rust, typed Python) are preferred
2. **Relevance to the role** -- DevOps etudes use Terraform/Docker/YAML; Data
   etudes use SQL/Python/dbt
3. **Verifiability** -- Every etude must have clear, automatable success criteria

## Sources

This curriculum is informed by practitioner experience documented in:

- Anthropic's context engineering research
- The METR randomized controlled trial on AI-assisted development
- GitHub's analysis of 2,500+ AGENTS.md files
- Spec-driven development practices (GitHub Spec-Kit, Thoughtworks)
- Practitioner reports from Addy Osmani, Armin Ronacher, Boris Cherny, and others
- The "Professional Software Developers Don't Vibe, They Control" study (arXiv 2512.14012)
