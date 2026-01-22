let words = [];
let selected = [];
let gameId = getGameIdFromUrl() || generateId();
let editIndex = null;

// ---------- utils ----------
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function getGameIdFromUrl() {
  return new URLSearchParams(location.search).get("id");
}

function saveGameToStorage(id, data) {
  localStorage.setItem("game_" + id, JSON.stringify(data));
}

function loadGameFromStorage(id) {
  const d = localStorage.getItem("game_" + id);
  return d ? JSON.parse(d) : null;
}

// ---------- words ----------
function addOrUpdateWord() {
  const he = hebrew.value.trim();
  const en = english.value.trim();
  if (!he || !en) return;

  if (editIndex !== null) {
    words[editIndex] = { he, en, matched: false };
    editIndex = null;
  } else {
    words.push({ he, en, matched: false });
  }

  resetWordEdit();
  renderGame();
  autoSave();
}

function resetWordEdit() {
  hebrew.value = "";
  english.value = "";
  editIndex = null;
}

function renderGame() {
  const game = document.getElementById("game");
  game.innerHTML = "";

  const heCol = document.createElement("div");
  const enCol = document.createElement("div");
  heCol.className = enCol.className = "column";

  words.forEach((w, i) => {
    if (!w.matched) {
      const h = createWord(w.he, () => selectWord(i, "he"));
      const e = createWord(w.en, () => selectWord(i, "en"));

      h.ondblclick = () => editWord(i);
      e.ondblclick = () => editWord(i);

      heCol.appendChild(h);
      enCol.appendChild(e);
    }
  });

  game.appendChild(heCol);
  game.appendChild(enCol);
}

function createWord(text, clickFn) {
  const div = document.createElement("div");
  div.className = "word";
  div.textContent = text;
  div.onclick = clickFn;
  return div;
}

function editWord(index) {
  hebrew.value = words[index].he;
  english.value = words[index].en;
  editIndex = index;
}

// ---------- match ----------
function selectWord(index, lang) {
  if (selected.length === 2) return;

  selected.push({ index, lang });

  if (selected.length === 2) {
    const [a, b] = selected;
    if (a.index === b.index && a.lang !== b.lang) {
      words[a.index].matched = true;
    }
    selected = [];
    renderGame();
    autoSave();
  }
}

// ---------- save / load ----------
function saveGame() {
  saveGameToStorage(gameId, words);
  renderSavedGames();
  alert("נשמר ✅");
}

function autoSave() {
  saveGameToStorage(gameId, words);
}

function renderSavedGames() {
  const ul = document.getElementById("savedGames");
  ul.innerHTML = "";

  Object.keys(localStorage)
    .filter(k => k.startsWith("game_"))
    .forEach(k => {
      const id = k.replace("game_", "");
      const li = document.createElement("li");

      li.innerHTML = `
        <span>משחק ${id}</span>
        <div>
          <button class="small" onclick="openGame('${id}')">פתח</button>
          <button class="small secondary" onclick="deleteGame('${id}')">מחק</button>
        </div>
      `;
      ul.appendChild(li);
    });
}

function openGame(id) {
  const data = loadGameFromStorage(id);
  if (!data) return;
  gameId = id;
  words = data;
  history.replaceState({}, "", "?id=" + id);
  renderGame();
}

function deleteGame(id) {
  localStorage.removeItem("game_" + id);
  renderSavedGames();
}

// ---------- share ----------
function shareGame() {
  saveGame();
  const url = `${location.origin}${location.pathname}?id=${gameId}`;
  navigator.clipboard.writeText(url);
  alert("קישור הועתק 📋");
}

// ---------- init ----------
(function () {
  const fromUrl = getGameIdFromUrl();
  if (fromUrl) {
    const data = loadGameFromStorage(fromUrl);
    if (data) {
      gameId = fromUrl;
      words = data;
      saveGameToStorage(gameId, words);
    }
  }
  renderGame();
  renderSavedGames();
})();
