#!/bin/bash

cd "$(dirname "$0")/starter"

echo "=== DME-001 Verification ==="

# This script runs inside PostgreSQL via docker compose
# It attempts invalid inserts and counts how many the schema prevents

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

echo "--- Schema Constraint Checks ---"
echo "(Each check attempts an invalid insert that the schema should reject)"

# Helper: run SQL and check if it fails (which means the constraint works)
expect_fail() {
  local desc="$1"
  local sql="$2"
  if docker compose exec -T postgres psql -U marketplace -d marketplace -c "$sql" 2>/dev/null; then
    check "$desc" "false"  # Insert succeeded = constraint missing
  else
    check "$desc" "true"   # Insert failed = constraint enforced
  fi
}

# 1. Product price must be positive
expect_fail "Product price > 0" \
  "INSERT INTO marketplace.products (id, seller_id, title, price, status) VALUES (gen_random_uuid(), gen_random_uuid(), 'Test', -5.00, 'active');"

# 2. Review rating must be 1-5
expect_fail "Review rating 1-5" \
  "INSERT INTO marketplace.reviews (id, order_id, product_id, reviewer_id, rating, body) VALUES (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 0, 'Bad');"

# 3. Order status is enum (no arbitrary values)
expect_fail "Order status is constrained" \
  "INSERT INTO marketplace.orders (id, buyer_id, status, total) VALUES (gen_random_uuid(), gen_random_uuid(), 'invalid_status', 10.00);"

# 4. Inventory can't go negative
expect_fail "Inventory >= 0" \
  "INSERT INTO marketplace.products (id, seller_id, title, price, inventory, status) VALUES (gen_random_uuid(), gen_random_uuid(), 'Test', 10.00, -1, 'active');"

# 5. Email uniqueness (case-insensitive)
expect_fail "Case-insensitive email uniqueness" \
  "INSERT INTO marketplace.sellers (id, email, name) VALUES (gen_random_uuid(), 'TEST@example.com', 'Dup'); INSERT INTO marketplace.sellers (id, email, name) VALUES (gen_random_uuid(), 'test@example.com', 'Dup2');"

# 6. Title/name is NOT NULL
expect_fail "Product title NOT NULL" \
  "INSERT INTO marketplace.products (id, seller_id, title, price, status) VALUES (gen_random_uuid(), gen_random_uuid(), NULL, 10.00, 'active');"

# 7. URL/email format validation (if CHECK constraint exists)
expect_fail "Seller email format" \
  "INSERT INTO marketplace.sellers (id, email, name) VALUES (gen_random_uuid(), 'not-an-email', 'Test');"

# 8. Rating range upper bound
expect_fail "Review rating <= 5" \
  "INSERT INTO marketplace.reviews (id, order_id, product_id, reviewer_id, rating, body) VALUES (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 6, 'Too high');"

# 9. Order total must be non-negative
expect_fail "Order total >= 0" \
  "INSERT INTO marketplace.orders (id, buyer_id, status, total) VALUES (gen_random_uuid(), gen_random_uuid(), 'pending', -10.00);"

# 10. Product status is constrained
expect_fail "Product status is constrained" \
  "INSERT INTO marketplace.products (id, seller_id, title, price, status) VALUES (gen_random_uuid(), gen_random_uuid(), 'Test', 10.00, 'nonexistent_status');"

echo ""
echo "=== Constraint Score: $SCORE / $TOTAL ==="
echo "(Higher is better -- each PASS means the schema correctly rejected invalid data)"
