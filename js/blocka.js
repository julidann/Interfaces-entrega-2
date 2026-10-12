
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('blocka-board');
    const btnStart = document.getElementById('btn-start');
    const currentLevelSpan = document.getElementById('current-level');

    // Banco de imágenes (mínimo 6 según la consigna)
    const imageBank = [
        '../assets/img/blocka1.jpg',
        '../assets/img/blocka2.jpg',
        '../assets/img/blocka3.jpg',
        '../assets/img/blocka4.jpg',
        '../assets/img/blocka5.jpg',
        '../assets/img/blocka6.jpg'
    ];

    // Niveles y sus filtros
    const levels = [
        { level: 1, filter: 'grayscale' },
        { level: 2, filter: 'brightness' },
        { level: 3, filter: 'negative' }
    ];

    let currentLevelIdx = 0;
    let piecesData = [];
    let randomImgSrc = null;
    let levelCompleted = false;
    let gameStarted = false;

    let timerInterval = null;
    let elapsedSeconds = 0;
    let timerStarted = false;

    // Iniciar el juego
    btnStart.addEventListener('click', () => {
        currentLevelIdx = 0;
        gameStarted = true;
        startLevel(currentLevelIdx);
    });

    // Iniciar el temporizador
    function startTimer() {
    if (timerStarted) return;

    timerStarted = true;

    timerInterval = setInterval(() => {
        elapsedSeconds++;

        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        document.getElementById('timer').textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

    // Iniciar un nivel
    function startLevel(levelIndex) {
        if (levelIndex >= levels.length) {
            return;
        }

        board.innerHTML = '';
        piecesData = [];
        levelCompleted = false;

        updateLevelDisplay();

        // Seleccionar una imagen aleatoria del banco
        randomImgSrc = new Image();

        randomImgSrc.onload = () => {
            const subWidth = Math.floor(randomImgSrc.width / 2);
            const subHeight = Math.floor(randomImgSrc.height / 2);

            // Coordenadas de los cuatro recortes
            const cuts = [
                { sx: 0, sy: 0 },
                { sx: subWidth, sy: 0 },
                { sx: 0, sy: subHeight },
                { sx: subWidth, sy: subHeight }
            ];

            cuts.forEach((cut, index) => {
                // Crear un canvas para cada pieza
                const canvas = document.createElement('canvas');
                canvas.width = subWidth;
                canvas.height = subHeight;
                canvas.classList.add('blocka-piece');
                canvas.dataset.index = index;

                const ctx = canvas.getContext('2d');

                // Recortar una parte de la imagen original
                ctx.drawImage(
                    randomImgSrc,
                    cut.sx, cut.sy, subWidth, subHeight,
                    0, 0, subWidth, subHeight
                );

                // Aplicar el filtro correspondiente al nivel
                applyPixelFilter(
                    ctx,
                    subWidth,
                    subHeight,
                    levels[levelIndex].filter
                );

                // Rotación inicial aleatoria: 90, 180 o 270 grados
                const possibleRotations = [90, 180, 270];

                const initialRotation =
                    possibleRotations[
                        Math.floor(Math.random() * possibleRotations.length)
                    ];

                const piece = {
                    canvas: canvas,
                    ctx: ctx,
                    rotation: initialRotation,
                    correct: false
                };

                piecesData.push(piece);

                canvas.style.transform = `rotate(${initialRotation}deg)`;

                // Clic izquierdo: girar 90 grados hacia la izquierda
                canvas.addEventListener('click', (e) => {
                    e.preventDefault();
                    startTimer(); 
                    rotatePiece(index, -90);
                });

                // Clic derecho: girar 90 grados hacia la derecha
                canvas.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    startTimer(); 
                    rotatePiece(index, 90);
                });

                board.appendChild(canvas);
            });
        };

        randomImgSrc.onerror = () => {
            alert('No se pudo cargar la imagen. Revisá la ruta del archivo.');
        };

        // Cargar la imagen seleccionada
        randomImgSrc.src =
            imageBank[Math.floor(Math.random() * imageBank.length)];
    }

    // Rotar una pieza
    function rotatePiece(index, degrees) {
        if (levelCompleted || !gameStarted) {
            return;
        }

        const piece = piecesData[index];

        if (!piece) {
            return;
        }

        piece.rotation = (piece.rotation + degrees) % 360;

        // Normalizar ángulos negativos
        if (piece.rotation < 0) {
            piece.rotation += 360;
        }

        piece.correct = piece.rotation === 0;

        piece.canvas.style.transform =
            `rotate(${piece.rotation}deg)`;

        checkWinCondition();
    }

    // Aplicar filtros a los píxeles de la imagen
    function applyPixelFilter(ctx, width, height, filterType) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (filterType === 'grayscale') {
                // Escala de grises
                const avg = 0.3 * r + 0.59 * g + 0.11 * b;

                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;

            } else if (filterType === 'brightness') {
                // Aumentar el brillo un 30 %
                data[i] = Math.min(255, r * 1.3);
                data[i + 1] = Math.min(255, g * 1.3);
                data[i + 2] = Math.min(255, b * 1.3);

            } else if (filterType === 'negative') {
                // Invertir los colores
                data[i] = 255 - r;
                data[i + 1] = 255 - g;
                data[i + 2] = 255 - b;
            }

            // El canal alfa (data[i + 3]) se mantiene sin cambios
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Comprobar si todas las piezas están correctamente orientadas
    function checkWinCondition() {
        if (levelCompleted || piecesData.length === 0) {
            return;
        }

        const allCorrect = piecesData.every(
            piece => piece.rotation === 0
        );

        if (allCorrect) {
            levelCompleted = true;
            clearInterval(timerInterval);

            // Quitar el filtro y mostrar los colores originales
            removeFiltersAndShowRGB();

            setTimeout(() => {
                alert(
                    `¡Nivel ${levels[currentLevelIdx].level} completado!`
                );

                currentLevelIdx++;

                if (currentLevelIdx < levels.length) {
                    // Iniciar el siguiente nivel
                    startLevel(currentLevelIdx);
                } else {
                    // Juego completado
                    alert(
                        '¡Felicitaciones! Completaste todos los niveles de BLOCKA.'
                    );

                    gameStarted = false;
                    currentLevelIdx = 0;
                    updateLevelDisplay();
                    board.innerHTML = '';
                    piecesData = [];
                    btnStart.textContent = 'Jugar de nuevo';
                }
            }, 300);
        }
    }

    // Actualizar el número de nivel en el HTML
    function updateLevelDisplay() {
        if (currentLevelSpan) {
            currentLevelSpan.textContent =
                levels[currentLevelIdx].level;
        }
    }

    // Quitar el filtro y recuperar la imagen original en cada canvas
    function removeFiltersAndShowRGB() {
        if (!randomImgSrc || !randomImgSrc.complete) {
            return;
        }

        const subWidth = Math.floor(randomImgSrc.width / 2);
        const subHeight = Math.floor(randomImgSrc.height / 2);

        const cuts = [
            { sx: 0, sy: 0 },
            { sx: subWidth, sy: 0 },
            { sx: 0, sy: subHeight },
            { sx: subWidth, sy: subHeight }
        ];

        piecesData.forEach((piece, index) => {
            const cut = cuts[index];

            // Limpiar el canvas
            piece.ctx.clearRect(
                0,
                0,
                piece.canvas.width,
                piece.canvas.height
            );

            // Dibujar el recorte original sin filtros
            piece.ctx.drawImage(
                randomImgSrc,
                cut.sx, cut.sy, subWidth, subHeight,
                0, 0, subWidth, subHeight
            );
        });
    }
});