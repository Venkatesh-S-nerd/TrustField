import os
import joblib


# Path to trained anomaly detection model
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "anomaly_detector.pkl"
)


# Load model once when the application starts
model = joblib.load(MODEL_PATH)


def predict_anomaly(event: dict) -> dict:
    """
    Predict whether a CloudTrail/security event is anomalous.

    Returns:
        {
            "prediction": int,
            "anomaly": bool
        }
    """

    # Convert event into the feature format
    # expected by the trained model.
    features = [[
        event.get("user_id", 0),
        event.get("action", ""),
        event.get("resource_type", ""),
        event.get("status", ""),
    ]]

    prediction = model.predict(features)[0]

    return {
        "prediction": int(prediction),
        "anomaly": prediction == -1
    }