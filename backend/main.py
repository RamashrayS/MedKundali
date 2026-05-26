import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database.connection import engine, Base
from backend.routes import auth, reports, chat, user

# Auto-create all mapped PostgreSQL/SQLite database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Medical Kundali API",
    description="Intelligent clinical record digitization, Gemini summaries, and conversational assistance.",
    version="1.0.0"
)

# Set up CORS middleware to permit React developer portals and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage folder as static server so uploads load instantly
LOCAL_UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "storage", "uploads"))
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=LOCAL_UPLOAD_DIR), name="uploads")

# Include Modular API Routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(chat.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Medical Kundali MVP API Service",
        "documentation": "/docs"
    }
