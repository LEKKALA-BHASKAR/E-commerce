#!/usr/bin/env bash
set -e
BASE=${BASE:-http://localhost:4000/api}
PY=python3

echo "== login admin =="
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@luxe.dev","password":"Admin@123"}')
TOKEN=$(echo "$LOGIN" | $PY -c 'import sys,json;print(json.load(sys.stdin)["accessToken"])')
echo "token len: ${#TOKEN}"

echo "== get a product id =="
PROD=$(curl -s "$BASE/products?limit=1" | $PY -c 'import sys,json;p=json.load(sys.stdin)["items"][0];print(p["_id"]+"|"+p["name"]+"|"+str(p["price"]))')
PID=$(echo "$PROD" | cut -d'|' -f1)
PNAME=$(echo "$PROD" | cut -d'|' -f2)
PPRICE=$(echo "$PROD" | cut -d'|' -f3)
echo "product: $PNAME ($PID) @ $PPRICE"

echo "== validate WELCOME10 (subtotal=5000) =="
curl -s -X POST "$BASE/coupons/validate" -H 'Content-Type: application/json' \
  -d '{"code":"WELCOME10","subtotal":5000}' \
  | $PY -c 'import sys,json;d=json.load(sys.stdin);print("ok:",d.get("ok"),"discount:",d["coupon"]["discount"],"type:",d["coupon"]["type"])'

echo "== validate LUXE500 (subtotal=5000) =="
curl -s -X POST "$BASE/coupons/validate" -H 'Content-Type: application/json' \
  -d '{"code":"LUXE500","subtotal":5000}' \
  | $PY -c 'import sys,json;d=json.load(sys.stdin);print("ok:",d.get("ok"),"discount:",d["coupon"]["discount"])'

echo "== validate FAKE (expect fail) =="
curl -s -X POST "$BASE/coupons/validate" -H 'Content-Type: application/json' \
  -d '{"code":"FAKE","subtotal":5000}' \
  | $PY -c 'import sys,json;d=json.load(sys.stdin);print("ok:",d.get("ok"),"code:",d.get("code"))'

ADDR='{"fullName":"Test User","phone":"9999999999","line1":"123 Test","city":"Mumbai","postalCode":"400001","country":"IN"}'

echo "== create COD order =="
COD=$(curl -s -X POST "$BASE/orders" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d "{\"items\":[{\"product\":\"$PID\",\"qty\":1}],\"shipping\":$ADDR,\"paymentMethod\":\"cod\"}")
echo "$COD" | $PY -c 'import sys,json;d=json.load(sys.stdin);o=d["order"];print("ok:",d.get("ok"),"orderNumber:",o["orderNumber"],"status:",o["status"],"total:",o["total"])'
COD_ID=$(echo "$COD" | $PY -c 'import sys,json;print(json.load(sys.stdin)["order"]["id"])')

echo "== create Razorpay order (dev mock) =="
RZP=$(curl -s -X POST "$BASE/orders" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d "{\"items\":[{\"product\":\"$PID\",\"qty\":1}],\"shipping\":$ADDR,\"paymentMethod\":\"razorpay\",\"couponCode\":\"WELCOME10\"}")
echo "$RZP" | $PY -c 'import sys,json;d=json.load(sys.stdin);o=d["order"];rp=d["razorpay"];print("orderNumber:",o["orderNumber"],"discount:",o["discount"],"rzp.orderId:",rp["orderId"],"isDevMock:",rp["isDevMock"])'
RZP_ID=$(echo "$RZP" | $PY -c 'import sys,json;print(json.load(sys.stdin)["order"]["id"])')
RZP_OID=$(echo "$RZP" | $PY -c 'import sys,json;print(json.load(sys.stdin)["razorpay"]["orderId"])')

echo "== verify payment (dev mock signature) =="
curl -s -X POST "$BASE/orders/verify" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d "{\"razorpayOrderId\":\"$RZP_OID\",\"razorpayPaymentId\":\"pay_dev_test\",\"razorpaySignature\":\"dev_mock_signature\"}" \
  | $PY -c 'import sys,json;d=json.load(sys.stdin);o=d["order"];print("ok:",d.get("ok"),"paymentStatus:",o["paymentStatus"],"status:",o["status"])'

echo "== list my orders =="
curl -s "$BASE/orders" -H "Authorization: Bearer $TOKEN" \
  | $PY -c 'import sys,json;d=json.load(sys.stdin);print("count:",len(d["orders"]))'

echo "== get one order =="
curl -s "$BASE/orders/$COD_ID" -H "Authorization: Bearer $TOKEN" \
  | $PY -c 'import sys,json;o=json.load(sys.stdin)["order"];print("orderNumber:",o["orderNumber"],"items:",len(o["items"]))'

echo "== cancel COD order =="
curl -s -X POST "$BASE/orders/$COD_ID/cancel" -H "Authorization: Bearer $TOKEN" \
  | $PY -c 'import sys,json;o=json.load(sys.stdin)["order"];print("status:",o["status"],"timeline:",len(o["timeline"]))'

echo "== ALL GREEN =="
