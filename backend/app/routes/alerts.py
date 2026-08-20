from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.detection_service import (
    analyze_recent_logs,
    get_suspicious_logs
)

from app.services.behavior_detection_service import (
    analyze_user_behavior,
    analyze_all_user_behavior,
    get_suspicious_behavior
)


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


# ============================================================
# PRIVILEGE ESCALATION DETECTION
# ============================================================

@router.get("/detect")
def detect_activity(
    db: Session = Depends(get_db)
):
    """
    Analyze recent logs and automatically create
    incidents for HIGH and CRITICAL detections.
    """

    return analyze_recent_logs(
        db=db,
        limit=100
    )


# ============================================================
# SUSPICIOUS PRIVILEGE ACTIVITY
# ============================================================

@router.get("/suspicious")
def get_suspicious_activity(
    db: Session = Depends(get_db)
):
    """
    Return high-risk and critical privilege activity.
    """

    return get_suspicious_logs(
        db=db,
        limit=100
    )


# ============================================================
# USER BEHAVIOR ANALYSIS
# ============================================================

@router.get("/behavior")
def detect_user_behavior(
    db: Session = Depends(get_db)
):
    """
    Analyze behavioral patterns for all users.
    """

    return analyze_all_user_behavior(
        db=db,
        limit=20
    )


# ============================================================
# SUSPICIOUS USER BEHAVIOR
# ============================================================

@router.get("/behavior/suspicious")
def suspicious_user_behavior(
    db: Session = Depends(get_db)
):
    """
    Return users showing HIGH or CRITICAL behavioral risk.
    """

    return get_suspicious_behavior(
        db=db,
        limit=20
    )


# ============================================================
# SINGLE USER BEHAVIOR
# ============================================================

@router.get("/behavior/{user_id}")
def user_behavior(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Analyze behavioral patterns for a specific user.
    """

    return analyze_user_behavior(
        db=db,
        user_id=user_id,
        limit=20
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/health")
def alerts_health():
    """
    Check whether the alerts service is running.
    """

    return {
        "status": "Alerts service is healthy"
    }