import test from 'node:test';
import assert from 'node:assert/strict';
import {MathGame,makeQuestion,readScores} from '../games/grimace-gemini/core.mjs';
test('Arithmetic and answer choices stay valid across both modes and progression', () => {
  for(const mode of ['plus','minus']) for(const level of [0,1,10,100,10000]) for(let n=0;n<100;n++) {
    const q=makeQuestion(mode,level);
    assert.equal(q.answer,mode==='plus'?q.a+q.b:q.a-q.b);
    assert.ok(q.answer>0); assert.equal(new Set(q.options).size,4);
    assert.ok(q.options.includes(q.answer)); assert.ok(q.options.every(x=>Number.isInteger(x)&&x>=0));
  }
  assert.equal(makeQuestion('plus',0,()=>0).options.length,4);
});
test('Correct answer counts once; retry, next and switching preserve separate scores',()=>{
  const game=new MathGame({plus:0,minus:0},()=>0);
  game.start('plus'); const q=game.question;
  assert.equal(game.answer(q.options.find(n=>n!==q.answer)),'wrong');
  assert.equal(game.scores.plus,0);
  assert.equal(game.answer(q.answer),'correct');
  assert.equal(game.answer(q.answer),'ignored'); assert.equal(game.scores.plus,1);
  game.next(); assert.equal(game.solved,false);
  game.stop(); assert.equal(game.next(),null); assert.equal(game.answer(1),'ignored');
  game.start('minus'); game.answer(game.question.answer);
  assert.deepEqual(game.scores,{plus:1,minus:1});
});
test('Malformed, blocked and legacy saved progress is handled',()=>{
  for(const data of ['{','null','{"plus":-1,"minus":"5"}','{"plus":1e99}']) assert.deepEqual(readScores({getItem:()=>data}),{plus:0,minus:0});
  assert.deepEqual(readScores({getItem:()=>{throw Error()}}),{plus:0,minus:0});
  assert.deepEqual(readScores({getItem:()=>'{"plus":17,"minus":9}'}),{plus:17,minus:9});
});
