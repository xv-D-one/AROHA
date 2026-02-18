from flask import Flask, render_template, request
import os
# Import the AI logic
try:
    from ai_pipeline import analyze_medical_report_local
except ImportError as e:
    print(f"AI Pipeline Import Error: {e}")
    def analyze_medical_report_local(path, age, gender):
        return {"synopsis": "AI Not Loaded", "diagnosis": "Check Terminal", "risk_level": "N/A", "estimated_cost": 0}

app = Flask(__name__)

# Config
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('index.html', result=None)
        
        file = request.files['file']
        
        if file.filename == '':
            return render_template('index.html', result=None)

        if file:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)
            
            age = request.form.get('age')
            gender = request.form.get('gender')
            
            # Run Analysis
            print(f"Processing {file.filename}...")
            result = analyze_medical_report_local(filepath, age, gender)

    return render_template('index.html', result=result)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
