from app.core.database import SessionLocal
from app.models.log import Log


db = SessionLocal()

try:
    logs = (
        db.query(Log)
        .order_by(Log.timestamp.desc())
        .limit(10)
        .all()
    )

    print("\n================================")
    print("TRUSTFIELD DATABASE LOGS")
    print("================================")

    print(f"Total logs displayed: {len(logs)}")

    for log in logs:
        print("\n--------------------------------")
        print(f"ID: {log.id}")
        print(f"Username: {log.username}")
        print(f"Action: {log.action}")
        print(f"Resource: {log.resource_type}")
        print(f"Status: {log.status}")
        print(f"IP: {log.ip_address}")
        print(f"Timestamp: {log.timestamp}")

finally:
    db.close()