import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os

print("Starting Professional AI Training Pipeline...")

# TRAIN XGBOOST On Real PIMA Data
try:
    df = pd.read_csv('diabetes.csv')
    print(f"Loaded PIMA Diabetes Dataset ({len(df)} records).")
    
    # Define input and target feature X,y
    # PIMA columns: Glucose, BloodPressure, BMI, Age, Outcome
    X = df[['Glucose', 'BloodPressure', 'BMI', 'Age']]
    y = df['Outcome']

    # Split Data (80% Training, 20% Testing)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    #Train XGBoost
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)

    # Validate
    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"XGBoost Model Trained. Validation Accuracy: {accuracy * 100:.2f}%")

    # Save Brain
    model.save_model("medical_xgboost.json")
    print("XGBoost Brain saved as 'medical_xgboost.json'.")

except FileNotFoundError:
    print("CRITICAL ERROR: 'diabetes.csv' not found. Please download it from Kaggle.")

# VERIFY BIOBERT
print("\nVerifying BioBERT availability...")
try:
    from transformers import pipeline
    print("Transformers Library is ready. BioBERT will auto-download in app.py")
except ImportError:
    print("Error: Transformers not installed. Run 'pip install transformers'")