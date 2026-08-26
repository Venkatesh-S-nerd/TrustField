from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.detection_service import (
    analyze_recent_logs,
    get_suspicious_logs,
)


router = APIRouter(
    prefix="/detection",
    tags=["Detection"]
)


# ============================================================
# ANALYZE RECENT LOGS
# ============================================================

@router.get("/analyze")
def analyze_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Analyze recent activity logs for privilege escalation.

    Returns:
    - total logs analyzed
    - suspicious log count
    - ML anomaly count
    - detailed detection results
    """

    return analyze_recent_logs(
        db=db,
        limit=limit
    )


# ============================================================
# GET SUSPICIOUS LOGS
# ============================================================

@router.get("/suspicious")
def suspicious_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Return only logs that have been classified
    as suspicious.
    """

    results = get_suspicious_logs(
        db=db,
        limit=limit
    )

    return {
        "count": len(results),
        "detections": results
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/health")
def detection_health():
    """
    Check whether the detection API is running.
    """

    return {
        "status": "Detection service is healthy"
    }