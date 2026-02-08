# PSA-002: The Specification as Contract

> **Axiom**: The best specification is a contract that constrains interpretation, not a narrative that invites it.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Principal Software Architect |
| **Number** | PSA-002 |
| **Primary Competency** | Specification Writing |
| **Secondary Competency** | Context Engineering |
| **Trap Severity** | 2 (Foundation) |
| **Prerequisites** | PSA-001 |
| **Duration** | 2-3 sessions |
| **Stack** | Markdown + Code |

## Overview

You will write an RFC for a rate-limiting feature, first in the way you
normally write RFCs -- well-reasoned prose aimed at an architecture review
board. An agent implementing it will misinterpret ambiguities that any
experienced engineer on your team would resolve through context. Then you will
restructure the same RFC as a formal contract and watch the agent deliver
exactly what you specified.

## Why Your Coding Agent Cares

Agents are literal interpreters. When your RFC says "the system should handle
bursts gracefully," an agent must choose a specific behavior: drop requests?
queue them? increase the limit temporarily? A human reader on your team knows
you mean "use a token bucket with burst capacity equal to 2x the sustained
rate" because they were in the meeting where you discussed it. The agent was
not in that meeting.

The problem compounds with architectural prose. Phrases like "leverage the
existing middleware stack," "follow our standard error handling patterns," and
"integrate with the metrics pipeline" each contain three or four unstated
decisions. An experienced engineer resolves them through pattern-matching
against your codebase and organizational context. An agent resolves them by
making plausible guesses -- and plausible guesses produce plausible bugs.

The failure mode is not obvious wrongness. The agent will produce clean,
well-structured code that implements a coherent interpretation of your RFC. It
will pass the tests it writes for itself. In review, you will notice that it
chose sliding window instead of token bucket, logs errors instead of returning
429s, and counts by IP instead of by API key. Each choice is defensible. None
of them is what you meant.

Formal contracts eliminate this class of error. When the RFC specifies the
interface signature, the constraint boundaries, the error codes, and the
concrete examples of expected input/output behavior, ambiguity has nowhere to
hide. The agent becomes an implementer of a spec rather than an interpreter of
intent. This is not a concession to agent limitations -- it is better
specification writing, period. Your human reviewers benefit equally.

## The Setup

The `starter/` directory contains **gateway**, a Go HTTP API gateway with
authentication, routing, and request logging. The system currently has no
rate limiting.

```bash
cd starter/
go build ./...
go test -race -count=1 ./...
```

The codebase includes:

- `internal/middleware/` -- middleware chain (auth, logging, CORS)
- `internal/router/` -- route registration and dispatch
- `internal/store/` -- Redis-backed session and state storage
- `internal/metrics/` -- Prometheus metric emission
- `cmd/gateway/main.go` -- service entrypoint

You also have an RFC document at `docs/rfc-rate-limiting.md`. This is the
prose-style RFC you will use in Part 1.

**Your assignment**: Implement rate limiting for the gateway based on the RFC.

## Part 1: The Natural Approach

Read the RFC at `docs/rfc-rate-limiting.md`. It describes the rate-limiting
feature the way a senior architect typically writes for an architecture review:

> **RFC-0042: Rate Limiting for API Gateway**
>
> We need to add rate limiting to the gateway to protect downstream services
> from abuse and ensure fair usage across tenants. The rate limiter should
> integrate with our existing middleware stack and use Redis for distributed
> state.
>
> Limits should be configurable per tenant and per endpoint. When a client
> exceeds their limit, the system should return an appropriate error response
> with retry information. The system should handle bursts gracefully and
> degrade well under Redis failures.
>
> Rate limit headers should follow industry conventions. Metrics should be
> emitted for rate limit events to feed our existing alerting pipeline.
> The implementation should be efficient enough to add negligible latency
> to the request path.

Start a new agent session. Provide the RFC and the codebase. Ask the agent to
implement rate limiting according to the RFC.

Let the agent work. Review the result.

### Checkpoint

Evaluate the agent's implementation against these questions:

- [ ] What algorithm did the agent choose? (Sliding window? Token bucket?
  Fixed window? Leaky bucket?)
- [ ] How does it identify clients? (IP? API key? Tenant ID? Some combination?)
- [ ] What HTTP status code does it return? What headers?
- [ ] What happens during a Redis outage -- fail open or fail closed?
- [ ] How are per-tenant and per-endpoint limits structured in configuration?
- [ ] What metrics are emitted? What label cardinality?
- [ ] Where in the middleware chain is it placed?

Count the decisions the agent made that diverge from what you intended. Every
divergence traces back to an ambiguity in the RFC.

## Part 2: The Effective Approach

Reset the codebase. Replace the prose RFC with a contract-style specification
at `docs/rfc-rate-limiting.md`:

```markdown
# RFC-0042: Rate Limiting for API Gateway

## Interface Contract

### Middleware Signature

```go
func NewRateLimiter(cfg RateLimitConfig, store redis.Client) middleware.Middleware
```

The rate limiter MUST be inserted in the middleware chain AFTER authentication
(so tenant ID is available) and BEFORE routing.

### Algorithm

Token bucket. Each (tenant_id, endpoint) pair gets an independent bucket.

- `rate`: sustained requests per second (configurable, default: 100)
- `burst`: maximum burst size (configurable, default: 200)
- Refill: continuous (not per-interval)

### Client Identification

Rate limit key: `ratelimit:{tenant_id}:{endpoint_pattern}`

- `tenant_id`: extracted from the authenticated request context
  (`ctx.Value("tenant_id")`)
- `endpoint_pattern`: the registered route pattern, not the concrete path
  (e.g., `/api/v1/users/:id`, not `/api/v1/users/abc123`)

### Response on Limit Exceeded

HTTP 429 Too Many Requests.

```json
{
  "error": "rate_limit_exceeded",
  "retry_after_seconds": 2.5
}
```

### Response Headers (all responses)

| Header | Value | Example |
|--------|-------|---------|
| `X-RateLimit-Limit` | Bucket capacity (burst) | `200` |
| `X-RateLimit-Remaining` | Tokens remaining | `147` |
| `X-RateLimit-Reset` | Unix timestamp when bucket is full | `1700000000` |
| `Retry-After` | Seconds until a request would succeed (429 only) | `3` |

### Redis Failure Behavior

Fail OPEN. If Redis is unreachable, allow the request and emit a
`ratelimit_redis_error_total` counter metric. Log at WARN, not ERROR.

### Configuration

```yaml
rate_limits:
  default:
    rate: 100
    burst: 200
  tenants:
    tenant-abc:
      rate: 500
      burst: 1000
      endpoints:
        "/api/v1/reports": { rate: 10, burst: 20 }
```

### Metrics

| Metric | Type | Labels |
|--------|------|--------|
| `ratelimit_requests_total` | counter | `tenant_id`, `endpoint`, `decision={allowed,denied}` |
| `ratelimit_redis_error_total` | counter | -- |
| `ratelimit_latency_seconds` | histogram | -- |

Do NOT add `path` as a label (unbounded cardinality). Use `endpoint`
(the route pattern).

### Example Behavior

Request sequence for tenant "acme", endpoint `/api/v1/users/:id`,
config `rate=2, burst=5`:

| Time (s) | Request # | Tokens Before | Decision | Tokens After |
|-----------|-----------|---------------|----------|--------------|
| 0.0 | 1 | 5 | allowed | 4 |
| 0.0 | 2 | 4 | allowed | 3 |
| 0.0 | 3 | 3 | allowed | 2 |
| 0.0 | 4 | 2 | allowed | 1 |
| 0.0 | 5 | 1 | allowed | 0 |
| 0.0 | 6 | 0 | denied | 0 |
| 0.5 | 7 | 1 | allowed | 0 |
| 1.0 | 8 | 2 | allowed | 1 |
```

Start a new agent session with the restructured RFC and the same codebase.
Give the same high-level instruction: "Implement rate limiting according to
the RFC."

### Checkpoint

Evaluate the implementation against the same questions from Part 1:

- [ ] Algorithm: token bucket? (Specified explicitly.)
- [ ] Client identification: tenant_id + endpoint_pattern? (Specified.)
- [ ] HTTP 429 with the exact JSON body and headers? (Specified.)
- [ ] Redis failure: fail open with WARN log and counter metric? (Specified.)
- [ ] Configuration structure matches the YAML example? (Specified.)
- [ ] Metrics match the table, with no unbounded cardinality? (Specified.)
- [ ] Middleware position: after auth, before routing? (Specified.)

Count the divergences. Compare to Part 1.

## The Principle

You have been writing RFCs and ADRs for years. Your prose is tight,
your reasoning is sound, and your architecture review board trusts your
judgment. The problem is not the quality of your thinking -- it is the
format of its expression.

Prose-based RFCs are optimized for persuasion: they explain *why* a
design is correct to a human audience that shares your organizational
context. Contract-based specifications are optimized for implementation:
they define *what* must be built in terms that leave no room for
interpretation.

The gap between "any good engineer would know what I mean" and "the
specification uniquely determines the implementation" is where agent bugs
live. It is also where human bugs live -- you just catch them in code
review because the reviewer shares your context. When the implementer is
an agent, there is no shared context. There is only the document.

This is not about dumbing down your writing. Contracts are harder to write
than prose. Every ambiguity you eliminate is a decision you must actually
make, rather than deferring to the implementer's judgment. That is the
point. Architecture is the art of making decisions explicit.

> **The best specification is a contract that constrains interpretation, not a narrative that invites it.**

## Reflection

Record in your interaction log:

1. **Ambiguity count**: How many decisions did the agent make differently in
   Part 1 vs. Part 2? List each ambiguity the prose RFC left open.
2. **Specification effort**: How much longer did the contract-style RFC take
   to write? Was the effort front-loaded (writing the spec) or back-loaded
   (fixing the implementation)?
3. **Decision forcing**: Which decisions did writing the contract force you
   to make that you had been unconsciously deferring?
4. **Human benefit**: Would the contract-style RFC have improved a human
   implementer's output? In what ways?
5. **Spec maintenance**: How would you keep contract-style specifications
   from drifting as the implementation evolves?

## Going Further

- Take a real RFC or ADR from your organization. Identify every ambiguity
  an agent would need to resolve. Rewrite the ambiguous sections as formal
  contracts. Measure: how many of those ambiguities had different engineers
  on your team interpreting them differently?
- Write a contract-style specification for a feature, then have an agent
  implement it without any additional guidance. Track how many clarifying
  questions the agent asks vs. how many assumptions it makes silently.
- Build a specification template for your organization that includes
  mandatory sections: interface signatures, error behavior, configuration
  schema, concrete examples, and metric definitions. Pilot it with your
  team for one quarter.
