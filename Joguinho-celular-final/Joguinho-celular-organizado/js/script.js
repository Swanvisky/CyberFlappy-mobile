const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOverPanel = document.getElementById("gameOver");
const charsEl = document.getElementById("characters");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const finalScoreEl = document.getElementById("finalScore");
const finalBestEl = document.getElementById("finalBest");

const pauseBtn = document.getElementById("pauseBtn");

// =====================================================
// CANVAS RESPONSIVO PARA PC E CELULAR
// =====================================================

let W = window.innerWidth;
let H = window.innerHeight;

function detectarCelular() {
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.innerWidth < 700
  );
}

let isMobile = detectarCelular();
let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);

let canvasPronto = false;

function resize() {
  const larguraAnterior = W;
  const alturaAnterior = H;

  W = window.innerWidth;
  H = window.innerHeight;

  isMobile = detectarCelular();

  

  dpr = Math.min(
    window.devicePixelRatio || 1,
    isMobile ? 1.25 : 1.5
  );

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Mantém os elementos proporcionais se a tela mudar
  // durante uma partida, inclusive ao girar o celular.

  if (
    canvasPronto &&
    larguraAnterior > 0 &&
    alturaAnterior > 0
  ) {
    const escalaX = W / larguraAnterior;
    const escalaY = H / alturaAnterior;

    player.x *= escalaX;
    player.y *= escalaY;

    player.r = Math.max(
      isMobile ? 18 : 22,
      Math.min(31, W * 0.035)
    );

    pipes.forEach((p) => {
      p.x *= escalaX;
      p.w *= escalaX;
      p.center *= escalaY;

      p.gap = Math.min(
        p.gap * escalaY,
        Math.max(120, H - 100)
      );

      p.w = Math.max(40, Math.min(100, p.w));
    });

    particles.forEach((pt) => {
      pt.x *= escalaX;
      pt.y *= escalaY;
    });
  }

  // Evita que o personagem fique fora dos limites.
  if (canvasPronto && state === "play") {
    player.y = Math.max(
      player.r,
      Math.min(H - 58 - player.r, player.y)
    );
  }
}

window.addEventListener("resize", resize, { passive: true });

window.addEventListener("orientationchange", () => {
  // O resize também será acionado quando o navegador
  // atualizar as dimensões após a rotação.
  resize();
});

resize();

// =====================================================
// ESTADO DO JOGO
// =====================================================

let state = "menu";

let score = 0;
let pipes = [];
let particles = [];

let last = 0;
let spawnTimer = 0;
let paused = false;

let player = {
  x: 0,
  y: 0,
  vy: 0,
  r: 26,
  rot: 0
};
canvasPronto = true;

const gravity = 1550;
const flap = -470;
const pipeSpeed = 300;

// =====================================================
// INICIAR / REINICIAR
// =====================================================

function startGame() {
  const selectedCharacter =
    defaultChars[selectedIndex] || defaultChars[48];

  updateGameMusic(selectedCharacter.name);

  score = 0;
  scoreEl.textContent = "0";

  pipes = [];
  particles = [];

  spawnTimer = 0;
  paused = false;

  pauseBtn.textContent = "Ⅱ";
  pauseBtn.title = "Pausar";
  pauseBtn.style.display = "block";

  player.x = Math.min(W * 0.28, 240);
  player.y = H * 0.45;
  player.vy = 0;

  player.r = Math.max(
    22,
    Math.min(31, W * 0.035)
  );

  menu.style.display = "none";
  gameOverPanel.style.display = "none";

  state = "play";
  last = performance.now();
}

// =====================================================
// BOTÃO JOGAR
// =====================================================

document.getElementById("playBtn").onclick = () => {
  startGame();
};

// =====================================================
// BOTÃO TENTE NOVAMENTE
// =====================================================

document.getElementById("retryBtn").onclick = () => {
  startGame();
};

// =====================================================
// BOTÃO MENU
// =====================================================

document.getElementById("menuBtn").onclick = () => {
  state = "menu";
  paused = false;

  pipes = [];
  particles = [];

  gameOverPanel.style.display = "none";

  menu.style.display = "flex";
  pauseBtn.style.display = "none";

  renderChars();
};

// =====================================================
// BOTÃO PAUSAR
// =====================================================

pauseBtn.onclick = function(e) {
  e.preventDefault();
  e.stopPropagation();

  if (state !== "play") {
    return;
  }

  togglePause();
};

// =====================================================
// PAUSAR / CONTINUAR
// =====================================================

function togglePause() {
  paused = !paused;

  if (paused) {
    pauseBtn.textContent = "▶";
    pauseBtn.title = "Continuar";
  } else {
    pauseBtn.textContent = "Ⅱ";
    pauseBtn.title = "Pausar";
  }

  last = performance.now();
}

// =====================================================
// TECLADO
// =====================================================

document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();

    if (state === "menu") {
      startGame();
      return;
    }

    if (state === "play") {
      togglePause();
      return;
    }

    if (state === "over") {
      startGame();
      return;
    }
  }

  if (
    e.code === "Space" &&
    state === "play" &&
    !paused
  ) {
    e.preventDefault();
    jump();
  }
});

// =====================================================
// PULAR
// =====================================================

function jump() {
  if (state !== "play" || paused) {
    return;
  }

  player.vy = flap;

  for (let i = 0; i < (isMobile ? 4 : 7); i++) {
    particles.push({
      x: player.x - 18,
      y: player.y + (Math.random() - 0.5) * 16,
      vx: -70 - Math.random() * 90,
      vy: (Math.random() - 0.5) * 90,
      life: 0.55 + Math.random() * 0.25
    });
  }
}

// =====================================================
// CLIQUE / TOQUE NO CANVAS
// =====================================================

canvas.addEventListener("pointerdown", function(e) {
  if (state !== "play" || paused) {
    return;
  }

  // Evita que o navegador interprete o toque
  // como um gesto de navegação ou rolagem.
  e.preventDefault();

  jump();
}, { passive: false });

// =====================================================
// CANOS
// =====================================================

function addPipe() {
const gap = Math.max(150, Math.min(205, H * 0.24));
const margin = Math.min(90, H * 0.18);

const minCenter = margin + gap / 2;
const maxCenter = H - margin - gap / 2;

const center =
  maxCenter > minCenter
    ? minCenter + Math.random() * (maxCenter - minCenter)
    : H / 2;
    
  pipes.push({
    x: W + 80,
    w: 78,
    gap: gap,
    center: center,
    passed: false
  });
}

// =====================================================
function update(dt) {
  player.vy += gravity * dt;
  player.y += player.vy * dt;

  // CRIAR CANOS

  spawnTimer += dt;

  if (spawnTimer > 1.55) {
    spawnTimer = 0;
    addPipe();
  }

  // MOVIMENTAR CANOS

  pipes.forEach((p) => {
    p.x -= pipeSpeed * dt;
  });

  pipes = pipes.filter((p) => p.x + p.w > -20);

  // PARTÍCULAS

  particles.forEach((pt) => {
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.life -= dt;
  });

  particles = particles.filter((pt) => pt.life > 0);

  // COLISÕES

  for (const p of pipes) {
    if (!p.passed && p.x + p.w < player.x) {
      p.passed = true;
      score++;
      scoreEl.textContent = score;
    }

    const inX =
      player.x + player.r * 0.72 > p.x &&
      player.x - player.r * 0.72 < p.x + p.w;

    const top = p.center - p.gap / 2;
    const bot = p.center + p.gap / 2;

    const hitY =
      player.y - player.r * 0.72 < top ||
      player.y + player.r * 0.72 > bot;

    if (inX && hitY) {
      endGame();
      return;
    }
  }

  // CHÃO / TETO

  if (
    player.y + player.r > H - 58 ||
    player.y - player.r < 0
  ) {
    endGame();
  }
}

// =====================================================
// FIM DE JOGO
// =====================================================

function endGame() {
  if (state !== "play") {
    return;
  }

  state = "over";
  paused = false;

  pauseBtn.style.display = "none";

  // MELHOR PONTUAÇÃO

  if (score > best) {
    best = score;

    localStorage.setItem(
      "flappyBest",
      best
    );
  }

  bestEl.textContent = best;

  finalScoreEl.textContent = score;
  verificarPremio();
  finalBestEl.textContent = best;

  setTimeout(() => {
    if (state === "over") {
      gameOverPanel.style.display = "flex";
    }
  }, 180);
}

// ==========================================
// FORMULÁRIO DE PRÊMIO: VERSÃO DO CELULAR
// ==========================================

const prizeForm = document.getElementById("prizeForm");
const prizeMessage = document.getElementById("prizeMessage");
const prizeStatus = document.getElementById("prizeStatus");

function verificarPremio() {
  const pontos = Number(
    document.getElementById("finalScore").textContent
  );

  const podeGanhar = pontos >= 50;

  prizeMessage.style.display = podeGanhar ? "block" : "none";
  prizeForm.style.display = podeGanhar ? "block" : "none";
}

const painelFim = document.getElementById("gameOver");

new MutationObserver(verificarPremio).observe(painelFim, {
  attributes: true,
  attributeFilter: ["class", "style"]
});

prizeForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nome = document.getElementById("prizeName").value.trim();
  const email = document.getElementById("prizeEmail").value.trim();

  const pontuacao = Number(
    document.getElementById("finalScore").textContent
  );

  if (!nome || !email) {
    prizeStatus.textContent = "Preencha seu nome e e-mail.";
    return;
  }

  if (pontuacao < 50) {
    prizeStatus.textContent = "Você precisa alcançar 50 pontos.";
    return;
  }

  const botao = prizeForm.querySelector('button[type="submit"]');

  if (botao) {
    botao.disabled = true;
  }

  prizeStatus.textContent = "Registrando seu prêmio...";

  try {
    await firebase.auth().signInAnonymously();

    const banco = firebase.database();

    await banco.ref("premios").push({
      nome: nome,
      email: email,
      pontuacao: pontuacao,
      entregue: false,
      data: Date.now()
    });

    prizeStatus.textContent =
      "Prêmio registrado! Procure o responsável pelo stand.";

    prizeForm.reset();

  } catch (erro) {
    console.error("Erro ao registrar prêmio:", erro);

    prizeStatus.textContent =
      "Não foi possível registrar. Tente novamente.";
  } finally {
    if (botao) {
      botao.disabled = false;
    }
  }
});


// =====================================================
// LOOP PRINCIPAL
// =====================================================

function loop(now) {
  requestAnimationFrame(loop);

  // FUNDO

  drawBackground(now);

  // JOGO

  if (state === "play" || state === "over") {
    drawPipes();
    drawParticles();
    drawPlayer();
  } else {
    // PERSONAGEM NO MENU

    player.x = W * 0.5;

    player.y =
      H * 0.73 +
      Math.sin(now * 0.003) * 10;

    player.r = 30;
    player.vy = 0;

    drawPlayer();
  }

  // ATUALIZAÇÃO

  if (state === "play" && paused === false) {
    const dt = Math.min(
      (now - last) / 1000,
      0.03
    );

    last = now;

    update(dt);
  } else {
    last = now;
  }

  // TELA DE PAUSA

  if (paused === true && state === "play") {
    ctx.fillStyle = "rgba(20,55,80,.35)";

    ctx.fillRect(
      0,
      0,
      W,
      H
    );

    ctx.fillStyle = "white";
    ctx.font = "900 34px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      "PAUSADO",
      W / 2,
      H / 2
    );
  }
}

// =====================================================
// INICIAR LOOP
// =====================================================

requestAnimationFrame(loop);
