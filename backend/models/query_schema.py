from pydantic import BaseModel
from typing import Optional, List


# ── Inbound ──────────────────────────────────────────────────────────────────

class UserQuery(BaseModel):
    query: str


# ── Internal pipeline objects ─────────────────────────────────────────────────

class ParsedIntent(BaseModel):
    raw_query: str
    condition: Optional[str] = None
    procedure: Optional[str] = None
    specialist: Optional[str] = None
    city: Optional[str] = None
    budget_inr: Optional[float] = None
    speciality_keyword: Optional[str] = None


# ── Outbound ──────────────────────────────────────────────────────────────────

class HospitalResult(BaseModel):
    id: str
    name: str
    city: str
    state: str
    address: str
    category: str
    rating: float
    specialities: str
    accreditation: Optional[str] = None
    available_beds: Optional[int] = None
    contact: Optional[str] = None
    cost: Optional[float] = None
    distance: Optional[float] = None
    speciality: Optional[str] = None


class FinalResponse(BaseModel):
    condition: Optional[str] = None
    procedure: Optional[str] = None
    specialist: Optional[str] = None
    estimated_cost_min: Optional[float] = None
    estimated_cost_max: Optional[float] = None
    estimated_cost_label: Optional[str] = None
    budget_feasible: Optional[bool] = None
    ai_summary: Optional[str] = None
    hospitals: List[HospitalResult] = []
    query_city: Optional[str] = None
    total_found: int = 0
