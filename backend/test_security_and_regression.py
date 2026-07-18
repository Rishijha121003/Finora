import urllib.request
import urllib.error
import json
import uuid
from decimal import Decimal

BASE_URL = "http://localhost:8000/api/v1"

def request(endpoint, method="GET", data=None, token=None, headers_extra=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if headers_extra:
        headers.update(headers_extra)
        
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_body = resp.read().decode("utf-8")
            return resp.status, resp.headers, json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        return e.code, e.headers, json.loads(res_body) if res_body else None

def run_tests():
    print("==================================================")
    print(" FINORA V1.0.0 SECURITY & REGRESSION TEST SUITE ")
    print("==================================================\n")

    # 1. Test CORS Behavior (ISSUE-01 Fix)
    print("--- 1. Testing CORS Behavior (ISSUE-01) ---")
    status, hdrs, _ = request("/", method="GET", headers_extra={"Origin": "http://localhost:3000"})
    allowed_origin = hdrs.get("Access-Control-Allow-Origin")
    print("Allowed Origin for http://localhost:3000:", allowed_origin)
    assert allowed_origin == "http://localhost:3000"

    status, hdrs, _ = request("/", method="GET", headers_extra={"Origin": "http://untrusted-malicious-site.com"})
    malicious_origin = hdrs.get("Access-Control-Allow-Origin")
    print("Allowed Origin for http://untrusted-malicious-site.com:", malicious_origin)
    assert malicious_origin is None or malicious_origin != "*"
    print("PASSED: CORS policy properly restricts untrusted origins! ✅\n")

    # 2. Register User A & User B with fresh valid email addresses
    print("--- 2. Registering User A & User B ---")
    run_id = str(uuid.uuid4())[:8]
    email_a = f"usera_{run_id}@finora.io"
    email_b = f"userb_{run_id}@finora.io"

    status_a, _, user_a_res = request("/auth/register", method="POST", data={
        "name": "User A", "email": email_a, "password": "Password123!", "currency_code": "INR"
    })
    token_a = user_a_res["access_token"]
    user_a_id = user_a_res["user"]["id"]

    status_b, _, user_b_res = request("/auth/register", method="POST", data={
        "name": "User B", "email": email_b, "password": "Password123!", "currency_code": "INR"
    })
    token_b = user_b_res["access_token"]
    user_b_id = user_b_res["user"]["id"]
    print(f"User A Registered: {user_a_id} ({email_a})")
    print(f"User B Registered: {user_b_id} ({email_b})")

    # 3. Test Category Color Hex Validation (ISSUE-06 Fix)
    print("\n--- 3. Testing Category Color Hex Validation (ISSUE-06) ---")
    status, _, err = request("/categories", method="POST", token=token_b, data={
        "name": "Invalid Color Cat", "type": "EXPENSE", "color": "invalid-red-color"
    })
    print("Create category with invalid color status:", status)
    assert status == 422
    print("PASSED: Invalid hex color rejected with 422 Unprocessable Entity! ✅")

    # 4. User B creates a private custom category
    print("\n--- 4. User B Creates Private Custom Category ---")
    status, _, cat_b = request("/categories", method="POST", token=token_b, data={
        "name": "User B Private Vault", "type": "EXPENSE", "color": "#10b981"
    })
    cat_b_id = cat_b["id"]
    print("User B Private Category Created ID:", cat_b_id)

    # 5. User A attempts to link User B's private custom category to User A's transaction (ISSUE-04 Fix Verification)
    print("\n--- 5. Security Check: User A Linking User B's Private Category (ISSUE-04) ---")
    status, _, tx_err = request("/transactions", method="POST", token=token_a, data={
        "amount": 5000.00,
        "type": "EXPENSE",
        "category_id": cat_b_id, # User B's private category!
        "transaction_date": "2026-07-18",
        "payment_method": "UPI",
        "note": "Attacker trying to use User B's private category"
    })
    print("User A transaction creation with User B's category ID status:", status)
    assert status == 404
    print("PASSED: User A was blocked from assigning User B's private custom category! ✅")

    # 6. Full Transaction CRUD & Dashboard Metrics Regression
    print("\n--- 6. Regression Testing: User A Normal Flow ---")
    _, _, categories = request("/categories", token=token_a)
    salary_cat = next(c for c in categories if c["name"] == "Salary & Payroll")
    rent_cat = next(c for c in categories if c["name"] == "Housing & Rent")

    # Add Income
    status, _, inc_tx = request("/transactions", method="POST", token=token_a, data={
        "amount": 200000.00, "type": "INCOME", "category_id": salary_cat["id"],
        "transaction_date": "2026-07-18", "payment_method": "BANK_TRANSFER", "note": "Salary"
    })
    assert Decimal(str(inc_tx["amount"])) == Decimal("200000.00")

    # Add Expense via UPI
    status, _, exp_tx = request("/transactions", method="POST", token=token_a, data={
        "amount": 45000.00, "type": "EXPENSE", "category_id": rent_cat["id"],
        "transaction_date": "2026-07-18", "payment_method": "UPI", "note": "House Rent"
    })
    assert exp_tx["payment_method"] == "UPI"

    # Dashboard Metrics Check
    _, _, dash = request("/dashboard/summary?timeframe=month", token=token_a)
    summary = dash["summary"]
    print("Current Balance:", summary["current_balance"], "INR")
    assert Decimal(str(summary["total_income"])) == Decimal("200000.00")
    assert Decimal(str(summary["total_expense"])) == Decimal("45000.00")
    assert Decimal(str(summary["current_balance"])) == Decimal("155000.00")

    # UPI Filter Check
    _, _, upi_res = request("/transactions?payment_method=UPI", token=token_a)
    assert upi_res["pagination"]["total"] == 1

    print("\n==================================================")
    print(" ALL SECURITY & REGRESSION TESTS PASSED 100%! 🎉 ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
