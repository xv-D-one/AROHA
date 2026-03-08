import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'D:\TESSERACT-OCR\tesseract.exe'
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

print("Models Loaded")

# ---------------- OCR ----------------

def perform_ocr(image_path):
    img = Image.open(image_path).convert("L")

    text = pytesseract.image_to_string(img)

    text = re.sub(r'\s+', ' ', text)

    print("OCR raw text:", repr(text))

    return text


# ---------------- MEDICAL CONTEXT ----------------

def extract_medical_context(text):

    doc = nlp(text)

    medical_terms = []
    symptoms = []

    for ent in doc.ents:
        medical_terms.append(ent.text)

    for token in doc:
        if token.text.lower() in ["fever", "fatigue", "pain", "infection", "weakness"]:
            symptoms.append(token.text)

    return list(set(medical_terms)), list(set(symptoms))


# ---------------- PARAMETERS ----------------

PARAMETERS = {
    "Hemoglobin": ["hemoglobin", "hb", "hgb", "haemoglobin"],
    "WBC": ["wbc", "white blood cells", "leucocytes", "total w.b.c. count"],
    "RBC": ["rbc", "red blood cells", "erythrocytes", "total r.b.c. count"],
    "Platelets": ["platelets", "platelet", "plt", "platelet count"],
    "Sodium": ["sodium", "na", "natrium"],
    "Potassium": ["potassium", "k", "kalium"],
    "Urea": ["urea", "bun", "blood urea nitrogen"],
    "Creatinine": ["creatinine", "crea"],
    "Glucose": ["glucose", "sugar", "glu"]
}


# ---------------- LAB VALUE EXTRACTION ----------------
# THIS IS THE MAIN FIX

def extract_lab_values(text):

    values = {}

    for test, keywords in PARAMETERS.items():

        for keyword in keywords:

            pattern = rf"{keyword}\s*[:\-]?\s*(\d+\.?\d*)"

            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                values[test] = float(match.group(1))
                break

    print("Detected values:", values)

    return values


# ---------------- NORMAL RANGES ----------------

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


# ---------------- INTERPRET RESULTS ----------------

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

            findings.append(
                f"{test}: {value} (Low) | Normal Range: {low}-{high}"
            )

            explanations.append(
                f"{test} level is below the normal range which may indicate deficiency or physiological imbalance."
            )

        elif value > high:

            abnormal_count += 1

            findings.append(
                f"{test}: {value} (High) | Normal Range: {low}-{high}"
            )

            explanations.append(
                f"{test} level is elevated compared to the expected physiological range which may indicate metabolic or inflammatory conditions."
            )

        else:

            findings.append(
                f"{test}: {value} (Normal) | Normal Range: {low}-{high}"
            )

    return findings, explanations, abnormal_count


# ---------------- CLINICAL SUMMARY ----------------

def generate_clinical_summary(explanations, symptoms):

    if not explanations:

        return (
            "The laboratory investigation does not demonstrate significant abnormalities. "
            "All detected parameters fall within expected physiological reference ranges. "
            "Routine monitoring and clinical correlation are recommended."
        )

    summary = (
        "Detailed clinical interpretation of the laboratory parameters suggests the following observations: "
        + " ".join(explanations)
    )

    if symptoms:
        summary += " Reported patient symptoms include " + ", ".join(symptoms) + "."

    _ = biobert(summary)

    return summary


# ---------------- REPORT TYPE ----------------

def detect_report_type(text):

    text = text.lower()

    if "hemoglobin" in text or "wbc" in text:
        return "Complete Blood Count (CBC)"

    if "creatinine" in text:
        return "Renal Function Test"

    return "General Lab Report"


# ---------------- SEVERITY ----------------

def calculate_severity(values):

    severity = 0
    contributing = 0

    for test, value in values.items():

        if test not in NORMAL_RANGES:
            continue

        low, high = NORMAL_RANGES[test]

        if low <= value <= high:
            continue

        contributing += 1

        if value < low:
            deviation = (low - value) / low
        else:
            deviation = (value - high) / high

        severity += deviation * 20

    severity += contributing * 5

    return min(int(severity), 100)


# ---------------- MAIN PIPELINE ----------------

def analyze_medical_report_local(path, age, gender):

    try:

        raw_text = perform_ocr(path)

        medical_terms, symptoms = extract_medical_context(raw_text)

        lab_values = extract_lab_values(raw_text)

        findings, explanations, abnormal_count = interpret_lab_results(lab_values)

        synopsis = generate_clinical_summary(explanations, symptoms)

        report_type = detect_report_type(raw_text)

        severity_score = calculate_severity(lab_values)

        if severity_score >= 75:
            risk_level = "High Clinical Attention Needed"
            cost = 3000

        elif severity_score >= 40:
            risk_level = "Moderate Monitoring Required"
            cost = 1800

        elif severity_score > 0:
            risk_level = "Mild Variation"
            cost = 900

        else:
            risk_level = "Normal"
            cost = 500

        diagnosis_html = (
            "<br>".join(findings)
            if findings else
            "No measurable values detected."
        )

        return {
            "synopsis": synopsis,
            "diagnosis": diagnosis_html,
            "findings": findings,
            "risk_level": risk_level,
            "estimated_cost": cost,
            "severity_score": severity_score,
            "chart_labels": list(lab_values.keys()),
            "chart_values": list(lab_values.values()),
            "report_type": report_type
        }

    except Exception as e:

        return {
            "synopsis": "System error during analysis.",
            "diagnosis": str(e),
            "findings": [],
            "risk_level": "Unknown",
            "estimated_cost": 0,
            "severity_score": 0,
            "chart_labels": [],
            "chart_values": [],
            "report_type": "Unknown"
        }
