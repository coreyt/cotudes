#!/bin/bash
set -e

cd "$(dirname "$0")/starter"

echo "=== PSA-001 Verification ==="

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

echo "--- Build ---"
go build ./... && check "Build succeeds" "true" || check "Build succeeds" "false"

echo "--- Tests ---"
go test -race -count=1 ./... && check "Tests pass" "true" || check "Tests pass" "false"

echo "--- Invariant Checks ---"

# Check handler naming convention (on<EventName> pattern)
if grep -rq 'func on[A-Z]' internal/handlers/ 2>/dev/null; then
  check "New handler follows on<EventName> convention" "true"
else
  check "New handler follows on<EventName> convention" "false"
fi

# Check no concrete type imports across packages
# Look for imports of internal concrete types (not interfaces)
VIOLATIONS=$(grep -r 'internal/accounts"' internal/handlers/ 2>/dev/null | grep -v '_test.go' | grep -v 'interface' || true)
if [ -z "$VIOLATIONS" ]; then
  check "No concrete type imports across packages" "true"
else
  check "No concrete type imports across packages" "false"
fi

# Check ARCHITECTURE.md exists
if [ -f "ARCHITECTURE.md" ]; then
  check "ARCHITECTURE.md exists" "true"
else
  check "ARCHITECTURE.md exists" "false"
fi

# Check AccountClosed event exists
if grep -rq 'AccountClosed' internal/ 2>/dev/null; then
  check "AccountClosed event type implemented" "true"
else
  check "AccountClosed event type implemented" "false"
fi

echo ""
echo "=== Score: $SCORE / $TOTAL ==="
