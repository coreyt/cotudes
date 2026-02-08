# PSA-004: The Evolutionary Architecture

> **Axiom**: Design for the agent that will exist in two years, not the one that exists today.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Principal Software Architect |
| **Number** | PSA-004 |
| **Primary Competency** | Architecture for Agents |
| **Secondary Competency** | Delegation Judgment |
| **Trap Severity** | 2 (Fluency) |
| **Prerequisites** | PSA-001, PSA-002, PSA-003 |
| **Duration** | 2-3 sessions |
| **Stack** | Architecture |

## Overview

You will evaluate two competing architecture proposals for the same system.
One over-optimizes for current agent limitations -- fragmenting code into tiny
files, adding excessive inline comments, duplicating context everywhere. The
other ignores agents entirely -- relying on complex abstractions, implicit
patterns, and human intuition. Both are wrong. You will design a third
architecture that ages well as agent capabilities evolve.

## Why Your Coding Agent Cares

Today's agents struggle with certain patterns: deeply nested abstractions,
implicit dispatch, files over a few thousand lines, convention-driven behavior
without documentation. It is tempting to design architecture around these
limitations. Some teams do: they cap files at 200 lines, inline documentation
into every function, avoid metaprogramming entirely, and flatten inheritance
hierarchies into explicit switch statements.

This works today. It will be technical debt in 18 months.

Agent capabilities are improving on a quarterly cadence. Context windows have
grown from 4K to 200K tokens in two years. Tool use, multi-file reasoning,
and codebase-wide search are standard. The agent that cannot follow a three-
level abstraction today will follow it next quarter. The architecture you
warped to avoid that abstraction will remain warped.

The opposite failure is equally real. Architects who ignore agents design
systems that assume a human reader will "just know" the patterns. They use
convention-over-configuration frameworks where the file path *is* the routing
rule, metaprogramming that generates code at build time, and implicit
dependency injection that requires understanding the full container
configuration. These patterns are powerful and well-understood by experienced
engineers. They are opaque to agents today and will remain partially opaque
for years, because they require reasoning about absent code -- code that
exists only at runtime or by convention.

The evolutionary architecture optimizes for principles that are stable across
agent generations: explicit interfaces, discoverable conventions, documented
invariants, and clear module boundaries. These are good architecture
regardless of who or what is reading the code. They do not pander to current
agent limitations, and they do not assume capabilities that do not yet exist.

## The Setup

The `starter/` directory contains two architecture proposals for **routesmith**,
an API routing and middleware framework. Both proposals include design
documents, directory structures, and partial implementations.

```bash
cd starter/
ls proposals/
# proposal-a/  -- the agent-optimized architecture
# proposal-b/  -- the agent-ignorant architecture
```

**Proposal A** (agent-optimized) restructured the system to accommodate
current agent limitations:

- Every file is under 150 lines
- Functions include inline doc comments restating the module-level docs
- All middleware is explicit -- no chain composition, no dynamic dispatch
- Configuration is duplicated across modules to avoid cross-file reads
- Abstractions are flattened: no interfaces, concrete types everywhere
- README files in every directory repeating context from parent READMEs

**Proposal B** (agent-ignorant) uses sophisticated patterns a senior
engineer would appreciate:

- Convention-based middleware registration (drop a file in `middleware/`,
  it is auto-registered based on filename sort order)
- Generic middleware chain using type parameters and reflection
- Code generation for route handlers from an OpenAPI spec
- Dependency injection via a container with implicit binding rules
- Domain logic expressed through a fluent builder API

Both proposals include an `ADR.md` explaining the rationale.

**Your assignment**: Evaluate both proposals. Then design a third architecture
that will age well over 2-3 years of agent capability improvements. Implement
the core module structure and document your architectural decisions.

## Part 1: The Natural Approach

You have likely developed a strong intuition for one of these two directions.
Some architects, having experienced agent failures, lean toward Proposal A.
Others, skeptical of designing around tool limitations, lean toward Proposal B.

Pick the proposal closer to your instinct. Start a new agent session and ask
the agent to implement a feature using that architecture:

> "Add a new authentication middleware that supports both JWT and API key
> authentication. It should integrate with the existing middleware chain,
> support per-route configuration, and emit metrics for auth decisions."

If you chose Proposal A, observe:
- The agent has many small files to navigate. Does fragmentation help or
  hinder comprehension?
- Duplicated context: does the agent get confused by multiple sources of
  truth, or does redundancy help?
- No interfaces: how does the agent handle testing? Does it create test
  doubles, or does it test against concrete implementations?

If you chose Proposal B, observe:
- Can the agent discover the convention-based registration?
- Does it understand the generic middleware chain?
- Can it work with the code-generated route handlers?
- Does it find the implicit DI bindings?

### Checkpoint

- [ ] Did the agent produce a working implementation?
- [ ] How many times did it misunderstand the architecture?
- [ ] How many workarounds did it create because it could not follow the
  intended pattern?
- [ ] How much of the code would need to change if agent capabilities
  improved significantly next quarter?
- [ ] How much of the architecture is driven by the tool vs. by the domain?

## Part 2: The Effective Approach

Reset. Design the third architecture that follows evolutionary principles.

Start by establishing your design criteria:

**Keep (stable across agent generations):**
- Explicit interfaces between modules
- Documented invariants and constraints
- Module boundaries sized for comprehension (not artificially small)
- Concrete examples in documentation
- Constructor injection for dependencies

**Avoid (over-optimizing for current limitations):**
- Artificially fragmenting files below natural cohesion boundaries
- Duplicating context across locations (creates drift)
- Eliminating all abstraction (loses expressiveness)
- Inline comments that restate the code

**Avoid (ignoring agents entirely):**
- Convention-over-configuration without a discoverable manifest
- Reflection-based dispatch without explicit registration fallback
- Code generation without checked-in output
- Implicit dependency resolution without a wiring file

**Design for (likely near-term agent capabilities):**
- Multi-file reasoning within a module
- Codebase-wide search and reference following
- Interface-based navigation (go-to-implementation)
- Test execution and interpretation

Write an `ADR-003.md` documenting your architecture. Include:
- The principles guiding the design
- What you chose NOT to optimize for and why
- A 2-year review trigger: "Revisit these decisions when agents can X"

Implement the core module structure. Then start a new agent session and give
the same feature request. Observe how the agent navigates an architecture
designed to be stable, not accommodating.

### Checkpoint

- [ ] Did the agent produce a correct implementation without workarounds?
- [ ] Which of your architectural decisions actively helped the agent? Which
  were neutral? Which were irrelevant?
- [ ] Read your ADR-003 as if agent context windows doubled next month.
  Which decisions still hold? Which would you revisit?
- [ ] Compare the amount of architecture driven by domain concerns vs. tool
  concerns. What is the ratio?

## The Principle

Architecture decisions have a half-life. The decisions that age best are the
ones grounded in stable principles: separation of concerns, explicit
contracts, information hiding. The decisions that age worst are the ones
optimized for transient constraints: specific tool limitations, current team
size, today's deployment infrastructure.

Agent capabilities are a transient constraint. The specific things agents
struggle with today -- long files, implicit patterns, convention-based
dispatch -- are active areas of improvement. Designing architecture to avoid
these specific limitations is the same mistake as designing architecture
around a specific database's query planner quirks: it couples your system to
an implementation detail that will change.

The corollary is equally important: the things agents struggle with are often
things humans struggle with too, just at different thresholds. A file that
requires 200K tokens of context for an agent to understand correctly probably
requires more cognitive load than any single human should bear. The right
response is not to fragment it for the agent -- it is to design module
boundaries that serve both human cognition and agent reasoning.

Evolutionary architecture means making decisions that are robust to
capability changes in either direction. If agents get dramatically better,
your architecture should not need restructuring. If agents plateau, your
architecture should still be correct. The way to achieve this is to design
for the domain, not the tool.

> **Design for the agent that will exist in two years, not the one that exists today.**

## Reflection

Record in your interaction log:

1. **Instinct check**: Which proposal did you initially lean toward? What
   does that reveal about your mental model of agent-assisted development?
2. **Over-optimization audit**: Look at your current systems. Where have you
   (or your team) made architectural decisions specifically to accommodate
   agent limitations? Which of those decisions will age well?
3. **Under-optimization audit**: Where are you using patterns that are
   opaque to agents (convention-based dispatch, implicit registration,
   build-time code generation) without providing discoverable alternatives?
4. **Time horizon**: What is the half-life of your architectural decisions?
   Which decisions made two years ago are now technical debt because the
   tooling landscape changed?
5. **Review triggers**: What specific agent capability improvements would
   cause you to revisit your current architectural decisions?

## Going Further

- Inventory the architectural decisions in your most critical system. Tag
  each as "domain-driven," "agent-accommodating," or "agent-ignoring."
  For each agent-accommodating decision, write a review trigger: "Revisit
  when agents can ___." For each agent-ignoring decision, assess: does this
  create unnecessary friction for agent-assisted development?
- Design an architectural fitness function that measures how well a codebase
  supports agent-assisted development without over-optimizing for current
  limitations. Candidate metrics: average module size, interface coverage,
  documentation-to-code ratio, convention discoverability score.
- Write an ADR template for your organization that includes a "Tool
  Sensitivity" section: which decisions in this ADR are sensitive to
  changes in development tooling (including agents), and what are the
  review triggers?
