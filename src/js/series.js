/**
 * Tracks a fixed-length series of games. Pure logic, no DOM access.
 */
export class Series {
  #maxGames;
  #scores;
  #played;

  constructor(maxGames = 3) {
    this.#maxGames = Series.#validate(maxGames);
    this.reset();
  }

  static #validate(value) {
    if (!Number.isInteger(value) || value < 1) {
      throw new RangeError('maxGames must be a positive integer');
    }
    return value;
  }

  /** Clear all results, keeping the configured length. */
  reset() {
    this.#scores = { X: 0, O: 0, draws: 0 };
    this.#played = 0;
  }

  /**
   * Change the series length. Only allowed before the first game finishes.
   * @returns {boolean} whether the change was applied.
   */
  setMaxGames(value) {
    if (this.#played > 0) return false;
    this.#maxGames = Series.#validate(value);
    return true;
  }

  /**
   * Record a finished game.
   * @param {'X'|'O'|null} winner null means a draw.
   * @returns {boolean} false if the series was already complete.
   */
  record(winner) {
    if (this.#played >= this.#maxGames) return false;
    if (winner === 'X' || winner === 'O') this.#scores[winner] += 1;
    else this.#scores.draws += 1;
    this.#played += 1;
    return true;
  }

  getState() {
    const { X, O } = this.#scores;
    const complete = this.#played >= this.#maxGames;
    let winner = null;
    if (complete && X !== O) winner = X > O ? 'X' : 'O';

    return Object.freeze({
      maxGames: this.#maxGames,
      gamesPlayed: this.#played,
      scores: { ...this.#scores },
      complete,
      winner, // null while in progress, or when a completed series is tied
    });
  }
}
