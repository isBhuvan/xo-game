import { Game, STATUS } from './game.js';
import { Series } from './series.js';
import { initTheme } from './theme.js';

initTheme(document.getElementById('theme-toggle'));

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const newSeriesBtn = document.getElementById('new-series');
const maxGamesEl = document.getElementById('max-games');
const gameCountEl = document.getElementById('game-count');
const scoreEls = {
  X: document.getElementById('score-x'),
  O: document.getElementById('score-o'),
  draws: document.getElementById('score-draws'),
};
const dialog = document.getElementById('series-dialog');
const dialogTitle = document.getElementById('series-title');
const dialogSummary = document.getElementById('series-summary');
const trophyEl = document.getElementById('trophy');
const trophyMark = document.getElementById('trophy-mark');
const playAgainBtn = document.getElementById('play-again');

const game = new Game();
const series = new Series(Number(maxGamesEl.value));

const cells = Array.from({ length: 9 }, (_, i) => {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'cell';
  cell.dataset.index = String(i);
  boardEl.appendChild(cell);
  return cell;
});

const position = (i) => `row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}`;

function statusMessage({ status, winner, currentPlayer }) {
  if (status === STATUS.WON) return `Player ${winner} wins!`;
  if (status === STATUS.DRAW) return "It's a draw!";
  return `Player ${currentPlayer}'s turn`;
}

function render(state) {
  const over = state.status !== STATUS.PLAYING;

  cells.forEach((cell, i) => {
    const mark = state.board[i];
    cell.textContent = mark ?? '';
    cell.dataset.mark = mark ?? '';
    cell.classList.toggle('cell--win', state.winningLine.includes(i));
    cell.setAttribute(
      'aria-label',
      `${position(i)}, ${mark ? `marked ${mark}` : 'empty'}`
    );
    // aria-disabled keeps cells focusable for keyboard / screen reader users.
    cell.setAttribute('aria-disabled', String(over || mark !== null));
  });

  statusEl.textContent = statusMessage(state);
  statusEl.dataset.turn = over ? '' : state.currentPlayer;
  boardEl.dataset.over = String(over);
}

function renderSeries() {
  const s = series.getState();
  for (const key of Object.keys(scoreEls)) {
    scoreEls[key].textContent = String(s.scores[key]);
  }
  gameCountEl.textContent = s.complete
    ? 'Series complete'
    : `Game ${s.gamesPlayed + 1} of ${s.maxGames}`;
  maxGamesEl.value = String(s.maxGames);
  maxGamesEl.disabled = s.gamesPlayed > 0;
}

// ---------- Celebration ----------

const CONFETTI_COLORS = ['#4f46e5', '#e11d74', '#f59e0b', '#10b981', '#0ea5e9', '#fbbf24'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const confettiLayers = new Set();
const confettiTimers = new Set();

function later(fn, ms) {
  const id = setTimeout(() => {
    confettiTimers.delete(id);
    fn();
  }, ms);
  confettiTimers.add(id);
}

function clearConfetti() {
  confettiTimers.forEach(clearTimeout);
  confettiTimers.clear();
  confettiLayers.forEach((layer) => layer.remove());
  confettiLayers.clear();
}

/** Drop a burst of confetti pieces into `host`. */
function burst(host, count) {
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti__piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.setProperty('--dur', `${2 + Math.random() * 1.5}s`);
    piece.style.setProperty('--delay', `${Math.random() * 0.4}s`);
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 30}vw`);
    piece.style.setProperty('--spin', `${360 + Math.random() * 720}deg`);
    fragment.appendChild(piece);
  }
  layer.appendChild(fragment);
  host.appendChild(layer);
  confettiLayers.add(layer);

  later(() => {
    layer.remove();
    confettiLayers.delete(layer);
  }, 4500);
}

function celebrateGame() {
  if (reducedMotion.matches) return;
  clearConfetti();
  burst(document.body, 70);
}

/** Bigger show for the series winner. Lives inside the dialog (top layer). */
function celebrateSeries() {
  if (reducedMotion.matches) return;
  clearConfetti();
  [0, 900, 1800, 2700].forEach((ms) => later(() => burst(dialog, 120), ms));
}

// ---------- Series flow ----------

let seriesEndTimer = null;

function showSeriesResult() {
  const s = series.getState();
  clearConfetti();

  trophyEl.hidden = !s.winner;
  if (s.winner) trophyMark.textContent = s.winner;

  dialogTitle.textContent = s.winner
    ? `Player ${s.winner} wins the series!`
    : 'The series is tied!';
  dialogSummary.textContent =
    `Final score: X ${s.scores.X} – O ${s.scores.O}` +
    (s.scores.draws ? ` (${s.scores.draws} draw${s.scores.draws > 1 ? 's' : ''})` : '');

  if (!dialog.open) dialog.showModal();
  playAgainBtn.focus();
  if (s.winner) celebrateSeries();
}

function startSeries() {
  clearTimeout(seriesEndTimer);
  clearConfetti();
  if (dialog.open) dialog.close();
  series.reset();
  game.reset();
  render(game.getState());
  renderSeries();
}

// ---------- Events ----------

// Event delegation: one listener for the whole board.
boardEl.addEventListener('click', (event) => {
  const cell = event.target.closest('.cell');
  if (!cell) return;

  const { ok, state } = game.makeMove(Number(cell.dataset.index));
  if (!ok) return;

  render(state);
  if (state.status === STATUS.PLAYING) return;

  series.record(state.winner); // winner is null for a draw
  renderSeries();
  if (state.status === STATUS.WON) celebrateGame();

  if (series.getState().complete) {
    // Let the final game's win play out before the series result appears.
    seriesEndTimer = setTimeout(showSeriesResult, 1400);
  }
});

// Arrow-key navigation across the grid.
const ARROWS = { ArrowUp: -3, ArrowDown: 3, ArrowLeft: -1, ArrowRight: 1 };

boardEl.addEventListener('keydown', (event) => {
  const cell = event.target.closest('.cell');
  const step = ARROWS[event.key];
  if (!cell || step === undefined) return;

  const index = Number(cell.dataset.index);
  const col = index % 3;
  if ((event.key === 'ArrowLeft' && col === 0) ||
      (event.key === 'ArrowRight' && col === 2)) return;

  const next = cells[index + step];
  if (next) {
    event.preventDefault();
    next.focus();
  }
});

// Touch feedback: toggle a class on press so :active-like styling is
// instant on iOS, where :active is unreliable without a touch listener.
const press = (on) => (event) => {
  const cell = event.target.closest?.('.cell');
  if (cell) cell.classList.toggle('is-pressed', on);
};
boardEl.addEventListener('pointerdown', press(true), { passive: true });
['pointerup', 'pointercancel', 'pointerleave'].forEach((type) =>
  boardEl.addEventListener(type, press(false), { passive: true, capture: true })
);

resetBtn.addEventListener('click', () => {
  // After the final game, "New game" begins a fresh series.
  if (series.getState().complete) {
    startSeries();
    return;
  }
  clearConfetti();
  game.reset();
  render(game.getState());
});

newSeriesBtn.addEventListener('click', startSeries);
playAgainBtn.addEventListener('click', startSeries);

maxGamesEl.addEventListener('change', () => {
  series.setMaxGames(Number(maxGamesEl.value));
  renderSeries();
});

render(game.getState());
renderSeries();
