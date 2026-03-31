#!/bin/bash
BASE_URL="http://localhost:3000"
PASS=0
FAIL=0
TOKEN=""

check() {
  local name="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local expected="$5"

  if [ -n "$TOKEN" ]; then
    RESPONSE=$(curl -s -o /tmp/sass_resp -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      ${data:+-d "$data"} "$url")
  else
    RESPONSE=$(curl -s -o /tmp/sass_resp -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      ${data:+-d "$data"} "$url")
  fi

  if [ "$RESPONSE" = "$expected" ]; then
    echo "✅ PASS [$RESPONSE] — $name"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL [$RESPONSE] — $name"
    cat /tmp/sass_resp | head -c 200
    echo ""
    FAIL=$((FAIL + 1))
  fi
}

echo "🧪 SASS API Test Suite"
echo "========================="

# Health checks
check "API Gateway Health" "GET" "$BASE_URL/health" "" "200"
check "Auth Service Health" "GET" "http://localhost:3001/health" "" "200"
check "Event Service Health" "GET" "http://localhost:3002/health" "" "200"
check "Alert Service Health" "GET" "http://localhost:3003/health" "" "200"
check "GenAI Service Health" "GET" "http://localhost:3004/health" "" "200"

# Auth flow
LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sass.local","password":"Admin@123"}')
TOKEN=$(echo $LOGIN | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ FATAL: Could not get auth token. Run seed first: npm run seed"
  exit 1
fi
echo "🔑 Auth token obtained"

# All other endpoint tests
check "Get Current User" "GET" "$BASE_URL/api/auth/me" "" "200"
check "Get Events" "GET" "$BASE_URL/api/events?limit=10" "" "200"
check "Get Event Stats" "GET" "$BASE_URL/api/events/stats" "" "200"
check "Get Recent Events" "GET" "$BASE_URL/api/events/recent?minutes=30" "" "200"
check "Get Zones" "GET" "$BASE_URL/api/zones" "" "200"
check "Get Alert History" "GET" "$BASE_URL/api/alerts/history?limit=10" "" "200"
check "AI Query" "POST" "$BASE_URL/api/ai/query" '{"query":"kya ho raha hai?"}' "200"

echo ""
echo "========================="
echo "📊 Results: $PASS passed, $FAIL failed out of $((PASS + FAIL)) tests"

if [ $FAIL -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED!"
else
  echo "⚠️ $FAIL tests failed. Check logs above."
fi
