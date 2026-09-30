#!/bin/bash

API="${API_URL:-http://localhost:8080/api}"

echo "========================================"
echo "RASIKA PRODUCTION HEALTH CHECK"
echo "========================================"

echo ""
echo "Checking public APIs..."

for endpoint in buses trains flights
do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API/$endpoint")
  echo "$endpoint : HTTP $STATUS"
done

echo ""
echo "Checking backend..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API/buses")
echo "Backend API : HTTP $STATUS"

echo ""
echo "Health check complete."
