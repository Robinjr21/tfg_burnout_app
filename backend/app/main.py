from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.models import user, entry, alert
from app.routers import auth, entries, analysis

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Burnout Journal API",
    description="Backend del diario emocional con deteccion de burnout",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/v1")
app.include_router(entries.router,  prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "version": "0.1.0"}

@app.get("/")
def root():
    return {"mensaje": "¡API del Burnout Journal funcionando correctamente!"}