# Path: Staff Data Management Engineer

## Profile

**Experience**: 8+ years in data engineering, database administration, or data
platform work. Responsible for schemas, pipelines, data quality, and governance.

**Daily Work**: Schema design and migration, ETL/ELT pipeline development, data
quality validation, query optimization, data catalog maintenance, data governance
and compliance (PII handling, retention policies), CDC implementation, data
warehouse/lakehouse management.

**Unique Challenge**: Data correctness is harder to verify than code correctness.
A function that compiles and passes tests might still silently corrupt data. SQL
that returns results might return *wrong* results. A migration that runs
successfully might lose data. Agent-generated data code requires domain-specific
review that goes beyond syntax checking and unit tests.

**Anti-goal**: A data engineer who trusts agent-generated SQL because "it
returned rows" or agent-generated migrations because "they applied without
errors." Also: one who refuses to use agents for data work because "the risk
is too high," missing significant productivity gains on well-scoped tasks.

## Primary Competencies

1. **Output Evaluation** -- Data-specific review (correctness, not just syntax)
2. **Specification Writing** -- Precise data contracts and pipeline specs
3. **Feedback Loop Design** -- Data quality gates and validation checkpoints
4. **Context Engineering** -- Providing schema and lineage context to agents

## Etude Sequence

### Foundation (DME-001 to DME-003)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| DME-001 | The Schema Design | Specification Writing | Agent schema missing domain constraints (4) | SQL / PostgreSQL |
| DME-002 | Migration Safety | Output Evaluation | Agent migration that loses data silently (5) | SQL / Migration tool |
| DME-003 | The Query Review | Output Evaluation | Agent SQL returning results but subtly wrong (4) | SQL |

**DME-001**: The learner asks an agent to design a schema for a business domain.
The agent produces a normalized, syntactically correct schema -- but misses
domain constraints: a `status` field that should be an enum, a `price` field
that allows negative values, a missing uniqueness constraint on a natural key,
no `NOT NULL` on a required field. The trap is reviewing for structure rather
than domain semantics. The contrast: a specification that includes domain
constraints, valid value ranges, and business rules before the agent designs
the schema. **Axiom: A schema that satisfies normal forms but ignores domain
constraints is a schema that will corrupt data.**

**DME-002**: A database migration to add a column and backfill data. The agent
writes a migration that runs without error -- but the backfill logic has a subtle
WHERE clause that excludes 2% of rows. Data is silently lost. The trap is
verifying that the migration applies cleanly without verifying the data
transformation is correct. The contrast: writing data assertions (row counts,
value distributions, before/after comparisons) as part of the migration.
**Axiom: A migration that applies without error is not a migration that's
correct -- verify the data, not just the DDL.**

**DME-003**: A complex analytical query. The agent writes SQL that returns a
reasonable-looking result set. But it has a subtle join condition that produces
a partial cross-product for one category, inflating numbers by 15%. The trap is
checking that the query runs and returns "reasonable" numbers. The contrast:
verifying against known test data with predetermined expected results. **Axiom:
SQL that returns results and SQL that returns correct results are different
things -- test data with known answers is your safety net.**

### Fluency (DME-004 to DME-007)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| DME-004 | Pipeline Specification | Specification Writing | Vague ETL requirements → fragile pipelines (3) | Python / dbt |
| DME-005 | Data Quality Gates | Feedback Loop Design | Pipelines without validation checkpoints (3) | Python / Great Expectations |
| DME-006 | The Context Problem | Context Engineering | Agent unaware of data lineage and dependencies (3) | SQL / dbt |
| DME-007 | Idempotency and Recovery | Recovery Patterns | Agent pipelines that can't safely re-run (4) | Python / SQL |

**DME-004**: The learner describes an ETL pipeline in informal terms ("load
customer data from the API, clean it up, put it in the warehouse"). The agent
builds a pipeline that works for the current data shape but breaks on nulls,
encoding changes, API pagination, and rate limits. The contrast: a structured
pipeline spec covering source schema, expected data volumes, error handling
strategy, idempotency requirements, and SLA. **Axiom: "Clean it up" is not a
specification -- every transformation must have defined input, output, and
failure behavior.**

**DME-007**: An agent-built pipeline processes data successfully on first run.
A failure occurs mid-pipeline on the second run. Restarting the pipeline
duplicates data because it lacks idempotency guarantees. **Axiom: An agent
builds for the happy path unless you specify the unhappy paths -- data pipelines
must handle failure recovery by design.**

### Application (DME-008 to DME-010)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| DME-008 | Performance at Scale | Output Evaluation | Agent queries that work on dev, fail at prod scale (3) | SQL |
| DME-009 | The Access Pattern | Architecture for Agents | Data APIs agents can reason about (2) | SQL / API |
| DME-010 | Data Governance | Specification Writing | Agent output respecting PII and retention policies (3) | SQL / Policy |

**DME-008**: Agent-written SQL performs well against a dev database with 10K
rows. In production with 10M rows, the same query takes 45 minutes because it
triggers a sequential scan instead of using an index. The trap is accepting
performance based on dev testing. The contrast: EXPLAIN ANALYZE on realistic
data volumes, with index analysis as part of agent output review. **Axiom:
Query performance is a property of data volume, not query syntax -- test at
scale or specify scale constraints.**

### Capstone (DME-011)

| # | Title | Competency | Stack |
|---|-------|-----------|-------|
| DME-011 | Data Platform | All | SQL + Python + dbt |

End-to-end data platform feature: schema design from specification, migration
with data assertions, ETL pipeline with quality gates, analytical queries with
verified correctness, and documentation of data lineage. Requires agent
collaboration at every stage with appropriate review discipline for each.

## Prerequisites

```
DME-000 (Setup)
    └── DME-001 (Specification Writing)
    └── DME-002 (Output Evaluation)
    └── DME-003 (Output Evaluation)
            └── DME-004 through DME-007 (Fluency)
                    └── DME-008 through DME-010 (Application)
                            └── DME-011 (Capstone)
```

## Recommended Cross-Training

Complete ASE-003 (The Test First) from the Associate path -- the principle of
testing before implementation is foundational for data work, where "tests" means
data assertions and known-answer verification.
