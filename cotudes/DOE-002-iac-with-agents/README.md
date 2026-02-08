# DOE-002: IaC with Agents

> **Axiom**: `terraform plan` tells you what will change, not whether it should change -- agent-generated IaC requires security review, not just syntax validation.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff DevOps / CI/CD Engineer |
| **Number** | DOE-002 |
| **Primary Competency** | Output Evaluation |
| **Secondary Competency** | Context Engineering |
| **Trap Severity** | 4 (Common) |
| **Prerequisites** | DOE-000 (Environment Setup), DOE-001 |
| **Duration** | 2-3 sessions |
| **Stack** | Terraform |

## Overview

You will ask an agent to write Terraform for a new microservice deployment on
AWS. The agent will produce syntactically valid, `plan`-clean Terraform that
would expose your infrastructure to the internet. You will then apply
security-focused review techniques and automated policy scanning to catch what
`terraform plan` never will.

## Why Your Coding Agent Cares

Agents are excellent at producing Terraform that applies. They know the resource
schemas, they get the argument names right, and they produce configurations that
`terraform plan` accepts without complaint. This is precisely what makes them
dangerous for infrastructure work.

The agent optimizes for the feedback signal you give it. If you run
`terraform plan` and relay "0 errors," the agent concludes it succeeded. It has
no signal that `aws_security_group.service` allows ingress from `0.0.0.0/0`, or
that `aws_iam_role_policy.service` uses `"Action": "*"`, or that
`aws_s3_bucket.data` has no `block_public_access` configuration. These are not
errors in Terraform's type system. They are security misconfigurations that
`plan` is not designed to detect.

The pattern is consistent: agents default to the most permissive configuration
that works. An agent writing an IAM policy will use `*` for the resource ARN
because it doesn't know your account structure. It will open security groups
wide because restricting them requires context (VPC CIDR ranges, peer services)
that the agent doesn't have. It will skip S3 bucket policies because the
bucket "works" without them.

The fix is not to avoid agents for IaC. The fix is to give the agent security
constraints as input context, and to validate its output with tools designed
for security review -- OPA, Checkov, tfsec -- not just `terraform plan`.

## The Setup

The `starter/` directory contains a partial Terraform configuration for an AWS
environment:

- `main.tf` -- provider configuration and backend
- `variables.tf` -- input variables for the service (name, environment, region)
- `vpc.tf` -- an existing VPC with public and private subnets
- `outputs.tf` -- empty, awaiting service outputs

The scenario: you need to deploy a new internal API service. It requires:

- An ECS Fargate service running a container image
- An Application Load Balancer
- An S3 bucket for the service's data
- IAM roles for the ECS task
- Security groups for the ALB and the service
- CloudWatch log group

```bash
cd starter/
terraform init
terraform validate   # Should pass -- the existing config is valid
```

**Your assignment in two phases**:

1. Use an agent to write the Terraform for the new service
2. Review and harden the output using security scanning tools

## Part 1: The Natural Approach

Start your agent. Give it the task:

> "I need Terraform for a new internal API service called `order-processor`.
> It should run on ECS Fargate behind an ALB, with an S3 bucket for data
> storage. Use the existing VPC. Write the Terraform resources I need."

Let the agent produce the Terraform. When it's done, run:

```bash
terraform fmt
terraform validate
terraform plan
```

If `plan` succeeds, review the output. You will likely see something like:

```
Plan: 12 to add, 0 to change, 0 to destroy.
```

This looks correct. The agent produced working Terraform. Ship it?

### Checkpoint

Record in your interaction log:

- [ ] Did `terraform validate` pass?
- [ ] Did `terraform plan` complete without errors?
- [ ] Review the security group ingress rules. What CIDR ranges are allowed?
- [ ] Review the IAM role policy. What actions and resources are permitted?
- [ ] Review the S3 bucket. Is public access blocked? Is encryption enabled?
- [ ] Review the ALB. Is it internet-facing or internal?
- [ ] Review the ECS task definition. What capabilities does the container have?
- [ ] Count the number of security issues you can find manually.

## Part 2: The Effective Approach

Reset to the starter state. This time, take two actions before engaging the
agent.

**Step 1: Create a security context document.**

Write a file called `INFRA_REQUIREMENTS.md` that specifies your organization's
infrastructure policies:

```markdown
## Security Requirements for All Terraform

### IAM
- No wildcard (*) actions in IAM policies
- No wildcard (*) resource ARNs -- scope to specific resources
- Use least-privilege: only the actions the service actually needs
- All roles must have a permissions boundary attached

### Networking
- No security group rules with 0.0.0.0/0 ingress (except public ALBs on 443)
- Internal services use internal ALBs (scheme = "internal")
- Security groups must reference other security groups, not CIDR ranges,
  for service-to-service traffic
- All ALBs must use HTTPS (port 443) with TLS 1.2 minimum

### S3
- All buckets must have block_public_access enabled (all four settings)
- All buckets must have server-side encryption (AES-256 or KMS)
- All buckets must have versioning enabled
- Access logging must be configured

### ECS
- Task definitions must not run as root (use non-root user)
- Read-only root filesystem where possible
- No added Linux capabilities unless documented
- Log driver must be awslogs with a dedicated log group

### General
- All resources must have tags: Environment, Service, ManagedBy
- Use data sources to reference existing resources, not hardcoded ARNs
```

**Step 2: Set up automated policy scanning.**

Install at least one of these tools:

```bash
# Checkov (Python-based, broad coverage)
pip install checkov

# tfsec (Go-based, Terraform-specific)
brew install tfsec

# Or use OPA with Terraform (if you already have Rego policies)
```

**Step 3: Prompt the agent with context.**

Now start a fresh agent session. Include your security context:

> "Read INFRA_REQUIREMENTS.md. Then write Terraform for a new internal API
> service called `order-processor` on ECS Fargate behind an ALB, with an S3
> bucket for data storage. Use the existing VPC. Every resource must comply
> with the security requirements."

After the agent produces Terraform, run the automated scanner:

```bash
# Checkov
checkov -d . --framework terraform

# tfsec
tfsec .
```

Feed the scanner output back to the agent:

> "Here are the policy scan results. Fix all findings."

Iterate until the scanner passes clean.

### Checkpoint

- [ ] Did the agent produce least-privilege IAM policies on the first attempt?
- [ ] Are security groups scoped to specific sources (not `0.0.0.0/0`)?
- [ ] Is the S3 bucket encrypted, versioned, and access-blocked?
- [ ] Does `checkov` or `tfsec` pass with zero high-severity findings?
- [ ] Compare the IAM policy from Part 1 to Part 2 -- how many actions were
      removed?
- [ ] Compare the security group rules -- how many CIDR ranges were tightened?
- [ ] Is the ALB internal (not internet-facing)?

## The Principle

`terraform plan` is a change-detection tool, not a security tool. It answers
"what will Terraform do?" not "should Terraform do this?" When you use
`plan` as your only validation, you are checking syntax while ignoring
semantics.

This is not a new problem. Every experienced infrastructure engineer has a
mental checklist they run when reviewing Terraform PRs: check the IAM policy,
check the security groups, check the bucket policy. The difference with
agent-generated IaC is volume and speed. An agent can produce 500 lines of
Terraform in seconds. Your mental checklist does not scale to that velocity.

Automated policy scanning (Checkov, tfsec, OPA) scales. These tools encode
your security checklist as code. They catch the same things you catch in PR
review, but they catch them every time, on every resource, without fatigue.

The combination is powerful: give the agent your security requirements as
input context (so it gets closer on the first attempt), then validate its
output with policy scanners (so you catch what it missed). The agent learns
from the scanner output and fixes issues -- a tight feedback loop between
the agent and your security policies.

This is the DevOps equivalent of test-driven development. Your policies are
the tests. The agent writes the implementation. The scanner runs the tests.
You review what passes.

> **`terraform plan` tells you what will change, not whether it should change -- agent-generated IaC requires security review, not just syntax validation.**

## Reflection

Record in your interaction log:

1. **Permissiveness audit**: List every security misconfiguration the agent
   produced in Part 1. Categorize them (IAM, networking, storage, compute).
   Which category had the most issues?
2. **Context impact**: How did the security requirements document change the
   agent's first-pass output? Which requirements did it follow, and which
   did it still miss?
3. **Scanner integration**: How many iterations did it take for the agent to
   satisfy the policy scanner? Could you add these scanners to your actual
   CI pipeline?
4. **Your IaC workflow**: How does your team currently review agent-generated
   Terraform? What would you add after this exercise?

## Going Further

- Write OPA/Rego policies for your organization's specific security
  requirements. Run them in CI as a `conftest` step against every Terraform
  PR.
- Extend the exercise to a multi-account AWS setup. Give the agent context
  about account boundaries and cross-account IAM roles. Observe how it
  handles (or mishandles) trust policies.
- Try the same exercise with Pulumi or CloudFormation. Compare how the agent
  handles imperative vs. declarative IaC, and whether the same security
  patterns appear.
