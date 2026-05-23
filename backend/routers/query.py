from fastapi import APIRouter, HTTPException
from models.query_schema import UserQuery, FinalResponse
from services.intent_parser import parse_intent
from services.condition_mapper import enrich_intent
from services.cost_estimator import estimate_cost, check_budget_feasibility, format_inr
from services.hospital_filter import filter_hospitals
from services.response_synthesizer import synthesize_response

router = APIRouter()


@router.post("/query", response_model=FinalResponse, summary="Process a natural language healthcare query")
async def process_query(body: UserQuery) -> FinalResponse:
    """
    Full pipeline:
    1. Parse intent (condition, city, budget) via LLM
    2. Enrich with condition mapping CSV
    3. Estimate cost range from procedures CSV
    4. Filter & rank hospitals
    5. Synthesize AI summary
    """
    raw = body.query.strip()
    if not raw:
        raise HTTPException(status_code=422, detail="Query cannot be empty.")
    if len(raw) > 500:
        raise HTTPException(status_code=422, detail="Query too long. Please keep it under 500 characters.")

    # ── Step 1: Parse intent ───────────────────────────────────────────────
    intent = parse_intent(raw)

    # ── Step 2: Enrich with condition mapping ──────────────────────────────
    intent = enrich_intent(intent)

    # ── Step 3: Estimate cost ──────────────────────────────────────────────
    cost_min, cost_max, cost_column = estimate_cost(intent.procedure)

    # ── Step 4: Filter hospitals ───────────────────────────────────────────
    hospitals = filter_hospitals(
        intent=intent,
        cost_column=cost_column,
        cost_min=cost_min,
        cost_max=cost_max,
    )

    # ── Step 5: Budget feasibility ─────────────────────────────────────────
    budget_feasible = check_budget_feasibility(intent.budget_inr, cost_min)

    # ── Step 6: Cost label ─────────────────────────────────────────────────
    cost_label = None
    if cost_min and cost_max:
        cost_label = f"{format_inr(cost_min)} – {format_inr(cost_max)}"

    # ── Step 7: AI summary ─────────────────────────────────────────────────
    ai_summary = synthesize_response(
        query=raw,
        condition=intent.condition,
        procedure=intent.procedure,
        specialist=intent.specialist,
        cost_min=cost_min,
        cost_max=cost_max,
        hospital_count=len(hospitals),
        city=intent.city,
        budget=intent.budget_inr,
    )

    return FinalResponse(
        condition=intent.condition,
        procedure=intent.procedure,
        specialist=intent.specialist,
        estimated_cost_min=cost_min,
        estimated_cost_max=cost_max,
        estimated_cost_label=cost_label,
        budget_feasible=budget_feasible,
        ai_summary=ai_summary,
        hospitals=hospitals,
        query_city=intent.city,
        total_found=len(hospitals),
    )
