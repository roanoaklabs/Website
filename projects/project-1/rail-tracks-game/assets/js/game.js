/* Rail Tracks — a "connect the stations" logic puzzle.
 * Rules: connect the two station cells on the border of the grid with a
 * single, unbranching railroad path using straight and curved track pieces.
 * The numbers along the top/left tell you exactly how many cells in that
 * column/row contain track.
 */

const SIZE = 6;
const CELL_PX = 56;

// Each track shape connects exactly two of the four compass sides.
const SHAPE_SIDES = {
  H:  ['E', 'W'],
  V:  ['N', 'S'],
  NE: ['N', 'E'],
  NW: ['N', 'W'],
  SE: ['S', 'E'],
  SW: ['S', 'W'],
};
const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };
const DELTA = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };
const ALL_SHAPES = ['H', 'V', 'NE', 'NW', 'SE', 'SW'];

// SVG path fragments for each shape, drawn on a 0-40 / 0-40 cell viewbox.
// Curves use a quadratic bezier with the control point at the cell center,
// which guarantees the bulge is always on the correct (unambiguous) side.
const SHAPE_PATHS = {
  H:  'M0,20 L40,20',
  V:  'M20,0 L20,40',
  NE: 'M20,0 Q20,20 40,20',
  NW: 'M20,0 Q20,20 0,20',
  SE: 'M20,40 Q20,20 40,20',
  SW: 'M20,40 Q20,20 0,20',
};

const key = (r, c) => `${r},${c}`;

let state = null; // { board, rowClues, colClues, start, finish }

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isBorderNonCorner([r, c]) {
  const onBorder = r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1;
  const isCorner = (r === 0 || r === SIZE - 1) && (c === 0 || c === SIZE - 1);
  return onBorder && !isCorner;
}

function offBoardSide([r, c]) {
  if (r === 0) return 'N';
  if (r === SIZE - 1) return 'S';
  if (c === 0) return 'W';
  if (c === SIZE - 1) return 'E';
  return null;
}

function sideBetween([r1, c1], [r2, c2]) {
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (dr === -1) return 'N';
  if (dr === 1) return 'S';
  if (dc === 1) return 'E';
  if (dc === -1) return 'W';
  return null;
}

function shapeFromSides(s1, s2) {
  const combo = [s1, s2].sort().join('');
  const map = { EW: 'H', NS: 'V', EN: 'NE', NW: 'NW', ES: 'SE', SW: 'SW' };
  return map[combo];
}

// --- Puzzle generation -----------------------------------------------------

function generatePath() {
  const borderCells = [];
  for (let c = 1; c < SIZE - 1; c++) {
    borderCells.push([0, c]);
    borderCells.push([SIZE - 1, c]);
  }
  for (let r = 1; r < SIZE - 1; r++) {
    borderCells.push([r, 0]);
    borderCells.push([r, SIZE - 1]);
  }

  const minLen = 10;
  const maxLen = 20;

  for (let attempt = 0; attempt < 400; attempt++) {
    const start = borderCells[randInt(borderCells.length)];
    const visited = new Set([key(...start)]);
    const path = [start];
    if (walk(path, visited, minLen, maxLen)) {
      return path;
    }
  }
  throw new Error('Could not generate a puzzle — please try again.');
}

function walk(path, visited, minLen, maxLen) {
  const cell = path[path.length - 1];

  if (path.length >= minLen && path.length > 1 && isBorderNonCorner(cell)) {
    const stopChance = 0.15 + 0.05 * (path.length - minLen);
    if (Math.random() < stopChance) return true;
  }
  if (path.length >= maxLen) {
    return path.length > 1 && isBorderNonCorner(cell);
  }

  const dirs = shuffle(['N', 'S', 'E', 'W']);
  for (const dir of dirs) {
    const [dr, dc] = DELTA[dir];
    const nr = cell[0] + dr;
    const nc = cell[1] + dc;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
    const k = key(nr, nc);
    if (visited.has(k)) continue;

    visited.add(k);
    path.push([nr, nc]);
    if (walk(path, visited, minLen, maxLen)) return true;
    path.pop();
    visited.delete(k);
  }
  return false;
}

function buildPuzzle() {
  const path = generatePath();
  const n = path.length;

  // Work out the shape of every cell along the (hidden) solution path — this
  // is only used to derive the clue numbers and the two station pieces.
  // It is intentionally NOT written onto the player's board.
  const solutionShapes = {};
  for (let i = 0; i < n; i++) {
    const cell = path[i];
    const sideIn = i === 0 ? offBoardSide(cell) : sideBetween(cell, path[i - 1]);
    const sideOut = i === n - 1 ? offBoardSide(cell) : sideBetween(cell, path[i + 1]);
    solutionShapes[key(...cell)] = shapeFromSides(sideIn, sideOut);
  }

  const rowClues = Array(SIZE).fill(0);
  const colClues = Array(SIZE).fill(0);
  for (const [r, c] of path) {
    rowClues[r]++;
    colClues[c]++;
  }

  // The player's board starts blank except for the two given stations.
  const board = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ type: 'empty', shape: null, fixed: false }))
  );
  const start = path[0];
  const finish = path[n - 1];
  board[start[0]][start[1]] = { type: 'track', shape: solutionShapes[key(...start)], fixed: true };
  board[finish[0]][finish[1]] = { type: 'track', shape: solutionShapes[key(...finish)], fixed: true };

  return { board, rowClues, colClues, start, finish };
}

// --- Editable-shape helpers --------------------------------------------------

function invalidSidesFor([r, c]) {
  const sides = new Set();
  if (r === 0) sides.add('N');
  if (r === SIZE - 1) sides.add('S');
  if (c === 0) sides.add('W');
  if (c === SIZE - 1) sides.add('E');
  return sides;
}

function validShapesFor(cell) {
  const invalid = invalidSidesFor(cell);
  return ALL_SHAPES.filter((shape) => SHAPE_SIDES[shape].every((s) => !invalid.has(s)));
}

// --- Validation --------------------------------------------------------------

function validateConnectivity(board, start, finish) {
  const adj = {};
  const badCells = new Set();

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = board[r][c];
      if (cell.type !== 'track') continue;
      const k = key(r, c);
      adj[k] = [];
      const isStation = (r === start[0] && c === start[1]) || (r === finish[0] && c === finish[1]);

      for (const side of SHAPE_SIDES[cell.shape]) {
        const [dr, dc] = DELTA[side];
        const nr = r + dr;
        const nc = c + dc;
        const offBoard = nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE;

        if (offBoard) {
          if (!isStation) badCells.add(k);
          continue;
        }
        const neighbor = board[nr][nc];
        if (neighbor.type !== 'track' || !SHAPE_SIDES[neighbor.shape].includes(OPPOSITE[side])) {
          badCells.add(k);
          continue;
        }
        adj[k].push(key(nr, nc));
      }
    }
  }

  if (badCells.size > 0) {
    return { ok: false, badCells, message: "Some track pieces don't connect properly to their neighbors." };
  }

  const startKey = key(...start);
  const finishKey = key(...finish);
  const visited = new Set([startKey]);
  const queue = [startKey];
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of adj[cur] || []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }

  const allTrackKeys = Object.keys(adj);
  if (!visited.has(finishKey)) {
    return { ok: false, badCells: new Set(), message: 'The track does not connect the two stations yet.' };
  }
  if (visited.size !== allTrackKeys.length) {
    const stray = new Set(allTrackKeys.filter((k) => !visited.has(k)));
    return { ok: false, badCells: stray, message: 'There are extra track pieces disconnected from the main line.' };
  }
  return { ok: true };
}

function checkSolution() {
  const { board, rowClues, colClues, start, finish } = state;

  clearHighlights();

  // Empty cells are treated the same as an explicit ✕ (no track) — the
  // player doesn't need to mark every blank cell by hand.
  const rowCounts = Array(SIZE).fill(0);
  const colCounts = Array(SIZE).fill(0);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].type === 'track') {
        rowCounts[r]++;
        colCounts[c]++;
      }
    }
  }

  const badRows = [];
  const badCols = [];
  for (let r = 0; r < SIZE; r++) if (rowCounts[r] !== rowClues[r]) badRows.push(r);
  for (let c = 0; c < SIZE; c++) if (colCounts[c] !== colClues[c]) badCols.push(c);

  if (badRows.length || badCols.length) {
    highlightClues(badRows, badCols);
    showMessage("Some row/column counts don't match the clues yet.", 'error');
    return;
  }

  const result = validateConnectivity(board, start, finish);
  if (!result.ok) {
    if (result.badCells) highlightCells(result.badCells);
    showMessage(result.message, 'error');
    return;
  }

  showMessage('🎉 Solved! The line runs clean from station to station.', 'success');
}

// --- Rendering ---------------------------------------------------------------

const svgNS = 'http://www.w3.org/2000/svg';

function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  boardEl.style.setProperty('--cell-size', `${CELL_PX}px`);

  // Corner spacer
  boardEl.appendChild(makeClueCell(''));

  // Column clues
  for (let c = 0; c < SIZE; c++) {
    boardEl.appendChild(makeClueCell(state.colClues[c], `col-clue-${c}`));
  }

  for (let r = 0; r < SIZE; r++) {
    boardEl.appendChild(makeClueCell(state.rowClues[r], `row-clue-${r}`));
    for (let c = 0; c < SIZE; c++) {
      boardEl.appendChild(makeGameCell(r, c));
    }
  }
}

function makeClueCell(text, id) {
  const div = document.createElement('div');
  div.className = 'clue-cell';
  if (id) div.id = id;
  div.textContent = text;
  return div;
}

function makeGameCell(r, c) {
  const cell = state.board[r][c];
  const div = document.createElement('div');
  div.className = 'game-cell';
  div.id = `cell-${r}-${c}`;
  div.dataset.r = r;
  div.dataset.c = c;

  const isStation = (r === state.start[0] && c === state.start[1]) || (r === state.finish[0] && c === state.finish[1]);
  if (isStation) div.classList.add('station');

  renderCellContent(div, cell, isStation);

  if (!cell.fixed) {
    div.addEventListener('click', () => openPicker(r, c));
  } else {
    div.classList.add('fixed');
  }

  return div;
}

function renderCellContent(div, cell, isStation) {
  div.querySelectorAll('svg, .x-mark, .station-dot').forEach((el) => el.remove());

  if (cell.type === 'track') {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 40 40');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', SHAPE_PATHS[cell.shape]);
    path.setAttribute('class', 'track-line');
    svg.appendChild(path);
    if (isStation) {
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', '20');
      dot.setAttribute('cy', '20');
      dot.setAttribute('r', '5');
      dot.setAttribute('class', 'station-marker');
      svg.appendChild(dot);
    }
    div.appendChild(svg);
  } else if (cell.type === 'x') {
    const span = document.createElement('span');
    span.className = 'x-mark';
    span.textContent = '✕';
    div.appendChild(span);
  }
}

function updateCell(r, c) {
  const div = document.getElementById(`cell-${r}-${c}`);
  const cell = state.board[r][c];
  const isStation = (r === state.start[0] && c === state.start[1]) || (r === state.finish[0] && c === state.finish[1]);
  renderCellContent(div, cell, isStation);
}

// --- Picker popup --------------------------------------------------------------

const SHAPE_LABELS = {
  H: 'Straight (—)',
  V: 'Straight (|)',
  NE: 'Curve ⌐',
  NW: 'Curve ¬',
  SE: 'Curve L',
  SW: 'Curve ⌐ (mirror)',
};

function openPicker(r, c) {
  closePicker();

  const overlay = document.createElement('div');
  overlay.className = 'picker-overlay';
  overlay.id = 'pickerOverlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePicker();
  });

  const panel = document.createElement('div');
  panel.className = 'picker-panel';

  const title = document.createElement('h3');
  title.textContent = `Cell (row ${r + 1}, col ${c + 1})`;
  panel.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'picker-grid';

  grid.appendChild(makePickerButton('clear', 'Clear', null, r, c));
  grid.appendChild(makePickerButton('x', '✕  No track', null, r, c));

  for (const shape of validShapesFor([r, c])) {
    grid.appendChild(makePickerButton('track', null, shape, r, c));
  }

  panel.appendChild(grid);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function makePickerButton(kind, label, shape, r, c) {
  const btn = document.createElement('button');
  btn.className = 'picker-btn';
  btn.type = 'button';

  if (kind === 'track') {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 40 40');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', SHAPE_PATHS[shape]);
    path.setAttribute('class', 'track-line');
    svg.appendChild(path);
    btn.appendChild(svg);
  } else {
    btn.textContent = label;
    btn.classList.add('picker-btn-text');
    if (kind === 'x') btn.classList.add('picker-btn-x');
  }

  btn.addEventListener('click', () => {
    if (kind === 'clear') {
      state.board[r][c] = { type: 'empty', shape: null, fixed: false };
    } else if (kind === 'x') {
      state.board[r][c] = { type: 'x', shape: null, fixed: false };
    } else {
      state.board[r][c] = { type: 'track', shape, fixed: false };
    }
    updateCell(r, c);
    closePicker();
  });

  return btn;
}

function closePicker() {
  const existing = document.getElementById('pickerOverlay');
  if (existing) existing.remove();
}

// --- Messages & highlights -----------------------------------------------------

function showMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = `message message-${type}`;
}

function clearMessage() {
  const el = document.getElementById('message');
  el.textContent = '';
  el.className = 'message';
}

function highlightClues(badRows, badCols) {
  badRows.forEach((r) => document.getElementById(`row-clue-${r}`).classList.add('clue-error'));
  badCols.forEach((c) => document.getElementById(`col-clue-${c}`).classList.add('clue-error'));
}

function highlightCells(keysSet) {
  keysSet.forEach((k) => {
    const [r, c] = k.split(',');
    const div = document.getElementById(`cell-${r}-${c}`);
    if (div) div.classList.add('cell-error');
  });
}

function clearHighlights() {
  document.querySelectorAll('.clue-error').forEach((el) => el.classList.remove('clue-error'));
  document.querySelectorAll('.cell-error').forEach((el) => el.classList.remove('cell-error'));
  clearMessage();
}

// --- Controls ------------------------------------------------------------------

function newPuzzle() {
  state = buildPuzzle();
  renderBoard();
  clearHighlights();
  clearMessage();
}

function resetPuzzle() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!state.board[r][c].fixed) {
        state.board[r][c] = { type: 'empty', shape: null, fixed: false };
      }
    }
  }
  renderBoard();
  clearHighlights();
  clearMessage();
}

document.addEventListener('DOMContentLoaded', () => {
  newPuzzle();
  document.getElementById('newPuzzleBtn').addEventListener('click', newPuzzle);
  document.getElementById('resetBtn').addEventListener('click', resetPuzzle);
  document.getElementById('checkBtn').addEventListener('click', checkSolution);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePicker();
  });
});
