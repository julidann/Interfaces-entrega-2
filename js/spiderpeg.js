/**
 * -----------------------------------------------------------------
 * JUEGO: SPIDER-PEG (Trabajo Práctico Especial Nº 4)
 * Archivo: js/spiderpeg.js
 * -----------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    const canvas = document.getElementById("peg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Configuración general
    const TAM_TABLERO = 7;
    const TIEMPO_LIMITE_SEGS = 300; // 5 minutos por defecto
    const DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const X = -1; // Celda inválida (esquinas)

    // Elementos de la interfaz
    const el = {
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

    // Carga de imágenes (asegurate de tener las rutas correctas relativas a la página)
    const imgTablero = new Image();
    imgTablero.src = "../assets/img/tablero.svg"; // Opcional, si no existe dibuja fondo oscuro
    
    // Las 3 fichas del selector (<option value="0", "1", "2">)
    const archivosFichas = ["ficha1.png", "ficha2.png", "ficha3.png"];
    const imagenesFichas = archivosFichas.map(archivo => {
        const img = new Image();
        img.src = "../assets/img/" + archivo;
        return img;
    });

    // Posiciones válidas de la cruz
    const posiciones = [];
    for (let f = 0; f < TAM_TABLERO; f++) {
        for (let c = 0; c < TAM_TABLERO; c++) {
            if ((f >= 2 && f <= 4) || (c >= 2 && c <= 4)) {
                posiciones.push({ fila: f, columna: c });
            }
        }
    }

    // Estado del juego
    let tablero = crearTableroInicial();
    let tipoFichaElegida = null;
    let movimientos = 0;
    let segundosRestantes = TIEMPO_LIMITE_SEGS;
    let intervaloTimer = null;
    let partidaIniciada = false;
    let partidaTerminada = false;

    // Arrastre y pistas
    let origenArrastre = null;
    let posicionMouse = null;
    let arrastrando = false;
    let movimientoPista = null;

    // Medidas del canvas dinámicas
    let tamCelda = 0;
    let despX = 0;
    let despY = 0;
    let tamCuadrado = 0;

    function esPosicionValida(f, c) {
        return f >= 0 && f < TAM_TABLERO && c >= 0 && c < TAM_TABLERO && tablero[f][c] !== X;
    }

    function crearTableroInicial() {
        return [
            [ X, X, 1, 1, 1, X, X],
            [ X, X, 1, 1, 1, X, X],
            [ 1, 1, 1, 1, 1, 1, 1],
            [ 1, 1, 1, 0, 1, 1, 1], // Centro vacío
            [ 1, 1, 1, 1, 1, 1, 1],
            [ X, X, 1, 1, 1, X, X],
            [ X, X, 1, 1, 1, X, X]
        ];
    }

    function contarFichas() {
        let count = 0;
        tablero.forEach(fila => fila.forEach(c => { if (c === 1) count++; }));
        return count;
    }

    function ajustarCanvas() {
        const rect = canvas.getBoundingClientRect();
        const escala = window.devicePixelRatio || 1;

        canvas.width = Math.round(rect.width * escala);
        canvas.height = Math.round(rect.height * escala);
        ctx.setTransform(escala, 0, 0, escala, 0, 0);

        tamCuadrado = Math.min(rect.width, rect.height);
        tamCelda = tamCuadrado / TAM_TABLERO;
        despX = (rect.width - tamCuadrado) / 2;
        despY = (rect.height - tamCuadrado) / 2;

        dibujarTablero();
    }

    function dibujarFicha(x, y, diametro) {
        if (tipoFichaElegida === null) return;
        const img = imagenesFichas[tipoFichaElegida];
        if (img && img.complete && img.naturalWidth) {
            ctx.save();
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 8;
            ctx.drawImage(img, x - diametro / 2, y - diametro / 2, diametro, diametro);
            ctx.restore();
        } else {
            // Fallback por si la imagen aún no cargó
            ctx.beginPath();
            ctx.arc(x, y, diametro / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#e74c3c';
            ctx.fill();
        }
    }

    function dibujarTablero() {
        if (!tamCelda) return;

        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = "#111111";
        ctx.fillRect(despX, despY, tamCuadrado, tamCuadrado);

        if (imgTablero.complete && imgTablero.naturalWidth) {
            ctx.drawImage(imgTablero, despX, despY, tamCuadrado, tamCuadrado);
        }

        posiciones.forEach(({ fila, columna }) => {
            const x = despX + (columna + 0.5) * tamCelda;
            const y = despY + (fila + 0.5) * tamCelda;
            const radio = tamCelda * 0.38;

            // Dibujar hueco base si no hay imagen de fondo
            if (!imgTablero.complete || !imgTablero.naturalWidth) {
                ctx.beginPath();
                ctx.arc(x, y, radio, 0, Math.PI * 2);
                ctx.fillStyle = "#292929";
                ctx.fill();
                ctx.strokeStyle = "#454545";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Resaltar origen de pista
            if (movimientoPista && movimientoPista.origen.fila === fila && movimientoPista.origen.columna === columna) {
                dibujarResaltado(x, y, radio, "#f1c40f");
            }
            // Resaltar destino de pista
            if (movimientoPista && movimientoPista.destino.fila === fila && movimientoPista.destino.columna === columna) {
                dibujarResaltado(x, y, radio, "#2ecc71");
            }

            // Dibujar fichas fijas (excluyendo la arrastrada)
            const esArrastrada = arrastrando && origenArrastre && origenArrastre.fila === fila && origenArrastre.columna === columna;
            if (tablero[fila][columna] === 1 && !esArrastrada) {
                dibujarFicha(x, y, tamCelda * 0.75);
            }
        });

        // Dibujar ficha que sigue al mouse
        if (arrastrando && posicionMouse && origenArrastre) {
            dibujarFicha(posicionMouse.x, posicionMouse.y, tamCelda * 0.8);
        }
    }

    function dibujarResaltado(x, y, radio, color) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radio + 4, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.restore();
    }

    function obtenerCasilla(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - despX;
        const y = e.clientY - rect.top - despY;
        const columna = Math.floor(x / tamCelda);
        const fila = Math.floor(y / tamCelda);

        return esPosicionValida(fila, columna) ? { fila, columna } : null;
    }

    function obtenerMovimientosValidos() {
        const validos = [];
        posiciones.forEach(({ fila, columna }) => {
            if (tablero[fila][columna] !== 1) return;
            DIRECCIONES.forEach(([df, dc]) => {
                const dest = { fila: fila + df * 2, columna: columna + dc * 2 };
                const med = { fila: fila + df, columna: columna + dc };
                if (esPosicionValida(dest.fila, dest.columna) &&
                    tablero[med.fila][med.columna] === 1 &&
                    tablero[dest.fila][dest.columna] === 0) {
                    validos.push({ origen: { fila, columna }, destino: dest });
                }
            });
        });
        return validos;
    }

    function actualizarEstadisticas() {
        el.movimientos.textContent = movimientos;
        el.fichas.textContent = contarFichas();

        const m = Math.floor(segundosRestantes / 60).toString().padStart(2, "0");
        const s = (segundosRestantes % 60).toString().padStart(2, "0");
        el.tiempo.textContent = `${m}:${s}`;
    }

    function iniciarTemporizador() {
        clearInterval(intervaloTimer);
        intervaloTimer = setInterval(() => {
            if (!partidaIniciada || partidaTerminada) return;
            segundosRestantes--;
            actualizarEstadisticas();

            if (segundosRestantes <= 0) {
                finalizarPartida(false, "¡Se terminó el tiempo!");
            }
        }, 1000);
    }

    function comenzarPartida() {
        if (tipoFichaElegida === null) {
            el.mensaje.textContent = "Primero elegí un diseño de fichas.";
            return;
        }

        tablero = crearTableroInicial();
        movimientos = 0;
        segundosRestantes = TIEMPO_LIMITE_SEGS;
        partidaIniciada = true;
        partidaTerminada = false;
        
        el.pista.disabled = false;
        el.reiniciar.disabled = false;
        el.modal.classList.remove("show");
        movimientoPista = null;

        el.mensaje.textContent = "¡Partida en curso! Arrastrá una ficha para saltar.";
        actualizarEstadisticas();
        dibujarTablero();
        iniciarTemporizador();
    }

    function moverFicha(origen, destino) {
        const df = destino.fila - origen.fila;
        const dc = destino.columna - origen.columna;
        const saltoRecto = (Math.abs(df) === 2 && dc === 0) || (Math.abs(dc) === 2 && df === 0);

        if (!saltoRecto || !esPosicionValida(destino.fila, destino.columna)) return false;

        const med = { fila: origen.fila + df / 2, columna: origen.columna + dc / 2 };
        if (tablero[origen.fila][origen.columna] === 1 &&
            tablero[med.fila][med.columna] === 1 &&
            tablero[destino.fila][destino.columna] === 0) {

            tablero[origen.fila][origen.columna] = 0;
            tablero[med.fila][med.columna] = 0;
            tablero[destino.fila][destino.columna] = 1;
            movimientos++;
            movimientoPista = null;

            actualizarEstadisticas();
            dibujarTablero();
            comprobarFinal();
            return true;
        }
        return false;
    }

    function comprobarFinal() {
        const restantes = contarFichas();
        if (restantes === 1) {
            finalizarPartida(true, "¡Victoria! Lograste dejar una sola ficha en el tablero.");
        } else if (obtenerMovimientosValidos().length === 0) {
            finalizarPartida(false, `No quedan movimientos posibles. Te quedaron ${restantes} fichas.`);
        }
    }

    function finalizarPartida(gano, mensaje) {
        partidaTerminada = true;
        partidaIniciada = false;
        clearInterval(intervaloTimer);

        el.pista.disabled = true;
        el.tituloModal.textContent = gano ? "¡Felicitaciones!" : "Fin de la partida";
        el.textoModal.textContent = mensaje;
        el.modal.classList.add("show");
        el.mensaje.textContent = mensaje;
    }

    // Eventos Mouse / Drag & Drop
    canvas.addEventListener("mousedown", (e) => {
        if (partidaTerminada) return;
        const casilla = obtenerCasilla(e);
        if (!casilla || tablero[casilla.fila][casilla.columna] !== 1) return;

        if (!partidaIniciada) {
            if (tipoFichaElegida === null) {
                el.mensaje.textContent = "Seleccioná un diseño de fichas arriba para empezar.";
                return;
            }
            comenzarPartida();
        }

        origenArrastre = casilla;
        arrastrando = true;
        const rect = canvas.getBoundingClientRect();
        posicionMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        dibujarTablero();
    });

    window.addEventListener("mousemove", (e) => {
        if (!arrastrando) return;
        const rect = canvas.getBoundingClientRect();
        posicionMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        dibujarTablero();
    });

    window.addEventListener("mouseup", (e) => {
        if (!arrastrando || !origenArrastre) return;

        const destino = obtenerCasilla(e);
        const origen = origenArrastre;

        arrastrando = false;
        origenArrastre = null;
        posicionMouse = null;

        if (destino && moverFicha(origen, destino)) {
            el.mensaje.textContent = "¡Buen movimiento!";
        } else {
            el.mensaje.textContent = "Movimiento inválido. La ficha regresa a su lugar.";
            dibujarTablero();
        }
    });

    // Botones del DOM
    el.selectorFichas.addEventListener("change", (e) => {
        tipoFichaElegida = e.target.value === "" ? null : Number(e.target.value);
        if (!partidaIniciada && tipoFichaElegida !== null) {
            el.reiniciar.disabled = false;
            el.mensaje.textContent = "¡Diseño listo! Arrastrá una ficha para comenzar.";
        }
        dibujarTablero();
    });

    el.reiniciar.addEventListener("click", reiniciarPartida);
    el.reiniciarModal.addEventListener("click", reiniciarPartida);

    el.pista.addEventListener("click", () => {
        if (!partidaIniciada || partidaTerminada) return;
        const validos = obtenerMovimientosValidos();
        if (validos.length > 0) {
            movimientoPista = validos[Math.floor(Math.random() * validos.length)];
            el.mensaje.textContent = "💡 Pista: Mové la ficha con borde amarillo al círculo verde.";
            dibujarTablero();
        }
    });

    function reiniciarPartida() {
        clearInterval(intervaloTimer);
        tablero = crearTableroInicial();
        movimientos = 0;
        segundosRestantes = TIEMPO_LIMITE_SEGS;
        partidaIniciada = false;
        partidaTerminada = false;
        arrastrando = false;
        origenArrastre = null;
        movimientoPista = null;

        el.modal.classList.remove("show");
        el.pista.disabled = true;
        el.reiniciar.disabled = tipoFichaElegida === null;
        el.mensaje.textContent = tipoFichaElegida === null ? "Elegí un diseño de fichas." : "Arrastrá una ficha para comenzar.";
        
        actualizarEstadisticas();
        ajustarCanvas();
    }

    window.addEventListener("resize", ajustarCanvas);

    // Botón "Jugar Online" del HTML para hacer scroll automático hacia el juego
    const btnPlayOnline = document.getElementById("peg-play-online");
    if (btnPlayOnline) {
        btnPlayOnline.addEventListener("click", () => {
            canvas.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    // Inicialización visual
    el.pista.disabled = true;
    el.reiniciar.disabled = true;
    actualizarEstadisticas();
    ajustarCanvas();
});