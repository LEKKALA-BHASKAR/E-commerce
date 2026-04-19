#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
node src/index.js > /tmp/luxe-server.log 2>&1 &
PID=$!
trap "kill $PID 2>/dev/null || true" EXIT
sleep 2

echo "--- login ---"
curl -sS -c /tmp/luxe.jar -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  --data-binary '{"email":"admin@luxe.dev","password":"Admin@123"}'
echo
echo "--- bad login ---"
curl -sS -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  --data-binary '{"email":"admin@luxe.dev","password":"wrong"}'
echo
echo "--- validation ---"
curl -sS -X POST http://localhost:4000/api/auth/register \
  -H 'content-type: application/json' \
  --data-binary '{"email":"x","password":"1"}'
echo
echo "--- refresh ---"
curl -sS -b /tmp/luxe.jar -c /tmp/luxe.jar -X POST http://localhost:4000/api/auth/refresh
echo
