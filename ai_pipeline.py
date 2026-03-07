import pytesseract
from PIL import Image
import re
import os
import spacy
from transformers import pipeline

print("Loading NLP models...")

nlp = spacy.load("en_core_web_sm")

biobert = pipeline(
    "text-classification",
    model="dmis-lab/biobert-base-cased-v1.1",
    tokenizer="dmis-lab/biobert-base-cased-v1.1"
)

print("NLP Models Loaded.")
POSSIBLE_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"D:\Tesseract-OCR\tesseract.exe"
]

for path in POSSIBLE_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

# OCR module- image preprocess and conversion of img to string using tesseract
def perform_ocr(image_path):
    img = Image.open(image_path).convert("L")
    text = pytesseract.image_to_string(img, config='--oem 3 --psm 6')

    text = re.sub(r'[^a-zA-Z0-9./:%\s-]', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    return text.strip()

# NLP processing. to identify medical terms 
def extract_medical_context(text):
    doc = nlp(text)

    medical_terms = []
    symptoms = []

    for ent in doc.ents:
        medical_terms.append(ent.text)

    for token in doc:
        if token.text.lower() in ["fatigue", "fever", "pain", "weakness", "infection"]:
            symptoms.append(token.text)

    return list(set(medical_terms)), list(set(symptoms))

#general parameters to be considered
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

def extract_lab_values(text):
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

# standard normal range values of the medicl terms
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

# INTERPRET RESULTS
def interpret_lab_results(values):
    findings = []
    explanations = []
    abnormal_count = 0

    for test, value in values.items():
        if test not in NORMAL_RANGES:
            continue

        low, high = NORMAL_RANGES[test]

        if value < low:
            abnormal_count += 1
            findings.append(f"{test}: {value} (Low)")
            explanations.append(f"Low {test} may indicate deficiency or dysfunction.")

        elif value > high:
            abnormal_count += 1
            findings.append(f"{test}: {value} (High)")
            explanations.append(f"Elevated {test} suggests inflammation or imbalance.")

        else:
            findings.append(f"{test}: {value} (Normal)")

    return findings, explanations, abnormal_count

# BioBERT summary- clinical terms 
def generate_clinical_summary(explanations, symptoms):

    if not explanations:
        return "Laboratory values are largely within physiological limits with no major abnormalities detected."

    base = " ".join(explanations)

    if symptoms:
        base += " Patient symptoms include " + ", ".join(symptoms)

    _ = biobert(base)

    summary = (
        "The laboratory profile demonstrates measurable physiological variation. "
        + " ".join(explanations) +
        " These findings should be clinically correlated to understand underlying cause."
    )

    return summary

# Report type detection based on parameters in the document
def detect_report_type(text):
    t = text.lower()
    if "hemoglobin" in t or "wbc" in t:
        return "Complete Blood Count (CBC)"
    elif "creatinine" in t:
        return "Renal Function Test"
    else:
        return "General Laboratory Report"
    
#severity calculation on the basis of the abnormal values 
def calculate_severity(values):
    severity = 0
    contributing_tests = 0

    for test, value in values.items():
        if test not in NORMAL_RANGES:
            continue

        low, high = NORMAL_RANGES[test]

        if low <= value <= high:
            continue

        contributing_tests += 1

        if value < low:
            deviation = (low - value) / low
        else:
            deviation = (value - high) / high

        deviation = min(deviation, 1.5)

        severity += deviation * 20

    severity += contributing_tests * 5

    severity_score = min(int(severity), 100)

    print("Computed Severity Score:", severity_score)

    return severity_score

# MAIN PIPELINE
def analyze_medical_report_local(path, age, gender):
    try:
        raw_text = perform_ocr(path)

        medical_terms, symptoms = extract_medical_context(raw_text)

        lab_values = extract_lab_values(raw_text)

        findings, explanations, abnormal_count = interpret_lab_results(lab_values)

        synopsis = generate_clinical_summary(explanations, symptoms)

        report_type = detect_report_type(raw_text)

        severity_score = calculate_severity(lab_values)

        # Risk mapping from severity (0-100 scale min price for low severity max price for max severity)
        if severity_score >= 75:
            risk_level = "High Clinical Attention Needed"
            cost = 3000
        elif severity_score >= 40:
            risk_level = "Moderate Monitoring Advised"
            cost = 1800
        elif severity_score > 0:
            risk_level = "Mild Variation"
            cost = 900
        else:
            risk_level = "Normal"
            cost = 500

        reference_ranges = {
            test: f"{NORMAL_RANGES[test][0]} - {NORMAL_RANGES[test][1]}"
            for test in lab_values if test in NORMAL_RANGES
        }

        diagnosis_html = (
            "<b>Detected Lab Findings:</b><br>" +
            "<br>".join([f"• {f}" for f in findings])
        ) if findings else "No measurable values detected."

        return {
            "synopsis": synopsis,
            "diagnosis": diagnosis_html,
            "risk_level": risk_level,
            "estimated_cost": cost,
            "severity_score": severity_score,
            "chart_labels": list(lab_values.keys()),
            "chart_values": list(lab_values.values()),
            "reference_ranges": reference_ranges,
            "report_type": report_type
        }

    except Exception as e:
        return {
            "synopsis": "System Error",
            "diagnosis": str(e),
            "risk_level": "N/A",
            "estimated_cost": 0,
            "severity_score": 0,
            "chart_labels": [],
            "chart_values": [],
            "reference_ranges": {},
            "report_type": "Unknown"
        }
