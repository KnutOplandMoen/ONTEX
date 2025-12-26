from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from alembic.config import Config
from alembic import command
import os

from app.core.config import settings
from app.db.database import engine, Base, get_db
from app.db.models import ClinicalTrial, TrialStatus
from app.admin.views import ClinicalTrialAdmin
from app.services.ingestion import run_daily_ingestion
from app.api.endpoints import router as api_router

# Initialize Scheduler
scheduler = AsyncIOScheduler()

def run_migrations():
    """Run Alembic migrations on startup"""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    command.upgrade(alembic_cfg, "head")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run database migrations
    run_migrations()
    
    # Add ingestion job to run every 24 hours
    scheduler.add_job(run_daily_ingestion, 'interval', hours=24)
    scheduler.start()
    
    yield
    
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title="Osteosarcoma Clinical Trial Explorer", lifespan=lifespan)

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
    "https://my-railway-url.app", # Replace with actual domain if known
    "*" # Allow all for simplicity in this context, refine for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Admin
admin = Admin(app, engine)
admin.add_view(ClinicalTrialAdmin)

# Include API Router
app.include_router(api_router, prefix="/api/v1")

@app.post("/api/v1/debug/run-ingestion")
async def debug_ingestion():
    await run_daily_ingestion()
    return {"status": "started"}

# Mount static files
# Only mount if the directory exists (it will in Docker, maybe not in local dev unless built)
static_dir = os.path.join(os.path.dirname(__file__), "static") # Assumes /app/static in docker
if not os.path.exists(static_dir):
    # Fallback for local development or if static dir is different
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Check if API request first (though API router handles matches before this if included first? No, path matches are tricky)
    # Actually, if we use app.mount for static, specific paths are handled.
    # The Catch-all should be last.
    
    if full_path.startswith("api"):
        return {"error": "API route not found"}
        
    # Serve index.html for SPA
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend not built or found at " + static_dir}
