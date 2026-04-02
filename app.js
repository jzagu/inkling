// app.js — Inkling game logic

// ── State ──────────────────────────────────────────────────────────────────
let puzzle        = null;   // { start, end, minSteps, optimalPath }
let chain         = [];     // words so far; chain[0] === puzzle.start
let gameWon       = false;
let autoCompleted = false;  // true when game ended by proximity (goal auto-appended)
let gaveUp        = false;
let bestSteps     = null;   // best (lowest) step count achieved today

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

// ── Step counting ──────────────────────────────────────────────────────────
// Each transition between words = 1 step, including the auto-completed final step.
// Par = puzzle.minSteps (BFS shortest path through top-10k frequency words).
// Players using the full Scrabble dictionary may occasionally beat par.
function getPlayerSteps() {
  return chain.length - 1;
}
function getPar() {
  return puzzle.minSteps;
}

// ── Difficulty label ───────────────────────────────────────────────────────
function getDifficultyLabel(minSteps) {
  if (minSteps <= 3) return 'Easy';
  if (minSteps <= 4) return 'Medium';
  if (minSteps <= 5) return 'Hard';
  return 'Extreme';
}

// ── LocalStorage ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'inkling_v3';

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date:          getPacificDateString(),
    chain:         chain,
    won:           gameWon,
    autoCompleted: autoCompleted,
    gaveUp:        gaveUp,
    bestSteps:     bestSteps,
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

function makeWordRow(word, prevWord) {
  const row = document.createElement('div');
  row.className = 'chain-row';

  const wordDiv = document.createElement('div');
  wordDiv.className = 'chain-word';

  const diffIdx = prevWord ? getDiff(prevWord, word) : [];
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
    container.appendChild(makeWordRow(word, idx > 0 ? chain[idx - 1] : null));
  });
  document.getElementById('undo-btn').disabled = chain.length <= 1 || gameWon || gaveUp;
  document.getElementById('give-up-btn').classList.toggle('hidden', gameWon || gaveUp);
}

function renderHeader() {
  document.getElementById('puzzle-date').textContent = getPacificDateString();
  const badge = document.getElementById('difficulty-badge');
  const label = getDifficultyLabel(puzzle.minSteps);
  badge.textContent = label;
  badge.className   = 'diff-badge diff-' + label.toLowerCase();
}

// ── Give up ────────────────────────────────────────────────────────────────
function showGiveUpSolution() {
  document.getElementById('input-form').classList.add('hidden');
  document.getElementById('give-up-confirm').classList.add('hidden');

  const path = puzzle.optimalPath;
  const container = document.getElementById('chain-display');
  container.innerHTML = '';

  path.forEach((word, idx) => {
    if (idx > 0) {
      const arrow = document.createElement('div');
      arrow.className   = 'chain-arrow';
      arrow.textContent = '↓';
      container.appendChild(arrow);
    }
    container.appendChild(makeWordRow(word, idx > 0 ? path[idx - 1] : null));
  });

  showMessage(
    `One calculated optimal solution (${puzzle.minSteps} steps). Come back tomorrow for a new puzzle.`,
    'gave-up'
  );
}

function confirmGiveUp() {
  gaveUp = true;
  saveState();
  showGiveUpSolution();
}

// ── Win chain toggle ───────────────────────────────────────────────────────
let showingCalculatedSolution = false;

function renderWinChain(words) {
  const winChain = document.getElementById('win-chain-display');
  winChain.innerHTML = '';
  words.forEach((word, idx) => {
    if (idx > 0) {
      const arrow = document.createElement('div');
      arrow.className   = 'chain-arrow';
      arrow.textContent = '↓';
      winChain.appendChild(arrow);
    }
    winChain.appendChild(makeWordRow(word, idx > 0 ? words[idx - 1] : null));
  });
}

function toggleWinChain() {
  const btn = document.getElementById('toggle-solution-btn');
  showingCalculatedSolution = !showingCalculatedSolution;
  if (showingCalculatedSolution) {
    renderWinChain(puzzle.optimalPath);
    btn.textContent = 'Show my solution';
  } else {
    renderWinChain(chain);
    btn.textContent = 'Show calculated solution';
  }
}

// ── Try again ──────────────────────────────────────────────────────────────
function tryAgain() {
  if (gaveUp) return;
  chain         = [puzzle.start];
  gameWon       = false;
  autoCompleted = false;
  saveState();
  document.getElementById('win-overlay').classList.add('hidden');
  renderChain();
  clearMessage();
  document.getElementById('word-input').focus();
}

// ── Win overlay ────────────────────────────────────────────────────────────
function showWinOverlay() {
  const steps     = getPlayerSteps();
  const par       = getPar();
  const beatPar   = steps < par;
  const atPar     = steps === par;
  const diff      = getDifficultyLabel(puzzle.minSteps);

  // Update best steps for today
  if (bestSteps === null || steps < bestSteps) {
    bestSteps = steps;
    saveState();
  }

  const bestLine = bestSteps !== null && bestSteps < steps
    ? `<br><span class="best-score">Your best today: <strong>${bestSteps}</strong> step${bestSteps !== 1 ? 's' : ''}</span>`
    : '';

  document.getElementById('win-stats').innerHTML =
    `<strong>${steps}</strong> step${steps !== 1 ? 's' : ''} &nbsp;·&nbsp; ${diff}` +
    `<br>Par: <strong>${par}</strong> step${par !== 1 ? 's' : ''}` +
    bestLine;

  const badge = document.getElementById('optimal-badge');
  if (beatPar) {
    badge.textContent = '🌟 Beats calculated par!';
    badge.className   = 'optimal-badge beat-par';
    badge.classList.remove('hidden');
  } else if (atPar) {
    badge.textContent = '⚡ Par!';
    badge.className   = 'optimal-badge';
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  showingCalculatedSolution = false;
  document.getElementById('toggle-solution-btn').textContent = 'Show calculated solution';
  renderWinChain(chain);

  document.getElementById('win-overlay').classList.remove('hidden');
}

// ── Share text ─────────────────────────────────────────────────────────────
function buildShareText() {
  const steps   = getPlayerSteps();
  const par     = getPar();
  const beatPar = steps < par;
  const atPar   = steps === par;
  const diff    = getDifficultyLabel(puzzle.minSteps);

  let badge = '';
  if (beatPar) badge = ' 🌟 Beats par!';
  else if (atPar) badge = ' ⚡ Par!';

  let text = `Inkling ${getPacificDateString()} (${diff})\n`;
  text += `${puzzle.start} → ${puzzle.end}\n`;
  text += `${steps} step${steps !== 1 ? 's' : ''}${badge}\n\n`;

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
    gaveUp        = saved.gaveUp || false;
    bestSteps     = saved.bestSteps ?? null;
  } else {
    chain         = [puzzle.start];
    gameWon       = false;
    autoCompleted = false;
    gaveUp        = false;
  }

  renderHeader();
  renderRouteTiles('start-word', puzzle.start);
  renderRouteTiles('target-word', puzzle.end);
  renderChain();

  if (gameWon) {
    setTimeout(showWinOverlay, 100);
  } else if (gaveUp) {
    showGiveUpSolution();
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

  document.getElementById('try-again-btn').addEventListener('click', tryAgain);

  document.getElementById('give-up-btn').addEventListener('click', () => {
    document.getElementById('give-up-confirm').classList.remove('hidden');
    document.getElementById('give-up-btn').classList.add('hidden');
  });

  document.getElementById('give-up-yes').addEventListener('click', confirmGiveUp);

  document.getElementById('give-up-no').addEventListener('click', () => {
    document.getElementById('give-up-confirm').classList.add('hidden');
    document.getElementById('give-up-btn').classList.remove('hidden');
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
