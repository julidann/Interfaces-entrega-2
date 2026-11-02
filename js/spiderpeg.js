/* Lógica de Spider-Peg. Cada función está comentada para facilitar su lectura. */
(() => {
    "use strict";

    // Define las 33 posiciones válidas del tablero clásico inglés de 7 x 7.
    const positions = [];
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            if ((row >= 2 && row <= 4) || (col >= 2 && col <= 4)) positions.push({ row, col });
        }
    }

    // Guarda las referencias a los elementos de la interfaz.
    const boardElement = document.getElementById("peg-board");
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
    const timeLimit = 5 * 60;

    // Mantiene el estado actual de la partida.
    let board = [];
    let selected = null;
    let moves = 0;
    let secondsLeft = timeLimit;
    let timerId = null;
    let started = false;
    let finished = false;
    let draggedPosition = null;

    // Devuelve una clave única para identificar una casilla.
    function key(row, col) {
        return row + "-" + col;
    }

    // Comprueba si una coordenada pertenece al tablero con forma de cruz.
    function isValidPosition(row, col) {
        return positions.some(position => position.row === row && position.col === col);
    }

    // Selecciona el tipo de ficha ilustrada según la posición del tablero.
    function pieceImage(row, col) {
        const types = ["peg-red.svg", "peg-blue.svg", "peg-gold.svg"];
        return "../assets/img/" + types[(row * 3 + col) % types.length];
    }

    // Construye el estado inicial: todas las posiciones ocupadas salvo el centro.
    function createInitialBoard() {
        const initial = {};
        positions.forEach(({ row, col }) => {
            initial[key(row, col)] = !(row === 3 && col === 3);
        });
        return initial;
    }

    // Calcula todos los saltos válidos disponibles para el estado recibido.
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
                    validMoves.push({ from: { row, col }, to: { row: targetRow, col: targetCol } });
                }
            });
        });
        return validMoves;
    }

    // Actualiza los contadores visibles de movimientos, fichas y tiempo.
    function updateStats() {
        movesElement.textContent = moves;
        remainingElement.textContent = Object.values(board).filter(Boolean).length;
        const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
        const seconds = (secondsLeft % 60).toString().padStart(2, "0");
        timerElement.textContent = minutes + ":" + seconds;
    }

    // Dibuja las 49 celdas y coloca imágenes únicamente en las posiciones válidas.
    function renderBoard() {
        boardElement.innerHTML = "";
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement("button");
                cell.type = "button";
                cell.className = "peg-hole";
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.setAttribute("aria-label", "Fila " + (row + 1) + ", columna " + (col + 1));
                if (isValidPosition(row, col)) {
                    const occupied = board[key(row, col)];
                    if (occupied) {
                        cell.classList.add("has-peg");
                        const image = document.createElement("img");
                        image.src = pieceImage(row, col);
                        image.alt = "Ficha";
                        cell.appendChild(image);
                        cell.draggable = started && !finished;
                    }
                    if (selected && selected.row === row && selected.col === col) cell.classList.add("selected");
                    cell.addEventListener("click", handleCellClick);
                    cell.addEventListener("dragstart", handleDragStart);
                    cell.addEventListener("dragover", event => event.preventDefault());
                    cell.addEventListener("drop", handleDrop);
                } else {
                    cell.disabled = true;
                    cell.style.visibility = "hidden";
                }
                boardElement.appendChild(cell);
            }
        }
        updateStats();
    }

    // Inicia el temporizador cuando comienza una partida.
    function startTimer() {
        clearInterval(timerId);
        timerId = setInterval(() => {
            if (!started || finished) return;
            secondsLeft--;
            updateStats();
            if (secondsLeft <= 0) endGame(false, "Se terminó el tiempo. ¡Probá otra vez!");
        }, 1000);
    }

    // Inicia una partida nueva y activa los controles del juego.
    function startGame() {
        board = createInitialBoard();
        selected = null;
        moves = 0;
        secondsLeft = timeLimit;
        started = true;
        finished = false;
        messageElement.textContent = "Seleccioná una ficha y después el espacio al que querés saltar.";
        modalElement.classList.remove("show");
        renderBoard();
        startTimer();
    }

    // Comprueba si el movimiento entre dos coordenadas cumple las reglas del solitario.
    function isLegalMove(from, to) {
        const rowDistance = to.row - from.row;
        const colDistance = to.col - from.col;
        const isStraightJump = (Math.abs(rowDistance) === 2 && colDistance === 0) ||
            (Math.abs(colDistance) === 2 && rowDistance === 0);
        if (!isStraightJump || !isValidPosition(to.row, to.col)) return false;
        const middle = { row: from.row + rowDistance / 2, col: from.col + colDistance / 2 };
        return board[key(from.row, from.col)] &&
            board[key(middle.row, middle.col)] &&
            !board[key(to.row, to.col)];
    }

    // Ejecuta un salto válido y elimina la ficha que quedó en el medio.
    function makeMove(from, to) {
        if (!started || finished || !isLegalMove(from, to)) return false;
        const middleRow = (from.row + to.row) / 2;
        const middleCol = (from.col + to.col) / 2;
        board[key(from.row, from.col)] = false;
        board[key(middleRow, middleCol)] = false;
        board[key(to.row, to.col)] = true;
        selected = null;
        moves++;
        renderBoard();
        checkGameState();
        return true;
    }

    // Maneja la selección de fichas y el destino elegido mediante clic.
    function handleCellClick(event) {
        if (!started || finished) return;
        const row = Number(event.currentTarget.dataset.row);
        const col = Number(event.currentTarget.dataset.col);
        if (board[key(row, col)]) {
            selected = { row, col };
            messageElement.textContent = "Ahora elegí una casilla vacía a dos posiciones.";
            renderBoard();
        } else if (selected) {
            if (!makeMove(selected, { row, col })) {
                messageElement.textContent = "Ese salto no es válido. Elegí otra casilla.";
            }
        }
    }

    // Guarda el origen de la ficha que se está arrastrando.
    function handleDragStart(event) {
        if (!started || finished) { event.preventDefault(); return; }
        draggedPosition = {
            row: Number(event.currentTarget.dataset.row),
            col: Number(event.currentTarget.dataset.col)
        };
        selected = draggedPosition;
        event.dataTransfer.setData("text/plain", key(draggedPosition.row, draggedPosition.col));
    }

    // Ejecuta el movimiento cuando una ficha se suelta sobre otra casilla.
    function handleDrop(event) {
        event.preventDefault();
        if (!draggedPosition || finished) return;
        const target = {
            row: Number(event.currentTarget.dataset.row),
            col: Number(event.currentTarget.dataset.col)
        };
        if (!makeMove(draggedPosition, target)) {
            messageElement.textContent = "Movimiento no válido. No se modificó el tablero.";
        }
        draggedPosition = null;
    }

    // Comprueba si quedan movimientos y determina si la partida terminó.
    function checkGameState() {
        const remaining = Object.values(board).filter(Boolean).length;
        if (remaining === 1) {
            endGame(true, "¡Excelente! Lograste dejar una sola ficha.");
        } else if (getValidMoves(board).length === 0) {
            endGame(false, "No quedan movimientos posibles. Te quedaron " + remaining + " fichas.");
        }
    }

    // Detiene la partida y muestra el resultado.
    function endGame(won, message) {
        finished = true;
        started = false;
        clearInterval(timerId);
        modalTitle.textContent = won ? "¡Lo lograste!" : "Fin de la partida";
        modalText.textContent = message;
        modalElement.classList.add("show");
        messageElement.textContent = message;
        renderBoard();
    }

    // Muestra durante unos segundos un par de casillas que forman un movimiento válido.
    function showHint() {
        if (!started || finished) return;
        const availableMoves = getValidMoves(board);
        if (!availableMoves.length) { checkGameState(); return; }
        const hint = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        const fromCell = boardElement.querySelector('[data-row="' + hint.from.row + '"][data-col="' + hint.from.col + '"]');
        const toCell = boardElement.querySelector('[data-row="' + hint.to.row + '"][data-col="' + hint.to.col + '"]');
        fromCell.classList.add("hint-from");
        toCell.classList.add("hint-to");
        messageElement.textContent = "Pista: mové la ficha resaltada hacia el destino marcado.";
        setTimeout(() => {
            fromCell.classList.remove("hint-from");
            toCell.classList.remove("hint-to");
        }, 2100);
    }

    // Reinicia el tablero, el contador y el tiempo desde cero.
    function restartGame() {
        startGame();
    }

    // Cierra el cartel final sin modificar el resultado de la partida.
    function closeModal() {
        modalElement.classList.remove("show");
    }

    // Conecta los botones con las acciones correspondientes.
    startButton.addEventListener("click", startGame);
    document.getElementById("peg-play-online").addEventListener("click", () => {
        document.getElementById("jugar").scrollIntoView({ behavior: "smooth" });
    });
    restartButton.addEventListener("click", restartGame);
    hintButton.addEventListener("click", showHint);
    closeButton.addEventListener("click", closeModal);
    modalRestartButton.addEventListener("click", restartGame);

    // Presenta el tablero inicial como vista previa antes de comenzar.
    board = createInitialBoard();
    renderBoard();
})();
