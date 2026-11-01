import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, STATUS } from '../src/js/game.js';

const play = (game, moves) => moves.forEach((m) => game.makeMove(m));

test('X opens the first game and turns alternate', () => {
  const g = new Game();
  assert.equal(g.getState().currentPlayer, 'X');
  g.makeMove(0);
  assert.equal(g.getState().currentPlayer, 'O');
});

test('rejects occupied and out-of-range cells', () => {
  const g = new Game();
  g.makeMove(4);
  assert.equal(g.makeMove(4).ok, false);
  assert.equal(g.makeMove(9).ok, false);
  assert.equal(g.makeMove(-1).ok, false);
  assert.equal(g.makeMove(1.5).ok, false);
});

test('detects a win and reports the winning line', () => {
  const g = new Game();
  play(g, [0, 3, 1, 4, 2]);
  const s = g.getState();
  assert.equal(s.status, STATUS.WON);
  assert.equal(s.winner, 'X');
  assert.deepEqual(s.winningLine, [0, 1, 2]);
});

test('no moves allowed after the game ends', () => {
  const g = new Game();
  play(g, [0, 3, 1, 4, 2]);
  assert.equal(g.makeMove(8).ok, false);
});

test('detects a draw', () => {
  const g = new Game();
  play(g, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  const s = g.getState();
  assert.equal(s.status, STATUS.DRAW);
  assert.equal(s.winner, null);
});

test('reset clears the board and alternates the opening player', () => {
  const g = new Game();
  g.makeMove(0);
  g.reset();
  const s = g.getState();
  assert.equal(s.board.every((c) => c === null), true);
  assert.equal(s.currentPlayer, 'O');
  g.reset();
  assert.equal(g.getState().currentPlayer, 'X');
});
