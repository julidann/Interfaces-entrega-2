document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const tablero = document.getElementById('blocka-board');
    const btnComenzar = document.getElementById('btn-start');
    const btnAyudita = document.getElementById('btn-hint');
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
        { numero: 3, filtro: 'negativo', tiempoMaximo: 5 }    // Nivel 3: 45 segundos límite (Extra 4)
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

    // EXTRA 1: Animación de selección previa (Sorteo de miniaturas)
    // EXTRA 1: Sorteo de imagen en tamaño completo
   // EXTRA 1: Sorteo de imagen en tamaño completo
    function ejecutarSorteoImagen() {
        enSorteo = true;
        tablero.innerHTML = '';
        frenarCronometro();

        if (btnComenzar) btnComenzar.disabled = true;
        if (btnAyudita) btnAyudita.disabled = true;

        // Elemento <img> que ocupa todo el marco del tablero
        const imgRuleta = document.createElement('img');
        imgRuleta.id = 'img-ruleta';
        imgRuleta.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
            grid-column: 1 / -1;
            grid-row: 1 / -1;
        `;
        tablero.appendChild(imgRuleta);

        // Elegir la imagen ganadora desde el arranque
        const indiceElegido = Math.floor(Math.random() * bancoImagenes.length);
        const imagenGanadora = bancoImagenes[indiceElegido];

        let pasadas = 0;
        let actual = 0;
        const totalPasadas = 16 + indiceElegido; // Asegura que frene justo en indiceElegido

        const intervalo = setInterval(() => {
            // Muestra una foto aleatoria durante la animación
            imgRuleta.src = bancoImagenes[actual % bancoImagenes.length];

            pasadas++;
            actual++;

            // Cuando llega al final del sorteo
            if (pasadas >= totalPasadas) {
                clearInterval(intervalo);

                // Fijar explícitamente la imagen ganadora en el visor
                imgRuleta.src = imagenGanadora;

                // Destello neón verde para indicar que esa es la imagen elegida
                tablero.style.boxShadow = '0 0 25px #00d814';
                tablero.style.borderColor = '#00d814';
                
                setTimeout(() => {
                    tablero.style.boxShadow = 'none';
                    enSorteo = false;
                    // Arrancar el nivel con la MISMA imagen ganadora
                    iniciarNivelConImagen(imagenGanadora);
                }, 750);
            }
        }, 120);
    }

    // Carga e inicio del tablero de juego
    function iniciarNivelConImagen(urlImagen) {
        tablero.innerHTML = '';
        piezas = [];
        frenarCronometro();
        iniciarCronometro();

        if (btnComenzar) btnComenzar.disabled = false;
        if (btnAyudita) btnAyudita.disabled = false;

        if (spanNivel) {
            spanNivel.textContent = niveles[nivelActualIndex].numero;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = urlImagen;

        img.onload = () => {
            imagenCargada = img;
            const anchoParte = img.width / 2;
            const altoParte = img.height / 2;

            const cortes = [
                { x: 0, y: 0 },
                { x: anchoParte, y: 0 },
                { x: 0, y: altoParte },
                { x: anchoParte, y: altoParte }
            ];

            cortes.forEach((corte, index) => {
                const canvas = document.createElement('canvas');
                canvas.width = anchoParte;
                canvas.height = altoParte;
                canvas.classList.add('blocka-piece');

                const ctx = canvas.getContext('2d');

                // Corte de subimagen
                ctx.drawImage(
                    img,
                    corte.x, corte.y, anchoParte, altoParte,
                    0, 0, anchoParte, altoParte
                );

                // Aplicación de filtro según nivel (Grises, Brillo 30% o Negativo)
                aplicarFiltroMatriz(ctx, anchoParte, altoParte, niveles[nivelActualIndex].filtro);

                // Rotación aleatoria inicial
                const angulosPosibles = [90, 180, 270];
                const rotacionInicial = angulosPosibles[Math.floor(Math.random() * angulosPosibles.length)];

                piezas.push({
                    canvas: canvas,
                    ctx: ctx,
                    rotacion: rotacionInicial,
                    fijada: false
                });

                canvas.style.transform = `rotate(${rotacionInicial}deg)`;

                // Eventos de rotación
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

    // EXTRA 3: Lógica de la Ayudita (+5s y acomoda una pieza)
    function usarAyudita() {
        const piezasIncorrectas = piezas.filter(p => p.rotacion !== 0 && !p.fijada);

        if (piezasIncorrectas.length > 0) {
            const piezaElegida = piezasIncorrectas[Math.floor(Math.random() * piezasIncorrectas.length)];
            piezaElegida.rotacion = 0;
            piezaElegida.fijada = true;
            piezaElegida.canvas.style.transform = 'rotate(0deg)';
            piezaElegida.canvas.style.outline = '2px solid #00d814';

            // Penalización
            segundosTranscurridos += 5;
            actualizarPantallaTiempo();

            verificarVictoria();
        }
    }

    // Aplicación manual de filtros con ImageData (Sin usar CSS Filter)
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

    // Verificación de condición de victoria
    function verificarVictoria() {
        if (!piezas || piezas.length === 0) return;

        const gano = piezas.every(p => p.rotacion === 0);

        if (gano) {
            frenarCronometro();
            if (btnAyudita) btnAyudita.disabled = true;

            const tiempoTexto = formatearTiempo(segundosTranscurridos);
            mostrarImagenLimpia(); // Quita filtros y muestra la imagen original en RGB

            const claveNivel = `nivel_${niveles[nivelActualIndex].numero}`;
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

    // Remoción de filtros al completar el puzzle
    function mostrarImagenLimpia() {
        if (!imagenCargada) return;

        const anchoParte = imagenCargada.width / 2;
        const altoParte = imagenCargada.height / 2;

        const cortes = [
            { x: 0, y: 0 },
            { x: anchoParte, y: 0 },
            { x: 0, y: altoParte },
            { x: anchoParte, y: altoParte }
        ];

        piezas.forEach((pieza, i) => {
            const corte = cortes[i];
            pieza.ctx.clearRect(0, 0, anchoParte, altoParte);
            pieza.ctx.drawImage(
                imagenCargada,
                corte.x, corte.y, anchoParte, altoParte,
                0, 0, anchoParte, altoParte
            );
        });
    }

    // Cartel dinámico de resultado (Victoria / Derrota)
    function mostrarCartelResultado(gano, tiempoTexto, esNuevoRécord = false, récordPrevio = null) {
        const cartelExistente = document.getElementById('game-overlay');
        if (cartelExistente) cartelExistente.remove();

        const overlay = document.createElement('div');
        overlay.id = 'game-overlay';
        overlay.className = 'game-overlay';

        if (gano) {
            let textoRécordHTML = esNuevoRécord 
                ? '🏆 ¡Nuevo récord alcanzado en este nivel!' 
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
            // Cartel de Derrota (Tiempo agotado en Nivel 3)
            overlay.innerHTML = `
                <div class="overlay-card" style="border-color: #e50914;">
                    <h2 style="color: #e50914;">¡Tiempo Agotado! ⏳</h2>
                    <p>Se terminó el tiempo límite para este nivel.</p>
                    <div class="overlay-actions">
                        <button id="btn-retry" class="primary">Reintentar Nivel</button>
                        <a href="home.html" class="secondary">Menú Principal</a>
                    </div>
                </div>
            `;
        }

        if (contenedorJuego) contenedorJuego.appendChild(overlay);

        // Listeners de los botones del cartel
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

    // Temporizador y control de límite de tiempo (Extra 4)
    function iniciarCronometro() {
        segundosTranscurridos = 0;
        actualizarPantallaTiempo();

        cronometroInterval = setInterval(() => {
            segundosTranscurridos++;
            actualizarPantallaTiempo();

            // Verificación del tiempo máximo si el nivel lo exige
            const limiteNivel = niveles[nivelActualIndex].tiempoMaximo;
            if (limiteNivel && segundosTranscurridos >= limiteNivel) {
                frenarCronometro();
                mostrarCartelResultado(false, null); // Se dispara la derrota
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