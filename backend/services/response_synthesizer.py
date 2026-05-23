import os
from typing import Optional
from utils.prompt_templates import RESPONSE_SYNTHESIZER_SYSTEM, RESPONSE_SYNTHESIZER_USER
from services.cost_estimator import format_inr


def _get_client():
    """Lazy OpenAI client — only created when first needed."""
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)


def synthesize_response(
    query: str,
    condition: Optional[str],
    procedure: Optional[str],
    specialist: Optional[str],
    cost_min: Optional[float],
    cost_max: Optional[float],
    hospital_count: int,
    city: Optional[str],
    budget: Optional[float],
) -> Optional[str]:
    """
    Generates a human-friendly 2-3 sentence summary using GPT.
    Falls back to a template string if the LLM is unavailable.
    """
    try:
        client = _get_client()
        prompt = RESPONSE_SYNTHESIZER_USER.format(
            query=query,
            condition=condition or "Not identified",
            procedure=procedure or "Not identified",
            specialist=specialist or "General Physician",
            cost_min=format_inr(cost_min) if cost_min else "N/A",
            cost_max=format_inr(cost_max) if cost_max else "N/A",
            hospital_count=hospital_count,
            city=city or "your area",
            budget=format_inr(budget) if budget else "Not specified",
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": RESPONSE_SYNTHESIZER_SYSTEM},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[Synthesizer] LLM failed, using fallback: {e}")
        return _fallback_summary(condition, procedure, cost_min, cost_max, hospital_count, city)


def _fallback_summary(
    condition, procedure, cost_min, cost_max, hospital_count, city
) -> str:
    parts = []

    if condition and procedure:
        parts.append(
            f"Based on your query, we identified {condition} and recommend "
            f"{procedure} as the appropriate treatment."
        )
    elif condition:
        parts.append(f"We identified your condition as {condition}.")

    if cost_min and cost_max:
        parts.append(
            f"The estimated treatment cost in India ranges from "
            f"{format_inr(cost_min)} to {format_inr(cost_max)}."
        )

    if hospital_count > 0:
        loc = f"in {city}" if city else "nearby"
        parts.append(
            f"We found {hospital_count} suitable hospital"
            f"{'s' if hospital_count > 1 else ''} {loc} — "
            "we recommend consulting 2-3 options and verifying costs directly before booking."
        )

    return " ".join(parts) if parts else (
        "We couldn't fully process your query. "
        "Please try rephrasing with the condition, city, and budget."
    )
