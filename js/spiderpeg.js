/* Lógica de Spider-Peg: tablero dibujado en canvas y controles con Pointer Events. */
(() => {
    "use strict";

    // Obtiene el canvas y su contexto para dibujar el tablero.
    const canvas = document.getElementById("peg-canvas");
    const ctx = canvas.getContext("2d");

    // Obtiene los elementos que muestran el estado de la partida.
    const movesElement = document.getElementById("peg-moves");
    const remainingElement = document.getElementById("peg-remaining");
    const timerElement = document.getElementById("peg-timer");
    const messageElement = document.getElementById("peg-message");
    const modalElement = document.getElementById("peg-modal");
    const modalTitle = document.getElementById("peg-modal-title");
    const modalText = document.getElementById("peg-modal-text");
    const startButton = document.getElementById("peg-start");
    const hintButton = document.getElementById("peg-hint");
    const restartButton = document.getElementById("peg-restart");
    const closeButton = document.getElementById("peg-close");
    const modalRestartButton = document.getElementById("peg-modal-restart");
    const pieceChoice = document.getElementById("peg-piece-choice");
    const timeLimit = 5 * 60;

    // Carga el tablero gráfico; las fichas y las pistas se dibujan encima desde el canvas.
    const boardImage = new Image();
    boardImage.src = "../assets/img/tablero.svg";
    boardImage.onload = drawBoard;

    // Define las 33 posiciones que forman la cruz del tablero clásico.
    const positions = [];
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            if ((row >= 2 && row <= 4) || (col >= 2 && col <= 4)) {
                positions.push({ row, col });
            }
        }
    }

    // Carga las tres imágenes PNG disponibles para que el usuario elija una.
    const pieceImages = ["ficha1.png", "ficha2.png", "ficha3.png"].map(file => {
        const image = new Image();
        image.src = "../assets/img/" + file;
        image.onload = drawBoard;
        image.onerror = () => {
            messageElement.textContent = "No se pudo cargar " + file + ". Revisá el nombre y la ubicación del archivo.";
        };
        return image;
    });

    // Guarda el diseño elegido por el usuario; null indica que aún no eligió.
    let selectedPieceIndex = null;

    // Guarda el estado y las medidas actuales del tablero.
    let board = {};
    let selected = null;
    let moves = 0;
    let secondsLeft = timeLimit;
    let timerId = null;
    let started = false;
    let finished = false;
    let pointerStart = null;
    let pointerPosition = null;
    let isDragging = false;
    let hintMove = null;
    let hintTimeout = null;
    let suppressNextClick = false;
    let cellSize = 0;
    let boardOffsetX = 0;
    let boardOffsetY = 0;
    let boardSize = 0;

    // Devuelve la clave usada para guardar una casilla dentro del estado.
    function key(row, col) {
        return row + "-" + col;
    }

    // Comprueba si una fila y columna forman parte de la cruz del tablero.
    function isValidPosition(row, col) {
        return positions.some(position => position.row === row && position.col === col);
    }

    // Elige la ilustración de ficha correspondiente a una casilla.
    function getPieceImage() {
        return selectedPieceIndex === null ? null : pieceImages[selectedPieceIndex];
    }

    // Crea un tablero nuevo con el hueco central vacío.
    function createInitialBoard() {
        const initial = {};
        positions.forEach(({ row, col }) => {
            initial[key(row, col)] = !(row === 3 && col === 3);
        });
        return initial;
    }

    // Ajusta el tamaño interno del canvas para que se vea nítido en pantallas HD.
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.round(rect.width * pixelRatio);
        canvas.height = Math.round(rect.height * pixelRatio);
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        boardSize = Math.min(rect.width, rect.height);
        cellSize = boardSize / 7;
        boardOffsetX = (rect.width - boardSize) / 2;
        boardOffsetY = (rect.height - boardSize) / 2;
        drawBoard();
    }

    // Dibuja el fondo, los huecos, las fichas y los resaltados del tablero.
    function drawBoard() {
        if (!canvas || !ctx || !cellSize) return;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Pinta el tablero gráfico y deja las posiciones listas para las fichas.
        ctx.fillStyle = "#111111";
        ctx.fillRect(boardOffsetX, boardOffsetY, boardSize, boardSize);
        if (boardImage.complete && boardImage.naturalWidth) {
            ctx.drawImage(boardImage, boardOffsetX, boardOffsetY, boardSize, boardSize);
        }

        positions.forEach(({ row, col }) => {
            const x = boardOffsetX + col * cellSize;
            const y = boardOffsetY + row * cellSize;
            const centerX = x + cellSize / 2;
            const centerY = y + cellSize / 2;
            const radius = cellSize * 0.39;

            // Dibuja huecos simples como respaldo mientras carga el tablero gráfico.
            if (!boardImage.complete || !boardImage.naturalWidth) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fillStyle = "#292929";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#454545";
                ctx.stroke();
            }

            // Resalta el origen seleccionado y el destino de una pista.
            if (selected && selected.row === row && selected.col === col) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = "#FFD600";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            if (hintMove && hintMove.from.row === row && hintMove.from.col === col) {
                drawHighlight(centerX, centerY, radius, "#D6006A");
            }
            if (hintMove && hintMove.to.row === row && hintMove.to.col === col) {
                drawHighlight(centerX, centerY, radius, "#06D606");
            }

            // Dibuja la ficha si la posición está ocupada y no está siendo arrastrada.
            if (board[key(row, col)] && !(isDragging && pointerStart &&
                pointerStart.row === row && pointerStart.col === col)) {
                drawPiece(getPieceImage(), centerX, centerY, cellSize * 0.76);
            }
        });

        // Dibuja la ficha bajo el puntero mientras se realiza el arrastre.
        if (isDragging && pointerPosition && pointerStart) {
            drawPiece(getPieceImage(),
                pointerPosition.x, pointerPosition.y, cellSize * 0.82);
        }
    }

    // Dibuja un círculo de color para indicar una casilla de la pista.
    function drawHighlight(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // Dibuja una ficha centrada en las coordenadas indicadas.
    function drawPiece(image, x, y, size) {
        if (!image || !image.complete || !image.naturalWidth) return;
        ctx.save();
        ctx.shadowColor = "#000000aa";
        ctx.shadowBlur = 7;
        ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
        ctx.restore();
    }

    // Convierte la posición del puntero en una fila y columna del tablero.
    function getCellFromPointer(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - boardOffsetX;
        const y = event.clientY - rect.top - boardOffsetY;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        if (row < 0 || row > 6 || col < 0 || col > 6 || !isValidPosition(row, col)) return null;
        return { row, col };
    }

    // Calcula los saltos posibles en el estado de tablero recibido.
    function getValidMoves(state) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const validMoves = [];
        positions.forEach(({ row, col }) => {
            if (!state[key(row, col)]) return;
            directions.forEach(([dr, dc]) => {
                const middleRow = row + dr;
                const middleCol = col + dc;
                const targetRow = row + dr * 2;
                const targetCol = col + dc * 2;
                if (isValidPosition(targetRow, targetCol) &&
                    state[key(middleRow, middleCol)] &&
                    !state[key(targetRow, targetCol)]) {
                    validMoves.push({
                        from: { row, col },
                        to: { row: targetRow, col: targetCol }
                    });
                }
            });
        });
        return validMoves;
    }

    // Actualiza el tiempo y los contadores que aparecen junto al canvas.
    function updateStats() {
        movesElement.textContent = moves;
        remainingElement.textContent = Object.values(board).filter(Boolean).length;
        const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
        const seconds = (secondsLeft % 60).toString().padStart(2, "0");
        timerElement.textContent = minutes + ":" + seconds;
    }

    // Redibuja el tablero y sincroniza los contadores.
    function renderBoard() {
        updateStats();
        drawBoard();
    }

    // Inicia el contador regresivo de la partida.
    function startTimer() {
        clearInterval(timerId);
        timerId = setInterval(() => {
            if (!started || finished) return;
            secondsLeft--;
            updateStats();
            if (secondsLeft <= 0) endGame(false, "Se terminó el tiempo. ¡Probá otra vez!");
        }, 1000);
    }

    // Prepara una partida nueva y activa el temporizador.
    function startGame() {
        if (selectedPieceIndex === null) {
            messageElement.textContent = "Primero elegí el diseño de tus fichas.";
            return;
        }
        board = createInitialBoard();
        selected = null;
        moves = 0;
        secondsLeft = timeLimit;
        started = true;
        finished = false;
        hintMove = null;
        hintButton.disabled = false;
        restartButton.disabled = false;
        clearTimeout(hintTimeout);
        modalElement.classList.remove("show");
        messageElement.textContent = "Elegí una ficha y arrastrala hasta un hueco válido.";
        renderBoard();
        startTimer();
    }

    // Verifica que el salto sea recto, de dos casillas y sobre otra ficha.
    function isLegalMove(from, to) {
        if (!from || !to) return false;
        const rowDistance = to.row - from.row;
        const colDistance = to.col - from.col;
        const straightJump = (Math.abs(rowDistance) === 2 && colDistance === 0) ||
            (Math.abs(colDistance) === 2 && rowDistance === 0);
        if (!straightJump || !isValidPosition(to.row, to.col)) return false;
        const middleRow = from.row + rowDistance / 2;
        const middleCol = from.col + colDistance / 2;
        return board[key(from.row, from.col)] &&
            board[key(middleRow, middleCol)] &&
            !board[key(to.row, to.col)];
    }

    // Ejecuta el salto, elimina la ficha intermedia y comprueba el final del juego.
    function makeMove(from, to) {
        if (!started || finished || !isLegalMove(from, to)) return false;
        const middleRow = (from.row + to.row) / 2;
        const middleCol = (from.col + to.col) / 2;
        board[key(from.row, from.col)] = false;
        board[key(middleRow, middleCol)] = false;
        board[key(to.row, to.col)] = true;
        selected = null;
        moves++;
        hintMove = null;
        renderBoard();
        checkGameState();
        return true;
    }

    // Gestiona el inicio del puntero sobre una ficha.
    function handlePointerDown(event) {
        if (!started || finished) return;
        const cell = getCellFromPointer(event);
        if (!cell || !board[key(cell.row, cell.col)]) return;
        pointerStart = cell;
        pointerPosition = { x: event.clientX - canvas.getBoundingClientRect().left,
            y: event.clientY - canvas.getBoundingClientRect().top };
        isDragging = true;
        canvas.setPointerCapture(event.pointerId);
        renderBoard();
    }

    // Actualiza la posición visual de la ficha mientras se arrastra.
    function handlePointerMove(event) {
        if (!isDragging || !pointerStart) return;
        const rect = canvas.getBoundingClientRect();
        pointerPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        drawBoard();
    }

    // Suelta la ficha en el destino, o conserva la selección si fue un clic.
    function handlePointerUp(event) {
        if (!isDragging || !pointerStart) return;
        const target = getCellFromPointer(event);
        const rect = canvas.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;
        const startX = boardOffsetX + (pointerStart.col + 0.5) * cellSize;
        const startY = boardOffsetY + (pointerStart.row + 0.5) * cellSize;
        const distance = Math.hypot(endX - startX, endY - startY);
        const origin = pointerStart;
        suppressNextClick = true;
        isDragging = false;
        pointerStart = null;
        pointerPosition = null;

        if (distance < 8) {
            selected = origin;
            messageElement.textContent = "Ahora soltá la ficha en un hueco válido o elegí el destino con otro clic.";
        } else if (target && makeMove(origin, target)) {
            messageElement.textContent = "¡Buen movimiento!";
        } else {
            messageElement.textContent = "Ese movimiento no es válido. La ficha volvió a su lugar.";
        }
        renderBoard();
    }

    // Permite completar un movimiento haciendo clic en la ficha y luego en el destino.
    function handleCanvasClick(event) {
        if (suppressNextClick) {
            suppressNextClick = false;
            return;
        }
        if (!started || finished || isDragging) return;
        const cell = getCellFromPointer(event);
        if (!cell) return;
        if (board[key(cell.row, cell.col)]) {
            selected = cell;
            messageElement.textContent = "Ahora elegí un hueco vacío a dos posiciones.";
        } else if (selected && makeMove(selected, cell)) {
            messageElement.textContent = "¡Buen movimiento!";
        } else if (selected) {
            messageElement.textContent = "Ese movimiento no es válido.";
        }
        renderBoard();
    }

    // Comprueba si queda una ficha o si ya no existen saltos disponibles.
    function checkGameState() {
        const remaining = Object.values(board).filter(Boolean).length;
        if (remaining === 1) {
            endGame(true, "¡Excelente! Lograste dejar una sola ficha.");
        } else if (getValidMoves(board).length === 0) {
            endGame(false, "No quedan movimientos posibles. Te quedaron " + remaining + " fichas.");
        }
    }

    // Detiene el temporizador y muestra el resultado de la partida.
    function endGame(won, message) {
        finished = true;
        started = false;
        clearInterval(timerId);
        hintButton.disabled = true;
        modalTitle.textContent = won ? "¡Lo lograste!" : "Fin de la partida";
        modalText.textContent = message;
        modalElement.classList.add("show");
        messageElement.textContent = message;
        renderBoard();
    }

    // Resalta temporalmente el origen y el destino de un salto posible.
    function showHint() {
        if (!started || finished) return;
        const availableMoves = getValidMoves(board);
        if (!availableMoves.length) {
            checkGameState();
            return;
        }
        hintMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        messageElement.textContent = "Pista: mové la ficha resaltada hacia el círculo marcado.";
        drawBoard();
        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
            hintMove = null;
            drawBoard();
        }, 2200);
    }

    // Reinicia el juego desde el estado inicial si ya se eligió un diseño.
    function restartGame() {
        startGame();
    }

    // Aplica a todas las posiciones el diseño seleccionado en el menú.
    function changePieceDesign() {
        selectedPieceIndex = Number(pieceChoice.value);
        if (!started) {
            board = createInitialBoard();
            selected = null;
            renderBoard();
            startButton.disabled = false;
            restartButton.disabled = false;
            messageElement.textContent = "Diseño seleccionado. Presioná “Comenzar partida”.";
        } else {
            renderBoard();
            messageElement.textContent = "Cambiaste el diseño de las fichas.";
        }
    }

    // Oculta el mensaje final de la partida.
    function closeModal() {
        modalElement.classList.remove("show");
    }

    // Conecta el selector de diseño con el tablero.
    pieceChoice.addEventListener("change", changePieceDesign);

    // Conecta botones, eventos del canvas y ajuste de tamaño.
    startButton.addEventListener("click", startGame);
    document.getElementById("peg-play-online").addEventListener("click", () => {
        canvas.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    restartButton.addEventListener("click", restartGame);
    hintButton.addEventListener("click", showHint);
    closeButton.addEventListener("click", closeModal);
    modalRestartButton.addEventListener("click", restartGame);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("click", handleCanvasClick);
    window.addEventListener("resize", resizeCanvas);

    // Muestra el tablero inicial antes de comenzar la partida.
    board = createInitialBoard();
    startButton.disabled = true;
    hintButton.disabled = true;
    restartButton.disabled = true;
    resizeCanvas();
    renderBoard();
})();
