Gesture-Based Web Interface & Tic-Tac-Toe Game
This project creates a full-stack web application that allows users to control a web interface using hand gestures from their webcam. It features a main interactive page, an about page, and a fully playable Tic-Tac-Toe game, all controlled without a physical mouse.

Features
Real-Time Gesture Control: Uses your webcam to track your hand movements.

Custom Web Cursor: A custom cursor on the webpage follows your index finger.

Click Simulation: Pinching your index and middle fingers together simulates a click.

Multi-Page Navigation: Navigate between Home, About, and a Game page.

Interactive Game: Play Tic-Tac-Toe using only hand gestures.

Platform Independent: Works on any modern browser (Chrome, Firefox, etc.) on any OS (Windows, macOS, Linux).

Architecture
This project uses a client-server architecture:

Frontend (Client-Side): Built with HTML, Tailwind CSS, and vanilla JavaScript. It captures the video feed from the user's webcam and streams it to the backend. It also receives gesture commands from the backend to control the custom cursor on the page.

Backend (Server-Side): A Python server using Flask and Flask-SocketIO. It receives the video stream, processes it in real-time using OpenCV and a custom Hand Tracking Module, and sends the appropriate gesture commands (move, click) back to the frontend.

Project Structure
gesture-control-app/
├── backend/
│   ├── app.py              # Main Flask server, handles routing and WebSockets
│   ├── HandTrackingModule.py # OpenCV logic for hand detection
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── index.html          # The main landing page
    ├── about.html          # Information about the project
    ├── game.html           # The Tic-Tac-Toe game page
    └── static/
        └── js/
            ├── main.js     # JS for the index page (camera, WebSockets)
            └── game.js     # JS for the game page (game logic + camera/WebSockets)

Technologies Used
Frontend:

HTML5

Tailwind CSS (via CDN)

JavaScript (ES6+)

Socket.IO Client

Backend:

Python 3

Flask

Flask-SocketIO

OpenCV-Python

Eventlet

Setup and Installation
Prerequisites
Python 3.7+

A webcam

1. Clone the Repository
git clone <your-repo-url>
cd gesture-control-app

2. Set Up the Backend
Navigate to the backend directory and create a virtual environment.

cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt

3. Run the Application
Once the dependencies are installed and the virtual environment is active, start the Flask server from the backend directory.

python app.py

You should see output indicating the server has started, like:
Starting Flask-SocketIO server on http://127.0.0.1:5500

4. Open the Web Interface
Open your web browser and navigate to:

https://www.google.com/search?q=http://127.0.0.1:5500

Your browser will ask for permission to use your webcam. Once you grant permission, you should see the video feed and be able to control the cursor with your hand.