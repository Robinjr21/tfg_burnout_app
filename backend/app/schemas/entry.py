from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class EntryCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("La entrada no puede estar vacia")
        if len(v) > 5000:
            raise ValueError("La entrada no puede superar los 5000 caracteres")
        return v


class EntryResponse(BaseModel):
    id: str
    content: str
    stress_score: Optional[float]
    fatigue_score: Optional[float]
    cynicism_score: Optional[float]
    analyzed: bool
    word_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class EntryListResponse(BaseModel):
    entries: list[EntryResponse]
    total: int