document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const tablero = document.getElementById('blocka-board');
    const btnComenzar = document.getElementById('btn-start');
    const btnAyudita = document.getElementById('btn-hint');
    const selectPiezas = document.getElementById('select-pieces');
    const spanNivel = document.getElementById('current-level');
    const spanTiempo = document.getElementById('timer');
    
    // Contenedor del juego
    const contenedorJuego = document.querySelector('.game-container');

    // Banco de imágenes (mínimo 6 según la consigna)
    const bancoImagenes = [
        '../assets/img/blocka1.jpg',
        '../assets/img/blocka2.jpg',
        '../assets/img/blocka3.jpg',
        '../assets/img/blocka4.jpg',
        '../assets/img/blocka5.jpg',
        '../assets/img/blocka6.jpg'
    ];

    // Configuración de los 3 niveles con Filtros + Extra 4 (Tiempo límite en Nivel 3)
    const niveles = [
        { numero: 1, filtro: 'grises', tiempoMaximo: null },   // Nivel 1: Sin límite
        { numero: 2, filtro: 'brillo', tiempoMaximo: null },   // Nivel 2: Sin límite
        { numero: 3, filtro: 'negativo', tiempoMaximo: 45 }    // Nivel 3: 45 segundos límite
    ];

    let nivelActualIndex = 0;
    let piezas = []; 
    let imagenCargada = null;
    let enSorteo = false;
    
    // Control de tiempo y récords
    let cronometroInterval = null;
    let segundosTranscurridos = 0;
    let mejoresTiempos = {};

    // Eventos iniciales
    if (btnComenzar) {
        btnComenzar.addEventListener('click', () => {
            if (!enSorteo) ejecutarSorteoImagen();
        });
    }

    if (btnAyudita) {
        btnAyudita.addEventListener('click', usarAyudita);
    }

    // EXTRA 1: Sorteo de imagen en tamaño completo
    function ejecutarSorteoImagen() {
        enSorteo = true;
        tablero.innerHTML = '';
        tablero.style.display = 'grid';
        tablero.style.gridTemplateColumns = '1fr';
        tablero.style.gridTemplateRows = '1fr';

        frenarCronometro();

        if (btnComenzar) btnComenzar.disabled = true;
        if (btnAyudita) btnAyudita.disabled = true;
        if (selectPiezas) selectPiezas.disabled = true;

        const imgRuleta = document.createElement('img');
        imgRuleta.id = 'img-ruleta';
        imgRuleta.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
        `;
        tablero.appendChild(imgRuleta);

        const indiceElegido = Math.floor(Math.random() * bancoImagenes.length);
        const imagenGanadora = bancoImagenes[indiceElegido];

        let pasadas = 0;
        let actual = 0;
        const totalPasadas = 16 + indiceElegido;

        const intervalo = setInterval(() => {
            imgRuleta.src = bancoImagenes[actual % bancoImagenes.length];
            pasadas++;
            actual++;

            if (pasadas >= totalPasadas) {
                clearInterval(intervalo);
                imgRuleta.src = imagenGanadora;

                tablero.style.boxShadow = '0 0 25px #00d814';
                tablero.style.borderColor = '#00d814';
                
                setTimeout(() => {
                    tablero.style.boxShadow = 'none';
                    enSorteo = false;
                    iniciarNivelConImagen(imagenGanadora);
                }, 1500);
            }
        }, 180);
    }

    /*

    // Obtener la cantidad de piezas seleccionada
        const totalPiezas = selectPiezas ? parseInt(selectPiezas.value) : 4;
        let columnas, filas;

        // Estructura if / else para definir la grilla exacta
        if (totalPiezas === 6) {
            columnas = 3;
            filas = 2;
        } else if (totalPiezas === 8) {
            columnas = 4;
            filas = 2;
        } else {
            // Por defecto: 4 piezas (2x2)
            columnas = 2;
            filas = 2;
        }

        // Aplicar la grilla dinámica directamente al estilo del tablero
        tablero.style.display = 'grid';
        tablero.style.gridTemplateColumns = `repeat(${columnas}, minmax(0, 1fr))`;
        tablero.style.gridTemplateRows = `repeat(${filas}, minmax(0, 1fr))`;
        // Mantener cada celda cuadrada: el tablero adapta su proporción a la grilla.
        tablero.style.aspectRatio = `${columnas} / ${filas}`;
    */

    // EXTRA 2: Carga e inicio del tablero recortando SIEMPRE piezas cuadradas
    function iniciarNivelConImagen(urlImagen) {
        tablero.innerHTML = '';
        piezas = [];
        frenarCronometro();
        iniciarCronometro();

        if (btnComenzar) btnComenzar.disabled = false;
        if (btnAyudita) btnAyudita.disabled = false;
        if (selectPiezas) selectPiezas.disabled = false;

        if (spanNivel) {
            spanNivel.textContent = niveles[nivelActualIndex].numero;
        }

        // Obtener la cantidad de piezas seleccionada
        const totalPiezas = selectPiezas ? parseInt(selectPiezas.value) : 4;
        let columnas, filas;

        if (totalPiezas === 6) {
            columnas = 3;
            filas = 2;
        } else if (totalPiezas === 8) {
            columnas = 4;
            filas = 2;
        } else {
            // Por defecto: 4 piezas (2x2)
            columnas = 2;
            filas = 2;
        }

        // Grilla dinámica del tablero
        tablero.style.display = 'grid';
        tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
        tablero.style.gridTemplateRows = `repeat(${filas}, 1fr)`;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = urlImagen;

        img.onload = () => {
            imagenCargada = img;

            // Calcular cortes cuadrados para que cada pieza coincida con una celda cuadrada.
            const tamanoCorte = Math.min(img.width / columnas, img.height / filas);

            // Centrar el área utilizada cuando la imagen no tiene la proporción de la grilla.
            const offsetX = (img.width - tamanoCorte * columnas) / 2;
            const offsetY = (img.height - tamanoCorte * filas) / 2;

            // Generar los cortes
            const cortes = [];
            for (let f = 0; f < filas; f++) {
                for (let c = 0; c < columnas; c++) {
                    cortes.push({
                        x: offsetX + (c * tamanoCorte),
                        y: offsetY + (f * tamanoCorte)
                    });
                }
            }

            cortes.forEach((corte, index) => {
                const canvas = document.createElement('canvas');
                
                // 3. Forzar dimensión 1:1 (Cuadrada) en la resolución interna del Canvas
                canvas.width = 300; 
                canvas.height = 300;
                canvas.classList.add('blocka-piece');

                const ctx = canvas.getContext('2d');

                // Recortar la porción cuadrada exacta y dibujarla en el canvas cuadrado
                ctx.drawImage(
                    img,
                    corte.x, corte.y, tamanoCorte, tamanoCorte,
                    0, 0, canvas.width, canvas.height
                );

                // Aplicar filtro de nivel
                aplicarFiltroMatriz(ctx, canvas.width, canvas.height, niveles[nivelActualIndex].filtro);

                // Rotación aleatoria
                const angulosPosibles = [90, 180, 270];
                const rotacionInicial = angulosPosibles[Math.floor(Math.random() * angulosPosibles.length)];

                piezas.push({
                    canvas: canvas,
                    ctx: ctx,
                    rotacion: rotacionInicial,
                    fijada: false,
                    columna: index % columnas,
                    fila: Math.floor(index / columnas),
                    corteX: corte.x,
                    corteY: corte.y,
                    tamanoCorte: tamanoCorte
                });

                canvas.style.transform = `rotate(${rotacionInicial}deg)`;

                // Controles de rotación
                canvas.addEventListener('click', (e) => {
                    e.preventDefault();
                    rotarPieza(index, -90);
                });

                canvas.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    rotarPieza(index, 90);
                });

                tablero.appendChild(canvas);
            });
        };
    }

    // Rotación manual
    function rotarPieza(index, grados) {
        const pieza = piezas[index];
        if (pieza.fijada) return;

        pieza.rotacion = (pieza.rotacion + grados) % 360;
        if (pieza.rotacion < 0) pieza.rotacion += 360;

        pieza.canvas.style.transform = `rotate(${pieza.rotacion}deg)`;
        verificarVictoria();
    }

    // EXTRA 3: Lógica de Ayudita
    function usarAyudita() {
        const piezasIncorrectas = piezas.filter(p => p.rotacion !== 0 && !p.fijada);

        if (piezasIncorrectas.length > 0) {
            const piezaElegida = piezasIncorrectas[Math.floor(Math.random() * piezasIncorrectas.length)];
            piezaElegida.rotacion = 0;
            piezaElegida.fijada = true;
            piezaElegida.canvas.style.transform = 'rotate(0deg)';
            piezaElegida.canvas.style.outline = '2px solid #00d814';

            segundosTranscurridos += 5;
            actualizarPantallaTiempo();

            verificarVictoria();
        }
    }

    // Filtros con ImageData
    function aplicarFiltroMatriz(ctx, ancho, alto, tipoFiltro) {
        const datosImagen = ctx.getImageData(0, 0, ancho, alto);
        const pixeles = datosImagen.data;

        for (let i = 0; i < pixeles.length; i += 4) {
            let r = pixeles[i];
            let g = pixeles[i + 1];
            let b = pixeles[i + 2];

            if (tipoFiltro === 'grises') {
                let promedio = 0.3 * r + 0.59 * g + 0.11 * b;
                pixeles[i] = pixeles[i + 1] = pixeles[i + 2] = promedio;
            } else if (tipoFiltro === 'brillo') {
                pixeles[i] = Math.min(255, r * 1.30);
                pixeles[i + 1] = Math.min(255, g * 1.30);
                pixeles[i + 2] = Math.min(255, b * 1.30);
            } else if (tipoFiltro === 'negativo') {
                pixeles[i] = 255 - r;
                pixeles[i + 1] = 255 - g;
                pixeles[i + 2] = 255 - b;
            }
        }

        ctx.putImageData(datosImagen, 0, 0);
    }

    // Verificación de victoria
    function verificarVictoria() {
        if (!piezas || piezas.length === 0) return;

        const gano = piezas.every(p => p.rotacion === 0);

        if (gano) {
            frenarCronometro();
            if (btnAyudita) btnAyudita.disabled = true;

            const tiempoTexto = formatearTiempo(segundosTranscurridos);
            mostrarImagenLimpia();

            const claveNivel = `nivel_${niveles[nivelActualIndex].numero}_piezas_${piezas.length}`;
            const récordPrevio = mejoresTiempos[claveNivel];
            let esNuevoRécord = false;

            if (!récordPrevio || segundosTranscurridos < récordPrevio) {
                mejoresTiempos[claveNivel] = segundosTranscurridos;
                esNuevoRécord = true;
            }

            setTimeout(() => {
                mostrarCartelResultado(true, tiempoTexto, esNuevoRécord, récordPrevio);
            }, 1000);
        }
    }

    // Remoción de filtros
    // Remoción de filtros manteniendo el corte cuadrado perfecto
    function mostrarImagenLimpia() {
        if (!imagenCargada) return;

        piezas.forEach((pieza) => {
            pieza.ctx.clearRect(0, 0, pieza.canvas.width, pieza.canvas.height);
            pieza.ctx.drawImage(
                imagenCargada,
                pieza.corteX, pieza.corteY, pieza.tamanoCorte, pieza.tamanoCorte,
                0, 0, pieza.canvas.width, pieza.canvas.height
            );
        });
    }

    // Cartel dinámico
    function mostrarCartelResultado(gano, tiempoTexto, esNuevoRécord = false, récordPrevio = null) {
        const cartelExistente = document.getElementById('game-overlay');
        if (cartelExistente) cartelExistente.remove();

        const overlay = document.createElement('div');
        overlay.id = 'game-overlay';
        overlay.className = 'game-overlay';

        if (gano) {
            let textoRécordHTML = esNuevoRécord 
                ? '¡Nuevo récord alcanzado!' 
                : `Tu récord actual: ${formatearTiempo(récordPrevio)}`;

            const textoBoton = (nivelActualIndex === niveles.length - 1) ? 'Reiniciar Juego' : 'Siguiente Nivel';

            overlay.innerHTML = `
                <div class="overlay-card">
                    <h2>¡Nivel Completado! 🎉</h2>
                    <p>Tiempo de partida: <strong>${tiempoTexto}</strong></p>
                    <p class="record-text">${textoRécordHTML}</p>
                    <div class="overlay-actions">
                        <button id="btn-next-level" class="primary">${textoBoton}</button>
                        <a href="home.html" class="secondary">Menú Principal</a>
                    </div>
                </div>
            `;
        } else {
            overlay.innerHTML = `
                <div class="overlay-card">
                    <h2>¡Tiempo Agotado! ⏳</h2>
                    <p>Se terminó el tiempo límite para este nivel.</p>
                    <div class="overlay-actions">
                        <button id="btn-retry" class="primary">Reintentar Nivel</button>
                        <a href="home.html" class="secondary">Menú Principal</a>
                    </div>
                </div>
            `;
        }

        if (contenedorJuego) contenedorJuego.appendChild(overlay);

        const btnSiguiente = document.getElementById('btn-next-level');
        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', () => {
                overlay.remove();
                if (nivelActualIndex < niveles.length - 1) {
                    nivelActualIndex++;
                } else {
                    nivelActualIndex = 0;
                }
                ejecutarSorteoImagen();
            });
        }

        const btnReintentar = document.getElementById('btn-retry');
        if (btnReintentar) {
            btnReintentar.addEventListener('click', () => {
                overlay.remove();
                ejecutarSorteoImagen();
            });
        }
    }

    // Temporizador y control del Extra 4
    function iniciarCronometro() {
        segundosTranscurridos = 0;
        actualizarPantallaTiempo();

        cronometroInterval = setInterval(() => {
            segundosTranscurridos++;
            actualizarPantallaTiempo();

            const limiteNivel = niveles[nivelActualIndex].tiempoMaximo;
            if (limiteNivel && segundosTranscurridos >= limiteNivel) {
                frenarCronometro();
                mostrarCartelResultado(false, null);
            }
        }, 1000);
    }

    function frenarCronometro() {
        if (cronometroInterval) {
            clearInterval(cronometroInterval);
            cronometroInterval = null;
        }
    }

    function actualizarPantallaTiempo() {
        if (spanTiempo) {
            const limiteNivel = niveles[nivelActualIndex].tiempoMaximo;
            let textoDisplay = formatearTiempo(segundosTranscurridos);
            
            if (limiteNivel) {
                textoDisplay += ` / ${formatearTiempo(limiteNivel)}`;
            }
            spanTiempo.textContent = textoDisplay;
        }
    }

    function formatearTiempo(totalSegundos) {
        const min = Math.floor(totalSegundos / 60);
        const seg = totalSegundos % 60;
        return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
    }
});