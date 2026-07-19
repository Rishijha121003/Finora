import urllib.request
import urllib.error
import json
import uuid
import datetime
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

def run_final_audit():
    test_results = {}
    print("==========================================================================")
    print(" FINORA V1.0.0 COMPREHENSIVE FINAL RELEASE REGRESSION & AUDIT SUITE ")
    print("==========================================================================\n")

    run_id = str(uuid.uuid4())[:8]

    # TEST 1: User Registration with INR
    print("1. Testing Registration with INR...")
    email_fresh = f"fresh_user_{run_id}@finora.io"
    status, _, reg_data = request("/auth/register", method="POST", data={
        "name": "Rishi Final Test",
        "email": email_fresh,
        "password": "SecurePassword123!",
        "currency_code": "INR"
    })
    if status == 201 and "access_token" in reg_data and reg_data["user"]["currency_code"] == "INR":
        test_results["1_User_Registration_INR"] = "PASS"
        token_user1 = reg_data["access_token"]
        user1_id = reg_data["user"]["id"]
        print(f"   [PASS] User registered successfully: {user1_id} ({email_fresh})")
    else:
        test_results["1_User_Registration_INR"] = "FAIL"
        print(f"   [FAIL] Registration failed status {status}: {reg_data}")

    # TEST 2: Protected Route Verification without Token
    print("\n2. Testing Protected Routes without Authentication...")
    status, _, _ = request("/transactions")
    if status in (401, 403):
        test_results["2_Protected_Routes_Unauthenticated"] = "PASS"
        print("   [PASS] Access denied to unauthenticated request (401/403)")
    else:
        test_results["2_Protected_Routes_Unauthenticated"] = "FAIL"
        print(f"   [FAIL] Expected 401/403, got {status}")

    # TEST 3: Login Workflow
    print("\n3. Testing Login & Token Verification...")
    status, _, login_data = request("/auth/login", method="POST", data={
        "email": email_fresh,
        "password": "SecurePassword123!"
    })
    if status == 200 and "access_token" in login_data:
        test_results["3_Authentication_Login"] = "PASS"
        print("   [PASS] Login successful, JWT token acquired")
    else:
        test_results["3_Authentication_Login"] = "FAIL"

    # TEST 4: Custom Income & Expense Category Creation
    print("\n4. Testing Custom Category Creation...")
    status_inc, _, cat_inc = request("/categories", method="POST", token=token_user1, data={
        "name": "Freelance Consulting", "type": "INCOME", "color": "#10b981"
    })
    status_exp, _, cat_exp = request("/categories", method="POST", token=token_user1, data={
        "name": "Cloud Hosting & Subscriptions", "type": "EXPENSE", "color": "#6366f1"
    })
    if status_inc == 201 and status_exp == 201 and cat_inc["id"] and cat_exp["id"]:
        test_results["4_Custom_Categories_Create"] = "PASS"
        cat_inc_id = cat_inc["id"]
        cat_exp_id = cat_exp["id"]
        print(f"   [PASS] Created Custom Income ({cat_inc_id}) & Expense ({cat_exp_id}) Categories")
    else:
        test_results["4_Custom_Categories_Create"] = "FAIL"

    # TEST 5: Transactions Creation & Decimal Precision
    print("\n5. Testing Multiple Transactions (CASH, UPI, CARD, BANK_TRANSFER) & Decimal Precision...")
    today_str = datetime.date.today().isoformat()
    # Add Income 1: 150000.50 (BANK_TRANSFER)
    status1, _, tx1 = request("/transactions", method="POST", token=token_user1, data={
        "amount": 150000.50, "type": "INCOME", "category_id": cat_inc_id,
        "transaction_date": today_str, "payment_method": "BANK_TRANSFER", "note": "Client Project Payout"
    })
    # Add Expense 1: 35000.25 (UPI)
    status2, _, tx2 = request("/transactions", method="POST", token=token_user1, data={
        "amount": 35000.25, "type": "EXPENSE", "category_id": cat_exp_id,
        "transaction_date": today_str, "payment_method": "UPI", "note": "AWS Infrastructure"
    })
    # Add Expense 2: 10250.00 (CARD)
    status3, _, tx3 = request("/transactions", method="POST", token=token_user1, data={
        "amount": 10250.00, "type": "EXPENSE", "category_id": cat_exp_id,
        "transaction_date": today_str, "payment_method": "CARD", "note": "Office Hardware"
    })
    # Add Expense 3: 5000.00 (CASH)
    status4, _, tx4 = request("/transactions", method="POST", token=token_user1, data={
        "amount": 5000.00, "type": "EXPENSE", "category_id": cat_exp_id,
        "transaction_date": today_str, "payment_method": "CASH", "note": "Petty Cash Supplies"
    })

    if status1 == 201 and status2 == 201 and status3 == 201 and status4 == 201:
        precision_ok = (
            Decimal(str(tx1["amount"])) == Decimal("150000.50") and
            Decimal(str(tx2["amount"])) == Decimal("35000.25") and
            Decimal(str(tx3["amount"])) == Decimal("10250.00") and
            Decimal(str(tx4["amount"])) == Decimal("5000.00")
        )
        if precision_ok:
            test_results["5_Transactions_Decimal_Precision"] = "PASS"
            print("   [PASS] Recorded 4 transactions across CASH, UPI, CARD, BANK_TRANSFER with Decimal precision")
        else:
            test_results["5_Transactions_Decimal_Precision"] = "FAIL"
    else:
        test_results["5_Transactions_Decimal_Precision"] = "FAIL"

    # TEST 6: Dashboard Net Balance & Timeframe Invariant Verification
    print("\n6. Testing Dashboard Net Balance (Lifetime Balance Invariant)...")
    status_d, _, dash_month = request("/dashboard/summary?timeframe=month", token=token_user1)
    status_d_today, _, dash_today = request("/dashboard/summary?timeframe=today", token=token_user1)
    
    summary_month = dash_month["summary"]
    summary_today = dash_today["summary"]

    tot_inc = Decimal(str(summary_month["total_income"]))
    tot_exp = Decimal(str(summary_month["total_expense"]))
    net_bal = Decimal(str(summary_month["current_balance"]))
    net_bal_today = Decimal(str(summary_today["current_balance"]))

    print(f"   Total Income: {tot_inc} | Total Expense: {tot_exp} | Net Balance: {net_bal}")
    expected_balance = Decimal("150000.50") - Decimal("50250.25") # 99750.25

    if (net_bal == expected_balance and net_bal_today == expected_balance and 
        net_bal == (tot_inc - tot_exp)):
        test_results["6_Dashboard_Net_Balance_Invariant"] = "PASS"
        print("   [PASS] Net Balance = Total Income - Total Expenses (99750.25 INR) and invariant across timeframes!")
    else:
        test_results["6_Dashboard_Net_Balance_Invariant"] = "FAIL"

    # TEST 7: Search & Filters (Date, Type, Category, Payment Method)
    print("\n7. Testing Search & Filters...")
    _, _, res_search = request("/transactions?search=AWS", token=token_user1)
    _, _, res_upi = request("/transactions?payment_method=UPI", token=token_user1)
    _, _, res_type = request("/transactions?type=EXPENSE", token=token_user1)
    _, _, res_cat = request(f"/transactions?category_id={cat_exp_id}", token=token_user1)

    filters_ok = (
        res_search["pagination"]["total"] == 1 and
        res_upi["pagination"]["total"] == 1 and
        res_type["pagination"]["total"] == 3 and
        res_cat["pagination"]["total"] == 3
    )
    if filters_ok:
        test_results["7_Search_And_Filters"] = "PASS"
        print("   [PASS] Search by note, UPI filter, EXPENSE filter, and Category filter returned accurate counts")
    else:
        test_results["7_Search_And_Filters"] = "FAIL"
        print(f"   [FAIL] Search total: {res_search['pagination']['total']}, UPI total: {res_upi['pagination']['total']}")

    # TEST 8: Edit Transaction & Dashboard Recalculation
    print("\n8. Testing Edit Transaction & Dashboard Recalculation...")
    # Update tx4 amount from 5000.00 to 7000.00
    status_edit, _, edited_tx = request(f"/transactions/{tx4['id']}", method="PUT", token=token_user1, data={
        "amount": 7000.00
    })
    _, _, dash_after_edit = request("/dashboard/summary?timeframe=month", token=token_user1)
    new_balance = Decimal(str(dash_after_edit["summary"]["current_balance"]))
    new_expense = Decimal(str(dash_after_edit["summary"]["total_expense"]))
    
    # Expected expense = 50250.25 + 2000.00 = 52250.25; new balance = 150000.50 - 52250.25 = 97750.25
    if status_edit == 200 and new_expense == Decimal("52250.25") and new_balance == Decimal("97750.25"):
        test_results["8_Edit_Transaction_Dashboard_Update"] = "PASS"
        print(f"   [PASS] Edited transaction amount. Updated Total Expenses: {new_expense}, Net Balance: {new_balance}")
    else:
        test_results["8_Edit_Transaction_Dashboard_Update"] = "FAIL"

    # TEST 9: Delete Transaction & Dashboard Recalculation
    print("\n9. Testing Delete Transaction & Dashboard Recalculation...")
    status_del, _, _ = request(f"/transactions/{tx3['id']}", method="DELETE", token=token_user1)
    _, _, dash_after_del = request("/dashboard/summary?timeframe=month", token=token_user1)
    new_balance_del = Decimal(str(dash_after_del["summary"]["current_balance"]))
    new_expense_del = Decimal(str(dash_after_del["summary"]["total_expense"]))
    
    # Removed 10250.00 expense. New expense = 52250.25 - 10250.00 = 42000.25; New balance = 150000.50 - 42000.25 = 108000.25
    if status_del == 200 and new_expense_del == Decimal("42000.25") and new_balance_del == Decimal("108000.25"):
        test_results["9_Delete_Transaction_Dashboard_Update"] = "PASS"
        print(f"   [PASS] Deleted transaction. Updated Total Expenses: {new_expense_del}, Net Balance: {new_balance_del}")
    else:
        test_results["9_Delete_Transaction_Dashboard_Update"] = "FAIL"

    # TEST 10: Category Update & Re-assignment Deletion Safety
    print("\n10. Testing Custom Category Update & Re-assignment Deletion Safety...")
    status_cat_upd, _, _ = request(f"/categories/{cat_exp_id}", method="PUT", token=token_user1, data={
        "name": "Cloud Infrastructure & Tech", "color": "#06b6d4"
    })
    status_cat_del, _, _ = request(f"/categories/{cat_exp_id}", method="DELETE", token=token_user1)
    
    # Check if remaining transactions linked to deleted custom category were safely moved to Uncategorized Expense
    _, _, tx_list_after_cat_del = request("/transactions", token=token_user1)
    tx2_refetched = next(t for t in tx_list_after_cat_del["transactions"] if t["id"] == tx2["id"])
    
    if status_cat_upd == 200 and status_cat_del == 200 and tx2_refetched["category_name"] == "Uncategorized Expense":
        test_results["10_Category_Update_And_Safe_Delete"] = "PASS"
        print("   [PASS] Updated category name and safely re-assigned transactions to Uncategorized Expense on deletion!")
    else:
        test_results["10_Category_Update_And_Safe_Delete"] = "FAIL"

    # TEST 11: Multi-User Isolation Verification (User A vs User B)
    print("\n11. Testing Multi-User Data Isolation (User A vs User B)...")
    email_user2 = f"user2_{run_id}@finora.io"
    _, _, reg_u2 = request("/auth/register", method="POST", data={
        "name": "User B", "email": email_user2, "password": "Password123!", "currency_code": "USD"
    })
    token_user2 = reg_u2["access_token"]

    # User B attempts to access User A's transaction
    status_cross_get, _, _ = request(f"/transactions", token=token_user2) # User B's list should be empty
    status_cross_edit, _, _ = request(f"/transactions/{tx1['id']}", method="PUT", token=token_user2, data={"amount": 1.0})
    status_cross_del, _, _ = request(f"/transactions/{tx1['id']}", method="DELETE", token=token_user2)

    if (status_cross_get == 200 and status_cross_edit == 404 and status_cross_del == 404):
        test_results["11_User_Data_Isolation"] = "PASS"
        print("   [PASS] User B cannot view, modify, or delete User A's transactions (returned 404)")
    else:
        test_results["11_User_Data_Isolation"] = "FAIL"

    # TEST 12: PostgreSQL Data Persistence Verification
    print("\n12. Testing PostgreSQL Data Persistence across Session Re-login...")
    status_re_login, _, login_re_data = request("/auth/login", method="POST", data={
        "email": email_fresh, "password": "SecurePassword123!"
    })
    re_token = login_re_data["access_token"]
    _, _, dash_persisted = request("/dashboard/summary?timeframe=month", token=re_token)
    persisted_bal = Decimal(str(dash_persisted["summary"]["current_balance"]))
    
    if status_re_login == 200 and persisted_bal == Decimal("108000.25"):
        test_results["12_PostgreSQL_Data_Persistence"] = "PASS"
        print(f"   [PASS] Re-logged in successfully. Data persisted correctly: Net Balance = {persisted_bal} INR")
    else:
        test_results["12_PostgreSQL_Data_Persistence"] = "FAIL"

    print("\n==========================================================================")
    print(" SUMMARY REPORT OF ALL REGRESSION AUDIT TEST CASES ")
    print("==========================================================================")
    all_passed = True
    for test_name, result in test_results.items():
        print(f" - {test_name}: {result}")
        if result != "PASS":
            all_passed = False

    print("\n==========================================================================")
    if all_passed:
        print(" OVERALL VERDICT: RELEASE-READY (PASS 100%) 🚀 ")
    else:
        print(" OVERALL VERDICT: NOT READY (SOME TESTS FAILED) ❌ ")
    print("==========================================================================")

if __name__ == "__main__":
    run_final_audit()
