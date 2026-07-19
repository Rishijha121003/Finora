import urllib.request
import urllib.parse
import urllib.error
import json
import uuid
from datetime import datetime

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

def test_budgets_system():
    print("==========================================================================")
    print(" FINORA V1.3.0 BUDGET MANAGEMENT API TEST SUITE ")
    print("==========================================================================")

    # 1. Register test user
    run_id = str(uuid.uuid4())[:8]
    email = f"budget_user_{run_id}@finora.io"
    status, _, reg_data = request("/auth/register", method="POST", data={
        "name": "Budget User",
        "email": email,
        "password": "BudgetPassword123!",
        "currency_code": "INR"
    })
    assert status == 201
    token = reg_data["access_token"]
    print(f"1. Registered Test User: {email} ✅")

    # 2. Get Expense Category
    status, _, cat_list = request("/categories", method="GET", token=token)
    assert status == 200
    expense_cats = [c for c in cat_list if c.get("type") == "EXPENSE"]
    assert len(expense_cats) > 0
    cat_id = expense_cats[0]["id"]
    cat_name = expense_cats[0]["name"]

    # 3. Create Overall Monthly Budget (Limit: 50,000 INR)
    status, _, b1 = request("/budgets", method="POST", data={
        "amount": 50000.00,
        "period": "MONTHLY"
    }, token=token)
    assert status == 201
    assert float(b1["amount"]) == 50000.00
    print("2. Created Overall Monthly Budget (50,000 INR) ✅")

    # 4. Create Category Budget (Limit: 10,000 INR)
    status, _, b2 = request("/budgets", method="POST", data={
        "category_id": cat_id,
        "amount": 10000.00,
        "period": "MONTHLY"
    }, token=token)
    assert status == 201
    assert b2["category_id"] == cat_id
    assert float(b2["amount"]) == 10000.00
    print(f"3. Created Category Budget for '{cat_name}' (10,000 INR) ✅")

    # 5. Add Expense Transaction (8,500 INR) -> Triggers >= 80% Warning (85% used)
    status, _, tx1 = request("/transactions", method="POST", data={
        "amount": 8500.00,
        "type": "EXPENSE",
        "category_id": cat_id,
        "transaction_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "payment_method": "UPI",
        "note": "Budget test expense"
    }, token=token)
    assert status == 201

    # 6. Fetch Budget Summary & Verify Warning Threshold Calculation
    status, _, summary = request("/budgets/summary", method="GET", token=token)
    assert status == 200
    cat_b = next((c for c in summary["category_budgets"] if c["category_id"] == cat_id), None)
    assert cat_b is not None
    assert cat_b["percentage_used"] == 85.0
    assert cat_b["is_warning"] is True  # >= 80%
    assert cat_b["is_exceeded"] is False
    print("4. Budget Summary Calculation & 80% Warning Flag Verified ✅")

    # 7. Add another Expense Transaction (2,500 INR) -> Triggers Exceeded Flag (110% used)
    status, _, tx2 = request("/transactions", method="POST", data={
        "amount": 2500.00,
        "type": "EXPENSE",
        "category_id": cat_id,
        "transaction_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "payment_method": "CARD",
        "note": "Exceeding budget expense"
    }, token=token)
    assert status == 201

    status, _, summary2 = request("/budgets/summary", method="GET", token=token)
    assert status == 200
    cat_b2 = next((c for c in summary2["category_budgets"] if c["category_id"] == cat_id), None)
    assert cat_b2["percentage_used"] == 110.0
    assert cat_b2["is_exceeded"] is True
    print("5. Budget Exceeded Flag (110% used) Verified ✅")

    # 8. Delete Budget
    status, _, del_res = request(f"/budgets/{b2['id']}", method="DELETE", token=token)
    assert status == 200
    print("6. Deleted Category Budget Successfully ✅")

    print("\n==========================================================================")
    print(" ALL BUDGET MANAGEMENT API TESTS PASSED 100%! 🎉 ")
    print("==========================================================================")

if __name__ == "__main__":
    from datetime import datetime
    test_budgets_system()
