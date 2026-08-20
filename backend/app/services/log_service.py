from sqlalchemy.orm import Session

from app.models.log import Log


def create_log(
    db: Session,
    user_id: int | None,
    username: str | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    status: str = "success",
    ip_address: str | None = None,
    details: str | None = None
) -> Log:
    """
    Create and store an activity log.
    """

    new_log = Log(
        user_id=user_id,
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        status=status,
        ip_address=ip_address,
        details=details
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


def get_logs(
    db: Session,
    limit: int = 100
) -> list[Log]:
    """
    Retrieve recent activity logs.
    """

    return (
        db.query(Log)
        .order_by(Log.timestamp.desc())
        .limit(limit)
        .all()
    )