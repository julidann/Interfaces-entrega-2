document.addEventListener('DOMContentLoaded', () => {
    const tablero = document.getElementById('blocka-board');
    const btnComenzar = document.getElementById('btn-start');
    const btnAyudita = document.getElementById('btn-hint');
    const selectPiezas = document.getElementById('select-pieces');
    const spanNivel = document.getElementById('current-level');
    const spanTiempo = document.getElementById('timer');
    const contenedorJuego = document.querySelector('.game-container');
    const btnViewImage = document.getElementById('btn-view-image');
    //let imagenGanadora = null;



    const bancoImagenes = [
        '../assets/img/blocka1.jpg',
        '../assets/img/blocka2.jpg',
        '../assets/img/blocka3.jpg',
        '../assets/img/blocka4.jpg',
        '../assets/img/blocka5.jpg',
        '../assets/img/blocka6.jpg'
    ];

    const niveles = [
        { numero: 1, filtro: 'grises', tiempoMaximo: 30 },
        { numero: 2, filtro: 'brillo', tiempoMaximo: 45 },
        { numero: 3, filtro: 'negativo', tiempoMaximo: 45 }
    ];




    let nivelActualIndex = 0;
    let piezas = [];
    let imagenCargada = null;
    let enSorteo = false;
    let nivelTerminado = false;
    let cronometroInterval = null;
    let segundosTranscurridos = 0;
    let mejoresTiempos = {};
    
    btnViewImage.disabled = true;

    const btnStart = document.querySelector("#btn-start");
    const startScreen = document.querySelector("#start-screen");
    
    btnStart.addEventListener("click", () => {
        // Ocultamos la portada
        startScreen.style.display = "none";

        // Acá llamas a tu función para iniciar/dibujar el juego
        ejecutarSorteoImagen();
    });

    // Comenzar y ayudita
    btnComenzar.addEventListener('click', () => {
        if (!enSorteo) ejecutarSorteoImagen();
    });

    btnAyudita.addEventListener('click', usarAyudita);



    // EXTRA 1: sorteo animado de una imagen
    function ejecutarSorteoImagen() {
        if (enSorteo) return;

        // Remover la pantalla de bienvenida al hacer clic en Comenzar
        const pantallaInicio = document.getElementById('start-screen');
        if (pantallaInicio) {
            pantallaInicio.remove();
        }

        enSorteo = true;
        nivelTerminado = false;
        piezas = [];
        frenarCronometro();

        tablero.innerHTML = '';
        tablero.style.display = 'grid';
        tablero.style.gridTemplateColumns = '1fr';
        tablero.style.gridTemplateRows = '1fr';
        tablero.style.aspectRatio = '5 / 3';
        tablero.style.boxShadow = 'none';
        tablero.style.borderColor = '';

        btnComenzar.disabled = true;
        btnAyudita.disabled = true;
        selectPiezas.disabled = true;
        btnViewImage.disabled = true;

        const imgRuleta = document.createElement('img');
        imgRuleta.style.cssText =
            'width:100%;height:100%;object-fit:cover;border-radius:6px';

        tablero.appendChild(imgRuleta);

        const indiceElegido = Math.floor(Math.random() * bancoImagenes.length);
        const imagenGanadora = bancoImagenes[indiceElegido];

        console.log ("IMAGEN GUARDADA" + imagenGanadora);


        let pasadas = 0;
        let actual = 0;
        const totalPasadas = 16 + indiceElegido;

        const intervalo = setInterval(() => {
            imgRuleta.src = bancoImagenes[actual % bancoImagenes.length];
            actual++;
            pasadas++;

            if (pasadas >= totalPasadas) {
                clearInterval(intervalo);
                imgRuleta.src = imagenGanadora;
                tablero.style.boxShadow = '0 0 25px #00d814';
                tablero.style.borderColor = '#00d814';

                setTimeout(() => {
                    tablero.style.boxShadow = 'none';
                    enSorteo = false;
                    iniciarNivelConImagen(imagenGanadora);
                
                    if (probando){
                         showImagePreview(imagenGanadora);

                    }
                
                                    
                }, 1500);
            }
        }, 180);

    }

    // Preparar tablero
    /*function iniciarNivelConImagen(urlImagen) {
        tablero.innerHTML = '';
        piezas = [];
        nivelTerminado = false;

        const nivel = niveles[nivelActualIndex];
        const totalPiezas = selectPiezas
            ? parseInt(selectPiezas.value)
            : 4;

        const columnas = totalPiezas === 4 ? 2 : totalPiezas === 6 ? 3 : 4;
        const filas = totalPiezas / columnas;

        tablero.style.display = 'grid';
        tablero.style.gridTemplateColumns = `repeat(${columnas}, minmax(0, 1fr))`;
        tablero.style.gridTemplateRows = `repeat(${filas}, minmax(0, 1fr))`;
        tablero.style.aspectRatio = `${columnas} / ${filas}`;

        spanNivel.textContent = nivel.numero;

        const img = new Image();
        img.src = urlImagen;

        img.onload = () => {
            imagenCargada = img;

            // Recortar una zona cuadrada de la imagen
            const tamanoCorte = Math.min(
                img.width / columnas,
                img.height / filas
            );

            const offsetX = (img.width - tamanoCorte * columnas) / 2;
            const offsetY = (img.height - tamanoCorte * filas) / 2;

            for (let fila = 0; fila < filas; fila++) {
                for (let columna = 0; columna < columnas; columna++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 300;
                    canvas.height = 300;
                    canvas.classList.add('blocka-piece');

                    const ctx = canvas.getContext('2d');
                    const corteX = offsetX + columna * tamanoCorte;
                    const corteY = offsetY + fila * tamanoCorte;

                    ctx.drawImage(
                        img,
                        corteX, corteY, tamanoCorte, tamanoCorte,
                        0, 0, 300, 300
                    );

                    aplicarFiltroMatriz(ctx, nivel.filtro);

                    const angulos = [90, 180, 270];
                    const rotacion = angulos[
                        Math.floor(Math.random() * angulos.length)
                    ];

                    const pieza = {
                        canvas,
                        rotacion,
                        fijada: false,
                        corte: { x: corteX, y: corteY, tamano: tamanoCorte }
                    };

                    piezas.push(pieza);
                    canvas.style.transform = `rotate(${rotacion}deg)`;

                    // Clic izquierdo: gira a la izquierda.
                    canvas.addEventListener('click', () => {
                        rotarPieza(pieza, -90);
                    });

                    // Clic derecho: gira a la derecha.
                    canvas.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        rotarPieza(pieza, 90);
                    });

                    tablero.appendChild(canvas);
                }
            }

            btnComenzar.disabled = false;
            btnAyudita.disabled = false;
            selectPiezas.disabled = false;

            iniciarCronometro();
        };

        img.onerror = () => {
            enSorteo = false;
            btnComenzar.disabled = false;
            selectPiezas.disabled = false;
            alert('No se pudo cargar la imagen.');
        };
    }*/
/*
         btnComenzar.addEventListener('click', () => {
        if (!enSorteo) ejecutarSorteoImagen();
    });

    btnAyudita.addEventListener('click', usarAyudita);
*/

const probando = btnViewImage.addEventListener('click', showImagePreview);

/* PARTE NUEVAAAAA */

    function showImagePreview(urlImagen) {

        const vistaPrevia = document.getElementById('image-preview');
        vistaPrevia.innerHTML = '';
        const img = new Image();
       img.src = urlImagen;
       console.log(urlImagen, "probando");
        img.onload = () => {
            imagenCargada = imagenGanadora;
        }
        
        vistaPrevia.appendChild(img);
        setTimeout(() => {
            vistaPrevia.innerHTML = '';
        }
, 3000); 
       
    }

    function iniciarNivelConImagen(urlImagen) {
        tablero.innerHTML = '';
        piezas = [];
        nivelTerminado = false;
        

        const nivel = niveles[nivelActualIndex];
        const totalPiezas = parseInt(selectPiezas?.value || 4);

        // Definir columnas y filas según la selección (2x2, 3x2 o 4x2)
        let columnas = 2;
        if (totalPiezas === 8) {
            columnas = 4;
        } else if (totalPiezas === 6) {
            columnas = 3;
        }
        const filas = 2;

        tablero.style.display = 'grid';
        tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
        tablero.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
        tablero.style.aspectRatio = `${columnas} / ${filas}`;
        spanNivel.textContent = nivel.numero;

       const img = new Image();
        img.src = urlImagen;

        img.onload = () => {
            imagenCargada = img;
            const anchoPieza = img.width / columnas;
            const altoPieza = img.height / filas;

            for (let f = 0; f < filas; f++) {
                for (let c = 0; c < columnas; c++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 300;
                    canvas.height = 300;
                    canvas.className = 'blocka-piece';

                    const ctx = canvas.getContext('2d');
                    const corteX = c * anchoPieza;
                    const corteY = f * altoPieza;

                    ctx.drawImage(img, corteX, corteY, anchoPieza, altoPieza, 0, 0, 300, 300);
                    aplicarFiltroMatriz(ctx, nivel.filtro);

                    const rotacion = [90, 180, 270][Math.floor(Math.random() * 3)];
                    canvas.style.transform = `rotate(${rotacion}deg)`;


                    const pieza = {
                        canvas,
                        rotacion,
                        fijada: false,
                        corte: { x: corteX, y: corteY, tamanoX: anchoPieza, tamanoY: altoPieza }
                    };
                    piezas.push(pieza);

                    // Eventos de giro
                    canvas.addEventListener('click', () => rotarPieza(pieza, -90));
                    canvas.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        rotarPieza(pieza, 90);
                    });

                    tablero.appendChild(canvas);
                }
            }

            btnComenzar.disabled = btnAyudita.disabled = selectPiezas.disabled = false;
            btnViewImage.disabled = false;
            iniciarCronometro();
        };

        img.onerror = () => {
            enSorteo = false;
            btnComenzar.disabled = selectPiezas.disabled = false;
            alert('No se pudo cargar la imagen.');
        };
    }

    // Rotar una pieza
    function rotarPieza(pieza, grados) {
        if (pieza.fijada || nivelTerminado) return;

        pieza.rotacion = (pieza.rotacion + grados + 360) % 360;
        pieza.canvas.style.transform = `rotate(${pieza.rotacion}deg)`;

        verificarVictoria();
    }

    // EXTRA 3: ayudita
    function usarAyudita() {
        if (nivelTerminado) return;

        const incorrectas = piezas.filter(
            pieza => pieza.rotacion !== 0 && !pieza.fijada
        );

        if (incorrectas.length === 0) return;

        const pieza = incorrectas[
            Math.floor(Math.random() * incorrectas.length)
        ];

        pieza.rotacion = 0;
        pieza.fijada = true;
        pieza.canvas.style.transform = 'rotate(0deg)';
        pieza.canvas.style.outline = '2px solid #00d814';

        segundosTranscurridos += 5;
        actualizarPantallaTiempo();

        verificarVictoria();
    }

    // Aplicar filtros a cada pieza
    function aplicarFiltroMatriz(ctx, tipoFiltro) {
        const imagen = ctx.getImageData(0, 0, 300, 300);
        const pixeles = imagen.data;

        for (let i = 0; i < pixeles.length; i += 4) {
            const r = pixeles[i];
            const g = pixeles[i + 1];
            const b = pixeles[i + 2];

            if (tipoFiltro === 'grises') {
                const gris = 0.3 * r + 0.59 * g + 0.11 * b;
                pixeles[i] = gris;
                pixeles[i + 1] = gris;
                pixeles[i + 2] = gris;
            } else if (tipoFiltro === 'brillo') {
                pixeles[i] = Math.min(255, r * 1.3);
                pixeles[i + 1] = Math.min(255, g * 1.3);
                pixeles[i + 2] = Math.min(255, b * 1.3);
            } else if (tipoFiltro === 'negativo') {
                pixeles[i] = 255 - r;
                pixeles[i + 1] = 255 - g;
                pixeles[i + 2] = 255 - b;
            }
        }



        ctx.putImageData(imagen, 0, 0);
    }

    // Verificar si se completó la imagen
    function verificarVictoria() {
        if (nivelTerminado || piezas.length === 0) return;

        const gano = piezas.every(pieza => pieza.rotacion === 0);
        if (!gano) return;

        nivelTerminado = true;
        frenarCronometro();
        btnAyudita.disabled = true;

        const tiempoTexto = formatearTiempo(segundosTranscurridos);
        const clave = `nivel${niveles[nivelActualIndex].numero}_piezas${piezas.length}`;
        const recordPrevio = mejoresTiempos[clave];

        const nuevoRecord =
            recordPrevio === undefined ||
            segundosTranscurridos < recordPrevio;

        if (nuevoRecord) {
            mejoresTiempos[clave] = segundosTranscurridos;
        }

        mostrarImagenLimpia();

        setTimeout(() => {
            mostrarCartelResultado(
                true,
                tiempoTexto,
                nuevoRecord,
                recordPrevio
            );
        }, 1000);
    }

    // Mostrar la imagen original sin filtros
    /*  function mostrarImagenLimpia() {
          piezas.forEach(pieza => {
              const ctx = pieza.canvas.getContext('2d');
              const { x, y, tamano } = pieza.corte;
  
              ctx.clearRect(0, 0, 300, 300);
              ctx.drawImage(
                  imagenCargada,
                  x, y, tamano, tamano,
                  0, 0, 300, 300
              );
          });
      }*/

    function mostrarImagenLimpia() {
        piezas.forEach(pieza => {
            const ctx = pieza.canvas.getContext('2d');
            const { x, y, tamanoX, tamanoY } = pieza.corte;

            ctx.clearRect(0, 0, 300, 300);
            ctx.drawImage(
                imagenCargada,
                x, y, tamanoX, tamanoY,
                0, 0, 300, 300
            );
        });
    }

    // Mostrar resultado
    function mostrarCartelResultado(
        gano,
        tiempoTexto,
        nuevoRecord = false,
        recordPrevio = null
    ) {
        const anterior = document.getElementById('game-overlay');
        if (anterior) anterior.remove();

        const overlay = document.createElement('div');
        overlay.id = 'game-overlay';
        overlay.className = 'game-overlay';

        if (gano) {
            const textoRecord = nuevoRecord
                ? '¡Nuevo récord alcanzado!'
                : `Tu récord actual: ${formatearTiempo(recordPrevio)}`;

            const textoBoton = nivelActualIndex === niveles.length - 1
                ? 'Reiniciar Juego'
                : 'Siguiente Nivel';

            overlay.innerHTML = `
                <div class="overlay-card">
                    <h2>¡Nivel Completado!</h2>
                    <p>Tiempo de partida: <strong>${tiempoTexto}</strong></p>
                    <p class="record-text">${textoRecord}</p>
                    <div class="overlay-actions">
                    <a href="home.html" class="secondary">Menú Principal</a>
                        <button id="btn-next-level" class="primary">${textoBoton}</button>
                        
                    </div>
                </div>
            `;
        } else {
            overlay.innerHTML = `
                <div class="overlay-card">
                    <h2>¡Tiempo Agotado!</h2>
                    <p>Se terminó el tiempo límite para este nivel.</p>
                    <div class="overlay-actions">
                    <a href="home.html" class="secondary">Menú Principal</a>
                        <button id="btn-retry" class="primary">Reintentar Nivel</button>
                        
                    </div>
                </div>
            `;
        }

        contenedorJuego.appendChild(overlay);

        const btnSiguiente = document.getElementById('btn-next-level');
        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', () => {
                overlay.remove();

                nivelActualIndex =
                    (nivelActualIndex + 1) % niveles.length;

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

    // Temporizador
    function iniciarCronometro() {
        segundosTranscurridos = 0;
        actualizarPantallaTiempo();

        frenarCronometro();
        const tiempo = document.getElementById('tiempito');
       // const ctx = tiempo.getContext('2d');
       /* const alerta = [
            { color: 'green' },
            { color: 'yellow' },
            { color: 'red' }
        ];*/

       // ctx = tiempo.getContext('2d');


        cronometroInterval = setInterval(() => {
            segundosTranscurridos++;
            actualizarPantallaTiempo();
            const limite = niveles[nivelActualIndex].tiempoMaximo;
            if (tiempo){
                console.log('Tiempo transcurrido:', segundosTranscurridos);
            
            }

            if (segundosTranscurridos <= 10) {
                console.log('Tiempo en verde');
                tiempo.fillStyle = 'rgb(0, 255, 0)';
            } else if (segundosTranscurridos > 10 && segundosTranscurridos <= 20) {
                tiempo.fillStyle = 'rgb(255, 255, 0)';
            } else if (segundosTranscurridos > 20) {
                tiempo.fillStyle = 'rgb(255, 0, 0)';
            }

    

            if (limite !== null && segundosTranscurridos >= limite) {
                nivelTerminado = true;
                frenarCronometro();
                btnAyudita.disabled = true;
                mostrarCartelResultado(false, null);
            }
        }, 1000);
    }

    function frenarCronometro() {
        if (cronometroInterval !== null) {
            clearInterval(cronometroInterval);
            cronometroInterval = null;
        }
    }

    function actualizarPantallaTiempo() {
        const limite = niveles[nivelActualIndex].tiempoMaximo;
        let texto = formatearTiempo(segundosTranscurridos);

        if (limite !== null) {
            texto += ` / ${formatearTiempo(limite)}`;
        }

        spanTiempo.textContent = texto;
    }

    function formatearTiempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const resto = segundos % 60;

        return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
    }
});
