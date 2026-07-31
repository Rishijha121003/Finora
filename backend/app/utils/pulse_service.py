"""
Finora Pulse Financial Health Scoring Service

Computes a comprehensive financial health score (0-100) based on:
- Saving Behavior: 35% (net savings ratio)
- Expense Control: 30% (expense-to-income ratio)
- Budget Discipline: 20% (budget adherence)
- Balance Stability: 15% (balance trend)
"""

from decimal import Decimal
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.budget import Budget
from app.schemas.pulse import PulseFactorScore, PulseResponse


class PulseScoreCalculator:
    """Service layer for computing Finora Pulse scores"""
    
    # Weights for each factor (must sum to 100)
    SAVING_BEHAVIOR_WEIGHT = 35
    EXPENSE_CONTROL_WEIGHT = 30
    BUDGET_DISCIPLINE_WEIGHT = 20
    BALANCE_STABILITY_WEIGHT = 15
    
    # Scoring thresholds and ranges
    MIN_TRANSACTIONS_FOR_SCORE = 3
    DATA_WINDOW_MONTHS = 3
    
    def __init__(self, user_id: str, db: Session):
        self.user_id = user_id
        self.db = db
        self.today = date.today()
        self.window_start = self.today - timedelta(days=self.DATA_WINDOW_MONTHS * 30)
        
    def calculate_pulse_score(self) -> PulseResponse:
        """Calculate comprehensive Pulse score"""
        
        # Fetch financial data
        transactions = self._get_transactions()
        accounts = self._get_accounts()
        budget_info = self._get_budget_info()
        
        # Check if we have sufficient data
        has_sufficient_data = len(transactions) >= self.MIN_TRANSACTIONS_FOR_SCORE
        
        if not has_sufficient_data:
            return self._create_insufficient_data_response()
        
        # Calculate metrics
        income_total = self._sum_by_type(transactions, "INCOME")
        expense_total = self._sum_by_type(transactions, "EXPENSE")
        net_savings = income_total - expense_total
        
        # Calculate factor scores
        saving_score = self._score_saving_behavior(income_total, expense_total, net_savings)
        expense_score = self._score_expense_control(income_total, expense_total)
        budget_score = self._score_budget_discipline(budget_info, expense_total)
        stability_score = self._score_balance_stability(accounts)
        
        # Create factor breakdown
        factors = [
            PulseFactorScore(
                name="Saving Behavior",
                score=saving_score,
                weight=self.SAVING_BEHAVIOR_WEIGHT,
                explanation=self._explain_saving_behavior(saving_score, net_savings, income_total),
                metric_value=f"{self._format_decimal(net_savings)}" if income_total > 0 else "No income"
            ),
            PulseFactorScore(
                name="Expense Control",
                score=expense_score,
                weight=self.EXPENSE_CONTROL_WEIGHT,
                explanation=self._explain_expense_control(expense_score, expense_total, income_total),
                metric_value=f"{self._get_expense_ratio(income_total, expense_total):.1f}%" if income_total > 0 else "No income"
            ),
            PulseFactorScore(
                name="Budget Discipline",
                score=budget_score,
                weight=self.BUDGET_DISCIPLINE_WEIGHT,
                explanation=self._explain_budget_discipline(budget_score, budget_info),
                metric_value=budget_info.get("status", "No budget set")
            ),
            PulseFactorScore(
                name="Balance Stability",
                score=stability_score,
                weight=self.BALANCE_STABILITY_WEIGHT,
                explanation=self._explain_balance_stability(stability_score),
                metric_value=f"{self._format_decimal(self._get_total_balance(accounts))}" if accounts else "No accounts"
            ),
        ]
        
        # Calculate weighted overall score
        overall_score = round(
            (saving_score * self.SAVING_BEHAVIOR_WEIGHT +
             expense_score * self.EXPENSE_CONTROL_WEIGHT +
             budget_score * self.BUDGET_DISCIPLINE_WEIGHT +
             stability_score * self.BALANCE_STABILITY_WEIGHT) / 100
        )
        
        # Determine label and color
        score_label, score_color = self._get_score_label_and_color(overall_score)
        
        # Generate summary
        summary = self._generate_summary(overall_score, factors)
        primary_insight = self._generate_primary_insight(saving_score, expense_score, budget_score, stability_score)
        
        return PulseResponse(
            overall_score=overall_score,
            score_label=score_label,
            score_color=score_color,
            factors=factors,
            summary=summary,
            primary_insight=primary_insight,
            data_window=f"{self.DATA_WINDOW_MONTHS} months",
            has_sufficient_data=True
        )
    
    # ==================== Data Fetchers ====================
    
    def _get_transactions(self) -> list:
        """Fetch transactions within the data window"""
        return self.db.query(Transaction).filter(
            Transaction.user_id == self.user_id,
            Transaction.transaction_date >= self.window_start,
            Transaction.transaction_date <= self.today
        ).all()
    
    def _get_accounts(self) -> list:
        """Fetch user's non-archived accounts"""
        return self.db.query(Account).filter(
            Account.user_id == self.user_id,
            Account.is_archived == False
        ).all()
    
    def _get_budget_info(self) -> dict:
        """Fetch budget information"""
        overall_budget = self.db.query(Budget).filter(
            Budget.user_id == self.user_id,
            Budget.category_id == None
        ).first()
        
        if not overall_budget:
            return {"exists": False, "status": "No budget set"}
        
        # Calculate current month spending
        month_start = self.today.replace(day=1)
        month_expense = self.db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == self.user_id,
            Transaction.type == "EXPENSE",
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date <= self.today
        ).scalar() or Decimal("0.00")
        
        budget_limit = Decimal(str(overall_budget.amount))
        month_expense = Decimal(str(month_expense))
        
        percentage_used = float((month_expense / budget_limit * 100)) if budget_limit > 0 else 0.0
        is_exceeded = month_expense > budget_limit
        
        return {
            "exists": True,
            "budget_limit": budget_limit,
            "current_spend": month_expense,
            "percentage_used": percentage_used,
            "is_exceeded": is_exceeded,
            "status": f"{percentage_used:.0f}% used" if not is_exceeded else "Budget exceeded"
        }
    
    # ==================== Scoring Methods ====================
    
    def _score_saving_behavior(self, income: Decimal, expense: Decimal, net_savings: Decimal) -> float:
        """
        Score saving behavior: higher savings ratio = higher score
        
        Formula:
        - If income <= 0: score = 50 (neutral)
        - savings_ratio = net_savings / income
        - ratio >= 30%: score = 100 (excellent savings)
        - ratio >= 15%: score = 80 (good savings)
        - ratio >= 0%: score = 50 + (ratio / 15 * 50) (positive but low)
        - ratio < 0%: score = max(0, 50 + (ratio * 100)) (deficit)
        """
        income_dec = Decimal(str(income))
        expense_dec = Decimal(str(expense))
        net_savings_dec = Decimal(str(net_savings))
        
        if income_dec <= 0:
            return 50.0
        
        savings_ratio = float(net_savings_dec / income_dec)
        
        if savings_ratio >= 0.30:
            return 100.0
        elif savings_ratio >= 0.15:
            return 80.0
        elif savings_ratio >= 0:
            return float(50 + (savings_ratio / 0.15) * 50)
        else:
            return float(max(0, 50 + (savings_ratio * 100)))
    
    def _score_expense_control(self, income: Decimal, expense: Decimal) -> float:
        """
        Score expense control: lower expense-to-income ratio = higher score
        
        Formula:
        - If income <= 0: score = 50 (neutral)
        - expense_ratio = expense / income
        - ratio <= 60%: score = 100 (excellent control)
        - ratio <= 80%: score = 80 (good control)
        - ratio <= 100%: score = 50 + ((100 - ratio) / 20 * 30) (living at/beyond means)
        - ratio > 100%: score = max(0, 50 - ((ratio - 100) / 100 * 50)) (spending more than earning)
        """
        income_dec = Decimal(str(income))
        expense_dec = Decimal(str(expense))
        
        if income_dec <= 0:
            return 50.0
        
        expense_ratio = float(expense_dec / income_dec)
        
        if expense_ratio <= 0.60:
            return 100.0
        elif expense_ratio <= 0.80:
            return 80.0
        elif expense_ratio <= 1.0:
            return float(50 + ((1.0 - expense_ratio) / 0.20) * 30)
        else:
            return float(max(0, 50 - ((expense_ratio - 1.0) / 1.0) * 50))
    
    def _score_budget_discipline(self, budget_info: dict, expense_total: Decimal) -> float:
        """
        Score budget discipline: how well user adheres to budget
        
        Logic:
        - No budget set: score = 60 (neutral - can't penalize)
        - Budget exists:
          - usage <= 80%: score = 100 (excellent)
          - usage <= 100%: score = 100 - (usage - 80) / 20 * 20 (good but approaching limit)
          - usage > 100%: score = max(0, 60 - (usage - 100) / 50 * 60) (overspending)
        """
        if not budget_info.get("exists"):
            return 60.0  # Neutral score when no budget exists
        
        percentage_used = budget_info.get("percentage_used", 0.0)
        
        if percentage_used <= 80:
            return 100.0
        elif percentage_used <= 100:
            return float(100 - ((percentage_used - 80) / 20) * 20)
        else:
            return float(max(0, 60 - ((percentage_used - 100) / 50) * 60))
    
    def _score_balance_stability(self, accounts: list) -> float:
        """
        Score balance stability: measure balance trends and consistency
        
        Logic:
        - No accounts: score = 50 (neutral)
        - Accounts exist:
          - Calculate month-over-month balance changes
          - Consistent growth: score = 100
          - Stable/positive: score = 80
          - Volatile: score = 50
          - Declining: score = 20-50 based on decline rate
        """
        if not accounts:
            return 50.0
        
        # Get monthly balance snapshots
        monthly_balances = self._calculate_monthly_balances(accounts)
        
        if len(monthly_balances) < 2:
            return 60.0  # Limited history
        
        # Analyze trend
        balance_changes = []
        for i in range(1, len(monthly_balances)):
            change = monthly_balances[i] - monthly_balances[i-1]
            balance_changes.append(float(change))
        
        # Calculate volatility (standard deviation-like metric)
        avg_change = sum(balance_changes) / len(balance_changes) if balance_changes else 0
        volatility = sum(abs(c - avg_change) for c in balance_changes) / len(balance_changes) if balance_changes else 0
        
        # Scoring logic
        if avg_change > 0 and volatility < abs(avg_change):
            # Consistent growth
            return 100.0
        elif avg_change >= 0:
            # Stable or slowly growing
            return 80.0
        elif avg_change < 0 and abs(avg_change) < (sum(monthly_balances) / len(monthly_balances) * 0.05):
            # Slight decline
            return 60.0
        else:
            # Significant decline
            return float(max(20, 50 - (abs(avg_change) / max(1, sum(monthly_balances) / len(monthly_balances)) * 30)))
    
    def _calculate_monthly_balances(self, accounts: list) -> list:
        """Calculate account balance at the end of each month in the data window"""
        balances = []
        current_date = self.window_start.replace(day=1)
        
        while current_date <= self.today:
            total_balance = Decimal("0.00")
            
            for account in accounts:
                # Calculate balance up to end of current month
                month_end = (current_date.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                month_end = min(month_end, self.today)
                
                income = self.db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
                    Transaction.account_id == account.id,
                    Transaction.type == "INCOME",
                    Transaction.transaction_date >= self.window_start,
                    Transaction.transaction_date <= month_end
                ).scalar() or 0
                
                expense = self.db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
                    Transaction.account_id == account.id,
                    Transaction.type == "EXPENSE",
                    Transaction.transaction_date >= self.window_start,
                    Transaction.transaction_date <= month_end
                ).scalar() or 0
                
                balance = Decimal(str(account.opening_balance)) + Decimal(str(income)) - Decimal(str(expense))
                total_balance += balance
            
            balances.append(total_balance)
            
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
        
        return balances
    
    # ==================== Explanation Generators ====================
    
    def _explain_saving_behavior(self, score: float, net_savings: Decimal, income: Decimal) -> str:
        """Generate explanation for saving behavior score"""
        if income <= 0:
            return "Income data unavailable for savings calculation."
        
        savings_ratio = float(net_savings / income * 100)
        
        if score >= 90:
            return f"Excellent! You're saving {savings_ratio:.1f}% of your income—well above the 30% target."
        elif score >= 70:
            return f"Good savings discipline with {savings_ratio:.1f}% savings rate. Aim for 15-30%."
        elif score >= 50:
            return f"Moderate savings at {savings_ratio:.1f}%. Try to increase to 15% or more."
        else:
            return f"Your spending ({-savings_ratio:.1f}% deficit) exceeds income. Focus on reducing expenses."
    
    def _explain_expense_control(self, score: float, expense: Decimal, income: Decimal) -> str:
        """Generate explanation for expense control score"""
        if income <= 0:
            return "Income data unavailable for expense ratio calculation."
        
        expense_ratio = float(expense / income * 100)
        
        if score >= 90:
            return f"Excellent expense control at {expense_ratio:.1f}% of income. You're spending well within your means."
        elif score >= 70:
            return f"Good control with {expense_ratio:.1f}% expense ratio. Maintain this trend."
        elif score >= 50:
            return f"Moderate spending at {expense_ratio:.1f}% of income. Some room for optimization."
        else:
            return f"High spending at {expense_ratio:.1f}% of income. Consider cutting non-essential expenses."
    
    def _explain_budget_discipline(self, score: float, budget_info: dict) -> str:
        """Generate explanation for budget discipline score"""
        if not budget_info.get("exists"):
            return "No monthly budget set. Setting a budget helps track discipline."
        
        usage = budget_info.get("percentage_used", 0.0)
        
        if score >= 90:
            return f"Excellent! Only {usage:.0f}% of monthly budget used. Strong discipline."
        elif score >= 70:
            return f"Good discipline at {usage:.0f}% budget usage. Stay focused as you approach the limit."
        elif score >= 50:
            return f"At {usage:.0f}% budget usage. Tighten spending to stay within limits."
        else:
            return f"Over budget at {usage:.0f}%. Prioritize essential expenses to get back on track."
    
    def _explain_balance_stability(self, score: float) -> str:
        """Generate explanation for balance stability score"""
        if score >= 90:
            return "Excellent balance stability with consistent growth. Your finances are secure."
        elif score >= 70:
            return "Good balance stability. Your account balance is healthy and relatively steady."
        elif score >= 50:
            return "Moderate stability with some fluctuation. Monitor account balance trends."
        else:
            return "Low stability with significant balance decline. Address income or expense gaps."
    
    def _generate_summary(self, overall_score: float, factors: list) -> str:
        """Generate overall summary text"""
        if overall_score >= 80:
            top_factors = sorted(factors, key=lambda f: f.score, reverse=True)[:2]
            return f"Strong financial health! Your {top_factors[0].name.lower()} and {top_factors[1].name.lower()} are your strengths."
        elif overall_score >= 60:
            weakest = min(factors, key=lambda f: f.score)
            return f"Solid progress. Focus on improving {weakest.name.lower()} to reach the next level."
        elif overall_score >= 40:
            weakest = min(factors, key=lambda f: f.score)
            return f"Room for improvement. {weakest.name} is your primary area to address."
        else:
            return "Financial health needs attention. Review all categories and create an action plan."
    
    def _generate_primary_insight(self, saving_score: float, expense_score: float, 
                                   budget_score: float, stability_score: float) -> str:
        """Generate the primary insight/recommendation"""
        scores = {
            "saving": saving_score,
            "expense": expense_score,
            "budget": budget_score,
            "stability": stability_score
        }
        
        weakest = min(scores, key=scores.get)
        
        if weakest == "saving":
            return "💡 Increase your savings by either earning more or cutting discretionary expenses."
        elif weakest == "expense":
            return "💡 Review your expense categories and identify areas where you can cut back."
        elif weakest == "budget":
            return "💡 Create or adjust your monthly budget and track spending more carefully."
        else:
            return "💡 Build an emergency fund to stabilize your balance and weather unexpected costs."
    
    # ==================== Utility Methods ====================
    
    def _sum_by_type(self, transactions: list, tx_type: str) -> Decimal:
        """Sum transactions by type"""
        return sum(
            Decimal(str(t.amount)) for t in transactions if t.type == tx_type
        ) or Decimal("0.00")
    
    def _get_expense_ratio(self, income: Decimal, expense: Decimal) -> float:
        """Calculate expense-to-income ratio as percentage"""
        if income <= 0:
            return 0.0
        return float((Decimal(str(expense)) / Decimal(str(income))) * 100)
    
    def _get_total_balance(self, accounts: list) -> Decimal:
        """Calculate total balance across all accounts"""
        return sum(
            self._calculate_account_balance(acc) for acc in accounts
        ) or Decimal("0.00")
    
    def _calculate_account_balance(self, account: Account) -> Decimal:
        """Calculate current balance for an account"""
        income = self.db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.account_id == account.id,
            Transaction.type == "INCOME"
        ).scalar() or 0
        
        expense = self.db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.account_id == account.id,
            Transaction.type == "EXPENSE"
        ).scalar() or 0
        
        return Decimal(str(account.opening_balance)) + Decimal(str(income)) - Decimal(str(expense))
    
    def _format_decimal(self, value: Decimal) -> str:
        """Format decimal for display"""
        return f"{value:,.2f}"
    
    def _get_score_label_and_color(self, score: float) -> tuple:
        """Get label and color based on score"""
        if score >= 80:
            return "Excellent", "green"
        elif score >= 60:
            return "Good", "blue"
        elif score >= 40:
            return "Fair", "orange"
        else:
            return "Needs attention", "red"
    
    def _create_insufficient_data_response(self) -> PulseResponse:
        """Create response when insufficient data"""
        return PulseResponse(
            overall_score=50,
            score_label="Insufficient data",
            score_color="gray",
            factors=[],
            summary="Not enough transaction history to calculate Pulse score.",
            primary_insight="💡 Start logging your income and expenses to build your financial profile.",
            data_window=f"{self.DATA_WINDOW_MONTHS} months",
            has_sufficient_data=False
        )
