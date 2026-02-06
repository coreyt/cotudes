#!/bin/bash
set -e

cd "$(dirname "$0")/starter"

echo "=== DOE-001 Verification ==="

SCORE=0
TOTAL=6

check() {
  local desc="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "PASS: $desc"
    SCORE=$((SCORE + 1))
  else
    echo "FAIL: $desc"
  fi
}

echo "--- Application Checks ---"
npm run build 2>/dev/null && check "Build succeeds" "true" || check "Build succeeds" "false"
npm run lint 2>/dev/null && check "Lint passes" "true" || check "Lint passes" "false"
npm test 2>/dev/null && check "Tests pass" "true" || check "Tests pass" "false"

echo "--- CI Pipeline Checks ---"

CI_FILE=".github/workflows/ci.yml"

if [ -f "$CI_FILE" ]; then
  check "CI workflow exists" "true"
else
  check "CI workflow exists" "false"
fi

# Check for separate jobs (not single monolithic job)
if grep -q 'jobs:' "$CI_FILE" 2>/dev/null; then
  JOB_COUNT=$(grep -c '^\s\+\w\+:$' "$CI_FILE" 2>/dev/null || echo 0)
  if [ "$JOB_COUNT" -gt 1 ] 2>/dev/null; then
    check "CI has multiple jobs (not monolithic)" "true"
  else
    check "CI has multiple jobs (not monolithic)" "false"
  fi
else
  check "CI has multiple jobs (not monolithic)" "false"
fi

# Check for structured annotations
if grep -q '::error\|::warning\|annotations' "$CI_FILE" 2>/dev/null; then
  check "CI includes structured annotations" "true"
else
  check "CI includes structured annotations" "false"
fi

echo ""
echo "=== Score: $SCORE / $TOTAL ==="
