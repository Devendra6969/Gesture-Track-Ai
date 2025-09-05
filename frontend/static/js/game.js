// =================================================================
// GESTURE CONTROL AND WEBSOCKET COMMUNICATION
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const webcamVideo = document.getElementById("webcam");
  const previewCanvas = document.getElementById("preview_canvas");
  const previewCtx = previewCanvas.getContext("2d");
  const cursor = document.getElementById("cursor");

  // Smoothing variables for cursor movement
  let clocX = 0,
    clocY = 0;
  let plocX = 0,
    plocY = 0;
  const smoothening = 5;

  // Cooldown for click action to prevent multiple rapid clicks
  let clickCooldown = false;

  // --- WebSocket Connection Setup ---
  const socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  socket.on("connect", () => {
    status.textContent = "Connected! Show your hand to the camera.";
    console.log("Connected to server");
  });

  socket.on("disconnect", () => {
    status.textContent = "Disconnected from server.";
    console.log("Disconnected from server");
  });

  // --- Camera Setup ---
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        webcamVideo.srcObject = stream;
        webcamVideo.play();
        sendFrame(); // Start sending frames to the backend
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        status.textContent = "Error: Could not access webcam.";
      });
  }

  function sendFrame() {
    if (webcamVideo.readyState === webcamVideo.HAVE_ENOUGH_DATA) {
      previewCtx.drawImage(
        webcamVideo,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
      );
      const frame = previewCanvas.toDataURL("image/jpeg", 0.5); // Use lower quality for performance
      socket.emit("video_frame", frame.split(",")[1]);
    }
    requestAnimationFrame(sendFrame);
  }

  // --- Receive Data and Control Cursor ---
  socket.on("hand_data", (data) => {
    if (data.landmarks) {
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

      // Handle click action
      if (data.action === "click" && !clickCooldown) {
        cursor.classList.add("clicked");
        clickCooldown = true;

        // Simulate a click on the element under the cursor
        const elementUnderCursor = document.elementFromPoint(clocX, clocY);
        if (elementUnderCursor) {
          elementUnderCursor.click();
        }

        setTimeout(() => {
          cursor.classList.remove("clicked");
        }, 150);
        setTimeout(() => {
          clickCooldown = false;
        }, 500); // 500ms cooldown
      }
    }
  });

  // =================================================================
  // TIC-TAC-TOE GAME LOGIC
  // =================================================================

  const X_CLASS = "x";
  const O_CLASS = "o";
  const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  const cellElements = document.querySelectorAll("[data-cell]");
  const board = document.getElementById("gameBoard");
  const restartButton = document.getElementById("restartButton");
  const statusText = document.getElementById("status");
  let oTurn;
  let gameActive;

  startGame();

  restartButton.addEventListener("click", startGame);

  function startGame() {
    oTurn = false;
    gameActive = true;
    cellElements.forEach((cell) => {
      cell.classList.remove(X_CLASS);
      cell.classList.remove(O_CLASS);
      cell.textContent = "";
      cell.removeEventListener("click", handleClick);
      cell.addEventListener("click", handleClick, { once: true });
    });
    setBoardHoverClass();
    statusText.textContent = "X's Turn";
  }

  function handleClick(e) {
    if (!gameActive) return;
    const cell = e.target;
    const currentClass = oTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);

    if (checkWin(currentClass)) {
      endGame(false);
    } else if (isDraw()) {
      endGame(true);
    } else {
      swapTurns();
      setBoardHoverClass();
    }
  }

  function endGame(draw) {
    gameActive = false;
    if (draw) {
      statusText.textContent = "Draw!";
    } else {
      statusText.textContent = `${oTurn ? "O's" : "X's"} Wins!`;
    }
  }

  function isDraw() {
    return [...cellElements].every((cell) => {
      return (
        cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)
      );
    });
  }

  function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
    cell.textContent = currentClass === X_CLASS ? "X" : "O";
  }

  function swapTurns() {
    oTurn = !oTurn;
    statusText.textContent = `${oTurn ? "O's" : "X's"} Turn`;
  }

  function setBoardHoverClass() {
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    // This function is kept for potential future styling based on whose turn it is
  }

  function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some((combination) => {
      return combination.every((index) => {
        return cellElements[index].classList.contains(currentClass);
      });
    });
  }
});
