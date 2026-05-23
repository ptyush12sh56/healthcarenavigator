from models.query_schema import ParsedIntent
from utils.csv_loader import load_conditions


def enrich_intent(intent: ParsedIntent) -> ParsedIntent:
    """
    Uses condition_mapping_dataset.csv to fill in missing procedure / specialist
    fields that the LLM may not have populated.
    """
    if not intent.condition:
        return intent

    df = load_conditions()
    condition_lower = intent.condition.lower().strip()

    # Try exact match on condition_name first
    match = df[df["condition_name"].str.lower() == condition_lower]

    # If no exact match, search in aliases column
    if match.empty:
        mask = df["condition_aliases"].apply(
            lambda aliases: any(
                alias.strip().lower() in condition_lower or condition_lower in alias.strip().lower()
                for alias in str(aliases).split(",")
            )
        )
        match = df[mask]

    if not match.empty:
        row = match.iloc[0]
        # Only fill in values not already set by the LLM
        if not intent.procedure:
            intent.procedure = row["procedure_name"]
        if not intent.specialist:
            intent.specialist = row["specialist"]
        intent.speciality_keyword = row["speciality_keyword"]

    return intent
