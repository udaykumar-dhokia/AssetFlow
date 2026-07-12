"""
AssetFlow AI microservice entrypoint.

Run from the app/ folder:
    uvicorn main:app --reload

This keeps import style consistent with scripts/ (services.xxx, not
app.services.xxx) since app/ is the working directory either way.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import chat, health

app = FastAPI(title="AssetFlow AI Module", version="0.1.0")

# Wide-open CORS for the hackathon: the frontend team's app runs on a
# different origin/port and needs to call this service directly. Tighten
# this to specific origins before anything resembling production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)