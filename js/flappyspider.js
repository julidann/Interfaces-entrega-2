(() => {
  const container = document.getElementById('game-canvas-container');
  const world = document.getElementById('world');
  const player = document.getElementById('player');
  const startScreen = document.getElementById('start-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const scoreEl = document.getElementById('score-val');
  const livesEl = document.getElementById('lives-val');
  const finalScoreEl = document.getElementById('final-score');

  const CFG = {
    gravity: 0.45,
    flapForce: -8,
    maxFallSpeed: 10,
    speed: 3,            // px por frame (a 60 fps)
    pipeWidth: 70,
    pipeGap: 0.3,        // fracción de la altura del juego
    pipeEvery: 1800,     // ms entre tuberías/conductos
    maxLives: 3,
    invulnMs: 1200,      // tiempo sin recibir daño tras un golpe
    playerSize: 50,
    hitInset: 8          // margen para colisión justa
  };

  let W, H, PX;
  let bird, obstacles, score, lives;
  let invulnUntil, lastTime, rafId, running = false;
  let pipeTimer = 0;

  function measure() {
    W = container.clientWidth;
    H = container.clientHeight;
    PX = W * 0.15;
  }

  function updateHUD() {
    scoreEl.textContent = score;
    // Muestra las vidas con telarañas como tenías en tu HUD
    livesEl.textContent = '🕸️'.repeat(Math.max(lives, 0));
  }

  function reset() {
    measure();
    world.innerHTML = '';
    obstacles = [];
    score = 0;
    lives = CFG.maxLives;
    bird = { y: H * 0.4, vy: 0 };
    invulnUntil = 0;
    pipeTimer = 0;

    player.style.left = '0px';
    player.style.top = '0px';
    updateHUD();
  }

  // Generación de conductos (obstáculos adaptados a tus texturas)
  function spawnPipe() {
    const gapH = H * CFG.pipeGap;
    const margin = 40;
    const gapTop = margin + Math.random() * (H - gapH - margin * 2);
    const gapBottom = gapTop + gapH;

    // Alternar entre textura larga o corta aleatoriamente
    const isLong = Math.random() > 0.5;

    // Arriba (Conducto superior)
    const top = document.createElement('div');
    top.className = 'pipe top ' + (isLong ? 'texture-long' : 'texture-short');
    top.style.width = CFG.pipeWidth + 'px';
    top.style.height = gapTop + 'px';

    // Abajo (Conducto inferior)
    const bottom = document.createElement('div');
    bottom.className = 'pipe bottom ' + (isLong ? 'texture-short' : 'texture-long');
    bottom.style.width = CFG.pipeWidth + 'px';
    bottom.style.top = gapBottom + 'px';
    bottom.style.height = (H - gapBottom) + 'px';

    world.append(top, bottom);
    obstacles.push({ x: W, gapTop, gapBottom, passed: false, els: [top, bottom] });
  }

  function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function hit() {
    const now = performance.now();
    if (now < invulnUntil) return;
    invulnUntil = now + CFG.invulnMs;
    
    lives--;
    updateHUD();

    // --- EFECTO VISUAL DE GOLPE EN EL MUÑEQUITO ---
    player.classList.remove('damage-anim');
    void player.offsetWidth; // Forzar reflow para reiniciar la animación
    player.classList.add('damage-anim');

    if (lives <= 0) gameOver();
  }

  function flap() {
    if (!running) return;
    bird.vy = CFG.flapForce;

    // Activar animación keyframe de salto / aleteo
    player.classList.remove('flap-anim');
    void player.offsetWidth;
    player.classList.add('flap-anim');
  }

  function update(dt) {
    const ms = dt * 16.67;

    // Física de caída de la araña
    bird.vy = Math.min(bird.vy + CFG.gravity * dt, CFG.maxFallSpeed);
    bird.y += bird.vy * dt;

    if (bird.y < 0) {
      bird.y = 0;
      bird.vy = 0;
    }
    if (bird.y + CFG.playerSize > H) {
      bird.y = H - CFG.playerSize;
      bird.vy = CFG.flapForce * 0.5;   // rebote suave al tocar el suelo
      hit();
    }

    // Spawn de conductos
    pipeTimer += ms;
    if (pipeTimer >= CFG.pipeEvery) { 
      pipeTimer = 0; 
      spawnPipe(); 
    }

    const move = CFG.speed * dt;
    const hb = CFG.hitInset;
    const bx = PX + hb, by = bird.y + hb;
    const bw = CFG.playerSize - hb * 2, bh = CFG.playerSize - hb * 2;

    // Actualización de obstáculos (Conductos)
    obstacles = obstacles.filter(p => {
      p.x -= move;
      p.els.forEach(el => el.style.left = p.x + 'px');

      // Sumar puntos al superar el conducto
      if (!p.passed && p.x + CFG.pipeWidth < PX) {
        p.passed = true;
        score += 10;
        updateHUD();
      }

      // Colisiones
      const hitTop = overlaps(bx, by, bw, bh, p.x, 0, CFG.pipeWidth, p.gapTop);
      const hitBottom = overlaps(bx, by, bw, bh, p.x, p.gapBottom, CFG.pipeWidth, H - p.gapBottom);
      if (hitTop || hitBottom) hit();

      // Limpiar obstáculos fuera de pantalla
      if (p.x + CFG.pipeWidth < 0) {
        p.els.forEach(el => el.remove());
        return false;
      }
      return true;
    });

    player.style.transform = `translate(${PX}px, ${bird.y}px)`;
  }

  function loop(now) {
    const dt = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;
    update(dt);
    if (running) rafId = requestAnimationFrame(loop);
  }

  function startGame() {
    reset();
    startScreen.classList.remove('active');
    gameoverScreen.classList.remove('active');
    container.classList.add('playing'); 
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function gameOver() {
    running = false;
    cancelAnimationFrame(rafId);
    container.classList.remove('playing');
    finalScoreEl.textContent = score;
    gameoverScreen.classList.add('active');
  }

  // Eventos de control
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  container.addEventListener('click', flap);
  
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap();
    }
  });

  window.addEventListener('resize', measure);

  reset();
})();