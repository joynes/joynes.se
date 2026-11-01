import test from 'node:test';
import assert from 'node:assert/strict';
import {Course,banks,readProgress} from '../games/grimace-codex/core.mjs';
test('All twenty original questions have valid arithmetic and four unique options',()=>{
  for(const [mode,list]of Object.entries(banks)){
    assert.equal(list.length,10);
    for(const q of list){const [a,,b]=q.q.split(' ');assert.equal(q.correct,mode==='plus'?+a + +b:+a - +b);assert.equal(new Set(q.answers).size,4);assert.ok(q.answers.includes(q.correct));}
  }
});
test('Both courses can finish, retry, ignore duplicate answers, replay and switch modes',()=>{
  const game=new Course();
  for(const mode of ['plus','minus']){
    game.start(mode);
    for(let n=0;n<10;n++){
      assert.equal(game.progress[mode],n);const q=game.question;
      assert.equal(game.answer(q.answers.find(x=>x!==q.correct)),'wrong');
      assert.equal(game.answer(q.correct),'correct');assert.equal(game.answer(q.correct),'ignored');
      game.next();game.next();assert.equal(game.progress[mode],n+1);
    }
    assert.equal(game.question,undefined);assert.equal(game.answer(1),'ignored');
  }
  game.restart();assert.equal(game.progress.minus,0);assert.equal(game.progress.plus,10);game.stop();assert.equal(game.answer(3),'ignored');
});
test('Legacy progress accepts only complete valid question indices',()=>{
  for(const value of ['NaN','-1','11','3x','1.5'])assert.deepEqual(readProgress({getItem:()=>value}),{plus:0,minus:0});
  assert.deepEqual(readProgress({getItem:()=>{throw Error()}}),{plus:0,minus:0});
  assert.deepEqual(readProgress({getItem:()=> '10'}),{plus:10,minus:10});
});
