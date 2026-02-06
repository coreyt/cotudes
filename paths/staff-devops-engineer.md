# Path: Staff DevOps / CI/CD Engineer

## Profile

**Experience**: 8+ years in infrastructure, deployment, and operational systems.
Responsible for the pipelines that all code -- including agent-generated code --
flows through.

**Daily Work**: CI/CD pipeline design and maintenance, infrastructure as code
(Terraform, Pulumi, CloudFormation), container orchestration, deployment
automation, observability (monitoring, alerting, logging), incident response,
cloud cost management, security hardening.

**Unique Challenge**: Infrastructure mistakes can be catastrophic and difficult
to reverse. A misconfigured security group, an overly broad IAM role, or a
migration that corrupts production data cannot be easily rolled back. Agent-
generated IaC requires the highest level of review discipline. Additionally,
the DevOps engineer builds the feedback loops that make agents effective for
everyone else on the team.

**Anti-goal**: A DevOps engineer who either refuses to use agents for
infrastructure ("too dangerous") or who trusts agent-generated Terraform without
thorough security review. Also: building CI/CD that doesn't provide actionable
feedback to agents.

## Primary Competencies

1. **Feedback Loop Design** -- Building CI/CD that serves both humans and agents
2. **Output Evaluation** -- Security-focused review of agent-generated IaC
3. **Context Engineering** -- Providing infrastructure context to agents
4. **Architecture for Agents** -- Platform engineering for agent-augmented teams

## Etude Sequence

### Foundation (DOE-001 to DOE-003)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| DOE-001 | The CI Feedback Loop | Feedback Loop Design | CI that reports pass/fail without actionable detail (4) | GitHub Actions / YAML |
| DOE-002 | IaC with Agents | Output Evaluation | Agent Terraform with security misconfigs (4) | Terraform |
| DOE-003 | Pipeline as Agent Guardrail | Feedback Loop Design | CI stages that catch agent mistakes (3) | GitHub Actions |

**DOE-001**: A CI pipeline that reports "build failed" or "tests passed" with
no structured output. An agent iterating against this pipeline makes blind
guesses about what's wrong. The contrast: CI that provides structured, parseable
error output, lint results, and specific failure locations that agents can act
on directly. **Axiom: CI output designed for humans to read is CI output agents
can't use -- design for both audiences.**

**DOE-002**: The learner asks an agent to write Terraform for a new service.
The agent produces working Terraform that applies cleanly -- but with overly
permissive security groups, wildcard IAM policies, and public S3 buckets. The
trap is running `terraform plan` and seeing "3 to add, 0 to change, 0 to
destroy" and assuming it's correct. The contrast: security-focused review
checklist + automated policy scanning (OPA, Checkov, tfsec). **Axiom: `terraform
plan` tells you what will change, not whether it should change -- agent-generated
IaC requires security review, not just syntax validation.**

**DOE-003**: Designing CI pipeline stages specifically to catch categories of
agent mistakes: dependency verification (are all packages real?), security
scanning, integration tests, and deployment canary checks. **Axiom: Every
category of agent mistake you've seen is a CI stage you should build.**

### Fluency (DOE-004 to DOE-007)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| DOE-004 | The Dockerfile | Context Engineering | Agent building images without constraint context (3) | Docker |
| DOE-005 | Security Scanning | Output Evaluation | Hallucinated dependencies and supply-chain risk (4) | Any |
| DOE-006 | The Deployment Strategy | Task Decomposition | Agent-assisted rollout with incremental verification (2) | Kubernetes / IaC |
| DOE-007 | Monitoring and Alerting | Feedback Loop Design | Agent monitoring that misses critical signals (3) | Prometheus / Grafana |

**DOE-005**: The agent suggests npm packages or Python libraries that don't
exist (hallucinated packages). Up to 30% of agent-suggested packages are
hallucinated, creating supply-chain attack vectors. The contrast: automated
dependency verification in CI. **Axiom: Verify every dependency the agent
suggests exists before it enters your supply chain.**

### Application (DOE-008 to DOE-010)

| # | Title | Competency | Trap (Severity) | Stack |
|---|-------|-----------|------------------|-------|
| DOE-008 | The Incident Response | Recovery Patterns | Using agents during incidents -- speed vs. risk (3) | Any |
| DOE-009 | Platform Engineering | Architecture for Agents | Internal platforms agents can operate (2) | Any |
| DOE-010 | Cost and Resource Management | Delegation Judgment | Agent-provisioned resources without cost awareness (3) | Cloud / IaC |

### Capstone (DOE-011)

| # | Title | Competency | Stack |
|---|-------|-----------|-------|
| DOE-011 | Pipeline Overhaul | All | CI/CD + IaC |

End-to-end CI/CD redesign for an agent-augmented team: structured output for
agent consumption, security scanning stages, dependency verification, deployment
canaries, and cost guardrails. The pipeline must serve both human developers and
AI agents effectively.

## Prerequisites

```
DOE-000 (Setup)
    └── DOE-001 (Feedback Loop Design)
    └── DOE-002 (Output Evaluation)
    └── DOE-003 (Feedback Loop Design)
            └── DOE-004 through DOE-007 (Fluency)
                    └── DOE-008 through DOE-010 (Application)
                            └── DOE-011 (Capstone)
```

## Recommended Cross-Training

Complete STE-009 (The Feedback Machine) from the Staff SE path -- it approaches
CI design from the application developer's perspective.
