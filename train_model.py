import pandas as pd
import xgboost as xgb
import os
from sklearn.preprocessing import LabelEncoder

print("Loading CSV files...")
encounters = pd.read_csv('encounters.csv')
patients = pd.read_csv('patients.csv')

print(f"Loaded: {len(encounters)} encounters and {len(patients)} patients.")
#merge from dataset
df = pd.merge(encounters, patients, left_on='PATIENT', right_on='Id', how='left')

#selecting output colum
target_col = 'TOTAL_CLAIM_COST' 
if target_col not in df.columns:
    target_col = 'Total Claim Cost'
df = df[['BIRTHDATE', 'GENDER', 'ENCOUNTERCLASS', target_col]].dropna()

#preprocessing
# Convert Birthdate to Age
df['BIRTHDATE'] = pd.to_datetime(df['BIRTHDATE'])
df['AGE'] = 2022 - df['BIRTHDATE'].dt.year

# Convert Text to Numbers (Male/Female-0,1)
le_gender = LabelEncoder()
le_class = LabelEncoder()

df['GENDER'] = le_gender.fit_transform(df['GENDER'].astype(str))
df['ENCOUNTERCLASS'] = le_class.fit_transform(df['ENCOUNTERCLASS'].astype(str))

#training
X = df[['AGE', 'GENDER', 'ENCOUNTERCLASS']]
y = df[target_col]

print("Training Risk Model...")
model = xgb.XGBRegressor(objective='reg:squarederror')
model.fit(X, y)

#model save
if not os.path.exists('models'):
    os.makedirs('models')

model.save_model('models/risk_model.json')
print("Model saved to models/risk_model.json")