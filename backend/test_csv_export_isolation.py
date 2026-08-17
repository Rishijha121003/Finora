"""
Finora CSV Export — Cross-User Isolation Test

Verifies the FIX for the CSV export data leak:
GET /api/v1/transactions/export previously had no user_id filter,
so any logged-in user's CSV export contained ALL users' transactions.

This test registers two users (A and B), gives each their own account
and a uniquely-noted transaction, then asserts that:
  - User A's CSV export contains ONLY User A's transaction note.
  - User A's CSV export does NOT contain User B's transaction note.
  - User B's CSV export contains ONLY User B's transaction note.
  - User B's CSV export does NOT contain User A's transaction note.

Requires the backend running locally (uvicorn) before executing:
    uvicorn app.main:app --reload
Run with:
    python3 test_csv_export_isolation.py
"""
import urllib.request
import urllib.error
import json
import uuid

BASE_URL = "http://localhost:8000/api/v1"


def request(endpoint, method="GET", data=None, token=None, raw=False):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            res_body = resp.read()
            if raw:
                return resp.status, res_body.decode("utf-8")
            text = res_body.decode("utf-8")
            return resp.status, json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        res_body = e.read()
        if raw:
            return e.code, res_body.decode("utf-8")
        text = res_body.decode("utf-8")
        return e.code, json.loads(text) if text else None


def register_user_with_data(label, unique_note):
    """Registers a user, creates an account, and logs one uniquely-noted
    expense transaction for that user. Returns the auth token."""
    run_id = str(uuid.uuid4())[:8]
    email = f"{label.lower()}_{run_id}@finora.io"

    status, res = request("/auth/register", method="POST", data={
        "name": label, "email": email, "password": "Password123!", "currency_code": "INR"
    })
    assert status == 201, f"{label} registration failed: {res}"
    token = res["access_token"]
    user_id = res["user"]["id"]
    print(f"{label} registered: {user_id} ({email})")

    # Every transaction needs an owned account (V2 schema requirement)
    status, acct = request("/accounts", method="POST", token=token, data={
        "name": f"{label} Test Account",
        "account_type": "CASH",
        "opening_balance": "0.00",
    })
    assert status == 201, f"{label} account creation failed: {acct}"
    account_id = acct["id"]

    # Any system category works; fetch categories and grab the first expense one
    status, categories = request("/categories", token=token)
    expense_cat = next(c for c in categories if c["type"] == "EXPENSE")

    status, tx = request("/transactions", method="POST", token=token, data={
        "amount": 111.11,
        "type": "EXPENSE",
        "category_id": expense_cat["id"],
        "account_id": account_id,
        "transaction_date": "2026-08-01",
        "payment_method": "CASH",
        "note": unique_note,
    })
    assert status == 201, f"{label} transaction creation failed: {tx}"
    print(f"{label} transaction created with note: '{unique_note}'")

    return token


def run_test():
    print("==================================================")
    print(" FINORA CSV EXPORT — CROSS-USER ISOLATION TEST ")
    print("==================================================\n")

    note_a = f"USER_A_ONLY_NOTE_{uuid.uuid4().hex[:8]}"
    note_b = f"USER_B_ONLY_NOTE_{uuid.uuid4().hex[:8]}"

    print("--- 1. Setting up User A with a uniquely-noted transaction ---")
    token_a = register_user_with_data("UserA", note_a)

    print("\n--- 2. Setting up User B with a uniquely-noted transaction ---")
    token_b = register_user_with_data("UserB", note_b)

    print("\n--- 3. User A exports CSV ---")
    status, csv_a = request("/transactions/export", token=token_a, raw=True)
    assert status == 200, f"User A export failed with status {status}"
    assert note_a in csv_a, "FAIL: User A's own transaction missing from their own export!"
    assert note_b not in csv_a, "FAIL (SECURITY LEAK): User A's export contains User B's transaction!"
    print("PASSED: User A's export contains only their own data. ✅")

    print("\n--- 4. User B exports CSV ---")
    status, csv_b = request("/transactions/export", token=token_b, raw=True)
    assert status == 200, f"User B export failed with status {status}"
    assert note_b in csv_b, "FAIL: User B's own transaction missing from their own export!"
    assert note_a not in csv_b, "FAIL (SECURITY LEAK): User B's export contains User A's transaction!"
    print("PASSED: User B's export contains only their own data. ✅")

    print("\n==================================================")
    print(" ALL CSV EXPORT ISOLATION TESTS PASSED! 🎉 ")
    print(" No cross-user data leak detected.")
    print("==================================================")


if __name__ == "__main__":
    run_test()
