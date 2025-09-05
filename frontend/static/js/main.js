document.addEventListener("DOMContentLoaded", () => {
  // Connect to the WebSocket server
  const socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  const videoElement = document.getElementById("webcam");
  const canvasElement = document.getElementById("preview_canvas");
  const canvasCtx = canvasElement.getContext("2d");
  const cursor = document.getElementById("cursor");
  const status = document.getElementById("status");
  const messageBox = document.getElementById("messageBox");

  // Smoothing variables for cursor movement
  let clocX = 0,
    clocY = 0;
  let plocX = 0,
    plocY = 0;
  const smoothening = 5;

  // Cooldown for click action
  let clickCooldown = false;

  socket.on("connect", () => {
    console.log("Connected to server!");
    status.textContent = "Connection established. Starting camera...";
    startCamera();
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server.");
    status.textContent = "Disconnected. Please refresh.";
  });

  socket.on("hand_data", (data) => {
    if (data.action === "none" || !data.landmarks) {
      cursor.style.opacity = "0"; // Hide cursor if no hand is detected
      return;
    }

    cursor.style.opacity = "1"; // Show cursor if hand is detected
    const indexFingerTip = data.landmarks[8]; // Landmark for index finger tip
    const x = indexFingerTip.x * window.innerWidth;
    const y = indexFingerTip.y * window.innerHeight;

    // Smoothen the cursor movement
    clocX = plocX + (x - plocX) / smoothening;
    clocY = plocY + (y - plocY) / smoothening;

    cursor.style.left = `${clocX}px`;
    cursor.style.top = `${clocY}px`;

    plocX = clocX;
    plocY = clocY;

    // Handle click event
    if (data.action === "click" && !clickCooldown) {
      cursor.classList.add("clicked");
      clickCooldown = true;

      const element = document.elementFromPoint(clocX, clocY);
      if (element) {
        element.click();
      }
      setTimeout(() => cursor.classList.remove("clicked"), 200);
      setTimeout(() => {
        clickCooldown = false;
      }, 500); // 500ms cooldown
    }
  });

  function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          videoElement.srcObject = stream;
          videoElement.play();
          status.textContent = "Gesture control is active!";
          sendFrame(); // Start the loop
        })
        .catch((err) => {
          console.error("Error accessing camera: ", err);
          status.textContent =
            "Camera access denied. Please enable camera permissions.";
        });
    }
  }

  function sendFrame() {
    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      // Draw video frame to the preview canvas
      canvasCtx.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Convert frame to base64 JPEG using the preview canvas
      const dataURL = canvasElement.toDataURL("image/jpeg", 0.5); // Lower quality for better performance

      // Send the frame to the server
      socket.emit("video_frame", dataURL.split(",")[1]);
    }
    requestAnimationFrame(sendFrame); // Loop to send frames continuously
  }

  // Add click handlers for buttons to show feedback
  ["btn1", "btn2", "btn3"].forEach((id, index) => {
    const btn = document.getElementById(id);
    btn.addEventListener("click", (e) => {
      // Prevent the event from bubbling up if not needed
      e.stopPropagation();
      messageBox.textContent = `Button ${index + 1} was gesture-clicked!`;
      setTimeout(() => {
        messageBox.textContent = "\u00A0";
      }, 2000); // Reset after 2 seconds
    });
  });
});
