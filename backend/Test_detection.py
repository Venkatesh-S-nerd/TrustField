from app.core.database import SessionLocal
from app.services.detection_service import analyze_recent_logs


db = SessionLocal()

try:
    result = analyze_recent_logs(
        db=db,
        limit=20
    )

    print("\n================================")
    print("TRUSTFIELD DETECTION ENGINE")
    print("================================")

    print(f"Total analyzed: {result['total_analyzed']}")
    print(f"Suspicious: {result['suspicious_count']}")
    print(f"ML anomalies: {result['ml_anomalies']}")

    for detection in result["detections"]:

        print("\n--------------------------------")
        print(f"Username: {detection['username']}")
        print(f"Action: {detection['action']}")
        print(f"Resource: {detection['resource_type']}")
        print(f"Risk Score: {detection['risk_score']}")
        print(f"Risk Level: {detection['risk_level']}")
        print(f"Suspicious: {detection['suspicious']}")

        print("Reasons:")

        for reason in detection["reasons"]:
            print(f"  - {reason}")

finally:
    db.close()