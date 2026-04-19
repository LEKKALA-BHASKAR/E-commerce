#!/usr/bin/env bash
set -e
BASE=${BASE:-http://localhost:4000/api}

echo "== login =="
TOKEN=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@luxe.dev","password":"Admin@123"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["accessToken"])')
echo "token len: ${#TOKEN}"

echo "== categories =="
curl -s "$BASE/categories" | python3 -c 'import sys,json;d=json.load(sys.stdin);print("count:",len(d["flat"]),"first:",d["flat"][0]["name"])'

echo "== filter watches asc =="
curl -s "$BASE/products?category=watches&sort=price-asc" \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print([(i["name"],i["price"]) for i in d["items"]])'

echo "== suggest 'mon' =="
curl -s "$BASE/products/suggest?q=mon" \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print([i["name"] for i in d["items"]])'

echo "== get monaco-automatic-watch =="
curl -s "$BASE/products/monaco-automatic-watch" \
  | python3 -c 'import sys,json;p=json.load(sys.stdin)["product"];print(p["name"],p["price"],"variants:",len(p["variants"]))'

echo "== related =="
curl -s "$BASE/products/monaco-automatic-watch/related" \
  | python3 -c 'import sys,json;print([i["name"] for i in json.load(sys.stdin)["items"]])'

echo "== create review (idempotent on conflict) =="
RES=$(curl -s -X POST "$BASE/products/monaco-automatic-watch/reviews" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"rating":5,"title":"Stunning","body":"A heirloom piece."}')
echo "$RES" | python3 -c 'import sys,json;d=json.loads(sys.stdin.read());print("ok:",d.get("ok"),"msg:",d.get("message"),"code:",d.get("code"))'

echo "== list reviews =="
curl -s "$BASE/products/monaco-automatic-watch/reviews" \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print("count:",len(d["reviews"]))'

echo "== product after review =="
curl -s "$BASE/products/monaco-automatic-watch" \
  | python3 -c 'import sys,json;p=json.load(sys.stdin)["product"];print("ratingAvg:",p["ratingAvg"],"ratingCount:",p["ratingCount"])'

echo "== ALL GREEN =="
