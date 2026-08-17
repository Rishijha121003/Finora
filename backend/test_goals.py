import urllib.request
import urllib.parse
import urllib.error
import json
import uuid

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

def test_goals_system():
    print("==========================================================================")
    print(" FINORA V2.0 GOALS MANAGEMENT API TEST SUITE ")
    print("==========================================================================")

    # 1. Register test user 1
    run_id = str(uuid.uuid4())[:8]
    email1 = f"goal_user1_{run_id}@finora.io"
    status, _, reg1 = request("/auth/register", method="POST", data={
        "name": "Goal User 1",
        "email": email1,
        "password": "GoalPassword123!",
        "currency_code": "INR"
    })
    assert status == 201
    token1 = reg1["access_token"]
    print(f"1. Registered Test User 1: {email1} ✅")

    # 2. Register test user 2 (Security / Isolation verification)
    email2 = f"goal_user2_{run_id}@finora.io"
    status, _, reg2 = request("/auth/register", method="POST", data={
        "name": "Goal User 2",
        "email": email2,
        "password": "GoalPassword123!",
        "currency_code": "INR"
    })
    assert status == 201
    token2 = reg2["access_token"]
    print(f"2. Registered Test User 2: {email2} ✅")

    # 3. Create Savings Goal for User 1 (Emergency Fund: 100,000 INR, current 25,000 INR)
    status, _, g1 = request("/goals", method="POST", data={
        "title": "Emergency Reserve",
        "target_amount": 100000.00,
        "current_amount": 25000.00,
        "category": "Emergency Fund",
        "target_date": "2026-12-31"
    }, token=token1)
    assert status == 201
    assert g1["title"] == "Emergency Reserve"
    assert float(g1["target_amount"]) == 100000.00
    assert float(g1["current_amount"]) == 25000.00
    assert float(g1["remaining_amount"]) == 75000.00
    assert g1["percentage_completed"] == 25.0
    assert g1["is_completed"] is False
    goal_id1 = g1["id"]
    print("3. Created Savings Goal for User 1 ✅")

    # 4. Fetch Goals Summary for User 1
    status, _, summary1 = request("/goals/summary", method="GET", token=token1)
    assert status == 200
    assert summary1["total_goals"] == 1
    assert float(summary1["total_target"]) == 100000.00
    assert float(summary1["total_saved"]) == 25000.00
    assert summary1["overall_progress"] == 25.0
    print("4. Verified Goals Summary Calculation ✅")

    # 5. Security Test: User 2 must NOT access User 1's goal
    status, _, u2_goals = request("/goals", method="GET", token=token2)
    assert status == 200
    assert len(u2_goals) == 0  # Isolation verified

    status, _, u2_update_err = request(f"/goals/{goal_id1}", method="PUT", data={"current_amount": 100000.00}, token=token2)
    assert status == 404  # Not found for unauthorized user
    print("5. Verified Goal Security & Cross-User Data Isolation ✅")

    # 6. Update Goal Progress for User 1 (Deposit to reach 100% completion)
    status, _, g1_updated = request(f"/goals/{goal_id1}", method="PUT", data={
        "current_amount": 100000.00
    }, token=token1)
    assert status == 200
    assert float(g1_updated["current_amount"]) == 100000.00
    assert float(g1_updated["remaining_amount"]) == 0.00
    assert g1_updated["percentage_completed"] == 100.0
    assert g1_updated["is_completed"] is True
    print("6. Updated Goal Progress & Verified 100% Completion State ✅")

    # 7. Delete Goal for User 1
    status, _, del_res = request(f"/goals/{goal_id1}", method="DELETE", token=token1)
    assert status == 200
    print("7. Deleted Goal Successfully ✅")

    print("\n==========================================================================")
    print(" ALL GOALS MANAGEMENT API TESTS PASSED 100%! 🎉 ")
    print("==========================================================================")

if __name__ == "__main__":
    test_goals_system()
