import os

import joblib
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "cloudtrail_logs.csv"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "anomaly_detector.pkl"
)


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"Dataset loaded: {len(df)} records")


# ============================================================
# FEATURE ENGINEERING
# ============================================================

print("Preparing features...")

# Convert status into numerical values
status_encoder = LabelEncoder()
df["status_encoded"] = status_encoder.fit_transform(
    df["status"].astype(str)
)


# Encode action
action_encoder = LabelEncoder()
df["action_encoded"] = action_encoder.fit_transform(
    df["action"].astype(str)
)


# Encode resource type
resource_encoder = LabelEncoder()
df["resource_encoded"] = resource_encoder.fit_transform(
    df["resource_type"].astype(str)
)


# Extract hour from timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

df["hour"] = df["timestamp"].dt.hour


# ============================================================
# SELECT FEATURES
# ============================================================

features = [
    "user_id",
    "action_encoded",
    "resource_encoded",
    "status_encoded",
    "hour"
]

X = df[features]


print("Features used:")
print(features)


# ============================================================
# TRAIN ISOLATION FOREST
# ============================================================

print("Training Isolation Forest...")

model = IsolationForest(
    n_estimators=200,
    contamination=0.15,
    random_state=42
)

model.fit(X)


# ============================================================
# SAVE MODEL
# ============================================================

os.makedirs(
    os.path.dirname(MODEL_PATH),
    exist_ok=True
)

joblib.dump(
    {
        "model": model,
        "action_encoder": action_encoder,
        "resource_encoder": resource_encoder,
        "status_encoder": status_encoder,
        "features": features
    },
    MODEL_PATH
)


print()
print("==========================================")
print("ML MODEL TRAINING COMPLETE")
print("==========================================")
print(f"Records used : {len(df)}")
print(f"Features      : {features}")
print(f"Model saved   : {MODEL_PATH}")
print("==========================================")