from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.alerts import router as alerts_router
from app.routes.incidents import router as incidents_router
from app.routes.logs import router as logs_router
from app.routes.roles import router as roles_router
from app.routes.permission import router as permissions_router


app = FastAPI(
    title="TrustField API",
    description="AI-Based Detection and Prevention of Privilege Escalation in AWS Cloud",
    version="1.0.0"
)


# =========================
# CORS CONFIGURATION
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# API ROUTES
# =========================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(alerts_router)
app.include_router(incidents_router)
app.include_router(logs_router)
app.include_router(roles_router)
app.include_router(permissions_router)


# =========================
# ROOT ENDPOINT
# =========================

@app.get("/")
def home():
    return {
        "message": "Welcome to TrustField API",
        "status": "Running Successfully"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }