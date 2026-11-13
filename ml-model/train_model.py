
from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
from sklearn.model_selection import train_test_split


# Project paths
PROJECT_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_DIR / "data" / "release_history.csv"
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"


# Features used for prediction
FEATURES = [
    "files_changed",
    "total_changes",
    "impact_score",
    "auth_changed",
    "database_changed",
    "config_changed",
    "dependency_changed",
    "cicd_changed",
    "test_failures",
    "security_findings"
]

TARGET = "release_failed"


def train_model():

    print("\nLoading release history...")

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    data = pd.read_csv(DATA_PATH)

    # Check required columns
    required_columns = FEATURES + [TARGET]
    missing = [
        column for column in required_columns
        if column not in data.columns
    ]

    if missing:
        raise ValueError(
            f"Missing dataset columns: {missing}"
        )

    X = data[FEATURES]
    y = data[TARGET]

    if y.nunique() != 2:
        raise ValueError(
            "Dataset must contain both 0 and 1 outcomes."
        )

    print("Dataset loaded successfully!")
    print("Total releases:", len(data))
    print("Successful releases:", int((y == 0).sum()))
    print("Failed releases:", int((y == 1).sum()))

    # Split training and testing data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Create Random Forest model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42,
        class_weight="balanced"
    )

    print("\nTraining Random Forest model...")

    model.fit(X_train, y_train)

    # Evaluate model
    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print("\nModel training completed!")
    print("Accuracy:", round(accuracy * 100, 2), "%")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    # Save model and feature information together
    model_bundle = {
        "model": model,
        "features": FEATURES
    }

    joblib.dump(model_bundle, MODEL_PATH)

    print("\nModel saved successfully!")
    print("Location:", MODEL_PATH)


if __name__ == "__main__":
    train_model()
