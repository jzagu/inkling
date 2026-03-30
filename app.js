// app.js — Inkling game logic

// ── State ──────────────────────────────────────────────────────────────────
let puzzle        = null;   // { start, end, minMoves, optimalPath }
let chain         = [];     // words so far; chain[0] === puzzle.start
let gameWon       = false;
let autoCompleted = false;  // true when game ended by proximity (not exact match)

// ── Date helpers ───────────────────────────────────────────────────────────
function getPacificDateString() {
  return new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
}

function getPuzzleIndex() {
  const toLocalMidnight = d =>
    new Date(new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const today = toLocalMidnight(new Date());
  const epoch = toLocalMidnight(new Date('2025-01-01T12:00:00Z'));
  const days  = Math.floor((today - epoch) / 86_400_000);
  return ((days % DAILY_PAIRS.length) + DAILY_PAIRS.length) % DAILY_PAIRS.length;
}

// ── Diff computation ───────────────────────────────────────────────────────
function getDiff(a, b) {
  const out = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) out.push(i);
  }
  return out;
}

// ── Move counting ──────────────────────────────────────────────────────────
// The goal auto-appended by proximity win doesn't count as a player move.
// Optimal is minMoves-1 because players can stop one step before exact match.
function getPlayerMoves() {
  return autoCompleted ? chain.length - 2 : chain.length - 1;
}
function getEffectiveBest() {
  return Math.max(1, puzzle.minMoves - 1);
}

// ── Difficulty label ───────────────────────────────────────────────────────
function getDifficultyLabel(minMoves) {
  if (minMoves <= 3) return 'Easy';
  if (minMoves <= 4) return 'Medium';
  if (minMoves <= 5) return 'Hard';
  return 'Extreme';
}

// ── LocalStorage ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'inkling_v2';

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date:          getPacificDateString(),
    chain:         chain,
    won:           gameWon,
    autoCompleted: autoCompleted,
  }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.date !== getPacificDateString()) return null;
    return s;
  } catch {
    return null;
  }
}

// ── Message helpers ────────────────────────────────────────────────────────
function showMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className   = type || '';
}
function clearMessage() { showMessage(''); }

// ── Rendering ──────────────────────────────────────────────────────────────
function renderRouteTiles(elId, word) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  for (const ch of word) {
    const span = document.createElement('span');
    span.className   = 'route-tile';
    span.textContent = ch;
    el.appendChild(span);
  }
}

function makeWordRow(word, idx) {
  const row = document.createElement('div');
  row.className = 'chain-row';
  if (idx === 0) row.classList.add('is-start');

  const wordDiv = document.createElement('div');
  wordDiv.className = 'chain-word';

  const diffIdx = idx > 0 ? getDiff(chain[idx - 1], word) : [];
  for (let i = 0; i < word.length; i++) {
    const span = document.createElement('span');
    span.className = 'chain-letter' + (diffIdx.includes(i) ? ' changed' : '');
    span.textContent = word[i];
    wordDiv.appendChild(span);
  }
  row.appendChild(wordDiv);
  return row;
}

function renderChain() {
  const container = document.getElementById('chain-display');
  container.innerHTML = '';
  chain.forEach((word, idx) => {
    if (idx > 0) {
      const arrow = document.createElement('div');
      arrow.className   = 'chain-arrow';
      arrow.textContent = '↓';
      container.appendChild(arrow);
    }
    container.appendChild(makeWordRow(word, idx));
  });
  document.getElementById('undo-btn').disabled = chain.length <= 1 || gameWon;
}

function renderHeader() {
  document.getElementById('puzzle-date').textContent = getPacificDateString();
  const badge = document.getElementById('difficulty-badge');
  const label = getDifficultyLabel(puzzle.minMoves);
  badge.textContent = label;
  badge.className   = 'diff-badge diff-' + label.toLowerCase();
}

// ── Win overlay ────────────────────────────────────────────────────────────
function showWinOverlay() {
  const moves     = getPlayerMoves();
  const best      = getEffectiveBest();
  const isOptimal = moves <= best;
  const diff      = getDifficultyLabel(puzzle.minMoves);

  document.getElementById('win-stats').innerHTML =
    `<strong>${moves}</strong> move${moves !== 1 ? 's' : ''} &nbsp;·&nbsp; ${diff}` +
    `<br>Best possible: <strong>${best}</strong> move${best !== 1 ? 's' : ''}`;

  document.getElementById('optimal-badge').classList.toggle('hidden', !isOptimal);

  const winChain = document.getElementById('win-chain-display');
  winChain.innerHTML = '';
  chain.forEach((word, idx) => {
    if (idx > 0) {
      const arrow = document.createElement('div');
      arrow.className   = 'chain-arrow';
      arrow.textContent = '↓';
      winChain.appendChild(arrow);
    }
    winChain.appendChild(makeWordRow(word, idx));
  });

  document.getElementById('win-overlay').classList.remove('hidden');
}

// ── Share text ─────────────────────────────────────────────────────────────
function buildShareText() {
  const moves     = getPlayerMoves();
  const isOptimal = moves <= getEffectiveBest();
  const diff      = getDifficultyLabel(puzzle.minMoves);

  let text = `Inkling ${getPacificDateString()} (${diff})\n`;
  text += `${puzzle.start} → ${puzzle.end}\n`;
  text += `${moves} move${moves !== 1 ? 's' : ''}${isOptimal ? ' ⚡ Optimal!' : ''}\n\n`;

  chain.forEach((word, idx) => {
    if (idx === 0) return;
    const d = getDiff(chain[idx - 1], word);
    text += Array.from({ length: word.length }, (_, i) =>
      d.includes(i) ? '🟨' : '🟩'
    ).join('') + '\n';
  });

  text += '\nhttps://jzagu.github.io/inkling';
  return text;
}

// ── Submit word ────────────────────────────────────────────────────────────
function submitWord(raw) {
  const word = raw.trim().toUpperCase();
  if (!word) return;

  if (word.length !== 7) {
    showMessage('Words must be exactly 7 letters.', 'error');
    return;
  }

  if (!SCRABBLE_WORDS.has(word)) {
    showMessage(`"${word}" is not a valid word.`, 'error');
    return;
  }

  const prev = chain[chain.length - 1];
  const diff = getDiff(prev, word);
  if (diff.length < 1 || diff.length > 2) {
    showMessage(`Must change exactly 1 or 2 letters from "${prev}".`, 'error');
    return;
  }

  if (chain.includes(word)) {
    showMessage(`"${word}" is already in your chain.`, 'error');
    return;
  }

  chain.push(word);
  renderChain();
  clearMessage();

  // Win: submitted word is within 0-2 letters of goal
  const distToGoal = getDiff(word, puzzle.end).length;
  if (distToGoal <= 2) {
    // If not exact match, auto-append the goal word so the chain reads complete
    if (distToGoal > 0) {
      chain.push(puzzle.end);
      autoCompleted = true;
      renderChain();
    }
    gameWon = true;
    saveState();
    setTimeout(showWinOverlay, 350);
  } else {
    saveState();
  }
}

// ── Undo ───────────────────────────────────────────────────────────────────
function undo() {
  if (chain.length <= 1 || gameWon) return;
  chain.pop();
  saveState();
  renderChain();
  clearMessage();
}

// ── Initialise ─────────────────────────────────────────────────────────────
function init() {
  puzzle = DAILY_PAIRS[getPuzzleIndex()];

  const saved = loadState();
  if (saved && Array.isArray(saved.chain) && saved.chain.length >= 1
      && saved.chain[0] === puzzle.start) {
    chain         = saved.chain;
    gameWon       = saved.won || false;
    autoCompleted = saved.autoCompleted || false;
  } else {
    chain         = [puzzle.start];
    gameWon       = false;
    autoCompleted = false;
  }

  renderHeader();
  renderRouteTiles('start-word', puzzle.start);
  renderRouteTiles('target-word', puzzle.end);
  renderChain();

  if (gameWon) {
    setTimeout(showWinOverlay, 100);
  } else {
    document.getElementById('word-input').focus();
  }
}

// ── Event listeners ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof DAILY_PAIRS === 'undefined' || typeof SCRABBLE_WORDS === 'undefined') {
    document.getElementById('message').textContent =
      'Error: word lists failed to load. Please refresh.';
    return;
  }

  init();

  document.getElementById('input-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('word-input');
    submitWord(input.value);
    input.value = '';
    input.focus();
  });

  document.getElementById('undo-btn').addEventListener('click', undo);

  document.getElementById('help-btn').addEventListener('click', () =>
    document.getElementById('help-overlay').classList.remove('hidden'));

  document.getElementById('help-close').addEventListener('click', () => {
    document.getElementById('help-overlay').classList.add('hidden');
    document.getElementById('word-input').focus();
  });

  document.getElementById('help-overlay').addEventListener('click', e => {
    if (e.target.id === 'help-overlay') {
      document.getElementById('help-overlay').classList.add('hidden');
      document.getElementById('word-input').focus();
    }
  });

  document.getElementById('share-btn').addEventListener('click', () => {
    const text    = buildShareText();
    const confirm = document.getElementById('share-confirm');
    const done    = () => {
      confirm.classList.remove('hidden');
      setTimeout(() => confirm.classList.add('hidden'), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  });

  document.getElementById('word-input').addEventListener('input', e => {
    const pos = e.target.selectionStart;
    e.target.value = e.target.value.toUpperCase();
    e.target.setSelectionRange(pos, pos);
  });
});

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' });
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); cb(); } catch {}
  document.body.removeChild(ta);
}
