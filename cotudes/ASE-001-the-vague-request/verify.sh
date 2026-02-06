#!/bin/bash
set -e

cd "$(dirname "$0")/starter"

echo "=== ASE-001 Verification ==="

echo "--- Build ---"
npm run build && echo "PASS: build" || { echo "FAIL: build"; exit 1; }

echo "--- Lint ---"
npm run lint && echo "PASS: lint" || { echo "FAIL: lint"; exit 1; }

echo "--- Tests ---"
npm test && echo "PASS: tests" || { echo "FAIL: tests"; exit 1; }

echo "--- Endpoint Checks ---"
SCORE=0
TOTAL=10

# Start server in background for endpoint testing
npm run build > /dev/null 2>&1
node dist/index.js &
SERVER_PID=$!
sleep 2

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

# Check POST returns 201
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","title":"Test"}')
check "POST returns 201" "$([ "$STATUS" = "201" ] && echo true || echo false)"

# Check POST validates empty URL
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"url":"","title":"Test"}')
check "POST validates empty URL" "$([ "$STATUS" = "400" ] && echo true || echo false)"

# Check POST validates missing title
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}')
check "POST validates missing title" "$([ "$STATUS" = "400" ] && echo true || echo false)"

# Check GET returns list
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/bookmarks)
check "GET /bookmarks returns 200" "$([ "$STATUS" = "200" ] && echo true || echo false)"

# Check GET with pagination params
BODY=$(curl -s "http://localhost:3000/bookmarks?limit=5&offset=0")
check "GET supports pagination" "$(echo "$BODY" | grep -q '"total"' && echo true || echo false)"

# Check GET by ID returns 200
ID=$(curl -s -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/2","title":"Test 2"}' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/bookmarks/$ID")
  check "GET /bookmarks/:id returns 200" "$([ "$STATUS" = "200" ] && echo true || echo false)"
else
  check "GET /bookmarks/:id returns 200" "false"
fi

# Check GET by invalid ID returns 404
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/bookmarks/nonexistent)
check "GET /bookmarks/:id returns 404 for missing" "$([ "$STATUS" = "404" ] && echo true || echo false)"

# Check PUT returns 404 for missing
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT http://localhost:3000/bookmarks/nonexistent \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated"}')
check "PUT returns 404 for missing" "$([ "$STATUS" = "404" ] && echo true || echo false)"

# Check DELETE returns 404 for missing
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:3000/bookmarks/nonexistent)
check "DELETE returns 404 for missing" "$([ "$STATUS" = "404" ] && echo true || echo false)"

# Check error format
BODY=$(curl -s -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"url":"","title":""}')
check "Error responses have { error } format" "$(echo "$BODY" | grep -q '"error"' && echo true || echo false)"

kill $SERVER_PID 2>/dev/null || true

echo ""
echo "=== Score: $SCORE / $TOTAL ==="
