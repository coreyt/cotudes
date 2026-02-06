# PSA-001: Agent-Friendly System Design

> **Axiom**: Architecture that relies on tribal knowledge is architecture that agents will violate.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Principal Software Architect |
| **Number** | PSA-001 |
| **Primary Competency** | Architecture for Agents |
| **Trap Severity** | 3 (Intermediate) |
| **Prerequisites** | PSA-000 (Environment Setup) |
| **Duration** | 2-3 sessions |
| **Stack** | Go |

## Overview

You will add a feature to an event-driven system that is riddled with implicit
invariants -- ordering dependencies, naming conventions, data constraints, and
init-order requirements that exist only in the heads of the team. The agent
will produce code that compiles, passes tests, and violates at least three
invariants.

Then you will make the implicit explicit and watch the same agent get it right.

## Why Your Coding Agent Cares

When an agent works in a codebase with implicit invariants, it produces code
that compiles, passes tests, and violates undocumented rules. The bugs are
invisible. Tests pass because the tests don't know about the invariants either.

The naming convention trap is particularly real: if the agent creates
`handleAccountClosed` instead of `onAccountClosed` and the dispatcher uses
reflection, it has created a handler that will be silently ignored. No error,
no test failure, no warning.

Agents strongly prefer codebases with explicit invariants. A documented
ARCHITECTURE.md is worth more to an agent than clever test coverage, because
tests tell it what *does* happen but architecture docs tell it what *must*
happen. Making the implicit explicit fixes both human and agent errors.

## The Setup

The `starter/` directory contains **ledgerflow**, a Go event processing system
for a financial platform. The system processes account lifecycle events:
`AccountCreated`, `AccountActivated`, `AccountSuspended`, `TransactionProcessed`.

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
```

The codebase works. The tests pass. But the architecture contains implicit
knowledge that no document captures:

- Events must be processed in lifecycle order, but this is enforced only by
  handler registration order in `main.go`, not by any explicit check
- Event handlers follow the `on<EventName>` naming convention; the dispatcher
  silently drops handlers that don't match this pattern
- Account balances must never go negative, enforced by checks scattered across
  three packages rather than a single constraint
- Module A depends on module B's interface but never on B's concrete types --
  critical for testing, undocumented
- The cache must be warmed before the API accepts traffic, currently enforced
  by a `time.Sleep(5 * time.Second)` in `main.go`

**Your assignment**: Add a new `AccountClosed` event type and handler. When an
account is closed, it should finalize the balance, emit a `BalanceFinalized`
event, and mark the account as closed. Closing an account with a positive
balance requires a final withdrawal.

## Part 1: The Natural Approach

Start your agent in the `starter/` directory. Describe the feature:

> "Add an AccountClosed event type and handler. When an account is closed,
> finalize the balance, emit a BalanceFinalized event, and mark the account
> as closed. Closing an account with a positive balance requires a final
> withdrawal."

Let the agent work. Run the tests. They will likely pass.

### Checkpoint

The tests pass, but inspect the code against the implicit invariants:

- [ ] Is the new handler registered in the correct lifecycle order in
  `main.go`? (After `AccountSuspended`, before any post-close events.)
- [ ] Does the handler follow the `on<EventName>` naming convention? (If not,
  the dispatcher silently ignores it.)
- [ ] Does the balance finalization check enforce the non-negative invariant
  the same way the other packages do?
- [ ] Does the new code depend on module interfaces (not concrete types)?
- [ ] Does it account for the cache warm-up timing?

Count the invariant violations. The code compiles. The tests pass. The bugs
are invisible until production.

## Part 2: The Effective Approach

Reset the codebase. Before starting a new session, create an
`ARCHITECTURE.md` that makes every implicit invariant explicit:

```markdown
# Architecture Invariants

## Event Processing Order
Events MUST be processed in lifecycle order:
AccountCreated → AccountActivated → AccountSuspended → AccountClosed
Handler registration order in main.go enforces this. New handlers must be
registered in the correct position.

## Handler Naming Convention
All event handlers MUST be named `on<EventName>`. The dispatcher uses
reflection to match handlers to events. A handler named `handleAccountClosed`
will be silently ignored. It must be `onAccountClosed`.

## Balance Invariant
Account balances must NEVER go negative. This is enforced by checks in
the accounts, billing, and handlers packages. Any new code that modifies
a balance must include this check. There is no single enforcement point.

## Module Dependencies
Packages under internal/ must depend on interfaces, not concrete types.
The accounts package defines interfaces; the handlers package consumes them.
Never import a concrete type from another internal package.

## Init Order
The cache must be warmed before the API accepts traffic. Currently enforced
by a sleep in main.go. Any new initialization must complete before the
readiness signal.
```

Now start a new session with the ARCHITECTURE.md in place. Give the same
task description.

### Checkpoint

- [ ] How many invariant violations remain?
- [ ] Did the agent reference the ARCHITECTURE.md constraints?
- [ ] Compare the two implementations: same feature, same agent, different
  context. What changed?

## The Principle

Every codebase has tribal knowledge. Experienced engineers internalize it
through months of code review, incident post-mortems, and hallway
conversations. They know that handlers must be named a certain way, that
balances must be checked in three places, that the cache needs warm-up time.

An agent has none of this context. It reads the code as-is, infers patterns
from what's visible, and produces code that is locally correct but globally
wrong. The bugs are the worst kind: they pass tests, survive code review, and
appear only in production under specific conditions.

The fix is not more tests or better code review. The fix is making the
architecture explicit. Every undocumented invariant is a bug waiting for the
next contributor to introduce -- whether that contributor is a new hire, a
contractor, or an AI agent.

If your architecture requires institutional memory to use correctly, it is
architecture that agents will violate. And increasingly, it is architecture
that humans will violate too.

> **Architecture that relies on tribal knowledge is architecture that agents will violate.**

## Reflection

Record in your interaction log:

1. **Inventory**: How many implicit invariants did you identify? How many did
   the agent violate? Were there invariants even you missed on first read?
2. **Cost of implicit**: For each violated invariant, what would the
   production impact be? A silent data corruption? A dropped event? A race
   condition?
3. **Documentation debt**: In your own systems, how many invariants exist only
   as tribal knowledge? What would it take to make them explicit?
4. **Design principle**: How would you design a new system where invariants
   are enforced by code rather than convention?

## Going Further

- Refactor one of the implicit invariants into an explicit enforcement
  mechanism (e.g., replace handler naming convention with explicit
  registration, replace scattered balance checks with a single domain
  method). Re-run the agent with no ARCHITECTURE.md. Does the explicit
  code prevent the violation without documentation?
- Apply this to a real system: inventory the tribal knowledge in your most
  complex service. Write the ARCHITECTURE.md. Have an agent add a feature.
  Measure the difference.
