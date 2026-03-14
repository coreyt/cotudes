# Proposed Extended Curriculum

## Purpose

This document proposes an extension to the current `cotudes` curriculum so it
can do two things at once:

1. Preserve the existing strength of the repository: teaching engineers how to
   work effectively with coding agents.
2. Add the missing conceptual ladder engineers need as they move from
   traditional software engineering to agent-augmented and agent-orchestrated
   workflows.

The result should be a curriculum that teaches both:

- **Human competency**: specification, review, decomposition, delegation,
  feedback loops, workflow design.
- **Mental models**: how LLMs work, how agent loops work, how tools and MCP fit
  together, and how harnesses structure safe execution.

## Core Thesis

The current curriculum correctly assumes that the main transition is not "learn
to prompt" but "learn to direct engineering work performed by agents."

That thesis should remain intact.

What is missing is a shared conceptual progression that helps all roles answer:

- What is an LLM actually doing?
- What is the difference between a model, an agent, a tool, a harness, and a
  workflow?
- How does an engineer safely build and operate systems where agents can read,
  plan, call tools, evaluate results, and iterate?

The curriculum should therefore become **two-dimensional**:

- **Dimension 1: Shared foundations**
  Every learner builds an agent and LLM mental model.
- **Dimension 2: Role-specific etudes**
  Each role then practices the engineering behaviors that matter most in that
  role.

## Design Principles

1. Keep the existing competency model.
   The current 10 competencies are still the right behaviors to train.

2. Add a shared conceptual spine before role specialization.
   All learners should pass through the same mental-model and workflow
   foundations before branching deeply by role.

3. Teach agent use as an engineering workflow, not as chat usage.
   The unit of learning should be the loop: task framing, context loading,
   planning, tool execution, verification, review, and restart.

4. Use one concrete working example across roles.
   Use **Block's Block Workflow + Goose** as the canonical example for:
   harness + agent + tools + verification + restart discipline.

5. End every role path with a capstone.
   The capstone should require both working software and evidence of disciplined
   agent collaboration.

## Proposed Curriculum Shape

The curriculum is organized into three layers (the original Layer 2 — Agent
Systems Foundation — has been retired; see that section for disposition):

1. **Common Foundation** (FND-001, FND-002)
2. **Role-Specific Paths** (existing etudes + sharing clusters)
3. **Role Capstones** (standardized four-output evidence model)

## Layer 1: Common Foundation

Every role should complete a shared foundation sequence before entering the main
role path.

### FND-001: Using Coding Agents as a Working Engineer

Focus:
- Claude Code / Codex style workflows
- task framing
- scoped delegation
- reading before accepting
- preserving human ownership of requirements and review

Outcome:
- learner can use an agent productively without treating it like autocomplete or
  an infallible teammate

### FND-002: LLM Mental Model for Practitioners

Focus:
- tokens, context windows, sampling, tool calling, retrieval at a high level
- why models hallucinate
- why context quality matters more than prompt cleverness
- what models are good at vs poor at

Outcome:
- learner can predict common model failure modes and design around them

### FND-003: From Model to Agent

Focus:
- difference between an LLM and an agent
- the agentic loop: observe, plan, act, verify, revise, stop
- why autonomy without checkpoints is dangerous
- when to restart rather than continue

Outcome:
- learner can reason about agent behavior as an execution loop, not a magic box

### FND-004: Provider and System Design Basics

Focus:
- high-level system design of an LLM provider
- inference, latency, rate limits, context assembly, tool execution boundaries
- why product behavior differs across local, API, and harnessed setups

Outcome:
- learner understands the systems constraints that shape model and agent
  behavior

## Layer 2: Agent Systems Foundation

> **Retired.** The AGT layer has been superseded by the cross-path sharing
> strategy documented in `dev/curriculum-map.md` (see "Cross-Path Lesson
> Sharing"). Each AGT concept is addressed by existing or planned etudes that
> are shared across paths rather than authored as a separate pre-role sequence.
> Authoring a parallel AGT layer would create redundancy, not depth.

### Disposition of AGT concepts

| AGT etude | Concept | Addressed by |
|-----------|---------|-------------|
| AGT-001 The Agentic Loop in Practice | plan-act-verify cycles, handling failure and dead ends | ASE-007 The Debug Loop + STE-008 Recovery and Restart (Cluster 5, shared framework doc) |
| AGT-002 Agentic Tool Use | tools as bounded capabilities, verifiability and blast radius | ASE-006 Know What You Don't Know + STE-003 The Delegation Matrix (Cluster 4, shared delegation matrix) |
| AGT-003 Good Practices Workflow | spec first, tests as guardrails, checkpoints | ASE-001, ASE-003, STE-002 (Spec Writing cluster; shared spec template artifact) |
| AGT-004 Building Small Applications | end-to-end delivery with agent assistance | Existing role capstones (ASE-015, STE-015, etc.) |
| AGT-005 MCP Concepts and Boundaries | tool schemas, permissions, capability boundaries | MCP is a protocol, not a competency. Delegation Judgment and Workflow Architecture (FND-002) cover the underlying concepts. Appears as technology context inside relevant existing etudes. |
| AGT-006 Harness + Agent + Workflow | harness patterns, reproducibility, audit | DOE-001/DOE-003/STE-009 (Cluster 1, three-part CI scenario) + FND-002 The Workflow Contract |

## How This Integrates With the Existing Curriculum

The existing curriculum should not be replaced. It should be **reframed** as
role-specialized practice that begins after the shared foundations.

### Existing competency model

Retain the existing 10 competencies:

- Specification Writing
- Context Engineering
- Task Decomposition
- Delegation Judgment
- Output Evaluation
- Feedback Loop Design
- Session Management
- Parallel Orchestration
- Recovery Patterns
- Architecture for Agents

### Integration rule

For each existing path:

1. prepend the Common Foundation and Agent Systems Foundation
2. keep the existing role-specific etudes
3. add any missing role-relevant extensions
4. end with a capstone that includes:
   - working artifact
   - interaction log
   - review evidence
   - explanation of workflow choices

## Role Extensions

Role extensions add depth to the shared foundation within existing path etudes.
These are not separate pre-role sequences; they are the Application-tier and
role-specific etudes that the cross-path sharing strategy preserves or
introduces. See `dev/curriculum-map.md` "Cross-Path Lesson Sharing" for the
canonical sharing implementation.

### Associate Software Engineer

Keep emphasis on:
- specification
- test design
- review of agent output
- understanding before delegating

Extend with (Application tier, planned):
- failure mode recognition — addressed by shared ASE-007/STE-008 recovery framework
- capstone as first end-to-end delivery experience (ASE-015)

### Staff Software Engineer

Keep emphasis on:
- context engineering
- decomposition
- architecture for agent-friendly systems
- parallel execution and review

Extend with (Application tier, planned):
- workflow architecture — addressed by FND-002 The Workflow Contract (Competency 12)
- tool selection and scope — addressed by shared STE-003 delegation matrix
- multi-session delivery — STE-010 Session Continuity + STE-015 capstone

### Principal Software Engineer

Keep emphasis on:
- standards
- review protocols
- organizational delegation judgment
- security and maintainability

Extend with (Application tier, planned):
- workflow governance for teams — FND-002 + PSE-008 Cross-Team Consistency
- tool surface decisions — Delegation Judgment (PSE-006 Design Review Protocol)
- security review as a systematic practice — PSE-010 + shared DOE-005 checklist

### Principal Software Architect

Keep emphasis on:
- modular boundaries
- specifications as executable contracts
- architecture for agent-friendly development

Extend with (Application tier, planned):
- workflow-aware platform design — FND-002 + PSA-007 Observability Design
- capability boundary design — Delegation Judgment at architecture scale (PSA-006)
- agent-operated application design — PSA-008 The Data Architecture + PSA-009

### Staff DevOps / CI/CD Engineer

Keep emphasis on:
- feedback loops
- pipeline guardrails
- security review
- infra review of agent output

Extend with (Application tier, planned):
- workflow operations and policy enforcement — FND-002 + DOE-009 Platform Engineering
- observability for agentic workflows — DOE-007 Monitoring and Alerting
- incident response discipline — DOE-008 (Recovery Patterns at infrastructure scale)

### Staff Data Management Engineer

Keep emphasis on:
- specification
- correctness review
- data quality gates
- context around lineage and governance

Extend with (Application tier, planned):
- workflow architecture for repeatable data tasks — FND-002 + DME-007 Idempotency
- governed data access patterns — Delegation Judgment (DME-009 The Access Pattern)
- correctness as the capstone constraint — DME-011 Data Platform capstone

## Shared Systems Design Requirement

All roles should complete a basic systems design sequence that covers:

- agent, harness, and tool boundaries
- execution environments
- permissions and capability control
- verification and observability loops
- human approval points

This should be taught once in the shared foundation, then revisited differently
by role.

The working example should be:

- **Block Workflow** as the structured workflow model
- **Goose** as the concrete harness/agent example

The goal is not product-specific loyalty. The goal is giving learners one stable
reference implementation so they can build transferable mental models.

## Proposed Capstone Structure

Every role should end in a capstone, and every capstone should require four
outputs:

1. **A working artifact**
   Code, system design, pipeline, schema, or application depending on role.

2. **An interaction log**
   The actual agent collaboration record, annotated by the learner.

3. **A workflow explanation**
   Why the learner used a particular loop, tool pattern, harness, or checkpoint
   strategy.

4. **A review packet**
   Risks found, tests/checks run, unresolved concerns, and what the learner
   would change in a second pass.

### Capstone themes by role

- ASE: build a small feature or app safely with agent assistance
- STE: deliver a multi-step system feature using coordinated agents and review
- PSE: define and evaluate an org-level agent engineering practice
- PSA: redesign a system to be agent-friendly and operationally governable
- DOE: build a guarded CI/CD or platform workflow for agent-produced changes
- DME: deliver a data workflow with correctness, governance, and recovery built in

## Implementation Strategy for This Repository

The repo can evolve in phases:

### Phase 1: Add the shared foundation model to the docs

Update:
- `README.md`
- `dev/curriculum-map.md`
- each `paths/*.md`

Goal:
- make the common foundation explicit without rewriting every path immediately

### Phase 2: Add two new shared-foundation etudes

Author the two etudes that address genuinely absent competencies:

- `FND-001: The Failure Map` — Competency 11: LLM Failure Mode Reasoning
  (context degradation, hallucination under ambiguity, tool error propagation)
- `FND-002: The Workflow Contract` — Competency 12: Workflow Architecture
  (checkpoints, scope declaration, human approval gates, restart discipline)

These live in `cotudes/FND-001-the-failure-map/` and
`cotudes/FND-002-the-workflow-contract/`. Both satisfy the dual requirement
framework: real engineering task + named agent collaboration skill. Both follow
the trap-then-correct model.

The AGT layer (originally proposed as AGT-001 through AGT-006) is not authored.
Its concepts are addressed by the cross-path sharing strategy. See the "Layer 2:
Agent Systems Foundation" section above for the full disposition mapping.

### Phase 3: Implement cross-path sharing clusters

Apply Tier A sharing clusters during Fluency-tier authoring:
- CI Feedback cluster (DOE-003, STE-009 built on DOE-001 scenario)
- Context Calibration cluster (ASE-005 and STE-004 as one two-phase scenario)
- Agent-Friendly Architecture cluster (STE-006, PSA-003 built on PSA-001 codebase)

Apply Tier B clusters as Application-tier authoring begins:
- Delegation matrix artifact (STE-003 first, then ASE-006)
- Migration scenario (PSA-010 plans, STE-011 executes)
- Recovery framework doc (shared between ASE-007 and STE-008)

### Phase 4: Standardize capstones

Ensure every path has:
- one clear capstone etude
- the four-output evidence model: working artifact, interaction log, workflow
  explanation, review packet
- comparable evaluation criteria across paths

## Recommendation

Use the following final structure:

- **Common Foundation** (2 etudes: FND-001, FND-002)
  LLM failure mode reasoning and workflow architecture — the two competencies
  absent from the current 10
- **Role Path**
  existing competency-focused etudes by role, with cross-path sharing clusters
  applied to reduce redundancy and authoring effort
- **Capstone**
  one per role with the standardized four-output evidence model

This keeps the existing curriculum intact, eliminates AGT-layer redundancy,
addresses the two genuine conceptual gaps with the minimum necessary new work,
and reduces overall authoring effort through the sharing strategy.
