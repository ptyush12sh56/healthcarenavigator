import random
from typing import List, Optional
from models.query_schema import ParsedIntent, HospitalResult
from utils.csv_loader import load_hospitals


def filter_hospitals(
    intent: ParsedIntent,
    cost_column: Optional[str],
    cost_min: Optional[float],
    cost_max: Optional[float],
    top_n: int = 6,
) -> List[HospitalResult]:
    """
    Filters hospitals from the dataset based on:
    1. City match (required if city is parsed)
    2. Speciality match (if speciality_keyword is set)
    3. Budget feasibility (if budget_inr is set)
    Then sorts by rating DESC, cost ASC.
    """
    df = load_hospitals()
    filtered = df.copy()

    # ── City filter ────────────────────────────────────────────────────────
    if intent.city:
        city_lower = intent.city.lower().strip()
        city_mask = filtered["city_lower"] == city_lower
        city_results = filtered[city_mask]

        if not city_results.empty:
            filtered = city_results
        else:
            # Partial match fallback
            filtered = filtered[filtered["city_lower"].str.contains(city_lower, na=False)]

    # ── Speciality filter ──────────────────────────────────────────────────
    if intent.speciality_keyword:
        kw = intent.speciality_keyword.lower()
        spec_mask = filtered["specialities_lower"].str.contains(kw, na=False)
        spec_results = filtered[spec_mask]
        if not spec_results.empty:
            filtered = spec_results

    # ── Budget filter (soft — just flags, doesn't exclude) ─────────────────
    budget = intent.budget_inr
    if budget and cost_column and cost_column in filtered.columns:
        # Prefer hospitals within budget, but include slightly over-budget too
        within = filtered[filtered[cost_column] <= budget * 1.2]
        if not within.empty:
            filtered = within

    # ── Sort: rating DESC, then cost ASC ──────────────────────────────────
    if cost_column and cost_column in filtered.columns:
        filtered = filtered.sort_values(
            by=["rating", cost_column],
            ascending=[False, True],
        )
    else:
        filtered = filtered.sort_values(by="rating", ascending=False)

    # ── Convert to HospitalResult objects ─────────────────────────────────
    results: List[HospitalResult] = []
    for _, row in filtered.head(top_n).iterrows():
        cost_val = None
        if cost_column and cost_column in row and row[cost_column] > 0:
            cost_val = float(row[cost_column])

        # Simulate distance (for demo — replace with real geolocation later)
        distance = round(random.uniform(1.5, 18.0), 1)

        results.append(
            HospitalResult(
                id=str(row["id"]),
                name=str(row["name"]),
                city=str(row["city"]),
                state=str(row["state"]),
                address=str(row["address"]),
                category=str(row["category"]),
                rating=float(row["rating"]),
                specialities=str(row["specialities"]),
                accreditation=str(row["accreditation"]) if row["accreditation"] and str(row["accreditation"]) != "nan" else None,
                available_beds=int(row["available_beds"]) if row["available_beds"] else None,
                contact=str(row["contact"]) if row["contact"] else None,
                cost=cost_val,
                distance=distance,
                speciality=intent.speciality_keyword,
            )
        )

    return results
