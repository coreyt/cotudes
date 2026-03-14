#!/bin/bash
set -e

cd "$(dirname "$0")/starter"

echo "=== FND-001 Verification ==="

SCORE=0
TOTAL=9

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

echo "--- Build ---"
npx tsc --noEmit 2>/dev/null \
  && check "TypeScript compiles" "true" \
  || check "TypeScript compiles" "false"

echo "--- Tests ---"
npx vitest run 2>/dev/null \
  && check "All tests pass" "true" \
  || check "All tests pass" "false"

echo "--- Priority Feature ---"

check "priority field added to Task type" \
  "$(grep -q 'priority' src/types.ts && echo true || echo false)"

check "priority in addTask signature or body" \
  "$(grep -q 'priority' src/commands.ts && echo true || echo false)"

check "#urgent validation in commands" \
  "$(grep -q 'urgent' src/commands.ts && echo true || echo false)"

check "list command displays priority" \
  "$(grep -q 'priority' src/index.ts && echo true || echo false)"

echo "--- Failure Map ---"

check "failure-map.md created" \
  "$([ -f 'failure-map.md' ] && echo true || echo false)"

if [ -f "failure-map.md" ]; then
  check "Context Degradation section present" \
    "$(grep -qi 'context degradation' failure-map.md && echo true || echo false)"

  check "Hallucination section present" \
    "$(grep -qi 'hallucination' failure-map.md && echo true || echo false)"
else
  check "Context Degradation section present" "false"
  check "Hallucination section present" "false"
fi

echo ""
echo "=== Score: $SCORE / $TOTAL ==="
