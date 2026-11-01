/**
 * Pure Tic-Tac-Toe engine. No DOM access: safe to unit test in Node.
 */

export const PLAYERS = Object.freeze({ X: 'X', O: 'O' });

export const STATUS = Object.freeze({
  PLAYING: 'playing',
  WON: 'won',
  DRAW: 'draw',
});

const WIN_LINES = Object.freeze([
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
]);

export class Game {
  #board;
  #current;
  #status;
  #winner;
  #winningLine;
  #starter;

  constructor() {
    // reset() flips the starter, so seed with O to make X open the first game.
    this.#starter = PLAYERS.O;
    this.reset();
  }

  /** Restore the initial state. The opening player alternates every game. */
  reset() {
    this.#starter = this.#starter === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
    this.#board = Array(9).fill(null);
    this.#current = this.#starter;
    this.#status = STATUS.PLAYING;
    this.#winner = null;
    this.#winningLine = [];
  }

  /**
   * Attempt to place the current player's mark.
   * @param {number} index Cell index 0-8.
   * @returns {{ok: boolean, state: object}} ok is false for illegal moves.
   */
  makeMove(index) {
    const legal =
      this.#status === STATUS.PLAYING &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < 9 &&
      this.#board[index] === null;

    if (!legal) return { ok: false, state: this.getState() };

    this.#board[index] = this.#current;

    const line = WIN_LINES.find((combo) =>
      combo.every((i) => this.#board[i] === this.#current)
    );

    if (line) {
      this.#status = STATUS.WON;
      this.#winner = this.#current;
      this.#winningLine = [...line];
    } else if (this.#board.every(Boolean)) {
      this.#status = STATUS.DRAW;
    } else {
      this.#current = this.#current === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
    }

    return { ok: true, state: this.getState() };
  }

  /** Immutable snapshot of the current state. */
  getState() {
    return Object.freeze({
      board: [...this.#board],
      currentPlayer: this.#current,
      status: this.#status,
      winner: this.#winner,
      winningLine: [...this.#winningLine],
    });
  }
}
