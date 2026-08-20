from sqlalchemy.orm import Session

from app.models.log import Log
from app.models.incident import Incident


# ============================================================
# RISK LEVELS
# ============================================================

RISK_LOW = "LOW"
RISK_MEDIUM = "MEDIUM"
RISK_HIGH = "HIGH"
RISK_CRITICAL = "CRITICAL"


# ============================================================
# SUSPICIOUS ACTIONS
# ============================================================

HIGH_RISK_ACTIONS = {
    "DELETE",
    "UPDATE",
    "GRANT",
    "ASSUME_ROLE",
    "CREATE_USER",
    "DELETE_USER",
    "CHANGE_ROLE",
}


CRITICAL_ACTIONS = {
    "GRANT_ADMIN",
    "CREATE_ADMIN",
    "ESCALATE_PRIVILEGE",
    "ASSUME_ADMIN_ROLE",
}


# ============================================================
# ANALYZE SINGLE LOG
# ============================================================

def analyze_log(log: Log) -> dict:

    action = (log.action or "").upper()
    resource_type = (log.resource_type or "").lower()
    status = (log.status or "").lower()

    risk_score = 0
    reasons = []

    # --------------------------------------------------------
    # FAILED / DENIED ACTIVITY
    # --------------------------------------------------------

    if status in {"denied", "failed", "failure"}:
        risk_score += 20

        reasons.append(
            "Permission denied or failed activity detected"
        )

    # --------------------------------------------------------
    # HIGH-RISK ACTION
    # --------------------------------------------------------

    if action in HIGH_RISK_ACTIONS:
        risk_score += 40

        reasons.append(
            f"High-risk action detected: {action}"
        )

    # --------------------------------------------------------
    # CRITICAL ACTION
    # --------------------------------------------------------

    if action in CRITICAL_ACTIONS:
        risk_score += 70

        reasons.append(
            f"Critical privilege action detected: {action}"
        )

    # --------------------------------------------------------
    # PRIVILEGE-RELATED RESOURCE
    # --------------------------------------------------------

    privilege_resources = {
        "role",
        "roles",
        "permission",
        "permissions",
        "iam",
    }

    if resource_type in privilege_resources:
        risk_score += 25

        reasons.append(
            "IAM or privilege-related resource accessed"
        )

    # --------------------------------------------------------
    # HIGH-RISK ACTION + PRIVILEGE RESOURCE
    # --------------------------------------------------------

    if (
        action in HIGH_RISK_ACTIONS
        and resource_type in privilege_resources
    ):
        risk_score += 20

        reasons.append(
            "High-risk action performed against "
            "privilege-related resource"
        )

    # --------------------------------------------------------
    # CAP SCORE
    # --------------------------------------------------------

    risk_score = min(risk_score, 100)

    # --------------------------------------------------------
    # DETERMINE RISK LEVEL
    # --------------------------------------------------------

    if risk_score >= 80:
        risk_level = RISK_CRITICAL

    elif risk_score >= 60:
        risk_level = RISK_HIGH

    elif risk_score >= 30:
        risk_level = RISK_MEDIUM

    else:
        risk_level = RISK_LOW

    # --------------------------------------------------------
    # NO SUSPICIOUS BEHAVIOR
    # --------------------------------------------------------

    if not reasons:
        reasons.append(
            "No suspicious privilege activity detected"
        )

    return {
        "log_id": log.id,
        "user_id": log.user_id,
        "username": log.username,
        "action": log.action,
        "resource_type": log.resource_type,
        "status": log.status,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "suspicious": risk_score >= 60,
        "reasons": reasons,
    }


# ============================================================
# CREATE INCIDENT FROM DETECTION
# ============================================================

def create_incident_from_detection(
    db: Session,
    detection: dict
) -> Incident | None:

    # Only HIGH and CRITICAL detections create incidents
    if not detection["suspicious"]:
        return None

    log_id = detection["log_id"]

    # Prevent duplicate incidents for the same log
    existing_incident = (
        db.query(Incident)
        .filter(Incident.log_id == log_id)
        .first()
    )

    if existing_incident:
        return existing_incident

    severity = detection["risk_level"]

    title = (
        f"Privilege Escalation Detected - "
        f"{detection['action']}"
    )

    description = (
        f"Suspicious activity detected for user "
        f"'{detection['username']}'. "
        f"Action: {detection['action']}. "
        f"Resource: {detection['resource_type']}. "
        f"Risk score: {detection['risk_score']}. "
        f"Reasons: {'; '.join(detection['reasons'])}"
    )

    incident = Incident(
        title=title,
        description=description,
        severity=severity,
        status="OPEN",
        user_id=detection["user_id"],
        log_id=log_id,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


# ============================================================
# ANALYZE RECENT LOGS
# ============================================================

def analyze_recent_logs(
    db: Session,
    limit: int = 100
) -> dict:

    logs = (
        db.query(Log)
        .order_by(Log.timestamp.desc())
        .limit(limit)
        .all()
    )

    detections = []

    for log in logs:

        detection = analyze_log(log)

        detections.append(detection)

        # Automatically create incident
        create_incident_from_detection(
            db=db,
            detection=detection
        )

    return {
        "detections": detections,
        "total_analyzed": len(detections),
        "suspicious_count": sum(
            1
            for detection in detections
            if detection["suspicious"]
        ),
    }


# ============================================================
# GET SUSPICIOUS ACTIVITY
# ============================================================

def get_suspicious_logs(
    db: Session,
    limit: int = 100
) -> list[dict]:

    results = analyze_recent_logs(
        db=db,
        limit=limit
    )

    return [
        detection
        for detection in results["detections"]
        if detection["suspicious"]
    ]