from app.core.database import SessionLocal
from app.services.detection_service import analyze_recent_logs


print()
print("==========================================")
print("TRUSTFIELD DETECTION SERVICE TEST")
print("==========================================")


db = SessionLocal()

try:

    result = analyze_recent_logs(
        db=db,
        limit=10
    )

    print()
    print("Total logs analyzed:")
    print(result["total_analyzed"])

    print()
    print("Suspicious logs:")
    print(result["suspicious_count"])

    print()
    print("ML anomalies:")
    print(result["ml_anomalies"])

    print()
    print("==========================================")
    print("DETECTION PIPELINE SUCCESSFUL")
    print("==========================================")

    print()

    for detection in result["detections"]:

        print("------------------------------------------")

        print(
            f"User: {detection['username']}"
        )

        print(
            f"Action: {detection['action']}"
        )

        print(
            f"Resource: {detection['resource_type']}"
        )

        print(
            f"Risk Score: {detection['risk_score']}"
        )

        print(
            f"Risk Level: {detection['risk_level']}"
        )

        print(
            f"ML Prediction: {detection['ml_prediction']}"
        )

        print(
            f"ML Anomaly: {detection['ml_anomaly']}"
        )

        print(
            f"Suspicious: {detection['suspicious']}"
        )

        print(
            f"Reasons: {detection['reasons']}"
        )

finally:

    db.close()