# Finora v1.4.0 — Refined Product Requirements Document (PRD)

---

## 1. Document Information

- **Product Name**: Finora — Personal Finance Platform
- **Document Version**: 1.4.0-PRD-REV2
- **Target Release Version**: v1.4.0
- **Document Status**: REVISED / PENDING FINAL APPROVAL
- **Author**: Lead Product Strategist & Full-Stack Architect
- **Target Audience**: Core Engineering Team, UI/UX Designers, Product Operations
- **Creation / Revision Date**: July 19, 2026

---

## 2. Executive Summary

Finora v1.3.0 established a robust technical foundation with accurate `Decimal` financial accounting, JWT security, custom categories, responsive PWA architecture, and monthly budget limits.

Finora v1.4.0 is a focused utility release centered around **Trust, Daily Utility, Retention, and Mobile App UX**. Rather than redesigning the application, v1.4.0 evolves existing UI patterns to transform Finora from a passive manual logger into a **privacy-conscious personal finance companion**.

Following a detailed scope and operational risk audit, **Recurring Transactions** has been deferred to **v1.4.1** to ensure that Finora v1.4.0 can be shipped with zero background financial writing risk. v1.4.0 focuses on **9 high-value, production-safe features**: **Daily Safe Spend Counter**, **Quick Add Shortcuts**, **1-Click CSV Data Export**, **Self-Service Account Deletion**, **Authenticated Change Password**, **Privacy & Terms Pages**, **Transaction Date Presets**, **Custom Category Editing**, and **Native Mobile Bottom Action Sheets**.

---

## 3. Product Vision

Finora aims to be the premier **privacy-first personal finance platform** for Indian college students, freelancers, and young professionals. Finora empowers users to track income and expenses, maintain strict budget discipline, and know their daily safe spending allowance—**all without requiring invasive bank SMS permissions or direct bank account logins**.

---

## 4. v1.4.0 Release Theme

> **RELEASE THEME: "Trust, Daily Utility & Mobile Experience"**

Finora v1.4.0 strengthens user data ownership and privacy controls, while driving daily user retention by making transaction logging effortless and actionable.

---

## 5. Problem Statement

1. **Logging Friction**: Manual transaction entry without shortcuts leads to user logging fatigue after a few days.
2. **Lack of Daily Actionability**: Users know their overall monthly budget limit, but lack immediate clarity on how much they can safely spend *today*.
3. **Data Ownership & Privacy Gaps**: Users cannot export their transaction history or delete their accounts, causing privacy hesitation before storing financial records.
4. **Mobile UX Disconnect**: Web-style 3-dot dropdown popovers and manual date range pickers feel clunky on mobile viewports compared to native app patterns.

---

## 6. Target Users

- **Primary Persona A**: *Arjun, 21 — Indian College Student*. Manages a monthly allowance of ₹8,000–₹12,000. Wants fast, 1-tap entry for daily chai, meals, and transit without sharing bank SMS credentials.
- **Primary Persona B**: *Priya, 26 — Freelance Designer*. Has fluctuating monthly income. Needs 1-click CSV data export for tax filing and simple income/expense tracking.
- **Primary Persona C**: *Rohan, 28 — Young Working Professional*. Wants strict privacy, clear monthly budgeting, and a daily safe spending counter to prevent overspending before month-end.

---

## 7. User Pain Points

- *"I forget to log small daily expenses like ₹30 chai or ₹100 auto fare."*
- *"I have a ₹15,000 monthly budget, but I don't know how much I can spend today without running out of money before the 30th."*
- *"I want to back up my transactions to Excel or delete my account if I stop using the app, but there is no button for it."*
- *"Tapping small 3-dot dropdown menus and selecting dates on mobile web pickers is frustrating."*

---

## 8. Goals

- **Establish Retention Baseline**: Implement privacy-conscious analytics to establish a measured 7-day retention baseline, targeting an aspirational **45% 7-day retention**.
- **Strengthen Privacy & Data Controls**: Deliver self-service CSV Data Export, Account Deletion, and clear Privacy/Terms pages to significantly improve user trust and data ownership.
- **Elevate Mobile UX**: Convert mobile dropdowns and filter controls into native-feeling bottom sheets and date presets.
- **Maintain High System Stability**: Zero breaking changes to existing financial calculation engines or core APIs.

---

## 9. Non-Goals

- **NO Redesign**: Do not alter the core dark slate (`#0f172a`), glassmorphism cards, or approved visual hierarchy.
- **NO Third-Party Bank Scraping / SMS Permission Requesting**: Maintain zero credential requirements.
- **NO Native Codebase Rewrite**: Maintain the clean HTML/JS/CSS PWA structure.
- **NO Automated Background Financial Writes in v1.4.0**: Defer background cron execution to v1.4.1.
- **NO Monetization / Paywalls in v1.4.0**: Finora v1.4.0 remains 100% free; Pro features are deferred to v1.5+.

---

## 10. Current v1.3.0 Baseline

The following baseline components are verified stable and **MUST BE PRESERVED**:
- **Auth System**: JWT authentication, bcrypt password hashing, stateless token management.
- **Financial Calculations**: Decimal arithmetic (`Net Balance = Income - Expense`).
- **Dashboard**: Available Balance card, Income/Expense cards, Trend Chart, Budget Widget, Recent Transactions.
- **Budgeting**: Overall monthly limit, progress bar, 80% warning badge, exceeded status.
- **PWA Infrastructure**: Service Worker (`finora-shell-v1.3.0-rev2`), manifest, standalone mode, mobile bottom navigation (`#dashboard`, `#transactions`, `#categories`, `#profile`).
- **CSS Inset Support**: Existing safe-area support (`env(safe-area-inset-bottom)`) verified in `style.css`.

---

## 11. Detailed Functional Requirements

### 11.1 Daily Safe Spend Metric

#### Description
A dynamic Dashboard metric calculating the recommended maximum daily spend for the remaining days of the current month to stay within budget.

#### Logic & Math Formulation
$$\text{Remaining Budget} = \text{Active Monthly Budget Limit} - \text{Current Spend (Current Month Expenses)}$$

$$\text{Remaining Days} = (\text{Total Days in Current Month} - \text{Current Day of Month}) + 1$$

$$\text{Daily Safe Spend} = \frac{\text{Remaining Budget}}{\text{Remaining Days}}$$

#### Edge Case Behavior
- **No Active Budget**: Display `--` with subtitle *"Set a budget to enable Daily Safe Spend"*.
- **Budget Exceeded ($\text{Remaining Budget} \le 0$)**: Display `₹ 0.00` in Rose text (`#ef4444`) with subtitle *"Budget exceeded for this month"*.
- **Final Day of Month ($\text{Remaining Days} = 1$)**: $\text{Daily Safe Spend} = \text{Remaining Budget}$.
- **Independence from Available Balance**: Clearly labeled as *"DAILY SAFE SPEND"* with a target icon to distinguish it from *"AVAILABLE BALANCE"*.

---

### 11.2 Quick Add / Favorite Transactions

#### Description
Pre-configured transaction shortcuts for frequently logged items (e.g., `+ ₹50 Chai`, `+ ₹200 Lunch`).

#### Requirements
- **Creation**: Users create favorites from the Quick Add modal or by tapping *"Save as Favorite"* during regular transaction creation.
- **Storage**: Up to 6 active favorites per user stored in a new `favorite_transactions` table.
- **Interaction**: Tapping a favorite chip on mobile opens a pre-filled **Quick Add Bottom Sheet** with pre-selected amount, category, type, and note. The user taps `[Confirm & Save]` to log the entry in 1 tap, preventing accidental duplicate creation.
- **Management**: Long-press or edit button on chip allows deletion or updating.

---

### 11.3 1-Click CSV Data Export

#### Description
Allows authenticated users to download their transaction history as a standard `.csv` file.

#### Requirements
- **Placement**: Located under Profile Settings (`#profile`) & Transactions View Header.
- **Export Fields**: `Date`, `Type`, `Category`, `Amount`, `Currency`, `Payment Method`, `Note`, `Created At`.
- **Date Range Options**: `All Time`, `Current Month`, `Custom Range`.
- **Mobile PWA Behavior**: Triggers native browser file download blob (`Content-Type: text/csv`) with filename `finora_transactions_YYYYMMDD.csv`.

---

### 11.4 Self-Service Account & Data Deletion

#### Description
Full self-service account deletion to strengthen user data control.

#### Requirements
- **Location**: Danger Zone in Profile Settings (`#profile`).
- **Confirmation UX**: Requires user to type their account password and click a red `[Permanently Delete Account]` button.
- **Cascade Deletion**: Database transaction hard-deletes user record and cascades to `transactions`, `categories` (custom), `budgets`, `feedback`, and `favorite_transactions`.
- **Session Cleanup**: Invalidates local JWT token and redirects to `#landing` with toast *"Account and data permanently deleted"*.

---

### 11.5 Authenticated Change Password & Password Reset Policy

#### Requirements
- **In-Scope for v1.4.0**: **Authenticated Change Password** (`POST /api/v1/auth/change-password`). Requires current password + new password (min 8 chars).
- **Deferred to v1.5**: Unauthenticated "Forgot Password" via email reset link is deferred to v1.5 to avoid adding external SMTP infrastructure complexity (SendGrid/Resend) in v1.4.0.

---

### 11.6 Privacy Policy & Terms of Service Pages

#### Requirements
- **Views**: Clean `#privacy` and `#terms` views styled with existing card containers.
- **Links**: Accessible via Landing Page footer, Login/Register footer, and Profile section.
- **Content**: Outlines zero bank credential collection, local storage JWT usage, isolated database storage, and right to data export/deletion.
- **Disclaimer**: Expressly states that privacy features strengthen data control but do not constitute legal advice or formal regulatory certification.

---

### 11.7 Transaction Date Filter Presets

#### Requirements
- **Pill Switcher**: Positioned above search bar in Transactions view (`#transactions`).
- **Options**: `[All]`, `[Today]`, `[This Week]`, `[This Month]`, `[Last Month]`.
- **Mobile UX**: Horizontal scrollable pill row. Selecting a preset updates `start_date` and `end_date` query params automatically while preserving manual custom pickers.

---

### 11.8 Custom Category Editing

#### Requirements
- **Action**: Edit button added to custom category rows on Categories View (`#categories`).
- **Editable Fields**: Name, Color Accent picker.
- **System Category Protection**: System categories (`is_system = True`) remain non-editable and non-deletable.

---

### 11.9 Native Mobile Action Bottom Sheets

#### Requirements
- **Trigger**: Tapping the 3-dot action button on recent transaction cards (Dashboard) or mobile transaction cards (Transactions View) on viewports `<=640px`.
- **Behavior**: Slides up a clean bottom sheet with action list: `[Edit Transaction]`, `[Delete Transaction]`, `[Cancel]`.
- **Destructive Safety**: Deleting from bottom sheet requires confirmation dialog/toast.

---

## 12. Evaluation & Deferral of Recurring Transactions (Option B Decision)

### Scope Evaluation: Option A vs. Option B

- **Option A (Include Recurring Transactions in v1.4.0)**:
  - *Risk*: Requires background cron scheduling (Render Cron / Cron-Job.org), complex database idempotency (`recurring_executions` log table with `UNIQUE(rule_id, scheduled_date)`), timezone boundary edge cases, and active production monitoring. For a solo developer, introducing automated background DB writes risks silently generating incorrect or duplicate financial records if cron retries or server restarts occur.

- **Option B (Defer Recurring Transactions to v1.4.1)**:
  - *Recommendation*: **ADOPT OPTION B (DEFER TO v1.4.1)**.
  - *Justification*: Deferring Recurring Transactions keeps v1.4.0 focused 100% on **low-risk, high-value, user-driven actions** (Daily Safe Spend, Quick Add, Data Export, Account Delete, Action Sheets). This ensures v1.4.0 can be shipped cleanly without background write operational overhead.

---

## 13. Robust Database Idempotency Architecture for v1.4.1 Spec

For implementation in **v1.4.1**, the recurring transaction engine must use a **database-level idempotency key strategy** rather than string matching in transaction notes.

### Recommended Database Schema (v1.4.1 Spec):
```sql
CREATE TABLE recurring_executions (
    id VARCHAR(36) PRIMARY KEY,
    recurring_rule_id VARCHAR(36) NOT NULL REFERENCES recurring_transactions(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaction_id VARCHAR(36) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT uq_rule_scheduled_date UNIQUE (recurring_rule_id, scheduled_date)
);
```

### Idempotency Guarantee:
- **Transaction Boundary**: The backend execution engine wraps generation inside a strict SQL transaction block with `SELECT FOR UPDATE` on the recurring rule row.
- **Unique Constraint Enforcement**: Attempting to insert a duplicate `(recurring_rule_id, scheduled_date)` execution record raises a `IntegrityError` at the database level, automatically rolling back transaction generation regardless of cron retries, server restarts, or concurrent API requests.
- **Timezone**: All `scheduled_date` values are normalized to UTC date strings (`YYYY-MM-DD`).

---

## 14. Privacy-Conscious Analytics & Retention Strategy

### Retention Objective:
Primary objective: **Establish a measurable 7-day retention baseline** using privacy-conscious event analytics.

### Aspirational Targets (Unmeasured Baseline):
- **Target 7-Day Retention**: 45% (Aspirational target to be validated post-v1.4.0).
- **Target Quick Add Adoption**: 40% of active users adopting at least 1 Quick Add shortcut.

### Minimum Privacy-Conscious Analytics Setup (PostHog / Plausible - No PII / No Amounts Collected):
- `user_registered` (Timestamp, Currency Code)
- `session_started` (DAU/WAU tracking)
- `transaction_created` (Entry method: `manual` vs `quick_add_favorite`)
- `daily_safe_spend_viewed` (Dashboard view)
- `csv_exported` (Data export count)
- `account_deleted` (Retention loss event)

*Note: Individual transaction amounts, notes, or category names are NEVER sent to analytics servers.*

---

## 15. UI/UX Requirements

- **Design Preservation**: Retain `#0f172a` dark slate background, glassmorphism containers, Indigo (`#6366f1`), Emerald (`#10b981`), and Rose (`#ef4444`) accents.
- **Mobile Thumb Zone**: Ensure primary action triggers sit within the bottom 60% of mobile viewports.
- **Safe Area Insets**: Utilize existing CSS safe area padding (`env(safe-area-inset-bottom)`).
- **Empty States**: Clear, actionable text for empty state widgets (e.g. *"No favorite shortcuts created yet. Tap + to add your first favorite."*).

---

## 16. Mobile PWA Requirements

- **Service Worker Shell Version**: Upgrade to `finora-shell-v1.4.0-rev1` in `sw.js`.
- **Standalone Display**: Maintain portrait orientation and standalone PWA display mode.
- **Offline Fallback**: Service Worker continues to fallback to static shell when offline.

---

## 17. Database & API Requirements (v1.4.0)

### New Table (`favorite_transactions`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) | Primary Key | UUID string |
| `user_id` | VARCHAR(36) | Foreign Key -> `users.id` (CASCADE) | Owner user |
| `category_id` | VARCHAR(36) | Foreign Key -> `categories.id` | Category reference |
| `title` | VARCHAR(100) | NOT NULL | Shortcut title |
| `amount` | NUMERIC(12, 2) | NOT NULL | Default amount |
| `type` | VARCHAR(10) | NOT NULL (`INCOME`/`EXPENSE`) | Transaction type |
| `payment_method` | VARCHAR(20) | NOT NULL | Default payment method |
| `created_at` | TIMESTAMP | DEFAULT utcnow | Creation timestamp |

### New & Updated Endpoints
```text
GET    /api/v1/dashboard/daily-safe-spend     -> Calculate daily safe spend
GET    /api/v1/favorites                       -> List user favorite shortcuts
POST   /api/v1/favorites                       -> Create favorite shortcut
DELETE /api/v1/favorites/{id}                  -> Delete favorite shortcut
GET    /api/v1/transactions/export             -> Download CSV file
DELETE /api/v1/auth/account                    -> Permanently delete account & data
POST   /api/v1/auth/change-password            -> Authenticated password update
PUT    /api/v1/categories/{id}                 -> Update custom category name & color
```

---

## 18. Feature Prioritization Matrix

| Feature | User Value | Dev Complexity | Production Risk | Retention Impact | Priority | Final Recommendation |
|---|---|---|---|---|---|---|
| **Daily Safe Spend Metric** | High | Low | Low | High | **P0** | **INCLUDE IN v1.4.0** |
| **1-Click CSV Data Export** | High | Low | Low | Medium | **P0** | **INCLUDE IN v1.4.0** |
| **Account Deletion & Data Wiping**| High | Low | Low | High (Trust)| **P0** | **INCLUDE IN v1.4.0** |
| **Privacy Policy & Terms Pages** | High | Low | Low | High (Trust)| **P0** | **INCLUDE IN v1.4.0** |
| **Authenticated Change Password** | Medium | Low | Low | Medium | **P0** | **INCLUDE IN v1.4.0** |
| **Quick Add / Favorite Chips** | High | Medium | Low | High | **P1** | **INCLUDE IN v1.4.0** |
| **Transaction Date Presets** | Medium | Low | Low | Medium | **P1** | **INCLUDE IN v1.4.0** |
| **Custom Category Editing** | Medium | Low | Low | Medium | **P1** | **INCLUDE IN v1.4.0** |
| **Native Mobile Action Sheets** | High | Medium | Low | High | **P1** | **INCLUDE IN v1.4.0** |
| **Recurring Transactions Engine** | High | High | Medium | High | **P2** | **DEFER TO v1.4.1** |

---

## 19. Features Explicitly Deferred

| Feature | Classification | Reason for Deferral |
|---|---|---|
| **Recurring Transactions Engine** | **DEFER TO v1.4.1** | Avoids background cron execution risk in v1.4.0. |
| **Forgot Password Email Reset** | **DEFER TO v1.5+** | Avoids external SMTP server infrastructure setup in v1.4.0. |
| **Category-Level Budgets** | **DEFER TO v1.5+** | Overall monthly budget fulfills 90% of current user needs. |
| **Savings Goals & Tracker** | **DEFER TO v1.5+** | High complexity; deferred to v1.5 Pro milestone. |
| **PWA Push Notifications** | **DEFER TO v1.5+** | Requires Web Push VAPID infrastructure. |
| **Google OAuth Sign-In** | **DEFER TO v1.5+** | Requires Google Cloud Console setup. |
| **Automatic Bank Sync / SMS Parsing**| **DO NOT BUILD YET** | Security & legal risk; violates zero-credential privacy promise. |
| **AI Spending Insights** | **DO NOT BUILD YET** | High API costs and premature for core tracking utility. |

---

## 20. Updated Nuanced Readiness Assessment

- **Technically Ready for Controlled Beta Users**: **YES** (Stable backend math, JWT auth, isolated DB rows).
- **Product Ready for Broader Free-User Testing**: **YES (Post-v1.4.0)** (v1.4.0 adds Quick Add shortcuts, Daily Safe Spend, and Date Presets).
- **Privacy & Data-Control Readiness**: **HIGHLY IMPROVED** (Self-service CSV export and Account Deletion give users full data control).
- **Operational Readiness**: **HIGH** (v1.4.0 has zero background workers, keeping operational overhead minimal).
- **Legal & Compliance Readiness**: **PENDING INDEPENDENT REVIEW** (Privacy/Terms pages and data controls address key requirements, but formal regulatory compliance should be independently reviewed before large-scale commercial launch).
- **Monetization Readiness**: **DEFERRED TO v1.5** (Focus remains on free utility and retention first).

---

## 21. Final Scope Summary (9 Features in v1.4.0)

1. **Daily Safe Spend Metric** (Dashboard metric for remaining daily allowance)
2. **Quick Add / Favorite Transactions** (1-tap shortcuts like `+ ₹50 Chai`)
3. **1-Click CSV Data Export** (Complete transaction history download)
4. **Self-Service Account & Data Deletion** (Password-verified hard delete)
5. **Authenticated Change Password** (In-app password updates)
6. **Privacy Policy & Terms Pages** (Legal compliance pages & footer links)
7. **Transaction Date Presets** (`All`, `Today`, `This Week`, `This Month`, `Last Month`)
8. **Custom Category Editing** (Update custom category name & color accent)
9. **Native Mobile Action Sheets** (Slide-up bottom action sheets for mobile 3-dot menus)

---

## 22. Final Honest Recommendation

> Finora v1.4.0 is now scoped as a **highly focused, production-safe utility release**. By deferring Recurring Transactions to v1.4.1, all 9 features in v1.4.0 are 100% user-driven API operations with zero background write risk. This allows the solo developer to ship v1.4.0 quickly, establish a clean analytics baseline, and deliver immediate user value.
