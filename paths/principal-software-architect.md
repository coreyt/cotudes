# Path: Principal Software Architect

## Profile

**Experience**: 15+ years. Responsible for system design decisions that span
years and teams. Evaluates technology strategy and makes bets on where the
industry is heading.

**Daily Work**: System architecture design, architecture decision records (ADRs),
bounded context definition, service boundary design, technology evaluation,
capacity planning, API strategy, compliance architecture.

**Unique Challenge**: Architectural decisions made now must account for rapidly
evolving agent capabilities. Over-optimizing for current agent limitations may be
as costly as ignoring agents entirely. The time horizon for architecture is 3-5
years; agent capabilities are changing quarterly.

**Anti-goal**: An architect who designs systems without considering that agents
will be primary authors of the code within those systems, or one who warps
architecture around current agent quirks that will be obsolete in 18 months.

## Primary Competencies

1. **Architecture for Agents** -- Designing systems agents can understand and extend
2. **Context Engineering** -- Self-documenting architecture for humans and agents
3. **Delegation Judgment** -- Evaluating where agents fit in the development lifecycle
4. **Specification Writing** -- ADRs and RFCs that agents can consume and implement

## Etude Sequence

### Foundation (PSA-001 to PSA-003)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| PSA-001 | Agent-Friendly System Design | Architecture for Agents | System with implicit knowledge agents can't discover (3) | Architecture |
| PSA-002 | The Specification as Contract | Specification Writing | ADRs/RFCs as agent-consumable implementation guides (2) | Markdown + Code |
| PSA-003 | Modular Boundaries | Architecture for Agents | Module boundaries for agent-sized work units (3) | Go / TypeScript |

**PSA-001**: A system with tribal knowledge embedded in code: implicit ordering
dependencies, undocumented invariants, conventions known only through
institutional memory. An agent working in this system introduces subtle bugs
because it can't discover what isn't written. The contrast: explicit
architecture with documented invariants, clear module boundaries, and
discoverable conventions. **Axiom: Architecture that relies on tribal knowledge
is architecture that agents will violate.**

**PSA-002**: An RFC describes a new feature in human-oriented prose. An agent
implementing it misinterprets ambiguities that a human reader would resolve
through context. The contrast: the same RFC structured with formal interface
contracts, explicit constraints, and concrete examples that both humans and
agents can implement against. **Axiom: The best specification is a contract
that constrains interpretation, not a narrative that invites it.**

**PSA-003**: A monolithic module where every change requires understanding 5,000
lines of context. Agents struggle because the context window can't hold the full
picture. The contrast: well-bounded modules with clear interfaces, where each
module fits comfortably in an agent's working context. **Axiom: Module boundaries
should fit in an agent's context window and a human's working memory.**

### Fluency (PSA-004 to PSA-007)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| PSA-004 | The Evolutionary Architecture | Architecture for Agents | Designing for future agent capabilities (2) | Architecture |
| PSA-005 | Documentation as Code | Context Engineering | Self-documenting architecture for agents and humans (3) | Any |
| PSA-006 | The Platform Decision | Delegation Judgment | Build-with-agent vs. buy vs. build-yourself (2) | Analysis |
| PSA-007 | Observability Design | Feedback Loop Design | Monitoring agent-generated system behavior (2) | Go / TypeScript |

### Application (PSA-008 to PSA-010)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| PSA-008 | The Data Architecture | Architecture for Agents | Schema design agents can reason about (3) | SQL / Any |
| PSA-009 | Compliance and Governance | Output Evaluation | Agent output meeting regulatory requirements (2) | Process + Code |
| PSA-010 | The Migration Strategy | Task Decomposition | Large-scale migration planned for agent execution (2) | Architecture |

### Capstone (PSA-011)

| # | Title | Competency | Stack |
|---|-------|-----------|-------|
| PSA-011 | System Redesign | All | Architecture + Code |

Redesign an existing system with agent collaboration explicitly considered:
module boundaries that fit agent context windows, documented invariants, ADRs
structured as implementation contracts, and observability for agent-generated
code behavior.

## Recommended Cross-Training

Complete STE-006 (Agent-Friendly Architecture) and PSE-001 (Architecture Review)
before starting this path.
