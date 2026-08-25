from pathlib import Path
import joblib
import pandas as pd


# Find the TrustField project root
PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "anomaly_detector.pkl"

print(f"MODEL PATH: {MODEL_PATH}")


# Load model
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found at: {MODEL_PATH}"
    )

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]
action_encoder = model_data["action_encoder"]
resource_encoder = model_data["resource_encoder"]
status_encoder = model_data["status_encoder"]

features = model_data["features"]


def predict_anomaly(event: dict) -> dict:

    user_id = event.get("user_id", 0)
    action = str(event.get("action", ""))
    resource_type = str(event.get("resource_type", ""))
    status = str(event.get("status", ""))

    timestamp = event.get("timestamp")

    if timestamp is None:
        raise ValueError("timestamp is required")

    timestamp = pd.to_datetime(timestamp)

    hour = timestamp.hour

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

    prediction = model.predict(input_data)[0]

    return {
        "prediction": int(prediction),
        "anomaly": bool(prediction == -1)
    }
