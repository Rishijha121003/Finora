import urllib.request
import urllib.parse
import urllib.error
import json
import uuid
from decimal import Decimal

BASE_URL = "http://localhost:8000/api/v1"

def request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_body = resp.read().decode("utf-8")
            return resp.status, resp.headers, json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        return e.code, e.headers, json.loads(res_body) if res_body else None

def run_v1_2_1_patch_tests():
    print("==========================================================================")
    print(" FINORA V1.2.1 PATCH REGRESSION & SEARCH WILDCARD TEST SUITE ")
    print("==========================================================================")

    # 1. Register a Fresh Test User
    run_id = str(uuid.uuid4())[:8]
    email = f"patch_user_{run_id}@finora.io"
    status, _, data = request("/auth/register", method="POST", data={
        "name": "Patch User",
        "email": email,
        "password": "Password123!",
        "currency_code": "INR"
    })
    assert status == 201, f"Failed registration: {data}"
    token = data["access_token"]

    # 2. Get Expense Category
    status, _, cat_data = request("/categories", method="GET", token=token)
    assert status == 200
    expense_cats = [c for c in cat_data if c.get("type") == "EXPENSE"]
    assert len(expense_cats) > 0
    cat_id = expense_cats[0]["id"]

    # 3. Create Transactions with Wildcard Signs (% and _) and Normal Notes
    t1_data = {
        "amount": 100.00,
        "type": "EXPENSE",
        "category_id": cat_id,
        "transaction_date": "2026-07-19",
        "payment_method": "UPI",
        "note": "20% Discount offer"
    }
    t2_data = {
        "amount": 200.00,
        "type": "EXPENSE",
        "category_id": cat_id,
        "transaction_date": "2026-07-19",
        "payment_method": "UPI",
        "note": "200 Discount offer" # Should NOT match literal '%Search'
    }
    t3_data = {
        "amount": 300.00,
        "type": "EXPENSE",
        "category_id": cat_id,
        "transaction_date": "2026-07-19",
        "payment_method": "CARD",
        "note": "tax_2026 payment"
    }
    t4_data = {
        "amount": 400.00,
        "type": "EXPENSE",
        "category_id": cat_id,
        "transaction_date": "2026-07-19",
        "payment_method": "CARD",
        "note": "taxa2026 payment" # Should NOT match literal '_Search'
    }

    assert request("/transactions", method="POST", data=t1_data, token=token)[0] == 201
    assert request("/transactions", method="POST", data=t2_data, token=token)[0] == 201
    assert request("/transactions", method="POST", data=t3_data, token=token)[0] == 201
    assert request("/transactions", method="POST", data=t4_data, token=token)[0] == 201

    # 4. Test Literal '%' Search
    print("\n--- Test 1: Literal '%' Search ---")
    status, _, res1 = request("/transactions?search=" + urllib.parse.quote("20%"), method="GET", token=token)
    assert status == 200
    txs1 = res1["transactions"]
    print(f"Query '20%' returned {len(txs1)} result(s)")
    assert len(txs1) == 1
    assert txs1[0]["note"] == "20% Discount offer"
    print("PASSED: Literal '%' search matched ONLY the percent sign string! ✅")

    # 5. Test Literal '_' Search
    print("\n--- Test 2: Literal '_' Search ---")
    status, _, res2 = request("/transactions?search=" + urllib.parse.quote("tax_2026"), method="GET", token=token)
    assert status == 200
    txs2 = res2["transactions"]
    print(f"Query 'tax_2026' returned {len(txs2)} result(s)")
    assert len(txs2) == 1
    assert txs2[0]["note"] == "tax_2026 payment"
    print("PASSED: Literal '_' search matched ONLY the underscore string! ✅")

    # 6. Test Normal Search Term
    print("\n--- Test 3: Normal Search Term ---")
    status, _, res3 = request("/transactions?search=" + urllib.parse.quote("Discount"), method="GET", token=token)
    assert status == 200
    txs3 = res3["transactions"]
    print(f"Query 'Discount' returned {len(txs3)} result(s)")
    assert len(txs3) == 2
    print("PASSED: Normal string search returned accurate results! ✅")

    # 7. Test Whitespace / Empty Search Term
    print("\n--- Test 4: Whitespace / Empty Search Term ---")
    status, _, res4 = request("/transactions?search=" + urllib.parse.quote("   "), method="GET", token=token)
    assert status == 200
    txs4 = res4["transactions"]
    print(f"Query '   ' (whitespace) returned {len(txs4)} total transactions")
    assert len(txs4) == 4
    print("PASSED: Whitespace search safely ignored search filter! ✅")

    print("\n==========================================================================")
    print(" ALL V1.2.1 PATCH REGRESSION TESTS PASSED 100%! 🎉 ")
    print("==========================================================================")

if __name__ == "__main__":
    run_v1_2_1_patch_tests()
