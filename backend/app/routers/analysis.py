from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security import decrypt_text
from app.models.entry import Entry
from app.models.alert import Alert
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.analysis import AnalysisResult
from app.ml.predictor import predict

router = APIRouter(prefix="/analysis", tags=["analysis"])

ALERT_THRESHOLD = 0.65
BURNOUT_WINDOW = 7


@router.post("/entries/{entry_id}", response_model=AnalysisResult)
def analyze_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id, Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")

    text = decrypt_text(entry.content_encrypted)
    result = predict(text)

    entry.stress_score = result["stress"]
    entry.fatigue_score = result["fatigue"]
    entry.cynicism_score = result["cynicism"]
    entry.analyzed = True

    alert_triggered = False
    alert_type = alert_severity = message = None

    if result["stress"] > ALERT_THRESHOLD:
        alert_triggered = True
        alert_type = "stress"
        alert_severity = "high" if result["stress"] > 0.85 else "medium"
        message = "Se han detectado niveles elevados de estres. Considera tomar un descanso."

    elif result["fatigue"] > ALERT_THRESHOLD:
        alert_triggered = True
        alert_type = "fatigue"
        alert_severity = "medium"
        message = "Tu escritura muestra senales de fatiga cognitiva."

    elif result["cynicism"] > ALERT_THRESHOLD:
        alert_triggered = True
        alert_type = "cynicism"
        alert_severity = "medium"
        message = "Se detectan senales de cinismo. Habla con alguien de confianza."

    if alert_triggered:
        alert = Alert(
            user_id=current_user.id,
            alert_type=alert_type,
            severity=alert_severity,
            message=message,
        )
        db.add(alert)

    db.commit()

    return AnalysisResult(
        stress_score=result["stress"],
        fatigue_score=result["fatigue"],
        cynicism_score=result["cynicism"],
        alert_triggered=alert_triggered,
        alert_type=alert_type,
        alert_severity=alert_severity,
        message=message,
    )


@router.get("/alerts", tags=["alerts"])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(desc(Alert.created_at))
        .limit(20)
        .all()
    )
    return alerts