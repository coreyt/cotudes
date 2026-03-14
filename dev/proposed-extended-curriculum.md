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

The curriculum should be reorganized into four layers:

1. **Common Foundation**
2. **Agent Systems Foundation**
3. **Role-Specific Paths**
4. **Role Capstones**

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

This layer is still shared across all roles. It introduces the workflow model
the rest of the repository should assume.

### AGT-001: The Agentic Loop in Practice

Focus:
- deliberate use of plan-act-verify cycles
- surfacing assumptions before execution
- explicit verification gates
- handling failure, loops, and dead ends

Working example:
- Block Workflow + Goose as the reference environment

### AGT-002: Agentic Tool Use

Focus:
- tools as bounded capabilities, not magical extensions of the model
- filesystem, tests, lint, search, networked APIs, and environment inspection
- selecting tools based on verifiability and blast radius

Outcome:
- learner distinguishes "ask the model" from "execute via tool and verify"

### AGT-003: Good Practices Workflow

Focus:
- spec before implementation
- tests and checks as guardrails
- code review of agent output
- small batches, checkpoints, rollback discipline, explicit acceptance criteria

Working example:
- Block Workflow + Goose demonstrating harness + agent + checks + restart

### AGT-004: Building Small Applications with Agents

Focus:
- shipping a simple but real application with agent assistance
- using agents for scaffolding, review, tests, refactors, and docs
- separating architecture decisions from code generation

Outcome:
- learner experiences end-to-end delivery, not just isolated prompting

### AGT-005: MCP Concepts and Boundaries

Focus:
- what MCP is
- why tool schemas, permissions, and discoverability matter
- when to use MCP vs native tools vs bespoke harness integrations
- risks around capability sprawl and trust boundaries

Outcome:
- learner can reason about MCP as interface and protocol, not as a buzzword

### AGT-006: Harness + Agent + Workflow

Focus:
- what a harness is
- why harnesses matter for reproducibility, tool routing, auditability, and
  policy enforcement
- compare direct chat use vs harnessed execution
- use Block Workflow + Goose as the default concrete example

Outcome:
- learner understands how teams operationalize agent use beyond ad hoc sessions

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

Not every role needs the same depth in every topic, but every role should see
the same base sequence.

### Associate Software Engineer

Keep emphasis on:
- specification
- test design
- review of agent output
- understanding before delegating

Extend with:
- a basic agentic loop etude
- a small app-building etude
- introductory MCP concepts
- harness familiarity, but not deep harness authoring

### Staff Software Engineer

Keep emphasis on:
- context engineering
- decomposition
- architecture for agent-friendly systems
- parallel execution and review

Extend with:
- deeper agentic workflow design
- tool selection and workflow composition
- app-building with multiple coordinated agent tasks
- harness usage as a team productivity system

### Principal Software Engineer

Keep emphasis on:
- standards
- review protocols
- organizational delegation judgment
- security and maintainability

Extend with:
- agent operating model design for teams
- provider/backend systems mental model for tradeoff analysis
- harness governance and rollout patterns
- deciding where MCP and tool surfaces belong in the org

### Principal Software Architect

Keep emphasis on:
- modular boundaries
- specifications as executable contracts
- architecture for agent-friendly development

Extend with:
- systems design for agent-operated applications
- tool and interface boundaries
- harness-aware platform design
- MCP and capability design at the architecture level

### Staff DevOps / CI/CD Engineer

Keep emphasis on:
- feedback loops
- pipeline guardrails
- security review
- infra review of agent output

Extend with:
- harness operations
- policy enforcement for agent tools
- MCP integration patterns in controlled environments
- observability for agentic workflows

### Staff Data Management Engineer

Keep emphasis on:
- specification
- correctness review
- data quality gates
- context around lineage and governance

Extend with:
- agentic tool use for schema/query/pipeline workflows
- harnessed execution for repeatable data tasks
- MCP concepts for governed data access
- app-building where data correctness is the central constraint

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

### Phase 2: Add new shared-foundation etudes

Introduce new etudes for:
- coding-agent usage
- LLM mental model
- agentic loop
- tool use
- small app-building
- MCP concepts
- harness workflow

These can live in a shared foundation namespace or be mirrored into each path.

### Phase 3: Patch role paths with targeted extensions

Add the role-specific extensions where they matter most:
- deeper harness/policy work for DOE and PSE
- deeper app/system design work for STE and PSA
- lighter conceptual versions for ASE

### Phase 4: Standardize capstones

Ensure every path has:
- one clear capstone
- the same required evidence model
- comparable evaluation criteria

## Recommendation

Use the following final structure:

- **Shared Foundation**
  tool use, LLM mental model, agentic loop, provider systems basics
- **Shared Agent Systems Layer**
  tool use, app-building, MCP, harness workflow
- **Role Path**
  current competency-focused etudes by role
- **Capstone**
  one per role with common evidence requirements

This keeps the best part of the current curriculum, while adding the missing
transition path from software engineer to effective operator of agentic systems.
