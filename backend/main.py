from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # Load .env before anything else

from routers.query import router as query_router
from utils.csv_loader import load_hospitals, load_procedures, load_conditions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load all CSV data into memory on startup."""
    print("🔄  Loading datasets into memory...")
    load_hospitals()
    load_procedures()
    load_conditions()
    print("✅  Datasets ready.")
    yield
    print("🛑  Shutting down.")


app = FastAPI(
    title="AI Healthcare Navigator API",
    description="Natural language hospital finder and treatment cost estimator for India.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative frontend port
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(query_router, tags=["Query"])


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "AI Healthcare Navigator"}


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "AI Healthcare Navigator API",
        "docs": "/docs",
        "health": "/health",
    }
