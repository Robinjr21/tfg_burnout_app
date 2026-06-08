from pydantic import BaseModel
from typing import Optional


class AnalysisResult(BaseModel):
    stress_score: float
    fatigue_score: float
    cynicism_score: float
    alert_triggered: bool
    alert_type: Optional[str] = None
    alert_severity: Optional[str] = None
    message: Optional[str] = None