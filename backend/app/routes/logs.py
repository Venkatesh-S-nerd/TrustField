from datetime import datetime

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.log import Log
from app.routes.users import get_current_user
from app.models.user import User
from app.services.log_service import get_logs


router = APIRouter(
    prefix="/logs",
    tags=["Logs"]
)


# ============================================================
# CREATE LOG REQUEST
# ============================================================

class LogCreate(BaseModel):
    action: str
    resource_type: str
    resource_id: int | None = None
    status: str = "success"
    ip_address: str | None = None
    details: str | None = None


# ============================================================
# CREATE ACTIVITY LOG
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create_log(
    log_data: LogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create an activity log for the authenticated user.
    """

    new_log = Log(
        user_id=current_user.id,
        username=current_user.username,
        action=log_data.action,
        resource_type=log_data.resource_type,
        resource_id=log_data.resource_id,
        status=log_data.status,
        ip_address=log_data.ip_address,
        details=log_data.details,
        timestamp=datetime.utcnow()
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


# ============================================================
# GET ALL LOGS
# ============================================================

@router.get("/")
def get_all_logs(
    db: Session = Depends(get_db)
):
    """
    Retrieve recent activity logs.
    """

    logs = get_logs(db)

    return logs


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/health")
def logs_health():
    """
    Check whether the logs service is running.
    """

    return {
        "status": "Logs service is healthy"
    }