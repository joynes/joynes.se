const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8791/';
const out=process.env.RALL_TEST_RESULTS||'test-results/rall-026';
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function diagnostics(p){return p.evaluate(()=>window.rall026Diagnostics());}
async function phase(p,wanted){await p.waitForFunction(wanted=>window.rall026Diagnostics?.().phase===wanted&&!document.querySelector('#continue').disabled,wanted,{timeout:30000}).catch(async error=>{fs.writeFileSync(path.join(out,'phase-failure.json'),JSON.stringify(await diagnostics(p)));await p.screenshot({path:path.join(out,'phase-failure.png')});throw error;});}
async function key(p,code,ms=25){await p.keyboard.down(code);await p.waitForTimeout(ms);await p.keyboard.up(code);await p.waitForTimeout(120);}
async function boot(p){await p.goto(base);await p.locator('#start').click();await phase(p,'intro');await p.locator('#continue').click();await phase(p,'title');await p.locator('#continue').click();await phase(p,'menu');await p.waitForTimeout(200);}
async function selected(p){return p.evaluate(()=>{const s=rall026Diagnostics().screen;return [9,10,11,12,13,14,15].findIndex(y=>(s.attributes[y*80+30]&8)!==0);});}
async function select(p,index,count=6){
 await p.waitForFunction(()=>{const s=rall026Diagnostics().screen;return [9,10,11,12,13,14,15].some(y=>(s.attributes[y*80+30]&8)!==0)},null,{timeout:5000}).catch(async error=>{fs.writeFileSync(path.join(out,'menu-failure.json'),JSON.stringify(await diagnostics(p)));await p.screenshot({path:path.join(out,'menu-failure.png')});throw error;});
 for(let tries=0;tries<10;tries++){
  const at=await selected(p);if(at===index)return;
  assert(at>=0,'Native menu highlight is visible');
  await p.locator('.menu-keys [data-pulse="264"]').click();await p.waitForTimeout(130);
  assert.equal(await selected(p),(at+1)%count,'One screen-button click selects exactly one native row');
 }throw Error('Could not select menu row');
}
async function begin(p,two=true){await select(p,two?1:0);await p.locator('#continue').click();await phase(p,two?'two-player-intro':'ai-intro');await p.locator('#continue').click();await phase(p,'playing');await p.waitForTimeout(200);}
async function moveTo(p,code,id,axis,value){
 await p.locator('#view').focus();await p.keyboard.down(code);
 try{await p.waitForFunction(({id,axis,value})=>rall026Diagnostics().screen.players.some(v=>v.id===id&&v[axis]===value),{id,axis,value},{timeout:15000,polling:10});}
 finally{await p.keyboard.up(code);}await p.waitForTimeout(100);
 const player=(await diagnostics(p)).screen.players.find(v=>v.id===id);assert.equal(player[axis],value);
}
async function observeDeath(p,fire,deadY){
 await p.locator('#view').focus();await p.keyboard.down(fire);
 try{await p.waitForFunction(y=>rall026Diagnostics().screen.players.some(v=>v.y===y&&v.attribute===4),deadY,{timeout:12000,polling:10});}
 finally{await p.keyboard.up(fire);}
 const d=await diagnostics(p);assert(d.screen.players.some(v=>v.y===deadY&&v.attribute===4),'Actual native red death figure');
 fs.writeFileSync(path.join(out,`death-${deadY}.json`),JSON.stringify(d,null,2));await p.screenshot({path:path.join(out,`death-${deadY}.png`)});
 await phase(p,'menu');
}
async function cover(p){
 await begin(p,true);await moveTo(p,'ArrowDown',1,'y',22);await moveTo(p,'ArrowRight',1,'x',44);
 const before=await diagnostics(p),count=(d,code)=>d.screen.codes.filter(v=>v===code).length;
 await key(p,'Space',1500);const glass=await diagnostics(p);assert(count(glass,45)<count(before,45),'A real native shot destroys glass');assert.equal(count(glass,207),count(before,207),'Barrels survive the shot');
 await moveTo(p,'ArrowRight',1,'x',47);await moveTo(p,'KeyD',2,'y',2);await moveTo(p,'KeyZ',2,'x',47);await moveTo(p,'KeyX',2,'y',3);
 const protectedState=await diagnostics(p);await key(p,'Space',2600);const protectedEnd=await diagnostics(p);
 assert.equal(protectedEnd.phase,'playing');assert.equal(protectedEnd.screen.players.find(v=>v.id===2)?.attribute,2,'Aligned opponent survives behind the original barrel');assert.equal(count(protectedEnd,207),count(protectedState,207));
 await p.screenshot({path:path.join(out,'cover.png')});fs.writeFileSync(path.join(out,'cover.json'),JSON.stringify({before:before.screen,glass:glass.screen,protected:protectedEnd.screen},null,2));
 await key(p,'Escape',100);await phase(p,'menu');console.log('PASS cover: actual glass destruction, intact barrel, aligned opponent protected');
}
(async()=>{
 const browser=await chromium.launch(process.env.RALL_HEADLESS_SHELL==='1'?{}:{channel:'chrome'});
 const errors=[],external=[];
 const context=await browser.newContext({viewport:{width:1280,height:950}});
 context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});});
 try{
  if(process.env.RALL_TEST_FOCUS!=='mobile'){
  const p=await context.newPage();await boot(p);if(process.env.RALL_TEST_FOCUS==='cover'){await cover(p);return;}
  const a=await diagnostics(p),t=Date.now();await p.waitForTimeout(2500);const b=await diagnostics(p),elapsed=(Date.now()-t)/1000;
  assert(a.frames>0);assert(b.audio.nonzero>0&&b.audio.peak>.001);assert(b.audio.played>0);
  assert(Math.abs((b.audio.samples-a.audio.samples)/44100-elapsed)<.15,'Native sound follows wall clock');
  assert.equal(b.audio.buffers-a.audio.buffers,b.audio.played-a.audio.played,'No audio blocks dropped in stable playback');
  await select(p,3);await p.locator('#continue').click();await phase(p,'controls');assert((await diagnostics(p)).screen.text.includes('Reload your weapon'));
  await key(p,'Escape',100);await phase(p,'menu');
  await select(p,4);await p.locator('#continue').click();await phase(p,'credits');assert((await diagnostics(p)).screen.text.includes('Registration info:'));
  await key(p,'Escape',100);await phase(p,'menu');
  await select(p,2);await p.locator('#continue').click();await phase(p,'options');await select(p,1,5);await p.locator('#continue').click();await phase(p,'sound-settings');assert((await diagnostics(p)).screen.text.includes('Change Digi-voices'));await select(p,6,7);await p.locator('#continue').click();await phase(p,'options');await select(p,4,5);await p.locator('#continue').click();await phase(p,'menu');
  await cover(p);await begin(p,true);let d=await diagnostics(p);assert.equal(d.screen.players.length,2);
  const initial=structuredClone(d.screen.players);
  await key(p,'ArrowRight',300);d=await diagnostics(p);assert(d.screen.players.find(v=>v.id===1).x>initial.find(v=>v.id===1).x);assert.deepEqual(d.screen.players.find(v=>v.id===2),initial.find(v=>v.id===2));
  await key(p,'KeyZ',300);assert((await diagnostics(p)).screen.players.find(v=>v.id===2).x<60);
  await moveTo(p,'KeyC',2,'x',60);
  const aim0=(await diagnostics(p)).screen.text.split('\n')[20];await key(p,'KeyE',300);const aimed=(await diagnostics(p)).screen.text.split('\n')[20];assert.notEqual(aimed,aim0);
  // Return the genuine native aim indicator to zero using real aiming keys.
  await p.keyboard.down('KeyQ');await p.waitForFunction(()=>Number(rall026Diagnostics().screen.text.split('\n')[20].slice(73).trim())<=0,null,{polling:10,timeout:3000});await p.keyboard.up('KeyQ');
  // Opposing key owners are released before/after a genuine emulator pause.
  await p.keyboard.down('ArrowRight');await p.waitForTimeout(120);await p.locator('#pause').click();await p.keyboard.up('ArrowRight');
  // Pause is a queued emulator command; observe after its next cooperative yield.
  await p.waitForTimeout(120);const frozen=await diagnostics(p);assert(frozen.paused);assert.deepEqual(frozen.held,[]);await p.waitForTimeout(700);const still=await diagnostics(p);assert.equal(still.screen.ticks,frozen.screen.ticks);assert.equal(still.frames,frozen.frames);assert.equal(still.audio.queued,0);
  await p.locator('#resume').click();await p.waitForTimeout(200);assert(!(await diagnostics(p)).paused);
  await p.screenshot({path:path.join(out,'desktop.png')});
  // Restart the original, then win with a real shot from a clear aligned lane.
  await p.locator('#restart').click();await phase(p,'intro');await p.locator('#continue').click();await phase(p,'title');await p.locator('#continue').click();await phase(p,'menu');await begin(p,true);
  await moveTo(p,'ArrowDown',1,'y',22);await moveTo(p,'ArrowRight',1,'x',60);await observeDeath(p,'Space',3);
  // Reverse the roles: same untouched rules, actual loss for player one.
  await begin(p,true);await moveTo(p,'ArrowDown',1,'y',22);await moveTo(p,'ArrowRight',1,'x',60);await observeDeath(p,'KeyV',22);
  console.log('PASS two players: controls, independent motion, aim, pause, both real native death outcomes');
  // One-player mode genuinely reacts to player-one movement.
  await begin(p,false);const computer=(await diagnostics(p)).screen.players.find(v=>v.id===2);await key(p,'ArrowRight',450);assert.notDeepEqual((await diagnostics(p)).screen.players.find(v=>v.id===2),computer);
  await key(p,'Escape',100);await phase(p,'menu');
  await select(p,5);await p.locator('#continue').click();await p.waitForFunction(()=>rall026Diagnostics().phase==='ended',null,{timeout:15000}).catch(async error=>{fs.writeFileSync(path.join(out,'quit-failure.json'),JSON.stringify(await diagnostics(p)));await p.screenshot({path:path.join(out,'quit-failure.png')});throw error;});await p.locator('#new-session').click();await phase(p,'intro');
  console.log('PASS desktop: original menus, sound clock, independent players, aim, pause, both actual deaths, computer reaction, quit/restart');
  await p.close();}

  const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:1});const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));
  await boot(m);await begin(m,true);await m.locator('#p2-toggle').click();
  const cdp=await mobile.newCDPSession(m);const pos=async selector=>{const r=await m.locator(selector).boundingBox();assert(r&&r.width>=40&&r.height>=40);return{x:r.x+r.width/2,y:r.y+r.height/2};};
  const first={id:1,...await pos('#p1-controls [data-key="262"]')},second={id:2,...await pos('#p2-controls [data-key="90"]')};
  const before=await diagnostics(m);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,second]});await m.waitForTimeout(300);
  let touched=await diagnostics(m);assert.deepEqual(touched.held.sort((a,b)=>a-b),[90,262]);assert(touched.screen.players.find(v=>v.id===1).x>before.screen.players.find(v=>v.id===1).x);assert(touched.screen.players.find(v=>v.id===2).x<before.screen.players.find(v=>v.id===2).x);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[second]});assert.deepEqual((await diagnostics(m)).held,[262]);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.deepEqual((await diagnostics(m)).held,[]);
  await m.screenshot({path:path.join(out,'mobile-landscape.png')});await m.setViewportSize({width:667,height:375});await m.screenshot({path:path.join(out,'mobile-small-landscape.png')});assert(await m.evaluate(()=>document.querySelector('#play').getBoundingClientRect().bottom<=innerHeight));await m.setViewportSize({width:390,height:844});await m.screenshot({path:path.join(out,'mobile-portrait.png')});assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await mobile.close();console.log('PASS mobile: two real fingers, independent native movement, release/cancel, portrait/landscape');

  for(const resource of ['app.mjs','vendor/emulators/emulators.js','game.jsdos','vendor/emulators/wdosbox.wasm']){
   const recovery=await browser.newContext();const r=await recovery.newPage();let failed=false;
   await r.route('**/'+resource,async route=>{if(!failed){failed=true;await route.fulfill({status:503,body:'Temporary test failure'});}else await route.continue();});
   await r.goto(base);if(resource!=='app.mjs')await r.locator('#start').click();await r.locator('#error').waitFor({state:'visible',timeout:30000});assert(failed);await r.locator('#retry').click();await phase(r,'intro');await recovery.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('PASS recovery: four actual HTTP failures followed by playable fresh-document retry; no page errors or external HTTP');
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({base,passed:true,errors,external},null,2));
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
