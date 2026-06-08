import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Entry(Base):
    __tablename__ = "entries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    # Texto cifrado con AES-256-GCM (nunca se guarda en claro)
    content_encrypted: Mapped[str] = mapped_column(String(10000), nullable=False)

    # Resultados del análisis de IA (se rellenan después)
    stress_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    fatigue_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    cynicism_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    analyzed: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    word_count: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship("User", back_populates="entries")