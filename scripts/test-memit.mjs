import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {Memit,normalize,levenshtein,similarityCredit} from '../games/memit/core.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../games/memit/dota-heroes.json',import.meta.url)));
test('Restored pack has all 127 unique official entries and exact local portrait hashes',()=>{
 assert.equal(data.items.length,127);assert.equal(new Set(data.items.map(i=>i.id)).size,127);assert.equal(new Set(data.items.map(i=>i.name)).size,127);
 for(const item of data.items){const bytes=fs.readFileSync(new URL('../games/memit/'+item.image,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');assert.match(item.source,/^https:\/\/cdn\.akamai\.steamstatic\.com\/apps\/dota2\//);}
});
test('All four original modes cover full pack or exactly ten unique questions',()=>{
 const game=new Memit(data.items,()=>0.42);const original=JSON.stringify(data.items);
 for(const mode of ['practice','guess','take10','exam']){
  game.start(mode);const count=['guess','take10'].includes(mode)?10:127;assert.equal(game.questions.length,count);const seen=new Set();
  while(game.question){const q=game.question;seen.add(q.id);
   if(mode==='guess'){assert.equal(new Set(game.options.map(x=>x.id)).size,6);assert.ok(game.options.includes(q));assert.equal(game.choose(q.id).kind,'correct');assert.equal(game.choose(q.id).kind,'ignored');}
   else if(mode!=='practice'){assert.equal(game.submit(q.name).kind,'correct');assert.equal(game.submit(q.name).kind,'ignored');}
   game.next();
  }
  assert.ok(game.complete);assert.equal(seen.size,count);assert.equal(game.score,mode==='practice'?0:count);game.next();
 }
 assert.equal(JSON.stringify(data.items),original);
});
test('Original negative score and similarity credit rules remain; wrong answers retry',()=>{
 assert.equal(normalize('  Queen OF Pain '),'queenofpain');assert.equal(levenshtein('kitten','sitting'),3);assert.equal(levenshtein('','axe'),3);assert.equal(levenshtein('axe',''),3);assert.equal(levenshtein('ä','ä'),0);
 assert.equal(similarityCredit('Abcd','Ab'),0.5);assert.equal(similarityCredit('Abcd','A'),0);assert.equal(similarityCredit('Abcd','Abce'),0.75);
 const game=new Memit(data.items,()=>0);game.start('guess');const q=game.question;const wrong=game.options.find(x=>x!==q);
 assert.equal(game.choose(wrong.id).kind,'wrong');assert.equal(game.score,-1);assert.equal(game.choose(wrong.id).kind,'ignored');assert.equal(game.score,-1);assert.equal(game.question,q);game.next();assert.equal(game.question,q);
 game.start('take10');const typed=game.question;assert.equal(game.submit('').kind,'empty');assert.equal(game.score,0);assert.equal(game.submit('zzzzzzzzzzzzzzzzzzzzzz').kind,'wrong');assert.equal(game.score,-1);assert.equal(game.question,typed);assert.equal(game.submit(typed.name).kind,'correct');assert.equal(game.score,0);
});
