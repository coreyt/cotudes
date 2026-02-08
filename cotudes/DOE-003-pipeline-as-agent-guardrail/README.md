# DOE-003: Pipeline as Agent Guardrail

> **Axiom**: Every category of agent mistake you've seen is a CI stage you should build.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff DevOps / CI/CD Engineer |
| **Number** | DOE-003 |
| **Primary Competency** | Feedback Loop Design |
| **Secondary Competency** | Architecture for Agents |
| **Trap Severity** | 3 (Moderate) |
| **Prerequisites** | DOE-000 (Environment Setup), DOE-001 |
| **Duration** | 2-3 sessions |
| **Stack** | GitHub Actions / YAML |

## Overview

You will design CI pipeline stages that function as guardrails against specific
categories of agent-generated code errors. Starting with a standard
build-lint-test pipeline, you will extend it with stages that catch hallucinated
dependencies, insecure configurations, phantom imports, and deployment risks --
turning the pipeline itself into a safety net for agent-augmented development.

## Why Your Coding Agent Cares

Agents make specific, repeatable categories of mistakes. They hallucinate
package names that sound plausible but don't exist on npm or PyPI. They import
modules that exist in their training data but were never added to the project.
They generate code that passes unit tests but introduces SQL injection or
hardcoded credentials. They add dependencies with known CVEs because their
training data predates the disclosure.

A standard CI pipeline -- build, lint, test -- catches some of these by
accident. A build fails if an import doesn't resolve. A linter might flag
a security pattern. But "catches by accident" is not a guardrail strategy.
You need explicit stages designed for the specific failure modes you've
observed.

The key insight is that agent mistakes are not random. They cluster into
categories, and each category has a corresponding automated check. Hallucinated
dependencies can be verified against the registry. Insecure patterns can be
detected by SAST tools. Phantom imports can be caught by dependency graph
analysis. You have seen these mistakes before. The question is whether your
pipeline is designed to catch them, or whether you are relying on human review
to catch what the pipeline misses.

The pipeline is the one enforcement point that every code change -- human or
agent-generated -- must pass through. If your guardrails exist only in PR
review comments or team norms, agent-generated code bypasses them silently.
If your guardrails exist as CI stages, nothing ships without passing them.

## The Setup

The `starter/` directory contains a Node.js/TypeScript web service with:

- `src/` -- application source code with a REST API
- `test/` -- unit and integration tests
- `package.json` -- dependencies including some intentionally suspicious entries
- `.github/workflows/ci.yml` -- a basic CI pipeline (build, lint, test)

The codebase has been "worked on by an agent" and contains several planted
issues across the categories you will build guardrails for:

- Two dependencies in `package.json` that do not exist on npm
- One dependency with a known critical CVE
- A hardcoded API key in a configuration file
- An unused import that references a module not in the dependency tree
- An S3 upload call with a public ACL

```bash
cd starter/
npm install    # This will warn about missing packages -- that's intentional
npm run build  # May or may not succeed depending on the phantom import
```

**Your assignment in two phases**:

1. Run the existing pipeline and observe what it catches (and what it misses)
2. Design and implement targeted CI stages for each failure category

## Part 1: The Natural Approach

Run the existing CI pipeline:

```bash
npm run build
npm run lint
npm test
```

Observe the results. Some of the planted issues will surface. Others will not.

Now start your agent and ask it to review the codebase:

> "Review this codebase for any issues. Check the dependencies, the security
> posture, and the code quality."

Observe what the agent finds and what it misses. The agent may catch some
issues but is unlikely to verify whether every dependency actually exists on
the registry, or to cross-reference dependency versions against CVE databases.

### Checkpoint

Record in your interaction log:

- [ ] Which of the planted issues did the standard CI pipeline catch?
- [ ] Which issues did the pipeline miss entirely?
- [ ] Which issues did the agent catch during review?
- [ ] Which issues did neither the pipeline nor the agent catch?
- [ ] How long would these undetected issues survive in a real codebase?

## Part 2: The Effective Approach

Design a CI pipeline with dedicated stages for each category of agent mistake.
Create or modify `.github/workflows/ci.yml` with the following stages:

**Stage 1: Dependency Verification**

Verify that every dependency in `package.json` actually exists on the npm
registry:

```bash
#!/bin/bash
# verify-deps.sh -- Check that all dependencies exist on npm
set -euo pipefail

jq -r '.dependencies // {} | keys[]' package.json | while read -r pkg; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://registry.npmjs.org/$pkg")
  if [ "$status" != "200" ]; then
    echo "::error::Dependency '$pkg' does not exist on npm (HTTP $status)"
    exit 1
  fi
done

echo "All dependencies verified on npm registry."
```

**Stage 2: Vulnerability Scanning**

Run `npm audit` and parse results into structured, actionable output:

```bash
npm audit --json | jq '.vulnerabilities | to_entries[] |
  select(.value.severity == "critical" or .value.severity == "high") |
  {name: .key, severity: .value.severity, via: .value.via[0].title}'
```

Fail the pipeline on critical or high-severity findings.

**Stage 3: Secret Detection**

Use a tool like `gitleaks`, `trufflehog`, or a custom regex scanner to detect
hardcoded secrets:

```bash
# Install gitleaks
# Then:
gitleaks detect --source . --no-git --report-format json --report-path secrets.json

if [ -s secrets.json ] && [ "$(jq length secrets.json)" -gt 0 ]; then
  echo "::error::Secrets detected in codebase"
  jq -r '.[] | "::error file=\(.File),line=\(.StartLine)::\(.Description): \(.Match)"' secrets.json
  exit 1
fi
```

**Stage 4: Import/Dependency Graph Validation**

Verify that every import in the source code resolves to either a local file or
an installed dependency:

```bash
# Use madge or a custom script to detect broken imports
npx madge --circular --warning src/
npx madge --orphans src/

# Or check that tsc --noEmit catches unresolved modules
npx tsc --noEmit --pretty 2>&1 | grep "Cannot find module"
```

**Stage 5: Security Pattern Scanning (SAST)**

Run a static analysis security tool to catch insecure code patterns:

```bash
# Use semgrep with a security ruleset
npx @semgrep/semgrep --config "p/security-audit" --config "p/secrets" src/
```

**Pipeline assembly**: Wire these stages into your workflow:

```yaml
jobs:
  verify-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/verify-deps.sh

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level=high
      - run: bash scripts/detect-secrets.sh
      - run: bash scripts/sast-scan.sh

  build-lint-test:
    runs-on: ubuntu-latest
    needs: [verify-deps]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - run: npm test

  gate:
    runs-on: ubuntu-latest
    needs: [verify-deps, security-scan, build-lint-test]
    steps:
      - run: echo "All guardrail stages passed"
```

After implementing the pipeline, run each stage locally and confirm that all
planted issues are now caught.

### Checkpoint

- [ ] Does the dependency verification stage catch the two fake packages?
- [ ] Does the vulnerability scanner flag the dependency with a known CVE?
- [ ] Does the secret detection stage find the hardcoded API key?
- [ ] Does the import validation catch the phantom import?
- [ ] Does the SAST scan flag the public S3 ACL?
- [ ] Do all stages produce structured output that an agent could parse and
      act on?
- [ ] Is the pipeline fast enough to run on every PR without becoming a
      bottleneck?

## The Principle

A CI pipeline is a codified list of things you have decided to care about. The
standard pipeline -- build, lint, test -- codifies: "does it compile, does it
follow style rules, do the tests pass." These checks predate the era of
agent-generated code and were designed for the mistakes human developers make.

Agent-generated code introduces new failure categories that the standard
pipeline was never designed to catch. Hallucinated dependencies don't trigger
build failures if the import is unused or conditionally loaded. Insecure
configurations pass lint checks because linters check style, not security.
Hardcoded secrets pass tests because tests mock external services.

Every time you encounter a new category of agent mistake -- in your own work
or reported by others -- ask: "Can I detect this automatically?" If yes, it
becomes a CI stage. If not, it becomes a review checklist item. Over time,
your pipeline evolves from a generic build-lint-test chain into a
purpose-built guardrail system that reflects the actual failure modes of your
development process.

This is not about mistrusting agents. It is about encoding your operational
knowledge into automated checks, the same way you encode business logic into
tests. The pipeline is the institutional memory for everything that can go
wrong.

> **Every category of agent mistake you've seen is a CI stage you should build.**

## Reflection

Record in your interaction log:

1. **Coverage mapping**: Create a matrix of agent failure categories vs. CI
   stages. Which categories are now covered? Which still rely on human review?
2. **False positive rate**: Did any of the new stages produce false positives?
   How would you tune them for a real production pipeline?
3. **Performance budget**: What is the total CI runtime after adding these
   stages? What is your team's tolerance? Which stages can run in parallel?
4. **Feedback quality**: When a stage fails, does it produce output specific
   enough for an agent to fix the issue in one pass? If not, how would you
   improve it?
5. **Your incident history**: Think of the last three production incidents
   caused by code that passed CI. Could a new CI stage have caught them?

## Going Further

- Add a deployment canary stage: after deploying to a staging environment,
  run smoke tests and verify that key metrics (latency, error rate) stay
  within bounds before promoting to production.
- Build a "guardrail registry" -- a document or config file that maps each
  CI stage to the specific failure category it guards against, with links
  to the incidents or postmortems that motivated adding it.
- Extend the dependency verification to check package publish dates. A
  package that was published in the last 24 hours and has zero downloads
  is a supply-chain attack indicator, not a legitimate dependency.
