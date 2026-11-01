import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {QuizGame, readBestScores, shuffled} from '../games/web-quizzes/core.mjs';

const bank = JSON.parse(fs.readFileSync(new URL('../games/web-quizzes/questions.json', import.meta.url)));
test('all original stages and question records remain playable', () => {
  assert.equal(bank.length, 12);
  assert.equal(bank.flatMap(s => s.questions).length, 154);
  assert.equal(new Set(bank.flatMap(s => s.questions.map(q => q.id))).size, 154);
  const before = JSON.stringify(bank);
  const game = new QuizGame(bank);
  for (let i = 0; i < bank.length; i++) {
    game.start(i);
    const answered = new Set();
    while (game.status !== 'complete') {
      const expected = bank[i].questions.find(q => q.id === game.current.id);
      assert.ok(!answered.has(expected.id));
      answered.add(expected.id);
      const correctText = expected.options[expected.answer];
      const index = game.current.options.findIndex(option => option.text === correctText);
      assert.equal(game.answer(index), true);
      assert.equal(game.answer(index), null, 'repeated activation does not count twice');
      assert.equal(game.next(), true);
    }
    assert.equal(answered.size, bank[i].questions.length);
    assert.equal(game.score, bank[i].questions.length);
    assert.equal(game.next(), false);
  }
  assert.equal(JSON.stringify(bank), before, 'shuffle must not corrupt later games or the source bank');
});

test('wrong answer retries, floor at zero, and restart/stage switching', () => {
  const game = new QuizGame(bank, () => 0.6);
  game.start(0);
  const wrong = game.current.options.findIndex(o => !o.correct);
  assert.equal(game.answer(wrong), false);
  assert.equal(game.score, 0);
  assert.equal(game.position, 0);
  assert.equal(game.answer(wrong), null);
  assert.equal(game.next(), false);
  assert.equal(game.answer(game.current.options.findIndex(o => o.correct)), true);
  game.next();
  assert.equal(game.score, 1);
  assert.equal(game.answer(game.current.options.findIndex(o => !o.correct)), false);
  assert.equal(game.score, 0);
  game.start(1);
  assert.equal(game.score, 0);
  assert.equal(game.position, 0);
  assert.equal(game.status, 'playing');
  game.menu();
  game.start(1);
  assert.equal(game.questions.length, 47);
  assert.throws(() => game.start(-1));
  assert.equal(game.answer(-1), null);
});

test('persisted scores cannot break menus or introduce impossible records', () => {
  const storage = value => ({getItem: () => value});
  assert.deepEqual(readBestScores(storage('{broken'), bank), {});
  assert.deepEqual(readBestScores(storage('null'), bank), {});
  assert.deepEqual(readBestScores(storage('[]'), bank), {});
  assert.deepEqual(readBestScores(storage('{"1":2,"2":999,"3":-1,"4":"3"}'), bank), {'1':2});
  assert.deepEqual(readBestScores({getItem() {throw new Error('blocked');}}, bank), {});
});

test('shuffle preserves membership without mutating its input', () => {
  const values = [1,2,3,4,5];
  assert.deepEqual(shuffled(values, () => 0), [2,3,4,5,1]);
  assert.deepEqual(values, [1,2,3,4,5]);
});
