from pathlib import Path

import joblib
import pandas as pd


# ============================================================
# FIND TRUSTFIELD PROJECT ROOT
# ============================================================

CURRENT_FILE = Path(__file__).resolve()

PROJECT_ROOT = None

for parent in CURRENT_FILE.parents:
    possible_model = parent / "ml" / "models" / "anomaly_detector.pkl"

    if possible_model.exists():
        PROJECT_ROOT = parent
        break


if PROJECT_ROOT is None:
    raise FileNotFoundError(
        "Could not find anomaly_detector.pkl anywhere above predict.py"
    )


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "anomaly_detector.pkl"
)


print(f"Loading model from: {MODEL_PATH}")


# ============================================================
# LOAD MODEL
# ============================================================

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]

action_encoder = model_data["action_encoder"]
resource_encoder = model_data["resource_encoder"]
status_encoder = model_data["status_encoder"]

features = model_data["features"]


# ============================================================
# PREDICT ANOMALY
# ============================================================

def predict_anomaly(event: dict) -> dict:

    user_id = event.get("user_id", 0)

    action = str(
        event.get("action", "")
    )

    resource_type = str(
        event.get("resource_type", "")
    )

    status = str(
        event.get("status", "")
    )

    timestamp = event.get("timestamp")

    if timestamp is None:
        raise ValueError(
            "Event timestamp is required"
        )

    timestamp = pd.to_datetime(timestamp)

    hour = timestamp.hour


    # --------------------------------------------------------
    # Encode values
    # --------------------------------------------------------

    try:

        action_encoded = action_encoder.transform(
            [action]
        )[0]

        resource_encoded = resource_encoder.transform(
            [resource_type]
        )[0]

        status_encoded = status_encoder.transform(
            [status]
        )[0]

    except ValueError:

        return {
            "prediction": -1,
            "anomaly": True
        }


    # --------------------------------------------------------
    # Create features
    # --------------------------------------------------------

    input_data = pd.DataFrame(
        [[
            user_id,
            action_encoded,
            resource_encoded,
            status_encoded,
            hour
        ]],
        columns=features
    )


    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------

    prediction = model.predict(
        input_data
    )[0]


    return {
        "prediction": int(prediction),
        "anomaly": bool(prediction == -1)
    }