from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import base64
import HandTrackingModule as htm
import os

# --- ROBUST PATH CONFIGURATION ---
# Get the absolute path of the directory where this script is located (backend)
backend_dir = os.path.dirname(os.path.abspath(__file__))
# Go one level up to get the project's root directory
root_dir = os.path.dirname(backend_dir)

# Define the paths to the frontend and static folders relative to the root
template_folder = os.path.join(root_dir, 'frontend')
static_folder = os.path.join(root_dir, 'frontend', 'static')

# Initialize Flask app with the robust paths
app = Flask(__name__, static_folder=static_folder, template_folder=template_folder)
# --- END OF PATH CONFIGURATION ---

socketio = SocketIO(app, async_mode='eventlet')
# Lowered detection confidence to make hand tracking more reliable
detector = htm.handDetector(detectionCon=0.7, maxHands=1)

# --- ROUTES ---
# These functions tell Flask what HTML page to send for each URL.

@app.route('/')
def index():
    """Serves the main page."""
    return render_template('index.html')

@app.route('/about.html')
def about():
    """Serves the about page."""
    return render_template('about.html')

@app.route('/game.html')
def game():
    """Serves the game page."""
    return render_template('game.html')

# --- WEBSOCKET EVENT HANDLER ---
# This function handles the real-time video processing.

@socketio.on('video_frame')
def handle_video_frame(image_data):
    """Receives a video frame from the client, processes it, and sends back hand data."""
    try:
        # Decode the base64 image
        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        # Process the image to find hands
        img = detector.findHands(img)
        lmList, bbox = detector.findPosition(img, draw=False)
        
        response_data = {}

        if lmList:
            # If a hand is detected, the default action is 'move'
            response_data['action'] = 'move'
            
            fingers = detector.fingersUp()
            
            # Check for a more specific "Clicking" gesture (only index and middle fingers up)
            if fingers[1] == 1 and fingers[2] == 1 and all(f == 0 for f in [fingers[0], fingers[3], fingers[4]]):
                length, _, _ = detector.findDistance(8, 12, img, draw=False)
                if length < 45: # Slightly increased distance for easier clicking
                    response_data['action'] = 'click'
            
            # Normalize landmark coordinates (0.0 to 1.0) to be independent of image size
            h, w, _ = img.shape
            normalized_lm = [{'x': lm[1]/w, 'y': lm[2]/h} for lm in lmList]
            response_data['landmarks'] = normalized_lm
        
        else:
            # Only when no hand is detected, send 'none'
            response_data['action'] = 'none'

        # Send the processed data back to the client
        emit('hand_data', response_data)

    except Exception as e:
        print(f"Error processing frame: {e}")

# --- MAIN EXECUTION ---

if __name__ == '__main__':
    # Using port 8080 to avoid potential conflicts with the default port 5000.
    # use_reloader=False prevents the server from restarting and causing an "Address already in use" error.
    port = 8080
    print(f"Starting Flask-SocketIO server on http://127.0.0.1:{port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True, use_reloader=False)

