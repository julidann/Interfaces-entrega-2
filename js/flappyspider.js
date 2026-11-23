(() => {

  const contenedorJuego = document.getElementById('game-canvas-container');
  const mundo = document.getElementById('world');
  const jugador = document.getElementById('player');

  const pantallaInicio = document.getElementById('start-screen');
  const pantallaFinal = document.getElementById('gameover-screen');

  const botonInicio = document.getElementById('start-btn');
  const botonReiniciar = document.getElementById('restart-btn');

  const puntajeHTML = document.getElementById('score-val');
  const vidasHTML = document.getElementById('lives-val');
  const puntajeFinalHTML = document.getElementById('final-score');

  // CONFIGURACION DEL JUEGO
  const CONFIGURACION = {
    gravedad: 0.2,
    fuerzaSalto: -5,
    velocidadCaida: 4,
    velocidadJuego: 1.6,
    anchoObstaculo: 60,
    espacioObstaculos: 0.4,
    tiempoObstaculos: 2200,
    vidasMaximas: 5,
    tiempoProteccion: 1200,
    tamañoJugador: 50,
    margenColision: 12,
    espacioInicial: 0.5,
    espacioMinimo: 0.3,
    reduccionEspacio: 0.01,     // cuánto se achica por cada tubería
    tiempoMinObstaculos: 1500,
    tiempoMaxObstaculos: 2600
  };

  // VARIABLES DEL JUEGO

  let anchoJuego;
  let altoJuego;
  let posicionJugador;

  let jugadorDatos;
  let obstaculos;
  let puntaje;
  let vidas;
  let cantidadCreados;
  let proximoObstaculo;

  let tiempoProteccion;
  let tiempoAnterior;
  let tiempoUltimoObstaculo = 0;

  let animacion;
  let jugando = false;

  // MEDIR EL TAMAÑO DEL ESCENARIO

  function medirJuego() {
    anchoJuego = contenedorJuego.clientWidth;
    altoJuego = contenedorJuego.clientHeight;

    posicionJugador = anchoJuego * 0.15;
  }

  function actualizarMarcador() {
    puntajeHTML.textContent = puntaje;
    vidasHTML.textContent = '🕸️'.repeat(Math.max(vidas, 0));
  }

  function reiniciarJuego() {
    medirJuego();

    mundo.innerHTML = '';

    obstaculos = [];
    puntaje = 0;
    vidas = CONFIGURACION.vidasMaximas;
    cantidadCreados = 0;
    proximoObstaculo = CONFIGURACION.tiempoMinObstaculos;

    jugadorDatos = {
      y: altoJuego * 0.4,
      velocidad: 0
    };

    tiempoProteccion = 0;
    tiempoUltimoObstaculo = 0;

    jugador.style.left = '0px';
    jugador.style.top = '0px';
    jugador.style.transform = 'translate(0px, 0px)';

    jugador.classList.remove('damage-anim', 'flap-anim');

    actualizarMarcador();
  }


  function crearObstaculo() {
    const proporcion = Math.max(
      CONFIGURACION.espacioMinimo,
      CONFIGURACION.espacioInicial - cantidadCreados * CONFIGURACION.reduccionEspacio
    );
    const espacio = altoJuego * proporcion;
    cantidadCreados++;
    const margen = 40;

    const posicionEspacio = margen +
      Math.random() * (altoJuego - espacio - margen * 2);

    const espacioInferior = posicionEspacio + espacio;
    const esLargo = Math.random() > 0.5;
    const obstaculoArriba = document.createElement('div');

    obstaculoArriba.className =
      'pipe top ' + (esLargo ? 'texture-long' : 'texture-short');

    obstaculoArriba.style.width = CONFIGURACION.anchoObstaculo + 'px';
    obstaculoArriba.style.height = posicionEspacio + 'px';

    const obstaculoAbajo = document.createElement('div');

    obstaculoAbajo.className =
      'pipe bottom ' + (esLargo ? 'texture-short' : 'texture-long');

    obstaculoAbajo.style.width = CONFIGURACION.anchoObstaculo + 'px';
    obstaculoAbajo.style.top = espacioInferior + 'px';
    obstaculoAbajo.style.height = (altoJuego - espacioInferior) + 'px';

    mundo.append(obstaculoArriba, obstaculoAbajo);

    obstaculos.push({
      x: anchoJuego,
      arriba: posicionEspacio,
      abajo: espacioInferior,
      puntosSumados: false,
      elementos: [obstaculoArriba, obstaculoAbajo]
    });
  }

  function hayColision(x1, y1, ancho1, alto1, x2, y2, ancho2, alto2) {
    return (
      x1 < x2 + ancho2 &&
      x1 + ancho1 > x2 &&
      y1 < y2 + alto2 &&
      y1 + alto1 > y2
    );
  }

  function recibirGolpe() {
    const ahora = performance.now();

    if (!jugando || ahora < tiempoProteccion) {
      return;
    }

    tiempoProteccion = ahora + CONFIGURACION.tiempoProteccion;

    vidas--;

    actualizarMarcador();

    jugador.classList.remove('damage-anim');
    void jugador.offsetWidth;
    jugador.classList.add('damage-anim');

    if (vidas <= 0) {
      terminarJuego();
    }
  }

  function saltar() {
    if (!jugando) {
      return;
    }

    jugadorDatos.velocidad = CONFIGURACION.fuerzaSalto;

    jugador.classList.remove('flap-anim');
    void jugador.offsetWidth;
    jugador.classList.add('flap-anim');
  }

  function actualizarJugador(tiempo) {
    jugadorDatos.velocidad += CONFIGURACION.gravedad * tiempo;

    jugadorDatos.velocidad = Math.min(
      jugadorDatos.velocidad,
      CONFIGURACION.velocidadCaida
    );

    jugadorDatos.y += jugadorDatos.velocidad * tiempo;

    // Evitar que salga por arriba

    if (jugadorDatos.y < 0) {
      jugadorDatos.y = 0;
      jugadorDatos.velocidad = 0;
    }


    // Comprobar si toca el suelo

    if (jugadorDatos.y + CONFIGURACION.tamañoJugador > altoJuego) {
      jugadorDatos.y = altoJuego - CONFIGURACION.tamañoJugador;
      jugadorDatos.velocidad = CONFIGURACION.fuerzaSalto * 0.5;

      recibirGolpe();
    }
  }

  function actualizarObstaculos(tiempo) {
    const movimiento = CONFIGURACION.velocidadJuego * tiempo;
    const margen = CONFIGURACION.margenColision;

    const xJugador = posicionJugador + margen;
    const yJugador = jugadorDatos.y + margen;

    const tamañoJugador = CONFIGURACION.tamañoJugador - margen * 2;

    obstaculos = obstaculos.filter(obstaculo => {

      // Mover obstaculo hacia la izquierda

      obstaculo.x -= movimiento;

      obstaculo.elementos.forEach(elemento => {
        elemento.style.left = obstaculo.x + 'px';
      });

      if (
        !obstaculo.puntosSumados && obstaculo.x +
        CONFIGURACION.anchoObstaculo < posicionJugador
      ) {
        obstaculo.puntosSumados = true;

        puntaje += 10;

        actualizarMarcador();
      }

      const choqueArriba = hayColision(
        xJugador, yJugador,
        tamañoJugador, tamañoJugador,
        obstaculo.x, 0,
        CONFIGURACION.anchoObstaculo, obstaculo.arriba
      );

      const choqueAbajo = hayColision(
        xJugador, yJugador,
        tamañoJugador, tamañoJugador,
        obstaculo.x, obstaculo.abajo,
        CONFIGURACION.anchoObstaculo,
        altoJuego - obstaculo.abajo
      );


      if (choqueArriba || choqueAbajo) {
        recibirGolpe();
      }

      // Eliminar obstaculos que salen de pantalla

      if (obstaculo.x + CONFIGURACION.anchoObstaculo < 0) {
        obstaculo.elementos.forEach(elemento => elemento.remove());

        return false;
      }

      return true;
    });
  }

  function actualizarJuego(tiempo, milisegundos) {

    actualizarJugador(tiempo);

    if (!jugando) {
      return;
    }

    tiempoUltimoObstaculo += milisegundos;

    if (tiempoUltimoObstaculo >= proximoObstaculo) {
      tiempoUltimoObstaculo = 0;
      proximoObstaculo = CONFIGURACION.tiempoMinObstaculos + 
                        Math.random() * (CONFIGURACION.tiempoMaxObstaculos - CONFIGURACION.tiempoMinObstaculos);
      crearObstaculo();
    }

    actualizarObstaculos(tiempo);

    // Actualizar posicion del jugador

    jugador.style.transform =
      `translate(${posicionJugador}px, ${jugadorDatos.y}px)`;
  }


  // BUCLE PRINCIPAL DEL JUEGO

  function bucleJuego(ahora) {

    const milisegundos = ahora - tiempoAnterior;

    const tiempo = Math.min(milisegundos / 16.67, 3);

    tiempoAnterior = ahora;

    actualizarJuego(tiempo, milisegundos);

    if (jugando) {
      animacion = requestAnimationFrame(bucleJuego);
    }
  }

  function comenzarJuego() {

    cancelAnimationFrame(animacion);

    jugando = false;

    reiniciarJuego();

    pantallaInicio.classList.remove('active');
    pantallaFinal.classList.remove('active');

    contenedorJuego.classList.add('playing');

    jugando = true;

    tiempoAnterior = performance.now();

    animacion = requestAnimationFrame(bucleJuego);
  }


  // TERMINAR PARTIDA

  function terminarJuego() {

    jugando = false;

    cancelAnimationFrame(animacion);

    contenedorJuego.classList.remove('playing');

    puntajeFinalHTML.textContent = puntaje;

    pantallaFinal.classList.add('active');
  }


  // EVENTOS DE LOS BOTONES

  botonInicio.addEventListener('click', function (evento) {
    evento.stopPropagation();
    comenzarJuego();
  });

  botonReiniciar.addEventListener('click', function (evento) {
    evento.stopPropagation();
    comenzarJuego();
  });


  // SALTAR CON CLIC

  contenedorJuego.addEventListener('click', saltar);


  // SALTAR CON BARRA ESPACIADORA

  document.addEventListener('keydown', function (evento) {

    if (evento.code === 'Space') {
      evento.preventDefault();
      saltar();
    }

  });


  // ADAPTAR EL JUEGO AL CAMBIAR EL TAMAÑO DE VENTANA

  window.addEventListener('resize', medirJuego);


  // PREPARAR EL JUEGO AL CARGAR LA PAGINA

  reiniciarJuego();

})();
