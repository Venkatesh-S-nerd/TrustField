from sqlalchemy.orm import Session

from app.models.log import Log


# ============================================================
# BEHAVIOR RISK LEVELS
# ============================================================

BEHAVIOR_LOW = "LOW"
BEHAVIOR_MEDIUM = "MEDIUM"
BEHAVIOR_HIGH = "HIGH"
BEHAVIOR_CRITICAL = "CRITICAL"


# ============================================================
# BEHAVIOR ANALYSIS
# ============================================================

def analyze_user_behavior(
    db: Session,
    user_id: int,
    limit: int = 20
) -> dict:
    """
    Analyze recent activity performed by a single user.

    The purpose of this service is to detect suspicious
    behavioral patterns rather than analyzing only one log.
    """

    logs = (
        db.query(Log)
        .filter(Log.user_id == user_id)
        .order_by(Log.timestamp.desc())
        .limit(limit)
        .all()
    )

    if not logs:
        return {
            "user_id": user_id,
            "behavior_score": 0,
            "behavior_level": BEHAVIOR_LOW,
            "suspicious": False,
            "patterns": [],
            "analyzed_logs": 0
        }

    score = 0
    patterns = []

    # ========================================================
    # PATTERN 1: REPEATED DENIED ACTIONS
    # ========================================================

    denied_logs = [
        log
        for log in logs
        if (log.status or "").lower() in {
            "denied",
            "failed",
            "failure"
        }
    ]

    denied_count = len(denied_logs)

    if denied_count >= 2:
        score += 20

        patterns.append(
            f"Repeated denied activity detected: "
            f"{denied_count} denied attempts"
        )

    if denied_count >= 4:
        score += 20

        patterns.append(
            "Multiple permission failures indicate "
            "possible privilege probing"
        )

    # ========================================================
    # PATTERN 2: PRIVILEGED ACTIONS
    # ========================================================

    privileged_actions = {
        "CHANGE_ROLE",
        "GRANT",
        "GRANT_ADMIN",
        "CREATE_ADMIN",
        "ESCALATE_PRIVILEGE",
        "ASSUME_ROLE",
        "ASSUME_ADMIN_ROLE",
        "DELETE_USER",
        "CREATE_USER"
    }

    privileged_logs = [
        log
        for log in logs
        if (log.action or "").upper()
        in privileged_actions
    ]

    privileged_count = len(privileged_logs)

    if privileged_count >= 2:
        score += 25

        patterns.append(
            f"Multiple privileged actions detected: "
            f"{privileged_count}"
        )

    # ========================================================
    # PATTERN 3: DENIED ACCESS FOLLOWED BY PRIVILEGED ACTION
    # ========================================================

    if denied_count > 0 and privileged_count > 0:

        score += 25

        patterns.append(
            "Privileged activity occurred alongside "
            "previous denied access attempts"
        )

    # ========================================================
    # PATTERN 4: ROLE CHANGE ATTEMPTS
    # ========================================================

    role_change_logs = [
        log
        for log in logs
        if (log.action or "").upper()
        in {
            "CHANGE_ROLE",
            "GRANT",
            "ESCALATE_PRIVILEGE",
            "ASSUME_ROLE"
        }
    ]

    if role_change_logs:

        score += 15

        patterns.append(
            "User attempted privilege or role modification"
        )

    # ========================================================
    # PATTERN 5: RAPID PRIVILEGE PROBING
    # ========================================================

    if denied_count >= 3 and privileged_count >= 1:

        score += 20

        patterns.append(
            "Behavior suggests possible privilege probing "
            "followed by privileged activity"
        )

    # ========================================================
    # CAP SCORE
    # ========================================================

    score = min(score, 100)

    # ========================================================
    # DETERMINE BEHAVIOR LEVEL
    # ========================================================

    if score >= 80:
        level = BEHAVIOR_CRITICAL

    elif score >= 60:
        level = BEHAVIOR_HIGH

    elif score >= 30:
        level = BEHAVIOR_MEDIUM

    else:
        level = BEHAVIOR_LOW

    # ========================================================
    # NO SUSPICIOUS BEHAVIOR
    # ========================================================

    if not patterns:
        patterns.append(
            "No suspicious behavioral pattern detected"
        )

    return {
        "user_id": user_id,
        "behavior_score": score,
        "behavior_level": level,
        "suspicious": score >= 60,
        "patterns": patterns,
        "analyzed_logs": len(logs)
    }


# ============================================================
# ANALYZE ALL ACTIVE USERS
# ============================================================

def analyze_all_user_behavior(
    db: Session,
    limit: int = 20
) -> list[dict]:
    """
    Analyze recent behavior for every user that has
    activity logs.
    """

    user_ids = (
        db.query(Log.user_id)
        .filter(Log.user_id.isnot(None))
        .distinct()
        .all()
    )

    results = []

    for row in user_ids:

        user_id = row[0]

        result = analyze_user_behavior(
            db=db,
            user_id=user_id,
            limit=limit
        )

        results.append(result)

    return results


# ============================================================
# GET SUSPICIOUS USER BEHAVIOR
# ============================================================

def get_suspicious_behavior(
    db: Session,
    limit: int = 20
) -> list[dict]:
    """
    Return only users whose recent behavior is
    classified as HIGH or CRITICAL.
    """

    results = analyze_all_user_behavior(
        db=db,
        limit=limit
    )

    return [
        result
        for result in results
        if result["suspicious"]
    ]