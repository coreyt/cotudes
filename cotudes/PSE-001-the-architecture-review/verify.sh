#!/bin/bash

cd "$(dirname "$0")"

echo "=== PSE-001 Verification ==="

SCORE=0
TOTAL=7

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

# Find the learner's ADR (could be in several locations)
ADR=$(find . -name "ADR-*notification*" -o -name "adr-*notification*" 2>/dev/null | head -1)

if [ -z "$ADR" ]; then
  echo "FAIL: No ADR document found for notification service."
  echo "Expected a file matching ADR-*notification* pattern."
  echo "=== Score: 0 / $TOTAL ==="
  exit 1
fi

echo "Found ADR: $ADR"
echo ""

# Check ADR follows template structure
check "ADR follows template (has Status section)" \
  "$(grep -qi 'status' "$ADR" && echo true || echo false)"

# Check shared database constraint
check "References shared database / ADR-001" \
  "$(grep -qi 'shared.*database\|shared.*postgres\|ADR-001\|shared.*cluster' "$ADR" && echo true || echo false)"

# Check event schema convention
check "References event schema / ADR-002 / CloudEvents" \
  "$(grep -qi 'CloudEvents\|event.*schema\|ADR-002\|schema.*registry' "$ADR" && echo true || echo false)"

# Check auth pattern
check "References API gateway auth / ADR-003" \
  "$(grep -qi 'gateway.*auth\|ADR-003\|JWT.*gateway\|not.*verify.*JWT' "$ADR" && echo true || echo false)"

# Check PCI compliance
check "References PCI-DSS / ADR-004 / CDE scope" \
  "$(grep -qi 'PCI\|CDE\|ADR-004\|cardholder\|payment.*data' "$ADR" && echo true || echo false)"

# Check connection pooling awareness
check "Addresses connection pooling / PgBouncer limits" \
  "$(grep -qi 'PgBouncer\|connection.*pool\|200.*connection\|connection.*limit' "$ADR" && echo true || echo false)"

# Check team ownership
check "Addresses team ownership" \
  "$(grep -qi 'team\|owner\|ownership' "$ADR" && echo true || echo false)"

echo ""
echo "=== Score: $SCORE / $TOTAL ==="
