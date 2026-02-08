# DOE-011: Pipeline Overhaul

> **Axiom**: A pipeline for an agent-augmented team is not a pipeline with extra stages -- it is the encoded contract between every contributor (human or machine) and production.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff DevOps / CI/CD Engineer |
| **Number** | DOE-011 |
| **Primary Competency** | All |
| **Trap Severity** | N/A (Capstone) |
| **Prerequisites** | DOE-001 through DOE-010 |
| **Duration** | 5-8 sessions |
| **Stack** | CI/CD + IaC (GitHub Actions, Terraform) |

## Overview

You will redesign an entire CI/CD pipeline from scratch for a team where both human developers and AI agents commit code, provision infrastructure, and deploy services. The pipeline must produce structured output agents can parse (DOE-001), enforce security policy on agent-generated IaC (DOE-002), catch known categories of agent mistakes via dedicated stages (DOE-003), validate container builds against production constraints (DOE-004), verify every dependency before installation (DOE-005), execute incremental deployment with canary verification (DOE-006), feed monitoring signals back into the pipeline (DOE-007), support safe agent-assisted incident response (DOE-008), expose platform primitives agents can operate autonomously (DOE-009), and enforce cost guardrails on provisioned resources (DOE-010).

This is not ten separate features bolted onto a YAML file. It is one coherent system where each capability reinforces the others.

## The Scenario

**NovaTech** is a mid-stage startup running 14 microservices on AWS. Their current CI/CD is a collection of GitHub Actions workflows that evolved organically over two years:

- A monolithic `ci.yml` per service: checkout, install, build, test, deploy. Each workflow is 200-400 lines of copy-pasted YAML with service-specific drift.
- Terraform lives in a separate `infra/` repo with a single `terraform apply` step gated by manual approval. No automated policy scanning. No plan output parsing.
- Deployment is all-or-nothing: push to main triggers a deploy to production. No canaries, no progressive rollout, no automated rollback.
- Container images are built with whatever Dockerfile the developer wrote. No base image policy, no size budget, no scanning gate.
- Monitoring exists (Prometheus + Grafana) but is disconnected from the pipeline. Deployments that degrade latency by 40% are discovered hours later by on-call.
- Dependency management is `npm install` / `pip install` with no verification step. Two supply-chain incidents in the last year (one typosquat, one malicious post-install script).
- Cost visibility is a monthly AWS bill reviewed by engineering leadership. No resource-level attribution, no provisioning guardrails.

The team has started using AI agents for development. Three engineers use Claude Code daily. Two use Cursor. Agent-generated PRs account for roughly 30% of merged code. Agent-generated Terraform has already caused one incident: an agent created a public S3 bucket that was discovered during a quarterly security audit, not by CI.

The CTO has asked you to redesign the pipeline. The requirements:

1. **One pipeline framework** that all services use (no more copy-paste YAML)
2. **Agent-friendly output** at every stage so agents can self-correct without human intervention
3. **Security gates** that catch agent-generated misconfigurations before they reach production
4. **Supply-chain verification** that eliminates hallucinated and malicious dependencies
5. **Progressive deployment** with automated canary analysis and rollback
6. **Cost guardrails** that prevent any single PR from increasing monthly spend by more than a configurable threshold
7. **Monitoring integration** that feeds production health signals back into deployment decisions

You have the existing workflows, the Terraform repo, and access to the AWS environment. You have 5-8 sessions.

### The Existing State (Starter Materials)

The `starter/` directory contains:

```
starter/
  services/
    order-api/          # Node.js/TypeScript service
      .github/workflows/ci.yml
      Dockerfile
      package.json
      src/
      test/
    user-service/       # Python/FastAPI service
      .github/workflows/ci.yml
      Dockerfile
      requirements.txt
      src/
      test/
    payment-gateway/    # Go service
      .github/workflows/ci.yml
      Dockerfile
      go.mod
      cmd/
      internal/
  infra/
    terraform/
      modules/
        ecs-service/    # Shared ECS module (overly permissive)
        networking/     # VPC, subnets, security groups
        storage/        # S3, RDS
      environments/
        staging/
        production/
      main.tf
      variables.tf
  scripts/
    deploy.sh           # The current deployment script (bash, no rollback)
  monitoring/
    dashboards/         # Grafana JSON exports
    alerts/             # Prometheus alert rules
```

Every piece of this starter is intentionally flawed in ways that DOE-001 through DOE-010 taught you to recognize. The CI workflows produce unstructured output. The Terraform has wildcard IAM policies. The Dockerfiles run as root. The dependency lists include hallucinated packages. The deployment script has no health checking. The monitoring is disconnected from CI/CD. There are no cost controls.

## Deliverables

### D1: Reusable Workflow Library

A set of composite GitHub Actions workflows that any service can call. Minimum:

- `ci-build.yml` -- Build and compile with structured error output (annotations, JSON summary)
- `ci-test.yml` -- Test with machine-readable results (JUnit XML or JSON), coverage reporting
- `ci-security.yml` -- Dependency verification, vulnerability scanning, secret detection, SAST
- `ci-docker.yml` -- Container build with base image policy enforcement, size budget, scanning
- `cd-deploy.yml` -- Progressive deployment with canary, health verification, automated rollback
- `cd-infra.yml` -- Terraform plan/apply with policy scanning (Checkov/tfsec/OPA), cost estimation

Each workflow must produce structured output consumable by both humans (summary annotations, PR comments) and agents (JSON artifacts, parseable error formats).

### D2: Terraform Pipeline

A redesigned infrastructure pipeline that:

- Runs `terraform plan` and parses the output into structured change summaries
- Executes policy scanning (Checkov, tfsec, or OPA) and fails on high-severity findings
- Estimates cost impact of infrastructure changes (Infracost or equivalent) and blocks changes exceeding the threshold
- Generates a human-readable and agent-readable plan summary as a PR comment
- Requires explicit approval for destructive changes (resource deletion, security group modification)
- Produces audit-quality logs of what changed, who approved, and what policy checks passed

### D3: Deployment Pipeline

A progressive deployment system that:

- Deploys canary instances (weighted routing or separate target group)
- Runs smoke tests against the canary
- Monitors canary health metrics (error rate, latency p99, CPU/memory) for a configurable bake period
- Automatically promotes or rolls back based on metric thresholds
- Produces structured deployment events that feed back into monitoring dashboards
- Supports both human-triggered and agent-triggered deployments with the same safety guarantees

### D4: Cost Guardrails

An automated cost control layer that:

- Estimates the cost impact of Terraform changes before apply
- Estimates the cost impact of new or resized ECS services
- Enforces per-PR cost thresholds (configurable per service and per environment)
- Produces a cost report as a PR comment and a JSON artifact
- Alerts when cumulative weekly spend exceeds budget with attribution to specific changes

### D5: Pipeline Context Documents

Context files that enable agents to operate the pipeline effectively:

- `CLAUDE.md` (or equivalent) for the pipeline repository itself, documenting how to add stages, modify workflows, and run locally
- `INFRA_REQUIREMENTS.md` encoding security policies for all Terraform
- `DOCKERFILE_SPEC.md` encoding container build standards
- `DEPLOYMENT_RUNBOOK.md` encoding deployment procedures, rollback criteria, and incident escalation
- Service-level context files that reference the shared pipeline documentation

### D6: Integration Test Suite

End-to-end tests that verify the pipeline itself:

- A test that submits a PR with a hallucinated dependency and confirms the pipeline rejects it
- A test that submits Terraform with a public S3 bucket and confirms policy scanning catches it
- A test that deploys a canary that returns 500s and confirms automated rollback triggers
- A test that submits a change exceeding the cost threshold and confirms the cost gate blocks it
- A test that verifies structured output format for each stage (parseable by an agent)

## Constraints

These constraints force you to exercise every competency from the path. They are not optional.

### C1: Agent-Authored First Draft

Use an agent to generate the first draft of every workflow, script, and Terraform module. Do not write the initial version yourself. This forces you to practice output evaluation (DOE-002) and context engineering (DOE-004) at scale -- you must provide enough context for the agent to get close, then systematically review and harden the output.

### C2: Structured Output Everywhere

Every pipeline stage must produce output in a format an agent can parse without heuristics. If a stage fails, its output must contain enough structured information for an agent to diagnose and fix the issue in a single pass. Test this by feeding failure output to an agent and measuring fix iterations. Target: one iteration for any single-stage failure. This exercises DOE-001 and DOE-003.

### C3: Security Gate with Zero High-Severity Bypass

No PR may merge with a high or critical severity finding from any security stage. No manual override. The pipeline enforces this unconditionally. The only way to "bypass" a security finding is to fix it or explicitly add it to a documented exception list with a justification and an expiration date. This exercises DOE-002 and DOE-005.

### C4: Cost Estimation on Every Infrastructure Change

Every Terraform change must include a cost estimate. Changes that increase monthly spend by more than $50 (configurable) require explicit approval with a cost justification. This exercises DOE-010.

### C5: Canary Deployment with Automated Rollback

At least one service must deploy via canary with automated rollback based on production metrics. The canary must run for a minimum bake period, and rollback must trigger without human intervention when metrics breach thresholds. This exercises DOE-006 and DOE-007.

### C6: Pipeline Self-Documentation

The pipeline repository must contain context documents sufficient for an agent to modify the pipeline itself. Test: start a new agent session, point it at the pipeline repo, and ask it to add a new CI stage. If the agent cannot do this without asking clarifying questions about pipeline structure, the documentation is insufficient. This exercises DOE-004 and DOE-009.

### C7: Incident Response Integration

The deployment pipeline must support "incident mode" -- a fast-path deployment with reduced (but not eliminated) gates for hotfixes. Document which gates are relaxed and which are never relaxed (security scanning stays; cost estimation is skipped). This exercises DOE-008.

## Evaluation Criteria

### Architecture (30%)

| Criterion | Exceeds | Meets | Below |
|-----------|---------|-------|-------|
| Workflow reusability | Composite workflows with parameterized inputs; adding a new service requires <20 lines of YAML | Shared workflows exist; some service-specific customization needed | Copy-pasted workflows with per-service divergence |
| Stage independence | Stages run in parallel where possible; failures in one stage do not block unrelated stages | Most stages are independent; some unnecessary sequential dependencies | Monolithic pipeline where everything runs sequentially |
| Terraform pipeline | Plan, policy scan, cost estimate, and apply as separate gated stages with structured output at each | Plan and apply separated; policy scanning present but output not fully structured | Single `terraform apply` step or policy scanning missing |
| Deployment progressiveness | Canary with metric-based promotion, configurable bake time, automated rollback | Canary exists; rollback is automated but metric thresholds are hardcoded | All-or-nothing deployment or manual rollback only |

### Feedback Quality (25%)

| Criterion | Exceeds | Meets | Below |
|-----------|---------|-------|-------|
| Error output structure | Every stage emits JSON artifacts + GitHub annotations; agent fixes issues in 1 iteration consistently | Most stages produce structured output; agent needs 1-2 iterations | Stages produce human-readable logs only; agent needs 3+ iterations |
| PR comments | Automated PR comments with security findings, cost estimates, test results, and deployment status in structured format | PR comments exist for major stages | No automated PR comments or comments are unstructured prose |
| Monitoring feedback | Production metrics feed back into deployment decisions automatically | Monitoring dashboards exist; manual verification during deploys | Monitoring is disconnected from CI/CD |

### Security (25%)

| Criterion | Exceeds | Meets | Below |
|-----------|---------|-------|-------|
| Dependency verification | Registry existence check + age/download heuristics + vulnerability scan + SBOM generation | Registry existence check + vulnerability scan | `npm audit` only or no verification |
| IaC policy scanning | OPA/Checkov/tfsec with custom org policies; zero high-severity findings allowed; exception process documented | Standard policy scanner with default rules; high-severity blocks merge | No automated policy scanning |
| Secret detection | Pre-commit hook + CI stage + entropy-based and pattern-based scanning | CI-stage secret detection with standard tooling | No automated secret detection |
| Container security | Base image policy + non-root enforcement + size budget + vulnerability scanning | Some container scanning; non-root enforced | No container security gates |

### Operational Maturity (20%)

| Criterion | Exceeds | Meets | Below |
|-----------|---------|-------|-------|
| Cost controls | Per-PR cost estimation + budget thresholds + weekly spend attribution + alerting | Cost estimation present; manual review of estimates | No cost visibility in pipeline |
| Incident fast-path | Documented incident mode with reduced-but-safe gate set; tested with a simulated incident | Incident mode exists but not tested end-to-end | No differentiated incident deployment path |
| Pipeline self-service | Agent can add a new CI stage or onboard a new service by reading context docs alone | Context docs exist; agent needs minor clarification | No pipeline documentation or docs are stale/incomplete |
| Rollback capability | Automated metric-based rollback + manual rollback command + rollback audit log | Automated rollback on canary failure | No automated rollback |

## Reflection

This is the final reflection for the DOE path. These questions look back across all ten preceding etudes and this capstone.

Record in your interaction log:

1. **Feedback loop inventory**: Map every pipeline stage you built to the DOE etude that taught the underlying principle. Which etude's lesson was most critical to the final design? Which was hardest to implement in practice?

2. **Agent output evaluation at scale**: In DOE-002 you evaluated a single Terraform module. In this capstone you evaluated agent output across workflows, scripts, IaC, Dockerfiles, and deployment logic. How did your review process change at scale? What did you miss that the pipeline caught? What did you catch that the pipeline missed?

3. **Context engineering ROI**: You wrote multiple context documents (CLAUDE.md, INFRA_REQUIREMENTS.md, DOCKERFILE_SPEC.md, DEPLOYMENT_RUNBOOK.md). For each, estimate the time investment to write it vs. the time saved across all subsequent agent interactions. Which had the highest return?

4. **The constraint that mattered most**: Which of the seven constraints (C1-C7) forced the most significant design improvement? Which felt like overhead that did not pull its weight?

5. **Dual-audience design**: The pipeline serves humans and agents. Where did these audiences' needs conflict? Where did optimizing for one audience unexpectedly benefit the other?

6. **Security posture change**: Compare NovaTech's security posture before and after. List every class of vulnerability that is now caught automatically. List any classes that still require human review. Is the residual risk acceptable?

7. **Cost visibility**: Before this capstone, cost was a monthly surprise. After, cost is estimated per-PR and tracked per-change. How does this change the team's relationship to infrastructure spending? Would the cost guardrails have prevented past incidents?

8. **What you would do differently**: If you started this capstone over, what would you build first? What sequence would you follow? What would you skip or defer?

9. **The axiom test**: State the path's axiom in your own words. Then test it: describe a pipeline design decision you made during this capstone that would have been different without the axiom. If you cannot point to a concrete decision it influenced, the axiom has not landed -- revisit it.

10. **Readiness**: You now have a pipeline that encodes your operational knowledge, serves both humans and agents, and catches the failure modes you have studied across ten etudes. What is the first thing you will change about your actual CI/CD at work on Monday?
