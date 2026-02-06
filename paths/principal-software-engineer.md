# Path: Principal Software Engineer

## Profile

**Experience**: 12+ years. Sets technical direction across multiple teams.
Evaluates architectural trade-offs. Responsible for long-term code health and
engineering culture.

**Daily Work**: Architecture reviews, technology strategy, engineering standards,
technical debt management at org scale, mentoring senior engineers, cross-team
coordination, evaluating new technologies.

**Unique Challenge**: Must make decisions about agent adoption that affect entire
organizations, with limited historical precedent. Must balance productivity gains
against maintainability, skill development, and long-term codebase health.

**Anti-goal**: A principal who either blocks agent adoption ("too risky") or
mandates it without adapting engineering practices, leading to unmaintainable
AI-generated code at scale.

## Primary Competencies

1. **Architecture for Agents** -- Designing systems for agent maintainability
2. **Delegation Judgment** -- Evaluating agent ROI across task types at org scale
3. **Output Evaluation** -- Establishing review standards for agent output
4. **Context Engineering** -- Writing guidelines that work across teams

## Etude Sequence

### Foundation (PSE-001 to PSE-003)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| PSE-001 | The Architecture Review | Architecture for Agents | Reviewing agent-proposed architecture uncritically (3) | Go / TypeScript |
| PSE-002 | Technical Debt Triage | Output Evaluation | Agent code that works but accumulates debt (3) | Go |
| PSE-003 | The Standards Document | Context Engineering | Guidelines that are too vague or too rigid (3) | Markdown |

**PSE-001**: An agent proposes a system architecture for a new service. It's
reasonable on the surface but violates an undocumented organizational constraint
(shared database access pattern, existing service boundaries, compliance
requirement). The trap is accepting the architecture because it looks sound in
isolation. **Axiom: Agents architect in a vacuum -- your value is the context
they cannot see.**

**PSE-002**: Agent-generated code across a codebase over 3 months. Each PR looked
fine individually. The aggregated result: inconsistent patterns, duplicated
utilities, abstractions that serve no purpose. The trap is reviewing agent PRs
at the PR level without tracking aggregate patterns. **Axiom: Agent-generated
technical debt is invisible at the PR level -- review the forest, not just the
trees.**

**PSE-003**: Writing an AGENTS.md / CLAUDE.md for the entire org. Too vague ("write
clean code") and agents ignore it. Too rigid (500 lines of rules) and agents get
confused by contradictions. The contrast: focused, specific, tested guidelines
that evolve based on observed agent behavior. **Axiom: Agent guidelines are code
-- they need testing, iteration, and maintenance.**

### Fluency (PSE-004 to PSE-007)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| PSE-004 | Measuring Agent ROI | Delegation Judgment | Lines-of-code metrics instead of outcomes (3) | Analysis |
| PSE-005 | The Legacy System | Architecture for Agents | Agent vs. undocumented legacy code (3) | Python / Java |
| PSE-006 | Design Review Protocol | Output Evaluation | Review standards for agent output (2) | Process |
| PSE-007 | Prototype vs. Production | Delegation Judgment | Agent prototype mistaken for production-ready (4) | Any |

### Application (PSE-008 to PSE-010)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| PSE-008 | Cross-Team Consistency | Context Engineering | Incompatible agent patterns across teams (2) | Process |
| PSE-009 | The Skill Preservation | Delegation Judgment | Team skills atrophying from over-reliance (3) | Process |
| PSE-010 | Security Surface Review | Output Evaluation | Agent-introduced vulnerabilities (3) | Any |

### Capstone (PSE-011)

| # | Title | Competency | Stack |
|---|-------|-----------|-------|
| PSE-011 | Org-Wide Practice | All | Process + Code |

Establish agent collaboration practices for a multi-team engineering org:
guidelines document, review protocol, measurement framework, and training
recommendations. Produce both the practice documentation and a reference
implementation.

## Recommended Cross-Training

Complete STE-006 (Agent-Friendly Architecture) before starting this path.
