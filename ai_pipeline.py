import pytesseract
from PIL import Image
import re
import os

POSSIBLE_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"D:\Tesseract-OCR\tesseract.exe"
]

for path in POSSIBLE_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

# OCR funcrtion- read document and convert to string
#cleaning the ocr noise
def perform_ocr(image_path):
    img = Image.open(image_path).convert("L")
    text = pytesseract.image_to_string(img, config='--oem 3 --psm 6')

    text = re.sub(r'[^a-zA-Z0-9./:%\s-]', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    return text.strip()

# understand and take lab values from thr document
def extract_lab_values(text):
    PARAMETERS = {
        "Hemoglobin": ["hemoglobin", "hb"],
        "WBC": ["wbc"],
        "RBC": ["rbc"],
        "Platelets": ["platelet"],
        "Sodium": ["sodium", "na"],
        "Potassium": ["potassium", "k"],
        "Urea": ["urea"],
        "Creatinine": ["creatinine"],
        "Glucose": ["glucose", "sugar"]
    }

    values = {}
    words = text.lower().split()

    for i, word in enumerate(words):
        for test, keywords in PARAMETERS.items():
            if word in keywords:
                for j in range(i + 1, min(i + 6, len(words))):
                    if re.match(r'^\d+(\.\d+)?$', words[j]):
                        values[test] = float(words[j])
                        break

    return values



# standard med report normal ranges
NORMAL_RANGES = {
    "Hemoglobin": (13.0, 17.0),
    "WBC": (4000, 11000),
    "RBC": (4.5, 5.9),
    "Platelets": (150000, 450000),
    "Sodium": (135, 145),
    "Potassium": (3.5, 5.1),
    "Urea": (15, 40),
    "Creatinine": (0.6, 1.3),
    "Glucose": (70, 140)
}

# REPORT TYPE DETECTION
def detect_report_type(text):
    t = text.lower()

    if "hemoglobin" in t or "wbc" in t:
        return "Complete Blood Count (CBC)"
    elif "creatinine" in t or "urea" in t:
        return "Renal Function Test"
    elif "bilirubin" in t:
        return "Liver Function Test"
    else:
        return "General Laboratory Report"

# interpretation of report 
def interpret_lab_results(values):
    findings = []
    explanations = []

    for test, value in values.items():
        if test not in NORMAL_RANGES:
            continue

        low, high = NORMAL_RANGES[test]

        if value < low:
            findings.append(f"{test}: {value} (Low)")
            explanations.append(f"{test} is below normal range suggesting deficiency or chronic condition.")

        elif value > high:
            findings.append(f"{test}: {value} (High)")
            explanations.append(f"{test} is elevated suggesting infection, inflammation, or metabolic imbalance.")

        else:
            findings.append(f"{test}: {value} (Normal)")

    return findings, explanations

# MAIN FUNCTION
def analyze_medical_report_local(path, age, gender):
    try:
        raw_text = perform_ocr(path)

        lab_values = extract_lab_values(raw_text)
        findings, explanations = interpret_lab_results(lab_values)

        report_type = detect_report_type(raw_text)

        abnormal_count = len(explanations)

        if abnormal_count >= 4:
            risk_level = "High Clinical Attention Needed"
            cost = 3000 + abnormal_count * 250
        elif abnormal_count >= 2:
            risk_level = "Moderate Monitoring Advised"
            cost = 1500 + abnormal_count * 200
        elif abnormal_count == 1:
            risk_level = "Mild Variation"
            cost = 800
        else:
            risk_level = "Normal"
            cost = 500

        severity_score = min(abnormal_count * 25, 100)

        if explanations:
            synopsis = "The report indicates: " + " ".join(explanations)
        else:
            synopsis = "All measured laboratory parameters are within normal limits."

        diagnosis_html = (
            "<b>Detected Clinical Parameters:</b><br>" +
            "<br>".join([f"• {f}" for f in findings])
        ) if findings else "No measurable values detected."

        reference_ranges = {
            test: f"{NORMAL_RANGES[test][0]} - {NORMAL_RANGES[test][1]}"
            for test in lab_values if test in NORMAL_RANGES
        }

        return {
            "synopsis": synopsis,
            "diagnosis": diagnosis_html,
            "risk_level": risk_level,
            "estimated_cost": cost,
            "chart_labels": list(lab_values.keys()),
            "chart_values": list(lab_values.values()),
            "reference_ranges": reference_ranges,
            "severity_score": severity_score,
            "report_type": report_type
        }

    except Exception as e:
        return {"synopsis": "System Error", "diagnosis": str(e)}
