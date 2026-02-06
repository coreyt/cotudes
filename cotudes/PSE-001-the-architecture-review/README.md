# PSE-001: The Architecture Review

> **Axiom**: Agents architect in a vacuum -- your value is the context they cannot see.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Principal Software Engineer |
| **Number** | PSE-001 |
| **Primary Competency** | Architecture for Agents |
| **Trap Severity** | 3 (Intermediate) |
| **Prerequisites** | PSE-000 (Environment Setup) |
| **Duration** | 2-3 sessions |
| **Stack** | Go / TypeScript (architecture review) |

## Overview

You will review an agent-proposed architecture for a new notification service
within an existing e-commerce platform. The platform has organizational
constraints -- shared database policies, event bus conventions, compliance
requirements, auth patterns -- scattered across existing documentation.

The architecture the agent produces will be technically sound. The question is
whether it fits your organization.

## Why Your Coding Agent Cares

When asked to design architecture, an agent optimizes for the problem as
described. It genuinely cannot know that your org shares a PostgreSQL cluster,
that PCI-DSS scoping rules restrict which services touch payment data, or that
teams have specific ownership boundaries. These are organizational constraints
that exist nowhere in the code.

The agent's blind spot isn't technical quality -- it's organizational context.
A principal engineer who evaluates the agent's architecture proposal purely on
technical merit will approve a design that breaks in their specific org. The
skill is knowing what context the agent is missing and providing it.

Agents would much rather receive "design this architecture, but it must comply
with these 4 ADRs and fit within this system landscape" than "design this
architecture." The constraints make the job easier, not harder. Unconstrained
design space is where agents are most likely to produce something that's
technically sound but organizationally wrong.

## The Setup

The `starter/` directory contains documentation for **Meridian Commerce**, a
mid-size e-commerce platform:

- `docs/system-landscape.md` -- Overview of existing services, infrastructure,
  and team ownership
- `docs/adrs/` -- Existing Architecture Decision Records
  - `ADR-001-shared-database.md` -- Shared PostgreSQL cluster policy
  - `ADR-002-event-schema.md` -- Event bus schema conventions
  - `ADR-003-auth-pattern.md` -- JWT auth via API gateway
  - `ADR-004-pci-scope.md` -- PCI-DSS cardholder data environment boundaries
- `docs/requirements-notification-service.md` -- Requirements for the new
  notification service
- `services/` -- Existing service skeletons showing current patterns
- `shared/` -- Shared Go packages used across services
- `adr-template.md` -- The org's ADR template

Read all documentation before proceeding. You are the principal engineer who
knows this system. The agent does not.

## Part 1: The Natural Approach

Start your agent. Provide the requirements document and ask:

> "Design the architecture for this notification service. Produce an ADR
> following our template."

Give the agent the requirements document and the ADR template. Do not provide
the existing ADRs, the system landscape, or any organizational constraints
beyond what's in the requirements doc.

Review the agent's proposed architecture.

### Checkpoint

The agent's architecture likely looks reasonable. Evaluate it against these
organizational constraints (which you know but the agent does not):

- [ ] **Database**: Does it propose its own database, or use the shared
  PostgreSQL cluster per ADR-001? (New services use schemas in the shared
  cluster, not standalone databases.)
- [ ] **Events**: Does it follow the event schema convention from ADR-002?
  (CloudEvents format, specific subject naming, schema registry.)
- [ ] **Auth**: Does it implement its own auth, or rely on the API gateway
  per ADR-003? (Services never verify JWTs directly.)
- [ ] **PCI scope**: Does it handle notification content containing payment
  data correctly per ADR-004? (Order confirmation notifications must not
  include full card numbers; notification service must not enter CDE scope.)
- [ ] **Connection pooling**: Does it account for PgBouncer's 200-connection
  limit shared across all services?
- [ ] **Team ownership**: Does it align with existing team boundaries?

Count the violations. Record which constraints the agent missed and why it
couldn't have known them.

## Part 2: The Effective Approach

Start a fresh agent session. This time, provide:

1. The requirements document
2. The ADR template
3. **All four existing ADRs**
4. **The system landscape document**
5. A summary of constraints the agent must respect

Your prompt:

> "Design the architecture for the notification service. It must comply with
> all existing ADRs and fit within the system landscape. Here are the
> organizational constraints: [list the specific constraints from ADR-001
> through ADR-004]. Produce an ADR following our template."

### Checkpoint

Evaluate the new architecture against the same checklist:

- [ ] How many organizational constraints does it respect now?
- [ ] Does it reference existing ADRs?
- [ ] Does it fit the team ownership model?
- [ ] Would you approve this ADR in a real review?

Compare with `reference/ADR-notification-service.md`.

## The Principle

An agent evaluating a technical problem will produce an architecture optimized
for the problem as described. It will consider scalability, maintainability,
separation of concerns, and standard patterns. The architecture will be
technically defensible.

But architecture decisions do not exist in isolation. They exist within
organizations that have:

- **Shared infrastructure** with capacity constraints
- **Compliance requirements** with hard legal boundaries
- **Team structures** with ownership models
- **Existing conventions** that reduce cognitive load across services
- **Historical decisions** documented in ADRs that constrain future choices

None of this context is visible to the agent unless you provide it. A
principal engineer's value is not in knowing design patterns -- the agent
knows those too. Your value is knowing the organizational context that makes
one technically sound architecture correct and another technically sound
architecture wrong.

The trap is evaluating the agent's proposal the way you'd evaluate a junior
engineer's: on technical merit alone. A junior engineer absorbs
organizational context through osmosis over months. The agent has none unless
you explicitly provide it.

> **Agents architect in a vacuum -- your value is the context they cannot see.**

## Reflection

Record in your interaction log:

1. **Inventory**: List every organizational constraint the agent violated in
   Part 1. For each, identify where that constraint is documented (or if it's
   undocumented tribal knowledge).
2. **Sufficiency**: Was providing the ADRs and system landscape sufficient, or
   did the agent still need additional context? What was missing?
3. **Generalization**: In your own organization, how many architectural
   constraints exist only as tribal knowledge? What would it take to make them
   discoverable?
4. **Process**: How would you change your architecture review process to
   account for agent-proposed designs?

## Going Further

- Inventory the undocumented architectural constraints in your actual
  organization. Draft ADRs for the top three.
- Have the agent propose an architecture for a real system at work. Evaluate
  it against organizational constraints. What does it miss?
- Review PSE-003 (The Standards Document): this etude addresses a single
  review; PSE-003 addresses writing guidelines that work across teams.
