#!/bin/bash
set -e

cd "$(dirname "$0")/starter"

echo "=== FND-002 Verification ==="

SCORE=0
TOTAL=10

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
  && check "All existing tests pass" "true" \
  || check "All existing tests pass" "false"

echo "--- Migrate Command ---"

check "migrate function implemented in commands.ts" \
  "$(grep -q 'migrate\|Migrate' src/commands.ts && echo true || echo false)"

# Write a fixture and test migration behavior
cat > /tmp/fnd002_fixture.json << 'EOF'
[
  {"id":"a1","title":"Normal","tags":[],"done":false,"createdAt":"2024-01-01T00:00:00Z"},
  {"id":"a2","title":"Urgent no priority","tags":["#urgent"],"done":false,"createdAt":"2024-01-01T00:00:00Z"},
  {"id":"a3","title":"Urgent low","tags":["#urgent"],"done":false,"createdAt":"2024-01-01T00:00:00Z","priority":2},
  {"id":"a4","title":"Null date","tags":[],"done":false,"createdAt":null}
]
EOF

cp /tmp/fnd002_fixture.json tasks.json

# Run migrate and capture output
MIGRATE_OUTPUT=$(npx ts-node src/index.ts migrate 2>&1 || true)
MIGRATE_EXIT=$?

# Should NOT write when invalid tasks exist (a3 is invalid, a4 may be invalid)
# The command should exit non-zero or print an error about invalid tasks
check "migrate reports invalid tasks" \
  "$(echo "$MIGRATE_OUTPUT" | grep -qi 'invalid\|error\|flag' && echo true || echo false)"

# Restore fixture and test a clean migration (no invalid tasks)
cat > tasks.json << 'EOF'
[
  {"id":"b1","title":"Normal","tags":[],"done":false,"createdAt":"2024-01-01T00:00:00Z"},
  {"id":"b2","title":"Urgent no priority","tags":["#urgent"],"done":false,"createdAt":"2024-01-01T00:00:00Z"}
]
EOF

CLEAN_OUTPUT=$(npx ts-node src/index.ts migrate 2>&1 || true)

# Check b1 now has priority 3
if [ -f "tasks.json" ]; then
  check "normal task migrated to priority 3" \
    "$(node -e "const t=require('./tasks.json');const b1=t.find(x=>x.id==='b1');console.log(b1&&b1.priority===3?'true':'false')" 2>/dev/null || echo false)"
  check "urgent task migrated to priority 4" \
    "$(node -e "const t=require('./tasks.json');const b2=t.find(x=>x.id==='b2');console.log(b2&&b2.priority>=4?'true':'false')" 2>/dev/null || echo false)"
else
  check "normal task migrated to priority 3" "false"
  check "urgent task migrated to priority 4" "false"
fi

# Check atomic write (saveTasksAtomic used, not saveTasks)
check "atomic write used in store.ts" \
  "$(grep -q 'saveTasksAtomic\|\.tmp' src/store.ts && echo true || echo false)"

# Clean up
rm -f tasks.json

echo "--- Workflow Contract ---"

check "workflow-contract.md created" \
  "$([ -f 'workflow-contract.md' ] && echo true || echo false)"

if [ -f "workflow-contract.md" ]; then
  check "Scope section present" \
    "$(grep -qi 'scope' workflow-contract.md && echo true || echo false)"

  check "Phases defined" \
    "$(grep -qi 'phase' workflow-contract.md && echo true || echo false)"

  check "Approval gate or checkpoint defined" \
    "$(grep -Eqi 'approval|checkpoint' workflow-contract.md && echo true || echo false)"
else
  check "Scope section present" "false"
  check "Phases defined" "false"
  check "Approval gate or checkpoint defined" "false"
fi

echo ""
echo "=== Score: $SCORE / $TOTAL ==="
