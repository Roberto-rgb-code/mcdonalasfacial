from flask import Flask, request, jsonify
from deepface import DeepFace
import cv2
import numpy as np
import base64
from google.cloud import aiplatform
from google.protobuf import json_format
from google.protobuf.struct_pb2 import Value

app = Flask(__name__)

# Initialize Vertex AI client
aiplatform.init(project='your-project-id', location='us-central1')
ENDPOINT_ID = 'your-endpoint-id'  # Replace with your Vertex AI endpoint ID
client = aiplatform.gapic.PredictionServiceClient(client_options={"api_endpoint": "us-central1-aiplatform.googleapis.com"})

# Route to process a video frame and detect emotion
@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    try:
        # Get the base64-encoded image from the request
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode the base64 image
        img_data = base64.b64decode(data['image'].split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Analyze the image with DeepFace for emotion detection
        analysis = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)

        # Extract the dominant emotion
        dominant_emotion = analysis[0]['dominant_emotion'].lower()

        # Map DeepFace emotions to our desired emotions (happy, sad, frustrated)
        emotion_map = {
            'happy': 'happy',
            'sad': 'sad',
            'angry': 'frustrated',
            'neutral': 'frustrated',
            'disgust': 'frustrated',
            'fear': 'sad',
            'surprise': 'happy'
        }
        mapped_emotion = emotion_map.get(dominant_emotion, 'sad')

        return jsonify({'emotion': mapped_emotion})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to get Vertex AI prediction
@app.route('/predict_preference', methods=['POST'])
def predict_preference():
    try:
        data = request.get_json()
        if 'emotion' not in data or 'purchase_history' not in data:
            return jsonify({'error': 'Emotion and purchase history required'}), 400

        emotion = data['emotion']
        purchase_history = data['purchase_history']

        # Prepare input for Vertex AI (example: emotion and purchase frequency)
        instance = {
            "emotion": emotion,
            "purchase_frequency": purchase_history  # Example: frequency of most purchased item
        }
        instances = [json_format.ParseDict(instance, Value())]

        # Send prediction request to Vertex AI
        endpoint_path = client.endpoint_path(project='your-project-id', location='us-central1', endpoint=ENDPOINT_ID)
        response = client.predict(endpoint=endpoint_path, instances=instances)

        # Extract prediction (e.g., preference score for recommended item)
        prediction = response.predictions[0]
        preference_score = prediction['score'] if 'score' in prediction else 0.5

        return jsonify({'preference_score': preference_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)