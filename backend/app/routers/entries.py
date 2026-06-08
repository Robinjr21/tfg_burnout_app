from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security import encrypt_text, decrypt_text
from app.models.entry import Entry
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.entry import EntryCreate, EntryResponse, EntryListResponse

router = APIRouter(prefix="/entries", tags=["entries"])


def _to_response(entry: Entry) -> EntryResponse:
    """Convierte un ORM Entry a schema, descifrando el contenido."""
    data = {
        "id": entry.id,
        "content": decrypt_text(entry.content_encrypted),
        "stress_score": entry.stress_score,
        "fatigue_score": entry.fatigue_score,
        "cynicism_score": entry.cynicism_score,
        "analyzed": entry.analyzed,
        "word_count": entry.word_count,
        "created_at": entry.created_at,
    }
    return EntryResponse(**data)


@router.post("/", response_model=EntryResponse, status_code=201)
def create_entry(
    payload: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = Entry(
        user_id=current_user.id,
        content_encrypted=encrypt_text(payload.content),
        word_count=len(payload.content.split()),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_response(entry)


@router.get("/", response_model=EntryListResponse)
def list_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(Entry).filter(Entry.user_id == current_user.id).count()
    entries = (
        db.query(Entry)
        .filter(Entry.user_id == current_user.id)
        .order_by(desc(Entry.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return EntryListResponse(entries=[_to_response(e) for e in entries], total=total)


@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id, Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    return _to_response(entry)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id, Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    db.delete(entry)
    db.commit()