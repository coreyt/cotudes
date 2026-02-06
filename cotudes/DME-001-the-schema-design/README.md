# DME-001: The Schema Design

> **Axiom**: A schema that satisfies normal forms but ignores domain constraints is a schema that will corrupt data.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff Data Management Engineer |
| **Number** | DME-001 |
| **Primary Competency** | Specification Writing |
| **Trap Severity** | 4 (Common) |
| **Prerequisites** | DME-000 (Environment Setup) |
| **Duration** | 2-3 hours |
| **Stack** | SQL / PostgreSQL |

## Overview

You will design a database schema for an online marketplace for handmade goods.
The domain includes sellers, products, orders with a defined lifecycle, and
reviews. You will do this twice: once describing the domain informally, once
with a formal specification. The difference in constraint coverage will be
stark.

## Why Your Coding Agent Cares

Data schemas are where specification writing matters most, because the failure
mode is silent. When an agent designs a schema from a domain description, it
produces well-normalized tables with proper foreign keys. It will look correct.
But the agent will miss: price must be positive, ratings must be 1-5, order
status transitions must follow a lifecycle, a seller can't review their own
product.

These aren't constraints an agent can infer from the domain description. The
description says "products have a price." Only the specification says "price
must be > 0." The description says "orders have a status." Only the
specification says "status transitions must follow pending -> paid -> shipped ->
delivered."

For schema design, the specification-first approach is non-negotiable. Domain
constraints are the one class of requirement agents systematically miss because
they live in the business rules, not in the data structure. A specification that
says "what the data must never be" gives the agent the negative constraints it
needs to produce a schema that actually protects data integrity.

## The Setup

In `starter/` you will find:

- `domain.md` -- A business stakeholder's description of the marketplace
- `docker-compose.yml` -- PostgreSQL 16 instance
- `migrations/001_baseline.sql` -- Creates the database and schema
- `tests/` -- SQL scripts that test constraint enforcement
- `verify-schema.sql` -- Comprehensive constraint verification (attempts to
  insert invalid data; counts how many violations the schema prevents)

Start the database:

```bash
cd starter/
docker compose up -d
docker compose exec postgres psql -U marketplace -d marketplace -c "SELECT 1"
```

The domain includes these entities:

- **Sellers**: verification status, computed rating
- **Products**: price, category, inventory count, lifecycle status
- **Orders**: lifecycle (pending → paid → shipped → delivered → completed/disputed)
- **Reviews**: 1-5 rating, verified purchase requirement

## Part 1: The Natural Approach

Open `domain.md`. Give it to your agent:

> "Design a PostgreSQL schema for this marketplace domain. Create a migration
> file with all tables, relationships, and indexes needed."

Save the output as `migrations/002_schema.sql`. Apply it:

```bash
docker compose exec postgres psql -U marketplace -d marketplace \
  -f /workspace/migrations/002_schema.sql
```

Run the verification:

```bash
docker compose exec postgres psql -U marketplace -d marketplace \
  -f /workspace/verify-schema.sql
```

### Checkpoint

Record in your interaction log:

1. How many verification checks passed vs. failed?
2. Is the schema normalized? Are foreign keys correct? Does it look
   professional?
3. What category of constraint is missing? (Hint: the schema likely handles
   *structure* well and *domain rules* poorly.)

Do not proceed until you have a clear count.

## Part 2: The Effective Approach

Reset the database:

```bash
docker compose down -v && docker compose up -d
docker compose exec postgres psql -U marketplace -d marketplace \
  -f /workspace/migrations/001_baseline.sql
```

Write a **schema specification** before prompting the agent. Cover:

- Every field's type, nullability, and valid value range
- Enumerated values for status and category fields
- State machine transitions (which status transitions are legal)
- Cross-entity invariants (a review requires a completed order)
- Natural keys and uniqueness constraints beyond PKs
- Computed vs. stored fields
- What the database must **prevent**, not just what it should store

Reference specification: `reference/schema-spec.md`.

Give your specification to the agent:

> "Implement this schema specification as a PostgreSQL migration. Every
> constraint must be enforced at the database level. Use CHECK constraints,
> ENUM types, triggers, or exclusion constraints as appropriate."

Apply and verify again. Compare the results.

### Checkpoint

- [ ] How many verification checks pass now vs. Part 1?
- [ ] What constraints did the specification add?
- [ ] Did the agent need follow-up prompts?

## The Principle

An agent given a domain description will produce a schema optimized for
**structure** -- tables, columns, foreign keys, indexes. It will satisfy
normal forms. It will look correct. But a schema is not just a container for
data. It is the last line of defense against invalid data states.

The domain document described what the system *does*. The specification
described what the data *must never be*. That shift -- from describing
behavior to constraining state -- is the difference between a schema that
stores data and a schema that protects data.

The constraints the agent missed in Part 1:

- **Product price must be positive** (not just non-null)
- **Order status transitions must follow the lifecycle** (no jumping from
  "pending" to "delivered")
- **Reviews must be 1-5** (not 0-5, not 1-10)
- **A review requires a completed order** (no reviewing undelivered products)
- **Seller rating is computed** (not directly settable)
- **Inventory can't go negative**
- **A seller can't review their own product**
- **Email uniqueness is case-insensitive**

Every constraint you omit from the schema is a constraint that must be
enforced in application code -- by every application, every API, every import
script, every migration, forever.

> **A schema that satisfies normal forms but ignores domain constraints is a schema that will corrupt data.**

## Reflection

Record in your interaction log:

1. **Comparison**: List the specific constraints Part 2 enforced that Part 1
   did not. How many could cause real data corruption in production?
2. **Process**: How long did writing the specification take? How did it
   change the agent's output quality?
3. **Transfer**: Where else do you describe *what the system does* when you
   should specify *what the data must never be*? Pipeline validation? ETL
   contracts? API schemas?
4. **Going forward**: For your next schema design, what sections will your
   specification document include?

## Going Further

- Apply this to an existing schema in your codebase. Write a
  `verify-schema.sql` for it. How many domain constraints are enforced only
  in application code?
- Write a specification for your most complex domain entity. Have the agent
  generate the schema. Diff it against production.
- Extend the marketplace with a `coupons` system. Write the spec first.
  Count how many constraints you identify that you wouldn't have mentioned
  in a casual description.
- Try the same specification with a different agent. Does constraint
  coverage remain consistent?
