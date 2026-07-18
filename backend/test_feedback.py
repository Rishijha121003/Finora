import urllib.request
import urllib.error
import json
import uuid

BASE_URL = "http://localhost:8000/api/v1"

def api_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_body = resp.read().decode("utf-8")
            return resp.status, json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        return e.code, json.loads(res_body) if res_body else None

def run_feedback_tests():
    print("=" * 60)
    print(" FINORA V1.1.0 USER FEEDBACK SYSTEM TEST SUITE ")
    print("=" * 60)

    # 1. Register test user
    random_str = str(uuid.uuid4())[:8]
    email = f"feedback_user_{random_str}@finora.io"
    password = "FeedbackPass123!"

    status, reg_data = api_request("/auth/register", method="POST", data={
        "name": "Feedback Tester",
        "email": email,
        "password": password,
        "currency_code": "INR"
    })
    assert status == 201, f"Registration failed ({status}): {reg_data}"
    user_data = reg_data["user"]
    user_id = user_data["id"]
    token = reg_data["access_token"]
    print(f"1. Registered Test User: {user_id} ({email}) ✅")

    # 2. Test Unauthenticated Feedback Submission (Expect 401)
    status, unauth_data = api_request("/feedback", method="POST", data={
        "rating": 5,
        "feedback_type": "GENERAL",
        "message": "Unauthenticated attempt should be rejected.",
        "would_use_again": "YES"
    })
    assert status in [401, 403], f"Expected 401/403, got {status}"
    print("2. Unauthenticated Feedback Submission Rejected (401/403) ✅")

    # 3. Test Rating Validation (rating = 0, expect 422)
    status_low, _ = api_request("/feedback", method="POST", token=token, data={
        "rating": 0,
        "feedback_type": "GENERAL",
        "message": "Invalid rating 0 attempt.",
        "would_use_again": "YES"
    })
    assert status_low == 422, f"Expected 422 for rating=0, got {status_low}"

    # Rating validation (rating = 6, expect 422)
    status_high, _ = api_request("/feedback", method="POST", token=token, data={
        "rating": 6,
        "feedback_type": "GENERAL",
        "message": "Invalid rating 6 attempt.",
        "would_use_again": "YES"
    })
    assert status_high == 422, f"Expected 422 for rating=6, got {status_high}"
    print("3. Rating Range Validation (1-5 Enforced) ✅")

    # 4. Test Invalid Feedback Type Rejection (expect 422)
    status_type, _ = api_request("/feedback", method="POST", token=token, data={
        "rating": 4,
        "feedback_type": "INVALID_TYPE",
        "message": "Invalid feedback type attempt.",
        "would_use_again": "YES"
    })
    assert status_type == 422, f"Expected 422 for invalid feedback_type, got {status_type}"
    print("4. Invalid Feedback Type Rejection (422) ✅")

    # 5. Test Short/Empty Message Rejection (message length < 5, expect 422)
    status_short, _ = api_request("/feedback", method="POST", token=token, data={
        "rating": 4,
        "feedback_type": "BUG",
        "message": "Hi",
        "would_use_again": "YES"
    })
    assert status_short == 422, f"Expected 422 for message < 5 chars, got {status_short}"
    print("5. Short/Empty Message Length Rejection (422) ✅")

    # 6. Test Invalid would_use_again Option (expect 422)
    status_again, _ = api_request("/feedback", method="POST", token=token, data={
        "rating": 4,
        "feedback_type": "GENERAL",
        "message": "Testing invalid recommendation option.",
        "would_use_again": "DEFINITELY_NOT"
    })
    assert status_again == 422, f"Expected 422 for invalid would_use_again, got {status_again}"
    print("6. Invalid 'Would Use Again' Option Rejection (422) ✅")

    # 7. Test Successful Authenticated Feedback Submission
    valid_payload = {
        "rating": 5,
        "feedback_type": "FEATURE_REQUEST",
        "message": "Finora is fantastic! Please add automatic recurring budgets in v1.2.",
        "would_use_again": "YES"
    }
    status_valid, fb_data = api_request("/feedback", method="POST", token=token, data=valid_payload)
    assert status_valid == 201, f"Expected 201, got {status_valid}: {fb_data}"

    assert fb_data["user_id"] == user_id, f"Feedback user_id mismatch! Expected {user_id}, got {fb_data['user_id']}"
    assert fb_data["rating"] == 5
    assert fb_data["feedback_type"] == "FEATURE_REQUEST"
    assert fb_data["message"] == valid_payload["message"]
    assert fb_data["would_use_again"] == "YES"
    print(f"7. Authenticated Feedback Created Successfully (ID: {fb_data['id']}) ✅")

    # 8. Security Check: Frontend attempts to pass spoofed user_id in body
    spoofed_user_id = str(uuid.uuid4())
    spoof_payload = {
        "user_id": spoofed_user_id,
        "rating": 4,
        "feedback_type": "BUG",
        "message": "Attempting to submit on behalf of victim user_id.",
        "would_use_again": "MAYBE"
    }
    status_spoof, spoof_data = api_request("/feedback", method="POST", token=token, data=spoof_payload)
    assert status_spoof == 201, f"Expected 201, got {status_spoof}"
    assert spoof_data["user_id"] == user_id, "VULNERABILITY: Spoofed user_id was accepted instead of JWT user!"
    assert spoof_data["user_id"] != spoofed_user_id
    print("8. Security Check: Spoofed user_id in payload ignored; JWT user_id strictly enforced ✅")

    print("=" * 60)
    print(" ALL FEEDBACK SYSTEM TESTS PASSED 100%! 🎉 ")
    print("=" * 60)

if __name__ == "__main__":
    run_feedback_tests()
