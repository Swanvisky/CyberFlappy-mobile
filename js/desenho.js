// Funções responsáveis pelo desenho do jogo.
// RETÂNGULO ARREDONDADO
// =====================================================

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + rr, y);

  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);

  ctx.closePath();
}

// =====================================================
// FUNDO COM IMAGEM DA CIDADE
// =====================================================

const fundoCidade = new Image();
fundoCidade.src = "assets/img/cidade-neon.png";

let fundoX = 0;
const velocidadeFundo = 120;
let ultimoTempoFundo = 0;

function drawBackground(t) {
  // Enquanto a imagem não carregar, mantém um fundo escuro.
  ctx.fillStyle = "#080b22";
  ctx.fillRect(0, 0, W, H);

  if (
    !fundoCidade.complete ||
    fundoCidade.naturalWidth === 0 ||
    fundoCidade.naturalHeight === 0
  ) {
    return;
  }

  const proporcao =
    fundoCidade.naturalWidth / fundoCidade.naturalHeight;

  const alturaImagem = H;
  const larguraImagem = alturaImagem * proporcao;

  let dt = 0;

  if (ultimoTempoFundo > 0) {
    dt = Math.min((t - ultimoTempoFundo) / 1000, 0.03);
  }

  ultimoTempoFundo = t;

  if (!paused) {
    fundoX -= velocidadeFundo * dt;
  }

  if (fundoX <= -larguraImagem) {
    fundoX += larguraImagem;
  }

  ctx.drawImage(
    fundoCidade,
    fundoX,
    0,
    larguraImagem,
    alturaImagem
  );

  ctx.drawImage(
    fundoCidade,
    fundoX + larguraImagem,
    0,
    larguraImagem,
    alturaImagem
  );
}

// =====================================================
// DESENHAR CANOS
// =====================================================

function drawPipes() {
  pipes.forEach((p) => {
    const topH = p.center - p.gap / 2;
    const bottomY = p.center + p.gap / 2;

    ctx.save();

    const gradient = ctx.createLinearGradient(
      p.x,
      0,
      p.x + p.w,
      0
    );

    gradient.addColorStop(0, "#563078");
    gradient.addColorStop(0.25, "#9564bd");
    gradient.addColorStop(0.55, "#b58bd5");
    gradient.addColorStop(0.82, "#8653ad");
    gradient.addColorStop(1, "#4b286b");

    ctx.fillStyle = gradient;

    // CANO SUPERIOR

    ctx.fillRect(
      p.x,
      0,
      p.w,
      Math.max(0, topH - 24)
    );

    // CANO INFERIOR

    ctx.fillRect(
      p.x,
      bottomY + 24,
      p.w,
      Math.max(0, H - bottomY - 24)
    );

    // BORDAS

    ctx.strokeStyle = "#42215e";
    ctx.lineWidth = 3;

    ctx.strokeRect(
      p.x,
      0,
      p.w,
      Math.max(0, topH - 24)
    );

    ctx.strokeRect(
      p.x,
      bottomY + 24,
      p.w,
      Math.max(0, H - bottomY - 24)
    );

    // PONTAS DOS CANOS

    const capGradient = ctx.createLinearGradient(
      p.x - 8,
      0,
      p.x + p.w + 8,
      0
    );

    capGradient.addColorStop(0, "#4b286b");
    capGradient.addColorStop(0.2, "#8e5bb5");
    capGradient.addColorStop(0.5, "#c5a1df");
    capGradient.addColorStop(0.8, "#8653ad");
    capGradient.addColorStop(1, "#42215e");

    ctx.fillStyle = capGradient;
    ctx.strokeStyle = "#42215e";
    ctx.lineWidth = 3;

    ctx.fillRect(
      p.x - 8,
      topH - 24,
      p.w + 16,
      28
    );

    ctx.strokeRect(
      p.x - 8,
      topH - 24,
      p.w + 16,
      28
    );

    ctx.fillRect(
      p.x - 8,
      bottomY - 4,
      p.w + 16,
      28
    );

    ctx.strokeRect(
      p.x - 8,
      bottomY - 4,
      p.w + 16,
      28
    );

    // REFLEXO CLARO

    ctx.fillStyle = "#d9baf0";

    ctx.fillRect(
      p.x + 9,
      0,
      5,
      Math.max(0, topH - 24)
    );

    ctx.fillRect(
      p.x + 9,
      bottomY + 24,
      5,
      Math.max(0, H - bottomY - 24)
    );

    ctx.fillRect(
      p.x - 4,
      topH - 18,
      5,
      16
    );

    ctx.fillRect(
      p.x - 4,
      bottomY + 2,
      5,
      16
    );

    ctx.restore();
  });
}

// =====================================================
// CACHE DE IMAGENS
// =====================================================

const imgCache = new Map();

function getImg(src) {
  if (!imgCache.has(src)) {
    const image = new Image();
    image.src = src;

    imgCache.set(src, image);
  }

  return imgCache.get(src);
}

// =====================================================
// DESENHAR JOGADOR
// =====================================================

function drawPlayer() {
  const c =
    allChars()[selectedIndex] || defaultChars[0];

  ctx.save();

  ctx.translate(
    player.x,
    player.y
  );

  // INCLINAÇÃO DO PERSONAGEM

  ctx.rotate(
    Math.max(
      -0.45,
      Math.min(0.8, player.vy / 800)
    )
  );

  // ESCOLHA DA IMAGEM

  const imagemAtual =
    player.vy < 0
      ? c.imgDown
      : c.imgUp;

  const img = getImg(imagemAtual);

  if (img.complete && img.naturalWidth > 0) {
    const tamanho = player.r * 3;

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      img,
      -tamanho / 2,
      -tamanho / 2,
      tamanho,
      tamanho
    );
  }

  ctx.restore();
}

// =====================================================
// ATUALIZAR JOGO
// =====================================================

// DESENHAR PARTÍCULAS
// =====================================================

function drawParticles() {
  particles.forEach((pt) => {
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
      pt.x,
      pt.y,
      3.5,
      0,
      Math.PI * 2
    );

    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

// =====================================================
