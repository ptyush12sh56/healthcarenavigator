import json
import re
import os
from models.query_schema import ParsedIntent
from utils.prompt_templates import INTENT_PARSER_SYSTEM, INTENT_PARSER_USER


def _get_client():
    """Lazy OpenAI client — only created when first needed."""
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)


def parse_intent(raw_query: str) -> ParsedIntent:
    """
    Uses GPT to extract structured intent from the user's natural language query.
    Falls back to a regex-based parser if the LLM call fails.
    """
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": INTENT_PARSER_SYSTEM},
                {"role": "user",   "content": INTENT_PARSER_USER.format(query=raw_query)},
            ],
            temperature=0.1,
            max_tokens=300,
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown fences if model wraps in ```json
        raw = re.sub(r"```(?:json)?", "", raw).strip().strip("`")
        parsed = json.loads(raw)

        return ParsedIntent(
            raw_query=raw_query,
            condition=parsed.get("condition"),
            procedure=parsed.get("procedure"),
            city=parsed.get("city"),
            budget_inr=parsed.get("budget_inr"),
            specialist=parsed.get("specialist"),
        )

    except Exception as e:
        print(f"[IntentParser] LLM failed, using fallback: {e}")
        return _fallback_parser(raw_query)


def _fallback_parser(query: str) -> ParsedIntent:
    """
    Simple regex/keyword fallback parser for when the LLM is unavailable.
    """
    q = query.lower()
    intent = ParsedIntent(raw_query=query)

    # ── Budget extraction ──────────────────────────────────────────────────
    lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*lakh", q)
    k_match    = re.search(r"(\d+(?:\.\d+)?)\s*k\b", q)
    rs_match   = re.search(r"(?:rs\.?|₹)\s*(\d+(?:,\d+)*)", q)

    if lakh_match:
        intent.budget_inr = float(lakh_match.group(1)) * 100000
    elif k_match:
        intent.budget_inr = float(k_match.group(1)) * 1000
    elif rs_match:
        intent.budget_inr = float(rs_match.group(1).replace(",", ""))

    # ── City extraction ────────────────────────────────────────────────────
    cities = [
        "nagpur", "mumbai", "pune", "hyderabad", "delhi", "bengaluru",
        "bangalore", "chennai", "kolkata", "lucknow", "indore", "ahmedabad",
        "gurugram", "gurgaon", "noida", "jaipur", "surat", "bhopal",
    ]
    for city in cities:
        if city in q:
            name = city.capitalize()
            if city == "bangalore":  name = "Bengaluru"
            if city in ("gurugram", "gurgaon"): name = "Gurugram"
            intent.city = name
            break

    # ── Condition / procedure / specialist extraction ──────────────────────
    condition_keywords = {
        "angioplasty":   ("Coronary Artery Disease",        "Angioplasty",     "Interventional Cardiologist"),
        "heart blockage":("Coronary Artery Disease",        "Angioplasty",     "Interventional Cardiologist"),
        "bypass":        ("Severe Coronary Artery Disease", "Bypass Surgery",  "Cardiac Surgeon"),
        "heart attack":  ("Heart Attack",                   "Angioplasty",     "Interventional Cardiologist"),
        "heart":         ("Coronary Artery Disease",        "Angioplasty",     "Cardiologist"),
        "knee":          ("Knee Arthritis",                 "Knee Replacement","Orthopedic Surgeon"),
        "hip":           ("Hip Arthritis",                  "Hip Replacement", "Orthopedic Surgeon"),
        "cataract":      ("Cataract",                       "Cataract Surgery","Ophthalmologist"),
        "eye":           ("Cataract",                       "Cataract Surgery","Ophthalmologist"),
        "appendix":      ("Appendicitis",                   "Appendectomy",    "General Surgeon"),
        "kidney":        ("Kidney Failure",                 "Dialysis",        "Nephrologist"),
        "dialysis":      ("Kidney Failure",                 "Dialysis",        "Nephrologist"),
        "cancer":        ("Cancer",                         "Chemotherapy",    "Oncologist"),
        "tumor":         ("Cancer",                         "Chemotherapy",    "Oncologist"),
        "spine":         ("Spine Disorder",                 "Spine Surgery",   "Spine Surgeon"),
        "back pain":     ("Spine Disorder",                 "Spine Surgery",   "Spine Surgeon"),
        "disc":          ("Spine Disorder",                 "Spine Surgery",   "Spine Surgeon"),
        "transplant":    ("Organ Failure",                  "Organ Transplant","Transplant Surgeon"),
    }

    for kw, (condition, procedure, specialist) in condition_keywords.items():
        if kw in q:
            intent.condition  = condition
            intent.procedure  = procedure
            intent.specialist = specialist
            break

    return intent
