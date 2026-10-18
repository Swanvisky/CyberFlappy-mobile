// Personagens, seleção, músicas e recorde.
// PERSONAGENS
// =====================================================

const defaultChars = [
  {
    name: "Gali Yas",
    imgUp: "assets/img/gali-yas-cima.png",
    imgDown: "assets/img/gali-yas-baixo.png"
  },
  {
    name: "Gali Tonho",
    imgUp: "assets/img/gali-tonho-cima.png",
    imgDown: "assets/img/gali-tonho-baixo.png"
  },
  {
    name: "Gali Juju",
    imgUp: "assets/img/gali-ju-cima.png",
    imgDown: "assets/img/gali-ju-baixo.png"
  },
  {
    name: "Gali Finy",
    imgUp: "assets/img/gali-finy-cima.png",
    imgDown: "assets/img/gali-finy-baixo.png"
  },  
  { 
    name: "Gali Sofria",
    imgUp: "assets/img/gali-sofi-cima.png",
    imgDown: "assets/img/gali-sofi-baixo.png"
  },
  {
    name: "Gali Thali",
    imgUp: "assets/img/gali-thali-cima.png",
    imgDown: "assets/img/gali-thali-baixo.png"
  }
];

// PERSONAGEM SELECIONADO

let selectedIndex = Number(
  localStorage.getItem("flappySelected") || 0
);

// =====================================================
// MÚSICAS DOS PERSONAGENS E MÚSICA DE FUNDO
// =====================================================

// Deixe os arquivos MP3 na mesma pasta do index.html
// e do script.js. Não precisa criar a pasta "audio".

const characterMusic = {
  "Gali Finy": "assets/music/do-the-dance2.mp3",
  "Gali Juju": "assets/music/SMOOTH-CRIMINAL.mp3",
  "Gali Sofria": "assets/music/pantera.mp3",
  "Gali Thali": "assets/music/frutti.mp3",
  "Gali Tonho": "assets/music/super-shy.mp3",
  "Gali Yas": "assets/music/sugar.mp3"
};

// Nome do arquivo da música de fundo.
const backgroundMusicPath = "assets/music/fundo.mp3";

// Um único reprodutor para impedir que duas músicas
// toquem simultaneamente.

const gameMusic = new Audio();

gameMusic.loop = true;
gameMusic.preload = "auto";

const volumePersonagem = 0.25;
const volumeFundo = 0.03;

let useCharacterMusic = true;
let currentMusicPath = "";

const musicModeBtn = document.getElementById("musicModeBtn");

// Reproduz uma música e para a anterior antes da troca.

function playGameMusic(path) {
  if (!path) return;

  if (currentMusicPath !== path) {
    gameMusic.pause();
    gameMusic.currentTime = 0;

    gameMusic.src = path;
    gameMusic.volume = path === backgroundMusicPath
      ? volumeFundo
      : volumePersonagem;
    currentMusicPath = path;
  }

  const playPromise = gameMusic.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((error) => {
      console.warn(
        "Não foi possível iniciar a música. Confira o nome do MP3.",
        error
      );
    });
  }
}

// Escolhe a música conforme o modo selecionado.

function updateGameMusic(characterName) {
  const characterTrack = characterMusic[characterName];

  const path =
    useCharacterMusic && characterTrack
      ? characterTrack
      : backgroundMusicPath;

  playGameMusic(path);
}

// O único botão alterna entre as músicas dos personagens
// e a música de fundo.

function toggleGameMusicMode() {
  useCharacterMusic = !useCharacterMusic;

  if (musicModeBtn) {
    musicModeBtn.textContent = useCharacterMusic
      ? "♫ Desligar música do personagem"
      : "♫ Ligar música do personagem";
  }

  const character =
    defaultChars[selectedIndex] || defaultChars[0];

  updateGameMusic(character.name);
}

if (musicModeBtn) {
  musicModeBtn.textContent =
    "♫ Desligar música do personagem";

  musicModeBtn.addEventListener(
    "click",
    toggleGameMusicMode
  );
}

// =====================================================
// MELHOR PONTUAÇÃO
// =====================================================

let best = Number(
  localStorage.getItem("flappyBest") || 0
);

bestEl.textContent = best;

// =====================================================
// PEGAR TODOS OS PERSONAGENS
// =====================================================

function allChars() {
  return defaultChars;
}

// =====================================================
// MOSTRAR PERSONAGENS
// =====================================================

function renderChars() {
  charsEl.innerHTML = "";

  if (
    selectedIndex < 0 ||
    selectedIndex >= allChars().length
  ) {
    selectedIndex = 0;

    localStorage.setItem(
      "flappySelected",
      "0"
    );
  }

  allChars().forEach((c, i) => {
    const button = document.createElement("button");

    button.className =
      "char" + (i === selectedIndex ? " selected" : "");

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const img = document.createElement("img");
    img.src = c.imgUp;

    avatar.appendChild(img);

    const name = document.createElement("small");
    name.textContent = c.name;

    button.append(avatar, name);

    // QUANDO CLICAR NO PERSONAGEM

    button.onclick = () => {
      selectedIndex = i;

      localStorage.setItem(
        "flappySelected",
        i
      );

      updateGameMusic(c.name);

      renderChars();
    };

    charsEl.appendChild(button);
  });
}

renderChars();

// =====================================================
