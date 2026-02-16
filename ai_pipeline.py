import pytesseract
from PIL import Image
import re
import os

# --- TESSERACT AUTO-PATH ---
possible_paths = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"D:\Tesseract-OCR\tesseract.exe",
    r"C:\Users\User\AppData\Local\Tesseract-OCR\tesseract.exe"
]
for path in possible_paths:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

def extract_text(image_path):
    try:
        img = Image.open(image_path)
        return pytesseract.image_to_string(img, config='--psm 6')
    except: return ""

def analyze_medical_report_local(path, age, gender):
    text = extract_text(path)
    clean_text = text.lower().replace('\n', ' ').replace(':', ' ')
    
    findings = []
    clinical_notes = []
    
    # MASTER CBC PARAMETERS (Based on your Shree Diagnostic Report)
    patterns = {
        "Haemoglobin": (r"(?:haemoglobin|hb).{0,15}?(\d{1,2}\.\d)", 13.0, 17.0),
        "WBC Count": (r"(?:w\.b\.c|wbc).{0,15}?(\d{4,6})", 4000, 10000),
        "Platelets": (r"(?:platelet|plt).{0,15}?(\d{3,6})", 150000, 450000)
    }

    for key, (pattern, low, high) in patterns.items():
        match = re.search(pattern, clean_text)
        if match:
            val = float(match.group(1))
            status = "Normal"
            if val < low: 
                status = "LOW"
                if key == "Haemoglobin": clinical_notes.append("Anemic tendency detected.")
            elif val > high: 
                status = "HIGH"
                if key == "WBC Count": clinical_notes.append("Signs of active infection/inflammation.")
            findings.append(f"{key}: {val} ({status})")

    # Final Synopsis Formulation
    if findings:
        synopsis = f"Automated CBC Triage for {age}Y/{gender}."
        # If clinical notes exist, show them; otherwise show raw findings
        diagnosis = " | ".join(clinical_notes) if clinical_notes else "Preliminary findings: " + " | ".join(findings)
        risk = "High" if clinical_notes else "Low"
    else:
        synopsis = "Document scanned. Complex handwriting/format detected."
        diagnosis = "Manual review required. OCR Sample: " + text[:50].replace('\n', ' ')
        risk = "Medium"

    return {
        "synopsis": synopsis,
        "diagnosis": diagnosis,
        "estimated_cost": 1200 + (len(clinical_notes) * 500),
        "risk_level": risk,
        "biometrics": {}
    }