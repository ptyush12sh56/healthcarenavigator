import pandas as pd
from pathlib import Path
from functools import lru_cache

DATA_DIR = Path(__file__).parent.parent / "data"


@lru_cache(maxsize=1)
def load_hospitals() -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / "hospitals_dataset.csv", dtype={"id": str})
    # Normalise city names for case-insensitive matching
    df["city_lower"] = df["city"].str.lower().str.strip()
    df["specialities_lower"] = df["specialities"].str.lower()
    return df


@lru_cache(maxsize=1)
def load_procedures() -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / "procedures_dataset.csv")
    return df


@lru_cache(maxsize=1)
def load_conditions() -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / "condition_mapping_dataset.csv")
    return df
