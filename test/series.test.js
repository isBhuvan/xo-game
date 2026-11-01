import test from 'node:test';
import assert from 'node:assert/strict';
import { Series } from '../src/js/series.js';

test('rejects invalid series lengths', () => {
  assert.throws(() => new Series(0), RangeError);
  assert.throws(() => new Series(2.5), RangeError);
});

test('declares the player with most wins once all games are played', () => {
  const s = new Series(3);
  s.record('X');
  s.record('O');
  assert.equal(s.getState().complete, false);
  assert.equal(s.getState().winner, null);
  s.record('X');
  const state = s.getState();
  assert.equal(state.complete, true);
  assert.equal(state.winner, 'X');
});

test('draws count as played games but not as wins', () => {
  const s = new Series(2);
  s.record(null);
  s.record('O');
  const state = s.getState();
  assert.deepEqual(state.scores, { X: 0, O: 1, draws: 1 });
  assert.equal(state.winner, 'O');
});

test('a completed series with equal wins is tied', () => {
  const s = new Series(2);
  s.record('X');
  s.record('O');
  assert.equal(s.getState().complete, true);
  assert.equal(s.getState().winner, null);
});

test('ignores results after the series is complete', () => {
  const s = new Series(1);
  assert.equal(s.record('X'), true);
  assert.equal(s.record('O'), false);
  assert.equal(s.getState().scores.O, 0);
});

test('length can only change before the first game finishes', () => {
  const s = new Series(3);
  assert.equal(s.setMaxGames(5), true);
  s.record('X');
  assert.equal(s.setMaxGames(7), false);
  assert.equal(s.getState().maxGames, 5);
});

test('reset clears results but keeps the length', () => {
  const s = new Series(5);
  s.record('X');
  s.reset();
  const state = s.getState();
  assert.equal(state.gamesPlayed, 0);
  assert.equal(state.maxGames, 5);
});
