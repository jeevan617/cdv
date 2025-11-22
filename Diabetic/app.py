import os
import sys
import uuid

# Flask
from flask import Flask, redirect, url_for, request, render_template, Response, jsonify, redirect
from werkzeug.utils import secure_filename
from gevent.pywsgi import WSGIServer

# TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras

# Preprocessing utilities
from tensorflow.keras.applications.imagenet_utils import preprocess_input, decode_predictions
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Model building
from keras import layers
from keras.optimizers import Adam
from keras.models import Sequential
from keras.applications import DenseNet121
from keras.callbacks import Callback, ModelCheckpoint


from PIL import Image
from models.model import build_model, preprocess_image

# Some utilites
import numpy as np
from utils import base64_to_pil


# Creating a new Flask Web application.
app = Flask(__name__)

# Store predictions
PREDICTIONS = {}
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Model saved with Keras model.save()
MODEL_PATH = './models/pretrained/model.h5'

# Loading trained model
model = build_model()
model.load_weights(MODEL_PATH)
print('Model loaded. Start serving...')


def model_predict(img, model):
    """
    Classify the severity of DR of image using pre-trained CNN model.

    Keyword arguments:
    img -- the retinal image to be classified
    model -- the pretrained CNN model used for prediction

    Predicted rating of severity of diabetic retinopathy on a scale of 0 to 4:

    0 - No DR
    1 - Mild
    2 - Moderate
    3 - Severe
    4 - Proliferative DR

    """
    
    ## Preprocessing the image
    x_val = np.empty((1, 224, 224, 3), dtype=np.uint8)
    img = img.resize((224,) * 2, resample=Image.LANCZOS)
    x_val[0, :, :, :] = img

    preds = model.predict(x_val)
    return preds


@app.route('/', methods=['GET'])
def index():
    # Main page
    return render_template('index.html')


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        # Get the image from post request
        img = base64_to_pil(request.json)

        # Generate unique filename
        filename = str(uuid.uuid4()) + ".jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        img.save(filepath)

        # Make prediction on the image
        preds = model_predict(img, model)

        # Process result to find probability and class of prediction
        pred_proba = "{:.3f}".format(np.amax(preds))    # Max probability
        pred_class = np.argmax(np.squeeze(preds))

        diagnosis = ["No DR", "Mild", "Moderate", "Severe", "Proliferative DR"]
        result = diagnosis[pred_class]               # Convert to string
        
        # Store prediction data
        pid = filename.replace('.jpg', '')
        display_pct = float(pred_proba) * 100.0
        PREDICTIONS[pid] = {
            'result': result,
            'probability': pred_proba,
            'level': pred_class,
            'display_pct': display_pct,
            'image_url': url_for('static', filename=f"uploads/{filename}")
        }
        
        # Return prediction ID for redirection
        return jsonify(id=pid, **PREDICTIONS[pid])

    return None


@app.route('/results/<pid>')
def results(pid):
    data = PREDICTIONS.get(pid)
    if not data:
        return render_template('result.html', error=True)
    return render_template('result.html', data=data)


@app.route('/advice/<int:level>')
def advice(level):
    level = max(0, min(4, level))
    return render_template('advice.html', level=level)


if __name__ == '__main__':
    # app.run(port=5002, threaded=False)

    # Serve the app with gevent
    http_server = WSGIServer(('0.0.0.0', 5003), app)
    http_server.serve_forever()

