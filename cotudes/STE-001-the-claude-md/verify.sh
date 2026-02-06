#!/bin/bash
set -e

cd "$(dirname "$0")/starter"

echo "=== STE-001 Verification ==="

SCORE=0
TOTAL=8

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
go test -race -count=1 ./... && check "Tests pass with -race -count=1" "true" || check "Tests pass with -race -count=1" "false"

echo "--- Convention Checks ---"

# Check handler naming convention
if grep -rq "func Handle[A-Z]" internal/handler/; then
  check "Handler naming: Handle<Resource><Action>" "true"
else
  check "Handler naming: Handle<Resource><Action>" "false"
fi

# Check error wrapping pattern
if grep -rq 'fmt.Errorf(".*: %w"' internal/; then
  check "Error wrapping: fmt.Errorf(\"operation: %w\", err)" "true"
else
  check "Error wrapping: fmt.Errorf(\"operation: %w\", err)" "false"
fi

# Check response envelope
if grep -rq '"data"' internal/response/ || grep -rq 'Data' internal/response/; then
  check "Response envelope: {\"data\": ..., \"error\": ...}" "true"
else
  check "Response envelope: {\"data\": ..., \"error\": ...}" "false"
fi

# Check table-driven tests
if grep -rq 'tests := \[\]struct' internal/ || grep -rq 'testCases' internal/; then
  check "Table-driven tests" "true"
else
  check "Table-driven tests" "false"
fi

# Check slog usage
if grep -rq 'slog\.' internal/; then
  check "Structured logging with slog" "true"
else
  check "Structured logging with slog" "false"
fi

# Check CLAUDE.md exists
if [ -f "CLAUDE.md" ]; then
  check "CLAUDE.md exists" "true"
else
  check "CLAUDE.md exists" "false"
fi

echo ""
echo "=== Score: $SCORE / $TOTAL ==="
