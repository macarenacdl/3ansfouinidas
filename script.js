/* ============================================================
   ✏️ CONFIGURATION — tout ce que tu peux modifier est ici
   ============================================================ */

// Nombre de fois où le bonbon s'enfuit avant de se laisser attraper
const CANDY_DODGES = 5;

// Texte en bas du billet (tu peux y mettre une date, par exemple)
const TICKET_NOTE = "Une journée rien que pour nous 🧡";

// Questions du quiz (answer = index de la bonne réponse, en partant de 0)
const QUESTIONS = [
  {
    q: "Quel a été le premier voyage des Fouinidas ensemble ? ✈️",
    options: ["Florence", "Rome", "Gruyères"],
    answer: 1,
  },
  {
    q: "Quand les Fouinidas ont-ils officiellement reconnu être en couple ? 💑",
    options: ["Décembre 2023", "Janvier 2024", "Les deux sont corrects"],
    answer: 2,
  },
  {
    q: "Quel est le rendez-vous idéal pour les Fouinidas ? 🌿",
    options: ["Un rendez-vous au spa", "Randonnée au Mont Salève", "Dîner dans un restaurant végan"],
    answer: 0,
  },
];

// Cartes du mémo. "img" = photo à placer dans le dossier images/
// Si la photo est absente, l'emoji s'affiche à la place.
// "win: true" = la paire qui fait gagner la partie.
const MEMO_CARDS = [
  { id: "asado",    emoji: "🥩", img: "images/asado.jpg" },
  { id: "msemen",   emoji: "🫓", img: "images/msemen.jpg" },
  { id: "tajine",   emoji: "🍲", img: "images/tajine.jpg" },
  { id: "parfum",   emoji: "🧴", img: "images/parfum.jpg" },
  { id: "glacier",  emoji: "🏔️", img: "images/glacier.jpg" },
  { id: "atay",     emoji: "🍵", img: "images/atay.jpg" },
  { id: "mate",     emoji: "🧉", img: "images/mate.jpg" },
  { id: "montre",   emoji: "⌚", img: "images/montre.jpg", win: true },
];

/* ============================================================
   Code du site
   ============================================================ */

const $ = (sel) => document.querySelector(sel);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------- Confettis ---------- */
function confetti(count = 40) {
  const box = $("#confetti");
  const emojis = ["🧡", "✨", "🎉", "🍬", "🍊", "🥳"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "confetti-piece";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 18 + Math.random() * 20 + "px";
    el.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
    el.style.animationDelay = Math.random() * 0.8 + "s";
    box.appendChild(el);
    setTimeout(() => el.remove(), 6500);
  }
}

/* ---------- Écran 1 : le bonbon ---------- */
const candy = $("#candy");
let dodges = 0;
let lastDodge = 0;
let pointer = { x: -999, y: -999 };

function moveCandy() {
  const size = 78;
  const margin = 16;
  const maxX = window.innerWidth - size - margin;
  const maxY = window.innerHeight - size - margin;
  let x, y, tries = 0;
  do {
    x = margin + Math.random() * (maxX - margin);
    y = margin + Math.random() * (maxY - margin);
    tries++;
    // on évite de réapparaître juste sous le doigt / la souris
  } while (tries < 15 && Math.hypot(x + size / 2 - pointer.x, y + size / 2 - pointer.y) < 160);
  candy.style.left = x + "px";
  candy.style.top = y + "px";
}

function dodge() {
  const now = Date.now();
  if (now - lastDodge < 300) return;
  lastDodge = now;
  dodges++;
  moveCandy();
  if (dodges >= CANDY_DODGES) {
    candy.classList.add("calm");
    $("#intro-hint").textContent = "Il est fatigué… attrape-le maintenant ! 🍬✨";
  }
}

function candyCenter() {
  const r = candy.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

document.addEventListener("pointermove", (e) => {
  pointer = { x: e.clientX, y: e.clientY };
  if (!$("#screen-intro").classList.contains("active") || dodges >= CANDY_DODGES) return;
  const c = candyCenter();
  if (Math.hypot(c.x - e.clientX, c.y - e.clientY) < 95) dodge();
});

candy.addEventListener("pointerdown", (e) => {
  pointer = { x: e.clientX, y: e.clientY };
  if (dodges < CANDY_DODGES) {
    dodge();
    return;
  }
  caught();
});

// Un bonbon qui se promène tout seul de temps en temps
setInterval(() => {
  if ($("#screen-intro").classList.contains("active") && dodges < CANDY_DODGES) moveCandy();
}, 2200);

function caught() {
  candy.classList.add("hidden");
  confetti(30);
  startQuiz();
}

window.addEventListener("load", () => {
  candy.style.left = window.innerWidth / 2 - 39 + "px";
  candy.style.top = window.innerHeight * 0.7 + "px";
  setTimeout(moveCandy, 600);
});

/* ---------- Écran 2 : le quiz ---------- */
let qIndex = 0;

function startQuiz() {
  qIndex = 0;
  showScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[qIndex];
  $("#quiz-progress").textContent = "🧡".repeat(qIndex) + "🤍".repeat(QUESTIONS.length - qIndex);
  $("#quiz-question").textContent = q.q;
  $("#quiz-feedback").textContent = "";
  const box = $("#quiz-answers");
  box.innerHTML = "";
  q.options.forEach((label, i) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = label;
    btn.addEventListener("click", () => answer(btn, i));
    box.appendChild(btn);
  });
}

function answer(btn, i) {
  const q = QUESTIONS[qIndex];
  if (i === q.answer) {
    btn.classList.add("right");
    $("#quiz-feedback").textContent = "Bravo ! 🎉";
    document.querySelectorAll(".answer").forEach((b) => (b.disabled = true));
    confetti(12);
    setTimeout(() => {
      qIndex++;
      if (qIndex < QUESTIONS.length) renderQuestion();
      else startMemo();
    }, 1100);
  } else {
    btn.classList.add("wrong");
    $("#quiz-feedback").textContent = "Hmm, pas tout à fait… réessaie ! 🙈";
    setTimeout(() => btn.classList.remove("wrong"), 450);
  }
}

/* ---------- Écran 3 : le mémo ---------- */
let first = null;
let lock = false;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startMemo() {
  showScreen("screen-memo");
  const grid = $("#memo-grid");
  grid.innerHTML = "";
  $("#memo-feedback").textContent = "";
  first = null;
  lock = false;

  const deck = shuffle([...MEMO_CARDS, ...MEMO_CARDS].map((c) => ({ ...c })));
  deck.forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "mcard";
    btn.dataset.id = c.id;
    btn.setAttribute("aria-label", "Carte");

    const inner = document.createElement("div");
    inner.className = "mcard-inner";

    const front = document.createElement("div");
    front.className = "mface mfront";
    front.textContent = "🧡";

    const back = document.createElement("div");
    back.className = "mface mback";
    const img = document.createElement("img");
    img.alt = c.id;
    img.src = c.img;
    img.addEventListener("error", () => {
      img.remove();
      back.textContent = c.emoji; // plan B : l'emoji
    });
    back.appendChild(img);

    inner.append(front, back);
    btn.appendChild(inner);
    btn.addEventListener("click", () => flip(btn, c));
    grid.appendChild(btn);
  });
}

function flip(btn, card) {
  if (lock || btn.classList.contains("flipped") || btn.classList.contains("matched")) return;
  btn.classList.add("flipped");

  if (!first) {
    first = { btn, card };
    return;
  }

  const second = { btn, card };
  lock = true;

  if (first.card.id === second.card.id) {
    first.btn.classList.replace("flipped", "matched");
    second.btn.classList.replace("flipped", "matched");
    const won = card.win;
    first = null;
    if (won) {
      $("#memo-feedback").textContent = "Les deux montres ! ⌚🎉";
      confetti(40);
      setTimeout(showGift, 1500);
    } else {
      $("#memo-feedback").textContent = "Une paire ! Mais ce ne sont pas les montres… 😉";
      lock = false;
    }
  } else {
    $("#memo-feedback").textContent = "";
    setTimeout(() => {
      first.btn.classList.remove("flipped");
      second.btn.classList.remove("flipped");
      first = null;
      lock = false;
    }, 900);
  }
}

/* ---------- Écran 4 : le cadeau ---------- */
function showGift() {
  $("#ticket-note").textContent = TICKET_NOTE;
  showScreen("screen-gift");
  confetti(60);
  setTimeout(() => confetti(40), 1800);
}
