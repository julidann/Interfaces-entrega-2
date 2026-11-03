/**
 * Spider-Peg
 * Solitario de clavijas en un tablero de 7x7.
 * Incluye arrastrar y soltar, selección por clic, pistas, temporizador y reinicio.
 */
(() => {
    "use strict";

    // Configuración general del juego.
    const TAMANIO_TABLERO = 7;
    const TIEMPO_LIMITE = 5 * 60;
    const DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const ARCHIVOS_FICHAS = ["ficha1.png", "ficha2.png", "ficha3.png"];

    // Elementos de la página.
    const canvas = document.getElementById("peg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const elementos = {
        movimientos: document.getElementById("peg-moves"),
        fichas: document.getElementById("peg-remaining"),
        tiempo: document.getElementById("peg-timer"),
        mensaje: document.getElementById("peg-message"),
        modal: document.getElementById("peg-modal"),
        tituloModal: document.getElementById("peg-modal-title"),
        textoModal: document.getElementById("peg-modal-text"),
        pista: document.getElementById("peg-hint"),
        reiniciar: document.getElementById("peg-restart"),
        reiniciarModal: document.getElementById("peg-modal-restart"),
        selectorFichas: document.getElementById("peg-piece-choice")
    };

    // Carga las imágenes utilizadas en el tablero.
    const imagenTablero = cargarImagen("../assets/img/tablero.svg");
    const imagenesFichas = ARCHIVOS_FICHAS.map(archivo =>
        cargarImagen("../assets/img/" + archivo)
    );

    // Guarda las 33 casillas que forman la cruz del tablero.
    const posiciones = [];


    for (let fila = 0; fila < TAMANIO_TABLERO; fila++) {
        for (let columna = 0; columna < TAMANIO_TABLERO; columna++) {
            if (fila >= 2 && fila <= 4 || columna >= 2 && columna <= 4) {
                posiciones.push({ fila, columna });

            }
        }
    }

    // Estado de la partida.
    let tablero = crearTableroInicial();
    let fichaElegida = null;
    let seleccion = null;
    let movimientos = 0;
    let segundosRestantes = TIEMPO_LIMITE;
    let temporizador = null;
    let partidaIniciada = false;
    let partidaTerminada = false;

    // Estado del arrastre con mouse y de la pista animada.
    let origenArrastre = null;
    let posicionMouse = null;
    let arrastrando = false;
    let movimientoPista = null;
    let temporizadorPista = null;
    let animacionPista = null;

    // Medidas del tablero dentro del canvas.
    let tamanioCelda = 0;
    let desplazamientoX = 0;
    let desplazamientoY = 0;
    let tamanioCuadrado = 0;

    /**
     * Carga una imagen y vuelve a dibujar el tablero cuando está lista.
     */
    function cargarImagen(ruta) {
        const imagen = new Image();
        imagen.onload = dibujarTablero;
        imagen.onerror = () => {
            elementos.mensaje.textContent = "No se pudo cargar una imagen del juego.";
            dibujarTablero();
        };
        imagen.src = ruta;
        return imagen;
    }

    /**
     * Comprueba si una posición existe dentro de la cruz del tablero.
     * Las casillas externas están marcadas con -1 en la matriz.
     */
    function esPosicionValida(fila, columna) {
        return fila >= 0 && fila < TAMANIO_TABLERO &&
            columna >= 0 && columna < TAMANIO_TABLERO &&
            tablero[fila][columna] !== -1;
    }

    /**
     * Crea la matriz inicial: -1 = fuera, 1 = ficha y 0 = hueco vacío.
     */
    function crearTableroInicial() {
        return [
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1],
            [ 1,  1, 1, 1, 1,  1,  1],
            [ 1,  1, 1, 0, 1,  1,  1],
            [ 1,  1, 1, 1, 1,  1,  1],
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1]
        ];
    }

    /**
     * Cuenta las fichas que siguen en el tablero (casillas con valor 1).
     */
    function contarFichas() {
        let cantidad = 0;
        tablero.forEach(fila => {
            fila.forEach(casilla => {
                if (casilla === 1) cantidad++;
            });
        });
        return cantidad;
    }

    /**
     * Ajusta la resolución del canvas y calcula las medidas de cada casilla.
     */
    function ajustarCanvas() {
        const rect = canvas.getBoundingClientRect();
        const escala = window.devicePixelRatio || 1;

        canvas.width = Math.round(rect.width * escala);
        canvas.height = Math.round(rect.height * escala);
        ctx.setTransform(escala, 0, 0, escala, 0, 0);

        tamanioCuadrado = Math.min(rect.width, rect.height);
        tamanioCelda = tamanioCuadrado / TAMANIO_TABLERO;
        desplazamientoX = (rect.width - tamanioCuadrado) / 2;
        desplazamientoY = (rect.height - tamanioCuadrado) / 2;

        dibujarTablero();
    }

    /**
     * Dibuja el tablero, las fichas, la selección, la pista y la ficha arrastrada.
     */
    function dibujarTablero() {
        if (!tamanioCelda) return;

        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = "#111111";
        ctx.fillRect(desplazamientoX, desplazamientoY, tamanioCuadrado, tamanioCuadrado);

        if (imagenTablero.complete && imagenTablero.naturalWidth) {
            ctx.drawImage(imagenTablero, desplazamientoX, desplazamientoY, tamanioCuadrado, tamanioCuadrado);
        }

        posiciones.forEach(({ fila, columna }) => {
            const x = desplazamientoX + (columna + 0.5) * tamanioCelda;
            const y = desplazamientoY + (fila + 0.5) * tamanioCelda;
            const radio = tamanioCelda * 0.39;

            // Dibuja los huecos si el fondo todavía no se cargó.
            if (!imagenTablero.complete || !imagenTablero.naturalWidth) {
                ctx.beginPath();
                ctx.arc(x, y, radio, 0, Math.PI * 2);
                ctx.fillStyle = "#292929";
                ctx.fill();
                ctx.strokeStyle = "#454545";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Marca la ficha seleccionada y los extremos de la pista.
            if (coincide(origenArrastre || seleccion, fila, columna)) {
                dibujarResaltado(x, y, radio, "#FFD600", performance.now());
            }
            if (movimientoPista && coincide(movimientoPista.origen, fila, columna)) {
                dibujarResaltado(x, y, radio, "#D6006A", performance.now());
            }
            if (movimientoPista && coincide(movimientoPista.destino, fila, columna)) {
                dibujarResaltado(x, y, radio, "#06D606", performance.now());
            }

            // Dibuja las fichas que no están siendo arrastradas.
            const esFichaArrastrada = arrastrando && coincide(origenArrastre, fila, columna);
            if (tablero[fila][columna] === 1 && !esFichaArrastrada) {
                dibujarFicha(x, y, tamanioCelda * 0.76);
            }
        });

        if (movimientoPista) dibujarRecorridoPista(performance.now());

        if (arrastrando && posicionMouse) {
            dibujarFicha(posicionMouse.x, posicionMouse.y, tamanioCelda * 0.82);
        }
    }

    /**
     * Comprueba si dos posiciones representan la misma casilla.
     */
    function coincide(posicion, fila, columna) {
        return posicion && posicion.fila === fila && posicion.columna === columna;
    }

    /**
     * Dibuja el contorno animado de una casilla resaltada.
     */
    function dibujarResaltado(x, y, radio, color, ahora) {
        const pulso = (Math.sin(ahora / 180) + 1) / 2;
        ctx.save();
        ctx.globalAlpha = 0.55 + pulso * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, radio + 4 + pulso * 9, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 + pulso * 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12 + pulso * 10;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Dibuja la línea y el punto animado que muestran el salto sugerido.
     */
    function dibujarRecorridoPista(ahora) {
        const desde = movimientoPista.origen;
        const hasta = movimientoPista.destino;
        const x1 = desplazamientoX + (desde.columna + 0.5) * tamanioCelda;
        const y1 = desplazamientoY + (desde.fila + 0.5) * tamanioCelda;
        const x2 = desplazamientoX + (hasta.columna + 0.5) * tamanioCelda;
        const y2 = desplazamientoY + (hasta.fila + 0.5) * tamanioCelda;
        const avance = (ahora % 1100) / 1100;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.setLineDash([6, 7]);
        ctx.lineDashOffset = -ahora / 35;
        ctx.strokeStyle = "#FFD600";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#FFD600";
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x1 + (x2 - x1) * avance, y1 + (y2 - y1) * avance, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "#FFD600";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
    }

    /**
     * Dibuja una ficha con el diseño seleccionado.
     */
    function dibujarFicha(x, y, tamanio) {
        if (fichaElegida === null) return;

        const imagen = imagenesFichas[fichaElegida];
        if (!imagen.complete || !imagen.naturalWidth) return;

        ctx.save();
        ctx.shadowColor = "#000000aa";
        ctx.shadowBlur = 7;
        ctx.drawImage(imagen, x - tamanio / 2, y - tamanio / 2, tamanio, tamanio);
        ctx.restore();
    }

    /**
     * Convierte las coordenadas del mouse en una casilla del tablero.
     */
    function obtenerCasilla(evento) {
        const rect = canvas.getBoundingClientRect();
        const x = evento.clientX - rect.left - desplazamientoX;
        const y = evento.clientY - rect.top - desplazamientoY;
        const columna = Math.floor(x / tamanioCelda);
        const fila = Math.floor(y / tamanioCelda);

        if (!esPosicionValida(fila, columna)) return null;
        return { fila, columna };
    }

    /**
     * Calcula todos los saltos legales disponibles en el tablero actual.
     */
    function obtenerMovimientosValidos() {
        const disponibles = [];

        posiciones.forEach(({ fila, columna }) => {
            if (tablero[fila][columna] !== 1) return;

            DIRECCIONES.forEach(([df, dc]) => {
                const destino = { fila: fila + df * 2, columna: columna + dc * 2 };
                const medio = { fila: fila + df, columna: columna + dc };

                if (esPosicionValida(destino.fila, destino.columna) &&
                    tablero[medio.fila][medio.columna] === 1 &&
                    tablero[destino.fila][destino.columna] === 0) {
                    disponibles.push({ origen: { fila, columna }, destino });
                }
            });
        });

        return disponibles;
    }

    /**
     * Actualiza los contadores y el tiempo que se muestran en pantalla.
     */
    function actualizarEstadisticas() {
        elementos.movimientos.textContent = movimientos;
        elementos.fichas.textContent = contarFichas();

        const minutos = Math.floor(segundosRestantes / 60).toString().padStart(2, "0");
        const segundos = (segundosRestantes % 60).toString().padStart(2, "0");
        elementos.tiempo.textContent = minutos + ":" + segundos;
    }

    /**
     * Redibuja el tablero y actualiza sus estadísticas.
     */
    function actualizarJuego() {
        actualizarEstadisticas();
        dibujarTablero();
    }

    /**
     * Inicia el temporizador regresivo de la partida.
     */
    function iniciarTemporizador() {
        clearInterval(temporizador);
        temporizador = setInterval(() => {
            if (!partidaIniciada || partidaTerminada) return;
            segundosRestantes--;
            actualizarEstadisticas();

            if (segundosRestantes <= 0) {
                finalizarPartida(false, "Se terminó el tiempo. ¡Probá otra vez!");
            }
        }, 1000);
    }

    /**
     * Prepara la partida y comienza a contar el tiempo.
     */
    function comenzarPartida() {
        if (fichaElegida === null) {
            elementos.mensaje.textContent = "Primero elegí el diseño de tus fichas.";
            return;
        }

        tablero = crearTableroInicial();
        fichaElegida = Number(elementos.selectorFichas.value);
        seleccion = null;
        movimientos = 0;
        segundosRestantes = TIEMPO_LIMITE;
        partidaIniciada = true;
        partidaTerminada = false;
        elementos.pista.disabled = false;
        elementos.reiniciar.disabled = false;
        elementos.modal.classList.remove("show");
        limpiarPista();
        elementos.mensaje.textContent = "Arrastrá una ficha hasta un hueco válido para jugar.";
        actualizarJuego();
        iniciarTemporizador();
    }

    /**
     * Comprueba si el movimiento entre dos casillas respeta las reglas.
     */
    function esMovimientoValido(origen, destino) {
        if (!origen || !destino) return false;

        const df = destino.fila - origen.fila;
        const dc = destino.columna - origen.columna;
        const saltoRecto = Math.abs(df) === 2 && dc === 0 ||
            Math.abs(dc) === 2 && df === 0;

        if (!saltoRecto || !esPosicionValida(destino.fila, destino.columna)) return false;

        const medio = { fila: origen.fila + df / 2, columna: origen.columna + dc / 2 };
        return tablero[origen.fila][origen.columna] === 1 &&
            tablero[medio.fila][medio.columna] === 1 &&
            tablero[destino.fila][destino.columna] === 0;
    }

    /**
     * Realiza un salto válido, elimina la ficha intermedia y revisa el final.
     */
    function moverFicha(origen, destino) {
        if (!partidaIniciada || partidaTerminada || !esMovimientoValido(origen, destino)) {
            return false;
        }

        const medio = {
            fila: (origen.fila + destino.fila) / 2,
            columna: (origen.columna + destino.columna) / 2
        };

        tablero[origen.fila][origen.columna] = 0;
        tablero[medio.fila][medio.columna] = 0;
        tablero[destino.fila][destino.columna] = 1;
        movimientos++;
        seleccion = null;

        limpiarPista();
        actualizarJuego();
        comprobarFinal();
        return true;
    }

    /**
     * Inicia el arrastre de una ficha y, si es la primera, comienza la partida.
     */
    function alPresionarMouse(evento) {
        if (partidaTerminada) return;

        const casilla = obtenerCasilla(evento);
        if (!casilla || tablero[casilla.fila][casilla.columna] !== 1) return;

        if (!partidaIniciada) {
            if (fichaElegida === null) {
                elementos.mensaje.textContent = "Primero elegí el diseño de tus fichas.";
                return;
            }
            comenzarPartida();
        }

        origenArrastre = casilla;
        const rect = canvas.getBoundingClientRect();
        posicionMouse = { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
        arrastrando = true;
        dibujarTablero();
    }

    /**
     * Mueve visualmente la ficha mientras se arrastra.
     */
    function alMoverMouse(evento) {
        if (!arrastrando) return;

        const rect = canvas.getBoundingClientRect();
        posicionMouse = { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
        dibujarTablero();
    }

    /**
     * Suelta la ficha: ejecuta el salto o deja la ficha en su lugar.
     */
    function alSoltarMouse(evento) {
        if (!arrastrando || !origenArrastre) return;

        const destino = obtenerCasilla(evento);
        const rect = canvas.getBoundingClientRect();
        const x = evento.clientX - rect.left;
        const y = evento.clientY - rect.top;
        const inicioX = desplazamientoX + (origenArrastre.columna + 0.5) * tamanioCelda;
        const inicioY = desplazamientoY + (origenArrastre.fila + 0.5) * tamanioCelda;
        const distancia = Math.hypot(x - inicioX, y - inicioY);
        const origen = origenArrastre;

        arrastrando = false;
        origenArrastre = null;
        posicionMouse = null;

        if (distancia < 8) {
            // Un clic selecciona la ficha para elegir el destino con otro clic.
            seleccion = origen;
            elementos.mensaje.textContent = "Ahora elegí un hueco vacío a dos posiciones.";
        } else if (destino && moverFicha(origen, destino)) {
            elementos.mensaje.textContent = "¡Buen movimiento!";
        } else {
            elementos.mensaje.textContent = "Ese movimiento no es válido. La ficha volvió a su lugar.";
        }

        actualizarJuego();
    }

    /**
     * Comprueba si se ganó o si ya no quedan movimientos posibles.
     */
    function comprobarFinal() {
        const restantes = contarFichas();

        if (restantes === 1) {
            finalizarPartida(true, "¡Excelente! Lograste dejar una sola ficha.");
        } else if (obtenerMovimientosValidos().length === 0) {
            finalizarPartida(false, "No quedan movimientos posibles. Te quedaron " + restantes + " fichas.");
        }
    }

    /**
     * Detiene la partida y muestra el resultado.
     */
    function finalizarPartida(gano, mensaje) {
        partidaTerminada = true;
        partidaIniciada = false;
        clearInterval(temporizador);
        limpiarPista();
        elementos.pista.disabled = true;
        elementos.tituloModal.textContent = gano ? "¡Lo lograste!" : "Fin de la partida";
        elementos.textoModal.textContent = mensaje;
        elementos.modal.classList.add("show");
        elementos.mensaje.textContent = mensaje;
        actualizarJuego();
    }

    /**
     * Muestra una pista animada con un movimiento válido al azar.
     */
    function mostrarPista() {
        if (!partidaIniciada || partidaTerminada) return;

        const movimientosValidos = obtenerMovimientosValidos();
        if (!movimientosValidos.length) {
            comprobarFinal();
            return;
        }

        limpiarPista();
        movimientoPista = movimientosValidos[Math.floor(Math.random() * movimientosValidos.length)];
        elementos.mensaje.textContent = "Pista: mové la ficha resaltada hacia el círculo marcado.";
        animarPista();
        temporizadorPista = setTimeout(limpiarPista, 3000);
    }

    /**
     * Mantiene activa la animación de la pista hasta que se oculta.
     */
    function animarPista() {
        if (!movimientoPista) return;
        dibujarTablero();
        animacionPista = requestAnimationFrame(animarPista);
    }

    /**
     * Cancela la pista actual y libera su temporizador y animación.
     */
    function limpiarPista() {
        clearTimeout(temporizadorPista);
        cancelAnimationFrame(animacionPista);
        temporizadorPista = null;
        animacionPista = null;
        movimientoPista = null;
        dibujarTablero();
    }

    /**
     * Vuelve al estado inicial y deja el temporizador detenido.
     */
    function reiniciarPartida() {
        clearInterval(temporizador);
        limpiarPista();

        tablero = crearTableroInicial();
        seleccion = null;
        movimientos = 0;
        segundosRestantes = TIEMPO_LIMITE;
        partidaIniciada = false;
        partidaTerminada = false;
        arrastrando = false;
        origenArrastre = null;
        posicionMouse = null;

        elementos.pista.disabled = true;
        elementos.reiniciar.disabled = fichaElegida === null;
        elementos.modal.classList.remove("show");
        elementos.mensaje.textContent = fichaElegida === null
            ? "Elegí un diseño de ficha para comenzar."
            : "Arrastrá una ficha para comenzar la partida.";

        actualizarJuego();
    }

    /**
     * Aplica el diseño elegido a todas las fichas del tablero.
     */
    function cambiarDisenoFichas() {
        fichaElegida = elementos.selectorFichas.value === ""
            ? null
            : Number(elementos.selectorFichas.value);

        if (!partidaIniciada) {
            elementos.reiniciar.disabled = fichaElegida === null;
            elementos.mensaje.textContent = fichaElegida === null
                ? "Elegí un diseño de ficha para comenzar."
                : "Diseño seleccionado. Arrastrá una ficha para comenzar.";
        }

        dibujarTablero();
    }

    // Conecta los controles y los eventos del canvas.
    elementos.selectorFichas.addEventListener("change", cambiarDisenoFichas);
    elementos.reiniciar.addEventListener("click", reiniciarPartida);
    elementos.reiniciarModal.addEventListener("click", reiniciarPartida);
    elementos.pista.addEventListener("click", mostrarPista);
    canvas.addEventListener("mousedown", alPresionarMouse);
    window.addEventListener("mousemove", alMoverMouse);
    window.addEventListener("mouseup", alSoltarMouse);
    window.addEventListener("resize", ajustarCanvas);

    // Desplaza la página hasta el tablero desde el botón de acceso.
    document.getElementById("peg-play-online").addEventListener("click", () => {
        canvas.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    // Inicia el tablero sin comenzar todavía el temporizador.
    elementos.pista.disabled = true;
    elementos.reiniciar.disabled = true;
    actualizarEstadisticas();
    ajustarCanvas();
})();
