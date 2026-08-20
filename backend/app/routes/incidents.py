from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentResponse


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


# ============================================================
# GET ALL INCIDENTS
# ============================================================

@router.get("/", response_model=list[IncidentResponse])
def get_incidents(
    db: Session = Depends(get_db)
):
    incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

    return incidents


# ============================================================
# GET INCIDENT BY ID
# ============================================================

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident


# ============================================================
# CREATE INCIDENT
# ============================================================

@router.post("/", response_model=IncidentResponse)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db)
):
    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        status=incident_data.status,
        user_id=incident_data.user_id
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/health")
def incidents_health():
    return {
        "status": "healthy",
        "module": "incidents"
    }