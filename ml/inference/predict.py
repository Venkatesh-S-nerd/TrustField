import os

import joblib
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "anomaly_detector.pkl"
)


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"ML model not found at: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


# ============================================================
# PREDICT ANOMALY
# ============================================================

def predict_anomaly(data):

    """
    Predict whether a log/activity is anomalous.

    Expected input:

    {
        "user_id": 2,
        "action": "CHANGE_ROLE",
        "resource_type": "users",
        "status": "denied",
        "timestamp": "2026-08-20T13:03:00"
    }
    """

    bundle = load_model()

    model = bundle["model"]

    action_encoder = bundle["action_encoder"]
    resource_encoder = bundle["resource_encoder"]
    status_encoder = bundle["status_encoder"]

    features = bundle["features"]


    # ========================================================
    # CONVERT INPUT TO DATAFRAME
    # ========================================================

    if isinstance(data, dict):
        data = pd.DataFrame([data])

    else:
        data = data.copy()


    # ========================================================
    # PREPARE TIMESTAMP
    # ========================================================

    data["timestamp"] = pd.to_datetime(
        data["timestamp"]
    )

    data["hour"] = data["timestamp"].dt.hour


    # ========================================================
    # ENCODE CATEGORICAL FEATURES
    # ========================================================

    try:

        data["action_encoded"] = action_encoder.transform(
            data["action"].astype(str)
        )

        data["resource_encoded"] = resource_encoder.transform(
            data["resource_type"].astype(str)
        )

        data["status_encoded"] = status_encoder.transform(
            data["status"].astype(str)
        )

    except ValueError as error:

        raise ValueError(
            "Input contains a value that was not present "
            "during model training. "
            f"Details: {error}"
        )


    # ========================================================
    # SELECT SAME FEATURES USED DURING TRAINING
    # ========================================================

    X = data[features]


    # ========================================================
    # RUN MODEL
    # ========================================================

    prediction = model.predict(X)


    # ========================================================
    # CONVERT RESULT
    # ========================================================

    results = []

    for value in prediction:

        results.append({
            "prediction": int(value),
            "anomaly": bool(value == -1)
        })


    # ========================================================
    # SINGLE RECORD
    # ========================================================

    if len(results) == 1:
        return results[0]


    return results