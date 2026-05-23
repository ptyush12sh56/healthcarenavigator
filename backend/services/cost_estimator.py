from typing import Tuple, Optional
from utils.csv_loader import load_procedures


def estimate_cost(procedure: Optional[str]) -> Tuple[Optional[float], Optional[float], Optional[str]]:
    """
    Returns (cost_min, cost_max, cost_column) for the given procedure name.
    Searches procedure_name and procedure_aliases columns.
    """
    if not procedure:
        return None, None, None

    df = load_procedures()
    procedure_lower = procedure.lower().strip()

    # Exact name match
    match = df[df["procedure_name"].str.lower() == procedure_lower]

    # Alias search
    if match.empty:
        mask = df["procedure_aliases"].apply(
            lambda aliases: any(
                alias.strip().lower() in procedure_lower or procedure_lower in alias.strip().lower()
                for alias in str(aliases).split(",")
            )
        )
        match = df[mask]

    if not match.empty:
        row = match.iloc[0]
        return float(row["cost_min_inr"]), float(row["cost_max_inr"]), row["cost_column"]

    return None, None, None


def check_budget_feasibility(budget: Optional[float], cost_min: Optional[float]) -> Optional[bool]:
    """Returns True if budget >= cost_min (basic check)."""
    if budget is None or cost_min is None:
        return None
    return budget >= cost_min


def format_inr(amount: float) -> str:
    """Format INR amount using lakh notation."""
    if amount >= 10_000_000:
        return f"₹{amount / 10_000_000:.1f} Crore"
    if amount >= 100_000:
        return f"₹{amount / 100_000:.1f} Lakh"
    if amount >= 1000:
        return f"₹{amount / 1000:.0f}K"
    return f"₹{amount:.0f}"
