import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ReadingGame,alphabet} from '../games/quiz-sdl/core.mjs';
const stages=JSON.parse(fs.readFileSync(new URL('../games/quiz-sdl/words.json',import.meta.url)));
const root=new URL('../games/quiz-sdl/res/',import.meta.url);
test('All 35 words keep their original images and have usable alphabet/sound assets',()=>{
 assert.deepEqual(stages.map(s=>s.length),[5,12,18]);
 for(const [stage,words]of stages.entries()){
  assert.equal(new Set(words.map(w=>w.image)).size,words.length);
  for(const w of words){assert.ok(fs.existsSync(new URL(`image/level/${stage}/${w.image}.png`,root)));for(const letter of w.word)assert.ok(alphabet.includes(letter));}
 }
 for(let i=0;i<29;i++){assert.ok(fs.existsSync(new URL(`image/alpha/${i}.png`,root)));assert.equal(fs.readFileSync(new URL(`sound/letter_${i}.wav`,root)).toString('ascii',0,4),'RIFF');}
});
test('Every stage completes with unique image options, retry, floor at zero and replay',()=>{
 const game=new ReadingGame(stages);
 for(let stage=0;stage<3;stage++){
  game.start(stage);const seen=[];
  for(let n=0;n<stages[stage].length;n++){
   const q=game.question;seen.push(q.word);assert.equal(new Set(game.options.map(w=>w.image)).size,4);assert.ok(game.options.includes(q));
   if(n===0){assert.equal(game.answer(game.options.find(w=>w!==q).image),'wrong');assert.equal(game.coins,0);}
   assert.equal(game.answer(q.image),'correct');assert.equal(game.answer(q.image),'ignored');game.next();
  }
  assert.equal(game.question,undefined);assert.equal(game.coins,stages[stage].length);assert.equal(new Set(seen).size,stages[stage].length);
  game.start(stage);assert.equal(game.coins,0);assert.equal(game.index,0);
 }
});
test('Wrong answer after success deducts one coin without skipping a word',()=>{
 const game=new ReadingGame(stages,()=>0);game.start(0);game.answer(game.question.image);game.next();const q=game.question;
 game.answer(game.options.find(w=>w!==q).image);assert.equal(game.coins,0);assert.equal(game.question,q);
});
