from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os, uuid
from ai_pipeline import analyze_medical_report_local

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER): 
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def home(): 
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
            
        file = request.files['file']
        filename = f"{uuid.uuid4()}_{file.filename}"
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)
        
        # This calls the updated 'Clinical Expert' brain
        analysis = analyze_medical_report_local(
            path, 
            request.form.get('age', "24"), 
            request.form.get('gender', "Male")
        )

        # We wrap the response in a 'data' object to match your frontend JavaScript
        return jsonify({"status": "success", "data": analysis})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(" AROHA is running...")
    app.run(debug=True, port=5000)