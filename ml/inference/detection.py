from ml.inference.predict import predict_anomaly


print()
print("==========================================")
print("TRUSTFIELD ML ANOMALY DETECTION TEST")
print("==========================================")


# ------------------------------------------------------------
# TEST EVENT
# ------------------------------------------------------------

event = {
    "user_id": 1,
    "action": "READ",
    "resource_type": "users",
    "status": "success",
    "timestamp": "2026-08-24 10:30:00"
}


# ------------------------------------------------------------
# RUN PREDICTION
# ------------------------------------------------------------

try:

    result = predict_anomaly(event)

    print()
    print("Event:")
    print(event)

    print()
    print("Prediction:")
    print(result)

    print()
    print("==========================================")

    if result["anomaly"]:
        print("RESULT: ANOMALY DETECTED")
    else:
        print("RESULT: NORMAL EVENT")

    print("==========================================")

except Exception as e:

    print()
    print("==========================================")
    print("DETECTION FAILED")
    print("==========================================")
    print(e)