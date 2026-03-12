from flask import Flask, render_template, request, jsonify
import os
from ai_pipeline import analyze_medical_report_local
from flask_cors import CORS
print("APP FILE RUNNING FROM:", __file__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes so the frontend can access the API


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ---------------- HOME PAGE ----------------

@app.route("/")
def index():
    return render_template("index.html")


# ---------------- PATIENT VIEW ----------------

@app.route("/patient", methods=["GET", "POST"])
def patient():

    result = None

    if request.method == "POST":

        file = request.files.get("file")

        if file and file.filename != "":

            filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
            file.save(filepath)

            age = request.form.get("age")
            gender = request.form.get("gender")

            result = analyze_medical_report_local(filepath, age, gender)

    return render_template("patient.html", result=result)


@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "No file provided"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    age = request.form.get("age", "30")
    gender = request.form.get("gender", "F")

    try:
        result = analyze_medical_report_local(filepath, age, gender)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- DOCTOR VIEW ----------------

@app.route("/doctor")
def doctor():
    return render_template("doctor.html")


@app.route("/upload_doctor", methods=["POST"])
def upload_doctor():
    file = request.files.get("report")
    
    if not file or file.filename == "":
        return "Please upload a report", 400
    
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)
    
    # For doctor, perhaps no age/gender, or default
    result = analyze_medical_report_local(filepath, "30", "M")
    
    # Adapt to template: summary = synopsis, alerts = findings
    analysis = {
        "summary": result["synopsis"],
        "alerts": result["findings"],
        "report_type": result.get("report_type", "Unknown")
    }
    
    return render_template("doctor.html", analysis=analysis)


# ---------------- COMPARE VIEW ----------------

@app.route("/compare")
def compare():
    return render_template("compare.html")


@app.route("/compare_reports", methods=["POST"])
def compare_reports():
    file1 = request.files.get("report1")
    file2 = request.files.get("report2")
    
    if not file1 or not file2:
        return "Please upload both reports", 400
    
    filepath1 = os.path.join(app.config["UPLOAD_FOLDER"], file1.filename)
    file1.save(filepath1)
    
    filepath2 = os.path.join(app.config["UPLOAD_FOLDER"], file2.filename)
    file2.save(filepath2)
    
    # Analyze both reports (using default age/gender for comparison)
    analysis1 = analyze_medical_report_local(filepath1, "30", "M")
    analysis2 = analyze_medical_report_local(filepath2, "30", "M")
    
    # Compare the analyses
    comparison = []
    
    if analysis1["severity_score"] != analysis2["severity_score"]:
        comparison.append(f"Severity score: {analysis1['severity_score']} vs {analysis2['severity_score']}")
    
    if analysis1["risk_level"] != analysis2["risk_level"]:
        comparison.append(f"Risk level: {analysis1['risk_level']} vs {analysis2['risk_level']}")
    
    # Compare lab values
    labs1 = dict(zip(analysis1["chart_labels"], analysis1["chart_values"]))
    labs2 = dict(zip(analysis2["chart_labels"], analysis2["chart_values"]))
    
    for key in set(labs1.keys()) | set(labs2.keys()):
        val1 = labs1.get(key, "N/A")
        val2 = labs2.get(key, "N/A")
        if val1 != val2:
            comparison.append(f"{key}: {val1} vs {val2}")
    
    return render_template("compare.html", comparison=comparison, analysis1=analysis1, analysis2=analysis2)


# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    app.run(debug=True)
