# DOE-005: Security Scanning

> **Axiom**: Verify every dependency the agent suggests exists before it enters your supply chain.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff DevOps / CI/CD Engineer |
| **Number** | DOE-005 |
| **Primary Competency** | Output Evaluation |
| **Secondary Competency** | Feedback Loop Design |
| **Trap Severity** | 4 (Common) |
| **Prerequisites** | DOE-001 through DOE-003 |
| **Duration** | 2-3 sessions |
| **Stack** | Node.js (npm) / Python (pip) |

## Overview

You will observe an agent suggest dependencies that do not exist on any package
registry -- hallucinated packages that sound plausible but are fabrications.
You will then build an automated dependency verification pipeline that catches
hallucinated, typosquatted, and suspiciously new packages before they enter
your project's supply chain.

## Why Your Coding Agent Cares

Agents hallucinate package names. This is not a rare edge case. Research has
shown that a significant percentage of agent-suggested packages -- across npm,
PyPI, and other registries -- do not exist. The agent produces
`npm install express-validator-sanitize` or `pip install flask-auth-utils` with
full confidence, and neither package is real.

This matters more than a build failure. When `npm install` fails because a
package doesn't exist, you get an error and move on. The real danger is when
someone registers the hallucinated package name before you try to install it.
This is not theoretical -- attackers monitor AI-suggested package names and
register them with malicious payloads. Your agent suggests a fake package, an
attacker registers it with a postinstall script that exfiltrates environment
variables, and your CI pipeline installs it and hands over your secrets.

The second category is legitimate packages with known vulnerabilities. An
agent trained on code from 2023 will suggest package versions that have since
had critical CVEs disclosed. It does not know about vulnerabilities discovered
after its training cutoff. A dependency it suggests may have been safe when the
training data was collected and compromised by the time you install it.

The third category is typosquatting. An agent might suggest `lodash` but its
output contains `lodash-utils` or `lodashs` -- close enough to look right in
a quick review, different enough to be a malicious package registered by an
attacker.

Your supply chain is only as secure as your weakest dependency. Every package
the agent adds is a link in that chain. Verification is not optional.

## The Setup

The `starter/` directory contains two projects that simulate agent-generated
dependency additions:

**Project A** (`starter/node-service/`): A Node.js service where an "agent"
has added dependencies to `package.json`:

- 15 real, legitimate packages
- 3 hallucinated packages (names that don't exist on npm)
- 1 package with a known critical CVE
- 1 typosquatted package (close to a popular package name)

**Project B** (`starter/python-service/`): A Python service where an "agent"
has added requirements to `requirements.txt`:

- 10 real, legitimate packages
- 2 hallucinated packages (names that don't exist on PyPI)
- 1 package with a known vulnerability
- 1 package published less than 48 hours ago with zero downloads

```bash
cd starter/node-service/
cat package.json    # Review the dependency list

cd ../python-service/
cat requirements.txt    # Review the requirements
```

Do not run `npm install` or `pip install` yet. That is the point.

**Your assignment in two phases**:

1. Attempt to review the dependency lists manually and with agent help
2. Build automated verification tooling

## Part 1: The Natural Approach

Review the dependency lists. For each project, try to identify which packages
are legitimate and which are suspicious.

Start your agent:

> "Review the package.json dependencies for this Node.js service. Are all
> of these packages legitimate? Flag any that look suspicious."

Then:

> "Review the requirements.txt for this Python service. Are all of these
> packages legitimate? Flag any that look suspicious."

Observe the agent's responses. It may flag some packages based on name
patterns, but it cannot verify existence on the registry in real time. It is
working from training data, which means it may confidently confirm a
hallucinated package as real (because the name sounds plausible) or flag a
legitimate package as suspicious (because it hasn't seen it before).

### Checkpoint

Record in your interaction log:

- [ ] How many of the hallucinated packages did you identify manually?
- [ ] How many did the agent identify?
- [ ] Did the agent incorrectly confirm any fake packages as legitimate?
- [ ] Did the agent flag any real packages as suspicious?
- [ ] How long did the manual review take?
- [ ] Could you confidently distinguish all real from fake without checking
      the registry?

## Part 2: The Effective Approach

Build a dependency verification toolkit that can be run locally and in CI.

**Step 1: npm dependency verification script.**

```bash
#!/bin/bash
# verify-npm-deps.sh
set -euo pipefail

FAILED=0

echo "=== Verifying npm dependencies ==="

# Check all dependencies and devDependencies
for section in dependencies devDependencies; do
  packages=$(jq -r ".$section // {} | keys[]" package.json 2>/dev/null)
  for pkg in $packages; do
    # Check existence on npm registry
    status=$(curl -s -o /dev/null -w "%{http_code}" \
      "https://registry.npmjs.org/$pkg")
    if [ "$status" != "200" ]; then
      echo "::error::HALLUCINATED: '$pkg' does not exist on npm (HTTP $status)"
      FAILED=1
      continue
    fi

    # Check package metadata for suspicious signals
    metadata=$(curl -s "https://registry.npmjs.org/$pkg")

    # Check publish date (flag if < 7 days old)
    created=$(echo "$metadata" | jq -r '.time.created // empty')
    if [ -n "$created" ]; then
      created_ts=$(date -d "$created" +%s 2>/dev/null || echo 0)
      now_ts=$(date +%s)
      age_days=$(( (now_ts - created_ts) / 86400 ))
      if [ "$age_days" -lt 7 ]; then
        echo "::warning::SUSPICIOUS: '$pkg' was created $age_days days ago"
      fi
    fi

    # Check weekly downloads (flag if very low)
    downloads=$(curl -s "https://api.npmjs.org/downloads/point/last-week/$pkg" \
      | jq -r '.downloads // 0')
    if [ "$downloads" -lt 100 ]; then
      echo "::warning::LOW_DOWNLOADS: '$pkg' has $downloads weekly downloads"
    fi

    echo "OK: $pkg (downloads: $downloads)"
  done
done

# Run npm audit for known vulnerabilities
echo ""
echo "=== Vulnerability scan ==="
npm audit --json 2>/dev/null | jq -r '
  .vulnerabilities // {} | to_entries[] |
  select(.value.severity == "critical" or .value.severity == "high") |
  "::error::CVE: \(.key) - severity: \(.value.severity) - \(.value.via[0].title // "unknown")"
' || true

exit $FAILED
```

**Step 2: Python dependency verification script.**

```bash
#!/bin/bash
# verify-python-deps.sh
set -euo pipefail

FAILED=0

echo "=== Verifying Python dependencies ==="

# Parse requirements.txt (handle version specifiers)
while IFS= read -r line; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue

  # Extract package name (before any version specifier)
  pkg=$(echo "$line" | sed 's/[>=<!\[].*//; s/\s*$//')

  # Check existence on PyPI
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://pypi.org/pypi/$pkg/json")
  if [ "$status" != "200" ]; then
    echo "::error::HALLUCINATED: '$pkg' does not exist on PyPI (HTTP $status)"
    FAILED=1
    continue
  fi

  # Check metadata for suspicious signals
  metadata=$(curl -s "https://pypi.org/pypi/$pkg/json")

  # Check if project has been yanked or has very few releases
  releases=$(echo "$metadata" | jq '.releases | length')

  # Check download stats (via pypistats API)
  recent_downloads=$(curl -s "https://pypistats.org/api/packages/$pkg/recent" \
    | jq -r '.data.last_week // 0' 2>/dev/null || echo "unknown")

  echo "OK: $pkg (releases: $releases, recent downloads: $recent_downloads)"
done < requirements.txt

exit $FAILED
```

**Step 3: Integrate into CI.**

Add these scripts as a CI stage that runs before `npm install` or
`pip install`:

```yaml
jobs:
  verify-supply-chain:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify npm dependencies exist
        working-directory: node-service
        run: bash ../scripts/verify-npm-deps.sh
      - name: Verify Python dependencies exist
        working-directory: python-service
        run: bash ../scripts/verify-python-deps.sh

  install-and-build:
    needs: [verify-supply-chain]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

The critical ordering: verification runs **before** installation. You do not
install a package to check if it's safe. You check if it's safe before you
install it.

**Step 4: Run verification against the starter projects.**

```bash
cd starter/node-service/
bash ../../scripts/verify-npm-deps.sh

cd ../python-service/
bash ../../scripts/verify-python-deps.sh
```

Review the output. Every hallucinated package should be flagged. Every
suspicious package should be warned about.

### Checkpoint

- [ ] Did the verification catch all hallucinated packages in both projects?
- [ ] Did it flag the typosquatted package?
- [ ] Did it flag the suspiciously new package?
- [ ] Did `npm audit` catch the package with a known CVE?
- [ ] Does the verification run before any package installation?
- [ ] Is the output structured enough for an agent to act on?
      (Can an agent read the output and remove the bad dependencies?)
- [ ] What is the runtime of the verification? Is it acceptable for CI?

## The Principle

Supply-chain security has always been hard. Developers add dependencies based
on a README, a recommendation, or a Stack Overflow answer. The difference
with agent-generated dependencies is that the recommendation comes from a
source that cannot distinguish real packages from plausible-sounding names
it generated from patterns in its training data.

When a human developer adds a dependency, they typically visited the npm page,
read the README, maybe checked the download count. It is an imperfect process,
but there is at least a human-in-the-loop verification step. When an agent
adds a dependency, it writes `"express-validator-sanitize": "^2.1.0"` into
`package.json` with the same confidence it writes `"express": "^4.18.0"`. One
is real. One is not. The agent does not know the difference.

Automated verification eliminates this class of risk entirely. A script that
checks the registry before installation is simple to write, fast to run, and
catches 100% of hallucinated packages. It also catches typosquatting (by
checking download counts and creation dates) and known vulnerabilities (by
running audit tools).

This is not about mistrusting agents. It is about recognizing that dependency
management is a security-critical operation, and any source of dependency
recommendations -- human, agent, or automated tool -- should be verified
against the registry of record before installation.

> **Verify every dependency the agent suggests exists before it enters your supply chain.**

## Reflection

Record in your interaction log:

1. **Detection confidence**: How many hallucinated packages could you identify
   without registry verification? What was your false-positive rate?
2. **Agent review quality**: When you asked the agent to review dependencies,
   did it demonstrate awareness of the hallucination problem? Did it suggest
   registry verification?
3. **Attack surface**: For the hallucinated packages in the starter projects,
   check if anyone has since registered those names. What does this tell you
   about the attack vector?
4. **CI integration cost**: What is the wall-clock time of running dependency
   verification in CI? Is it acceptable? How could you cache or parallelize
   it?
5. **Your projects**: Run the verification script against a real project at
   work. Were there any surprises?

## Going Further

- Extend the verification to check for package name similarity to popular
  packages (Levenshtein distance). Flag any dependency whose name is within
  edit distance 2 of a top-1000 npm package.
- Build a lockfile diff analyzer that runs on PRs: when `package-lock.json`
  or `requirements.txt` changes, verify only the newly added packages. This
  is faster than scanning all dependencies on every run.
- Research and implement Software Bill of Materials (SBOM) generation. Use
  tools like `syft` or `cyclonedx-npm` to generate an SBOM, then scan it
  against vulnerability databases. Compare the coverage to `npm audit`.
