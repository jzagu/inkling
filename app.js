// app.js — Inkling game logic

// ── State ──────────────────────────────────────────────────────────────────
let puzzle        = null;   // { start, end, minSteps, optimalPath }
let chain         = [];     // words so far; chain[0] === puzzle.start
let gameWon       = false;
let autoCompleted = false;  // true when game ended by proximity (goal auto-appended)
let gaveUp        = false;
let bestSteps     = null;   // best (lowest) step count achieved today
let hintsUsed     = 0;      // hints requested this attempt (resets on Try Again)
let bestHintFree  = null;   // best score achieved with 0 hints used

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
    hintsUsed:     hintsUsed,
    bestHintFree:  bestHintFree,
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

function showHintMessage(html, type) {
  const el = document.getElementById('hint-message');
  if (!el) return;
  el.innerHTML = html || '';
  el.className = 'hint-message' + (type ? ' ' + type : '') + (html ? '' : ' hidden');
}
function clearHintMessage() { showHintMessage(''); }

// ── Hint engine ────────────────────────────────────────────────────────────
// We build a neighbor graph over WORD_POOL (3,000 curated, profanity-filtered
// frequency-validated 7-letter words). Edges connect words that differ in 1
// or 2 letter positions. BFS from the player's current word finds the
// shortest path to any word within 2 letters of the goal — the first step
// along that path is returned as the hint. Player's already-used chain is
// blocked so we never suggest a word the player has typed.
const HINT_DEPTH_CAP = 12;
let neighborGraph        = null;   // Map<word, string[]>
let wordPoolSet          = null;   // Set<word> for O(1) membership
let neighborGraphReady   = false;
let neighborGraphPending = [];     // callbacks waiting for the graph

function computeNeighbors(word, dictSet) {
  const out = [];
  const A = 65, Z = 90;
  // 1-letter substitutions
  for (let i = 0; i < word.length; i++) {
    for (let c = A; c <= Z; c++) {
      const ch = String.fromCharCode(c);
      if (ch === word[i]) continue;
      const cand = word.slice(0, i) + ch + word.slice(i + 1);
      if (dictSet.has(cand)) out.push(cand);
    }
  }
  // 2-letter substitutions
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j < word.length; j++) {
      for (let c1 = A; c1 <= Z; c1++) {
        const ch1 = String.fromCharCode(c1);
        if (ch1 === word[i]) continue;
        for (let c2 = A; c2 <= Z; c2++) {
          const ch2 = String.fromCharCode(c2);
          if (ch2 === word[j]) continue;
          const cand = word.slice(0, i) + ch1 + word.slice(i + 1, j) + ch2 + word.slice(j + 1);
          if (dictSet.has(cand)) out.push(cand);
        }
      }
    }
  }
  return out;
}

function startNeighborGraphBuild() {
  if (neighborGraphReady || neighborGraph !== null) return;
  wordPoolSet   = new Set(WORD_POOL);
  neighborGraph = new Map();
  let i = 0;
  const CHUNK = 150;
  const scheduler = window.requestIdleCallback
    ? (cb) => window.requestIdleCallback(cb, { timeout: 250 })
    : (cb) => setTimeout(cb, 0);
  function tick() {
    const end = Math.min(i + CHUNK, WORD_POOL.length);
    for (; i < end; i++) {
      neighborGraph.set(WORD_POOL[i], computeNeighbors(WORD_POOL[i], wordPoolSet));
    }
    if (i < WORD_POOL.length) {
      scheduler(tick);
    } else {
      neighborGraphReady = true;
      const cbs = neighborGraphPending;
      neighborGraphPending = [];
      for (const cb of cbs) cb();
    }
  }
  scheduler(tick);
}

function whenNeighborGraphReady(cb) {
  if (neighborGraphReady) cb();
  else neighborGraphPending.push(cb);
}

// BFS from current chain word to any word within 2 letters of goal.
// Returns { hintWord, stepsToGoal } or null when no path exists in WORD_POOL.
function findHint() {
  if (!neighborGraphReady) return null;
  const current = chain[chain.length - 1];
  const goal    = puzzle.end;

  // Player has already won (button should be hidden, but guard anyway)
  if (getDiff(current, goal).length <= 2) return null;

  // Starting neighbors: if current word is in WORD_POOL we use the cached
  // edges, otherwise compute live (player may have typed a SCRABBLE-only
  // word that isn't in the curated pool).
  const startNeighbors = neighborGraph.has(current)
    ? neighborGraph.get(current)
    : computeNeighbors(current, wordPoolSet);

  const blocked = new Set(chain);        // never suggest a word the player has used
  const parent  = new Map();             // word -> parent in the BFS tree
  let frontier  = [];

  for (const n of startNeighbors) {
    if (blocked.has(n) || parent.has(n)) continue;
    parent.set(n, current);
    frontier.push(n);
  }

  let depth = 1;
  while (frontier.length && depth <= HINT_DEPTH_CAP) {
    // Check this depth-layer for any goal-adjacent word
    for (const word of frontier) {
      if (getDiff(word, goal).length <= 2) {
        // Walk back to the first step from `current`
        let firstStep = word;
        while (parent.get(firstStep) !== current) firstStep = parent.get(firstStep);
        // Words still to be added to the chain after taking this hint,
        // counting the auto-appended goal step (unless `word` IS goal).
        const stepsToGoal = depth + (word === goal ? 0 : 1);
        return { hintWord: firstStep, stepsToGoal };
      }
    }
    // Expand
    const next = [];
    for (const word of frontier) {
      const neighbors = neighborGraph.get(word) || [];
      for (const n of neighbors) {
        if (parent.has(n) || blocked.has(n)) continue;
        parent.set(n, word);
        next.push(n);
      }
    }
    frontier = next;
    depth++;
  }
  return null;
}

function requestHint() {
  if (gameWon || gaveUp) return;
  // Already within 2 of goal → don't bother (button should be hidden anyway)
  const current = chain[chain.length - 1];
  if (getDiff(current, puzzle.end).length <= 2) {
    showHintMessage(`You're already 1 step from <strong>${puzzle.end}</strong> — just type it!`, 'info');
    return;
  }

  const btn = document.getElementById('hint-btn');
  btn.disabled = true;

  const run = () => {
    const result = findHint();
    btn.disabled = false;
    updateHintButton();
    if (!result) {
      showHintMessage(
        'No hints available from here in the curated word pool. Try Undo or a different direction.',
        'warn'
      );
      return;
    }
    hintsUsed++;
    saveState();
    showHintMessage(
      `💡 Try: <strong>${result.hintWord}</strong> &nbsp;·&nbsp; ` +
      `${result.stepsToGoal} word${result.stepsToGoal !== 1 ? 's' : ''} to goal`,
      'info'
    );
  };

  if (neighborGraphReady) {
    run();
  } else {
    showHintMessage('Calculating hint…', 'info');
    whenNeighborGraphReady(run);
  }
}

function updateHintButton() {
  const btn = document.getElementById('hint-btn');
  if (!btn) return;
  // Hide entirely after give-up or after winning
  if (gameWon || gaveUp) {
    btn.classList.add('hidden');
    return;
  }
  // Hide when the player is already within 2 of the goal (a hint would be silly)
  const current = chain[chain.length - 1];
  if (getDiff(current, puzzle.end).length <= 2) {
    btn.classList.add('hidden');
    return;
  }
  btn.classList.remove('hidden');
  // Reflect usage count
  btn.textContent = hintsUsed > 0 ? `Hint (${hintsUsed} used)` : 'Hint';
}

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
  updateHintButton();
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
  hintsUsed     = 0;
  saveState();
  document.getElementById('win-overlay').classList.add('hidden');
  renderChain();
  clearMessage();
  clearHintMessage();
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
  }
  // Hint-free best is only updated when no hints were used this attempt
  if (hintsUsed === 0 && (bestHintFree === null || steps < bestHintFree)) {
    bestHintFree = steps;
  }
  saveState();

  const bestLine = bestSteps !== null && bestSteps < steps
    ? `<br><span class="best-score">Your best today: <strong>${bestSteps}</strong> step${bestSteps !== 1 ? 's' : ''}</span>`
    : '';

  const hintsLine = hintsUsed > 0
    ? `<br><span class="hint-stat">Hints used: <strong>${hintsUsed}</strong></span>`
    : '';

  const hintFreeLine = (bestHintFree !== null && bestHintFree !== bestSteps)
    ? `<br><span class="best-hint-free">Best hint-free today: <strong>${bestHintFree}</strong> step${bestHintFree !== 1 ? 's' : ''}</span>`
    : '';

  document.getElementById('win-stats').innerHTML =
    `<strong>${steps}</strong> step${steps !== 1 ? 's' : ''} &nbsp;·&nbsp; ${diff}` +
    `<br>Par: <strong>${par}</strong> step${par !== 1 ? 's' : ''}` +
    bestLine + hintsLine + hintFreeLine;

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

// ── Share squares & text ───────────────────────────────────────────────────
// Each square has two binary attributes:
//   color: 'yellow' (letter changed from prev word) | 'green' (letter unchanged)
//   atGoal: true if the letter matches the goal word at this position
//
// Visual: black border iff atGoal. The final row is always fully bordered.
// Text emoji encoding (no border possible on emoji, so we use 4 glyphs):
//   🟨 yellow + at goal   |  🟧 yellow + not at goal
//   🟩 green  + at goal   |  ⬜ green  + not at goal
function buildShareSquares() {
  if (chain.length < 2) return [];
  const goal = puzzle.end;
  const rows = [];

  // Row 0: the start word itself — all green, stars where it already
  // matches the goal's letter at that position.
  const start = chain[0];
  rows.push(
    Array.from({ length: start.length }, (_, i) => ({
      color:  'green',
      atGoal: start[i] === goal[i],
    }))
  );

  // Rows 1..N: each player transition. Yellow = letter changed from prev word.
  for (let idx = 1; idx < chain.length; idx++) {
    const prev = chain[idx - 1];
    const curr = chain[idx];
    const row  = [];
    for (let i = 0; i < curr.length; i++) {
      row.push({
        color:  prev[i] === curr[i] ? 'green' : 'yellow',
        atGoal: curr[i] === goal[i],
      });
    }
    rows.push(row);
  }
  return rows;
}

function squareToEmoji(sq) {
  if (sq.color === 'yellow') return sq.atGoal ? '🟨' : '🟧';
  return sq.atGoal ? '🟩' : '⬜';
}

function buildShareHeader() {
  const steps   = getPlayerSteps();
  const par     = getPar();
  const beatPar = steps < par;
  const atPar   = steps === par;
  const diff    = getDifficultyLabel(puzzle.minSteps);
  let badge = '';
  if (beatPar)      badge = ' 🌟 Beats par!';
  else if (atPar)   badge = ' ⚡ Par!';
  let text = `Inkling ${getPacificDateString()} (${diff})\n`;
  text += `${puzzle.start} → ${puzzle.end}\n`;
  text += `${steps} step${steps !== 1 ? 's' : ''}${badge}`;
  return text;
}

function buildShareText() {
  let text = buildShareHeader() + '\n\n';
  for (const row of buildShareSquares()) {
    text += row.map(squareToEmoji).join('') + '\n';
  }
  text += '\nhttps://jzagu.github.io/inkling';
  return text;
}

// ── Share modal: visual preview ────────────────────────────────────────────
function renderSharePreview() {
  const previewEl = document.getElementById('share-preview');
  previewEl.innerHTML = '';

  // Header text (matches what's in the copied text)
  const hdr = document.createElement('div');
  hdr.className = 'share-preview-header';
  hdr.textContent = buildShareHeader();
  previewEl.appendChild(hdr);

  // Squares grid
  const grid = document.createElement('div');
  grid.className = 'share-preview-grid';
  for (const row of buildShareSquares()) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'share-preview-row';
    for (const sq of row) {
      const cell = document.createElement('span');
      cell.className = `share-sq share-sq-${sq.color}` + (sq.atGoal ? ' at-goal' : '');
      rowDiv.appendChild(cell);
    }
    grid.appendChild(rowDiv);
  }
  previewEl.appendChild(grid);

  // Footer link
  const ftr = document.createElement('div');
  ftr.className = 'share-preview-footer';
  ftr.textContent = 'jzagu.github.io/inkling';
  previewEl.appendChild(ftr);
}

// ── Share image: canvas-rendered PNG ───────────────────────────────────────
function generateShareCanvas() {
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');

  const rows     = buildShareSquares();
  const sq       = 56;
  const gap      = 8;
  const pad      = 36;
  const headerH  = 130;
  const footerH  = 44;
  const cols     = 7;

  const width  = pad * 2 + sq * cols + gap * (cols - 1);
  const height = pad + headerH + rows.length * (sq + gap) - gap + footerH + pad;

  // Hi-DPI for crisp image
  const dpr = 2;
  canvas.width  = width  * dpr;
  canvas.height = height * dpr;
  canvas.style.width  = width  + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(0, 0, width, height);

  // Header text
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#e8e8f0';
  ctx.font         = 'bold 30px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Inkling', width / 2, pad + 22);

  const steps   = getPlayerSteps();
  const par     = getPar();
  const diff    = getDifficultyLabel(puzzle.minSteps);
  const beatPar = steps < par;
  const atPar   = steps === par;

  ctx.fillStyle = '#888899';
  ctx.font      = '15px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${getPacificDateString()} · ${diff}`, width / 2, pad + 50);

  ctx.fillStyle = '#e8e8f0';
  ctx.font      = 'bold 18px "Courier New", Courier, monospace';
  ctx.fillText(`${puzzle.start} → ${puzzle.end}`, width / 2, pad + 78);

  // Steps + badge line
  let statusLine = `${steps} step${steps !== 1 ? 's' : ''}`;
  if (beatPar)    statusLine += '  🌟 Beats par!';
  else if (atPar) statusLine += '  ⚡ Par!';
  ctx.fillStyle = beatPar ? '#51cf66' : (atPar ? '#f5a623' : '#888899');
  ctx.font      = 'bold 16px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(statusLine, width / 2, pad + 106);

  // Squares
  const gridTop = pad + headerH;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = rows[r][c];
      const x = pad + c * (sq + gap);
      const y = gridTop + r * (sq + gap);

      ctx.fillStyle = tile.color === 'yellow' ? '#f5a623' : '#51cf66';
      roundRect(ctx, x, y, sq, sq, 8);
      ctx.fill();

      if (tile.atGoal) {
        drawHollowStar(ctx, x + sq / 2, y + sq / 2, sq * 0.32, '#1a1a2e', 2.6);
      }
    }
  }

  // Footer
  ctx.fillStyle = '#888899';
  ctx.font      = '13px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('jzagu.github.io/inkling', width / 2, height - pad / 2);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

// Hollow 5-point star, stroked. cx/cy is center, r is outer radius.
function drawHollowStar(ctx, cx, cy, r, color, lineWidth) {
  const innerR = r * 0.42;
  const points = 5;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : innerR;
    const angle  = (Math.PI / points) * i - Math.PI / 2;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else         ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth   = lineWidth;
  ctx.lineJoin    = 'round';
  ctx.stroke();
  ctx.restore();
}

function shareImageFilename() {
  return `inkling-${getPacificDateString().replace(/\//g, '-')}.png`;
}

function downloadShareImage() {
  const canvas = generateShareCanvas();
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = shareImageFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showShareFeedback('Image saved.');
  }, 'image/png');
}

async function nativeShare() {
  if (!navigator.share) {
    showShareFeedback('Native share not supported on this device.', true);
    return;
  }
  // Try to include the image file (works in modern mobile Chrome/Safari)
  try {
    const canvas = generateShareCanvas();
    const blob   = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (blob && navigator.canShare) {
      const file = new File([blob], shareImageFilename(), { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Inkling',
          text:  buildShareText(),
          files: [file],
        });
        return;
      }
    }
    // Fallback to text + url only
    await navigator.share({
      title: 'Inkling',
      text:  buildShareText(),
      url:   'https://jzagu.github.io/inkling',
    });
  } catch (e) {
    if (e && e.name !== 'AbortError') {
      showShareFeedback('Share failed.', true);
    }
  }
}

function copyShareText() {
  const text = buildShareText();
  const done = () => showShareFeedback('Copied to clipboard.');
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function showShareFeedback(msg, isError) {
  const el = document.getElementById('share-feedback');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'share-feedback' + (isError ? ' is-error' : '');
  clearTimeout(showShareFeedback._t);
  showShareFeedback._t = setTimeout(() => {
    el.textContent = '';
    el.className   = 'share-feedback hidden';
  }, 2200);
}

function buildSocialShareUrls() {
  const text = buildShareText();
  const url  = 'https://jzagu.github.io/inkling';
  const encT = encodeURIComponent(text);
  const encU = encodeURIComponent(url);
  // For Twitter/Facebook the URL is parsed out and unfurled, so strip the
  // bare URL from the body to avoid duplication.
  const textNoUrl = text.replace(/\n*https?:\/\/\S+\s*$/, '');
  const encTNoUrl = encodeURIComponent(textNoUrl);
  return {
    twitter:  `https://twitter.com/intent/tweet?text=${encTNoUrl}&url=${encU}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encU}&quote=${encTNoUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encT}`,
    reddit:   `https://www.reddit.com/submit?url=${encU}&title=${encodeURIComponent('Inkling — ' + getPacificDateString())}`,
    email:    `mailto:?subject=${encodeURIComponent('My Inkling result')}&body=${encT}`,
  };
}

function openShareModal() {
  renderSharePreview();
  const urls = buildSocialShareUrls();
  document.getElementById('share-twitter').href  = urls.twitter;
  document.getElementById('share-facebook').href = urls.facebook;
  document.getElementById('share-whatsapp').href = urls.whatsapp;
  document.getElementById('share-reddit').href   = urls.reddit;
  document.getElementById('share-email').href    = urls.email;

  // Show the "Share…" button only when Web Share API is available
  const nativeBtn = document.getElementById('share-native-btn');
  if (navigator.share) nativeBtn.classList.remove('hidden');
  else                 nativeBtn.classList.add('hidden');

  const feedback = document.getElementById('share-feedback');
  feedback.textContent = '';
  feedback.className   = 'share-feedback hidden';

  document.getElementById('share-overlay').classList.remove('hidden');
}

function closeShareModal() {
  document.getElementById('share-overlay').classList.add('hidden');
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
  clearHintMessage();

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
  clearHintMessage();
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
    hintsUsed     = saved.hintsUsed ?? 0;
    bestHintFree  = saved.bestHintFree ?? null;
  } else {
    chain         = [puzzle.start];
    gameWon       = false;
    autoCompleted = false;
    gaveUp        = false;
    hintsUsed     = 0;
  }

  renderHeader();
  renderRouteTiles('start-word', puzzle.start);
  renderRouteTiles('target-word', puzzle.end);
  renderChain();

  // Kick off the neighbor graph build in the background — by the time the
  // player thinks about asking for a hint, it should be ready (~500ms over 3K
  // words on idle callbacks).
  startNeighborGraphBuild();

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

  document.getElementById('hint-btn').addEventListener('click', requestHint);

  document.getElementById('give-up-btn').addEventListener('click', () => {
    document.getElementById('give-up-confirm').classList.remove('hidden');
    document.getElementById('give-up-btn').classList.add('hidden');
  });

  document.getElementById('give-up-yes').addEventListener('click', confirmGiveUp);

  document.getElementById('give-up-no').addEventListener('click', () => {
    document.getElementById('give-up-confirm').classList.add('hidden');
    document.getElementById('give-up-btn').classList.remove('hidden');
  });

  document.getElementById('share-btn').addEventListener('click', openShareModal);

  document.getElementById('share-close').addEventListener('click', closeShareModal);
  document.getElementById('share-overlay').addEventListener('click', e => {
    if (e.target.id === 'share-overlay') closeShareModal();
  });

  document.getElementById('share-copy-btn').addEventListener('click', copyShareText);
  document.getElementById('share-image-btn').addEventListener('click', downloadShareImage);
  document.getElementById('share-native-btn').addEventListener('click', nativeShare);

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
