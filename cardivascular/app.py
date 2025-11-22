from flask import Flask, render_template, request, jsonify, url_for
from PIL import Image
import torch
from torchvision import transforms, models
import os
import uuid
import time

# -------------------------
# Model Definition
# -------------------------
class MultiOutputResNet(torch.nn.Module):
    def __init__(self, num_outputs=14):
        super().__init__()
        self.backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = torch.nn.Identity()
        self.fc = torch.nn.Sequential(
            torch.nn.Linear(in_features, 256),
            torch.nn.ReLU(),
            torch.nn.Linear(256, num_outputs)
        )
    
    def forward(self, x):
        x = self.backbone(x)
        x = self.fc(x)
        return x

# -------------------------
# Flask App
# -------------------------
app = Flask(__name__)
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"

# Load model
model = MultiOutputResNet(num_outputs=14).to(DEVICE)
model.load_state_dict(torch.load("checkpoints/retina_multioutput.pth", map_location=DEVICE))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5],[0.5, 0.5, 0.5])
])

feature_names = ['age','sex','cp','trestbps','chol','fbs','restecg',
                 'thalach','exang','oldpeak','slope','ca','thal','target']

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PREDICTIONS = {}

def compute_level(r):
    if r < 0.2:
        return 1
    elif r < 0.4:
        return 2
    elif r < 0.6:
        return 3
    elif r < 0.8:
        return 4
    else:
        return 5

# -------------------------
# Routes
# -------------------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error':'No file uploaded'})
    
    file = request.files['file']
    filename = str(uuid.uuid4()) + ".jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    img = Image.open(filepath).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(DEVICE)
    
    time.sleep(2)
    with torch.no_grad():
        output = model(img_tensor)
    output = output.cpu().numpy()[0]
    
    # Risk
    risk_value = float(output[-1])
    level = compute_level(risk_value)
    risk_label = f"Level {level}"
    
    # Prepare feature dictionary
    features_dict = {name: float(val) for name, val in zip(feature_names, output)}
    
    pid = filename
    display_pct = max(0.0, min(100.0, risk_value * 100.0))
    PREDICTIONS[pid] = {
        'risk_value': risk_value,
        'risk_label': risk_label,
        'level': level,
        'display_pct': display_pct,
        'features': features_dict,
        'image_url': url_for('static', filename=f"uploads/{filename}")
    }
    return jsonify({ 'id': pid, **PREDICTIONS[pid] })

@app.route('/results/<pid>')
def results(pid):
    data = PREDICTIONS.get(pid)
    if not data:
        return render_template('result.html', error=True)
    return render_template('result.html', data=data)

@app.route('/advice/<int:level>')
def advice(level):
    level = max(1, min(5, level))
    return render_template('advice.html', level=level)

# -------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5005)