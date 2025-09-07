import cv2
import numpy as np
import HandTrackingModule as htm
import time
import autopy
import pyautogui
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

wCam, hCam = 640, 480
frameR = 100  # Frame Reduction
smoothening = 7

pTime = 0
plocX, plocY = 0, 0
clocX, clocY = 0, 0

cap = cv2.VideoCapture(0)
cap.set(3, wCam)
cap.set(4, hCam)
detector = htm.handDetector(maxHands=1)
wScr, hScr = autopy.screen.size()

devices = AudioUtilities.GetSpeakers()
interface = devices.Activate(
   IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
volume = cast(interface, POINTER(IAudioEndpointVolume))

while True:
    success, img = cap.read()
    img = detector.findHands(img)
    lmList, bbox = detector.findPosition(img)
    if len(lmList) != 0:
        x1, y1 = lmList[8][1:]
        x2, y2 = lmList[12][1:]
        fingers = detector.fingersUp()

        # Moving Mode
        if fingers[1] == 1 and fingers[2] == 0:
            x3 = np.interp(x1, (frameR, wCam - frameR), (0, wScr))
            y3 = np.interp(y1, (frameR, hCam - frameR), (0, hScr))
            clocX = plocX + (x3 - plocX) / smoothening
            clocY = plocY + (y3 - plocY) / smoothening
            autopy.mouse.move(wScr - clocX, clocY)
            cv2.circle(img, (x1, y1), 15, (255, 0, 255), cv2.FILLED)
            plocX, plocY = clocX, clocY

        # Clicking Mode
        if fingers[1] == 1 and fingers[2] == 1:
            length, img, lineInfo = detector.findDistance(8, 12, img)
            if length < 40:
                cv2.circle(img, (lineInfo[4], lineInfo[5]),
                           15, (0, 255, 0), cv2.FILLED)
                autopy.mouse.click()

        # Right Click Mode
        if fingers[2] == 1 and fingers[0] == 1:
            length, img, lineInfo = detector.findDistance(12, 4, img)  # Distance between middle finger and thumb
            if length < 40:  # If fingers are close together
                cv2.circle(img, (lineInfo[4], lineInfo[5]),
                           15, (0, 255, 0), cv2.FILLED)
                autopy.mouse.click(button=autopy.mouse.Button.RIGHT)

        # Scroll Control
        if fingers[0] == 1 and fingers[4] == 1:
            length, _, _ = detector.findDistance(4, 20, img)  # Distance between thumb and pinky
            if length < 50:  # If fingers are close together
                pyautogui.scroll(-20)  # Scroll down
            else:  # If fingers are far apart
                pyautogui.scroll(20)  # Scroll up

        # Volume Control
        if fingers[1] == 1 and fingers[0] == 1:
            length, _, _ = detector.findDistance(8, 4, img)  # Distance between index finger and thumb
            if length < 50:  # If fingers are close together
                volume.SetMasterVolumeLevel(-20.0, None)  # Decrease volume
            else:  # If fingers are far apart
                volume.SetMasterVolumeLevel(-5.0, None)  # Increase volume

    cTime = time.time()
    fps = 1 / (cTime - pTime)
    pTime = cTime
    cv2.putText(img, str(int(fps)), (20, 50), cv2.FONT_HERSHEY_PLAIN, 3,
                (255, 0, 0), 3)
    cv2.imshow("Image", img)
    cv2.waitKey(1)
