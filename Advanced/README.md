# Hand Gesture Control System

This project enables hand gesture-based interaction with your computer using OpenCV, MediaPipe, and a custom Hand Tracking Module.
You can control the mouse cursor, perform clicks, scroll, and even adjust system volume using just your hand captured through a webcam.

<!-- 📌 Features -->
Hand Tracking using MediaPipe and OpenCV
Mouse Control: Move the cursor with your index finger
Click Actions: Perform left/right clicks with gestures
Volume Control: Adjust system volume with hand gestures
Scrolling: Scroll pages using pinch or finger combinations
Custom HandTracking Module (HandTrackingModule.py)
Smoothened cursor movement for better user experience
📂 Project Structure
├── Advanced.py           # Advanced gesture controls (mouse + volume + scrolling)
├── GestureTrack.py       # Basic mouse control with gestures
├── HandTrackingModule.py # Hand tracking module (using Mediapipe + OpenCV)
├── requirements.txt      # Required Python packages
└── README.md             # Project documentation
# ⚙️ Installation

<!-- Clone the repository -->

git clone https://github.com/Devendra6969/Gesture-Track-Ai
cd gesture-control
Install dependencies
pip install -r requirements.txt


🚀 Usage
1. Run basic mouse control
python GestureTrack.py
2. Run advanced controls (mouse + volume + scrolling)
python Advanced.py
Make sure your webcam is connected.

# 🖐️ Gesture Controls

Gesture	Action
Index Finger Up	Move mouse cursor
Index + Middle Finger Up	Mouse Click Mode
Index + Middle Finger Close Together	Single Click
Hold Index + Middle Finger Close Longer	Double Click
Pinch (Thumb + Index)	Scrolling (up/down depending on direction)
Pinch (Thumb + Index with Distance Change)	Volume Control (increase/decrease)
All Fingers Open	Stop interaction / idle mode

# 📦 Dependencies
OpenCV – Image processing
Mediapipe – Hand landmark detection
Autopy – Screen automation
PyAutoGUI – GUI automation
PyCaw – Windows audio control
Comtypes – COM support for Python
🛠️ Future Improvements
Add support for multi-hand gestures
Implement custom gesture recognition (e.g., zoom in/out, drag-and-drop)
Cross-platform support (currently volume control works on Windows only)
GUI for adjusting sensitivity and gesture mapping

👨‍💻 Author
Developed by Devendra Singh
📧 Email: devendrasingh2022@vitbhopal.ac.in
🔗 GitHub: [https://github.com/Devendra6969]