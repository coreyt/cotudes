# PSA-003: Modular Boundaries

> **Axiom**: Module boundaries should fit in an agent's context window and a human's working memory.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Principal Software Architect |
| **Number** | PSA-003 |
| **Primary Competency** | Architecture for Agents |
| **Secondary Competency** | Task Decomposition |
| **Trap Severity** | 3 (Intermediate) |
| **Prerequisites** | PSA-001, PSA-002 |
| **Duration** | 3-4 sessions |
| **Stack** | Go / TypeScript |

## Overview

You will add a feature to a monolithic module where every change requires
understanding 5,000+ lines of intertwined logic. The agent will produce code
that is locally coherent but violates cross-cutting concerns it could not fit
in its context window. Then you will decompose the module into well-bounded
units and watch the same agent deliver a correct implementation by reasoning
about one module at a time.

## Why Your Coding Agent Cares

Context windows are large and getting larger. This does not solve the problem.
An agent that can *hold* 200K tokens of code cannot *reason* about 200K tokens
of code with the same fidelity it reasons about 2K tokens. Context capacity and
reasoning fidelity are different things. You experience the same effect: you can
read a 5,000-line file, but you cannot hold its full dependency graph in your
head while making a change at line 3,400.

Monolithic modules create a specific failure pattern with agents. The agent
reads the file, identifies the function it needs to modify, and makes a change
that is correct in isolation. But the function has implicit coupling to state
initialized 2,000 lines above, a validation routine 800 lines below, and a
cache invalidation side effect in a method it never reads because it appeared
outside the window of code the agent chose to focus on. The resulting bug is
not a misunderstanding of the function -- it is a misunderstanding of the
function's entanglement with everything else in the module.

The classic architect response is "that module needs refactoring." Correct.
But the refactoring criteria have changed. The old heuristic was cohesion and
coupling. The new heuristic adds a constraint: each module must be
comprehensible within a single unit of focused attention -- whether that
attention belongs to a human or an agent. A module that requires scrolling
through 5,000 lines to understand the impact of a 10-line change is a module
that both humans and agents will modify incorrectly.

Well-bounded modules with explicit interfaces convert a global reasoning
problem into a local one. The agent reads the module, reads its interface
contract, and implements against the contract. It does not need to understand
the entire system. Neither do you.

## The Setup

The `starter/` directory contains **billingcore**, a billing engine with a
single dominant module. The system processes subscription billing: plan
management, usage metering, invoice generation, payment processing, proration
calculations, and tax computation.

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
```

The critical file is `internal/billing/engine.go` -- approximately 5,200 lines
containing:

- Plan and pricing logic (lines ~1-800)
- Usage metering and aggregation (lines ~800-1,600)
- Invoice generation with line-item calculations (lines ~1,600-2,800)
- Proration for mid-cycle upgrades/downgrades (lines ~2,800-3,600)
- Tax computation with jurisdiction rules (lines ~3,600-4,400)
- Payment orchestration and retry logic (lines ~4,400-5,200)

The module has extensive internal cross-references: invoice generation calls
proration helpers, proration calls pricing functions, tax computation reads
plan metadata, payment retry reads invoice state. These cross-references are
function calls within the same package, with shared mutable state through a
`BillingContext` struct threaded through most functions.

Supporting files exist in `internal/billing/` -- types, helpers, test fixtures
-- but the core logic lives in `engine.go`.

**Your assignment**: Add support for **multi-currency billing**. Tenants can
now have a `billing_currency` (USD, EUR, GBP). All monetary calculations --
pricing, usage metering, invoice totals, proration, tax, and payments -- must
respect the tenant's currency. Exchange rates come from an external service.
Currency conversion must happen at invoice generation time, not at the
individual line-item level (to avoid rounding drift).

## Part 1: The Natural Approach

Start a new agent session in the `starter/` directory. Describe the feature:

> "Add multi-currency billing support. Tenants have a billing_currency field
> (USD, EUR, GBP). All monetary calculations must use the tenant's currency.
> Exchange rates come from a new ExchangeRateService. Conversion happens at
> invoice generation time, not per line item. Update pricing, metering,
> invoicing, proration, tax, and payments to handle multiple currencies."

Let the agent work through `engine.go`. Observe how it approaches the 5,200-
line file. Watch for:

- How does the agent navigate the file?
- Does it read the entire file or work on sections?
- How does it handle cross-cutting concerns that span sections?

Run the tests. Review the implementation.

### Checkpoint

- [ ] Does the currency conversion happen at invoice generation time (not per
  line item)?
- [ ] Does proration correctly handle currency -- prorating in the base
  currency and converting once?
- [ ] Does the tax computation use the correct currency for jurisdiction
  lookups?
- [ ] Are exchange rates fetched once per invoice (not once per calculation)?
- [ ] Does payment processing pass the correct currency to the payment
  gateway?
- [ ] Is the `BillingContext` correctly threaded with currency information
  through all call paths?
- [ ] Do the existing tests still exercise meaningful assertions, or did the
  agent weaken them to make them pass?

Count the cross-cutting bugs. Each one traces to a section of `engine.go`
the agent could not hold in context while modifying another section.

## Part 2: The Effective Approach

Reset the codebase. Before starting a new session, decompose `engine.go` into
bounded modules:

```
internal/billing/
  plan/
    plan.go          # Plan and pricing logic
    plan_test.go
    interface.go     # PlanService interface
  metering/
    metering.go      # Usage metering and aggregation
    metering_test.go
    interface.go     # MeteringService interface
  invoice/
    invoice.go       # Invoice generation, line-item calculation
    invoice_test.go
    interface.go     # InvoiceService interface
  proration/
    proration.go     # Mid-cycle proration logic
    proration_test.go
    interface.go     # ProrationCalculator interface
  tax/
    tax.go           # Tax computation, jurisdiction rules
    tax_test.go
    interface.go     # TaxCalculator interface
  payment/
    payment.go       # Payment orchestration, retry
    payment_test.go
    interface.go     # PaymentProcessor interface
  currency/
    currency.go      # Currency types, exchange rate client
    currency_test.go
    interface.go     # ExchangeRateService interface
  engine.go          # Orchestrator: composes services via interfaces
```

Each module:
- Is 300-800 lines
- Depends on other modules through interfaces only
- Receives its dependencies via constructor injection
- Owns its own types (no shared `BillingContext` mega-struct)

The `engine.go` orchestrator is now a thin composition layer that wires modules
together and defines the billing workflow. It passes a `Currency` value and
an `ExchangeRateSnapshot` (fetched once at invoice generation time) to each
module that needs it.

Create an `ARCHITECTURE.md` in `internal/billing/` documenting:
- Module boundaries and responsibilities
- Interface contracts between modules
- The currency invariant: conversion happens once, at the orchestration layer
- Data flow: which module produces what, which module consumes it

Now start a new agent session. Give the same task description. Observe:
the agent can now reason about one module at a time, implement against
an interface, and trust that the orchestrator handles cross-cutting concerns.

### Checkpoint

Same questions as Part 1:

- [ ] Currency conversion at invoice generation time?
- [ ] Proration handles currency correctly?
- [ ] Tax computation uses correct currency?
- [ ] Exchange rates fetched once per invoice?
- [ ] Payment processing with correct currency?
- [ ] No shared mutable state threading issues?
- [ ] Tests exercise real assertions?

Compare the defect count. Compare the time the agent spent navigating code
vs. implementing logic.

## The Principle

Module boundaries have always been about managing complexity. The original
arguments -- cohesion, coupling, information hiding -- are fundamentally
arguments about human cognitive limits. A well-designed module is one that a
single engineer can understand, modify, and verify without holding the entire
system in their head.

Agents have the same constraint, expressed differently. Instead of working
memory, they have context windows. Instead of cognitive load, they have
attention degradation over long contexts. The practical effect is identical: a
module that requires global understanding to modify locally will be modified
incorrectly.

The size heuristic is useful: if a module is under 800 lines with a clear
interface, both a human and an agent can reason about it completely. But size
alone is insufficient. A 400-line module with implicit dependencies on three
other modules is worse than an 800-line module that is self-contained. The
real boundary is the interface contract: what goes in, what comes out, what
invariants are maintained.

Architects have been saying "decompose that module" for decades. The urgency
has increased. When agents are the primary authors of code changes, module
boundaries are not just a quality heuristic -- they are an error boundary. A
well-bounded module limits the blast radius of an agent's misunderstanding to
the module itself. A monolith lets a single misunderstanding propagate through
every function it touches.

> **Module boundaries should fit in an agent's context window and a human's working memory.**

## Reflection

Record in your interaction log:

1. **Navigation patterns**: How did the agent navigate the 5,200-line file?
   Did it read top-to-bottom? Jump to specific functions? Miss sections
   entirely? What does this tell you about how agents manage large contexts?
2. **Cross-cutting failures**: Which bugs were caused by the agent failing to
   hold two distant sections of the file in context simultaneously? Would a
   human reviewer have caught them?
3. **Decomposition effort**: How long did the module decomposition take? Was
   the refactoring mechanical or did it require architectural judgment?
4. **Interface design**: Which interface boundaries were obvious? Which
   required you to make non-obvious decisions about what belongs where?
5. **Size threshold**: In your experience, what is the maximum module size
   (in lines) where agents consistently produce correct implementations?

## Going Further

- Measure the agent's accuracy as a function of module size. Take a well-
  bounded module and progressively inline its dependencies, creating larger
  and larger files. At what size does the agent's error rate increase? Does
  the threshold differ between Go and TypeScript?
- Apply this decomposition to a real monolithic module in your codebase.
  Measure agent implementation quality before and after. Track: time to
  correct implementation, number of review cycles, and defect density.
- Design a module boundary linter that flags modules exceeding a configured
  line count or dependency count. Integrate it into your CI pipeline. Set
  the threshold at the size where your agents begin making cross-cutting
  errors.
