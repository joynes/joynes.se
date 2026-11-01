// Controlled collision scenarios exercise the original engine; these are unit
// scenarios, separate from test-hardword-breakout.cjs's full paddle-controlled win.
const assert=require('node:assert/strict');const {chromium}=require('playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/hardword/';
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
 const p=await browser.newPage({viewport:{width:1000,height:1000},serviceWorkers:'block'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const url=new URL(base);url.searchParams.set('age','8');url.searchParams.set('debug','');url.searchParams.set('go','breakout');await p.goto(url.href);await p.locator('#brkLevelGrid .bana-card').first().waitFor();
 await p.clock.install();let hits=0;
 for(let lv=1;lv<=15;lv++){
  await p.locator('#brkLevelGrid .bana-card').nth(lv-1).click();
  const result=await p.evaluate(()=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg);};
   check(brkBlocks.length===BRK_LVS[brkLevel-1].rows.flat().filter(Boolean).length,'Missing blocks');
   const block=brkBlocks.filter(b=>!b.isMetal).sort((a,b)=>b.y-a.y)[0];const before=block.hits;
   brkBalls=[{...brkBalls[0],x:block.x+block.w/2,y:block.y+block.h+6,vx:0,vy:-2,onPad:false,alive:true}];brkState='playing';
   brkUpdate(16);check(block.hits===before-1,'Ball must damage block through collision');
   return {cleared:brkBlocksCleared,damaged:before-block.hits};
  });assert.equal(result.damaged,1);hits++;
  await p.locator('#brkBackBtn').click();
 }
 await p.locator('#brkLevelGrid .bana-card').nth(2).click();
 const boss=await p.evaluate(()=>{
  // Arena after the destructible blocks are cleared: all boss HP is removed by
  // real ball collisions, never by assigning HP or completion state.
  brkBlocks=[];brkState='playing';brkSpawnBoss();const initial=brkBoss.hp;
  for(let shot=0;shot<initial;shot++){
   brkBalls=[{...brkBalls[0],x:brkBoss.x+brkBoss.w/2,y:brkBoss.y+brkBoss.h+5,vx:0,vy:-2,onPad:false,alive:true}];brkUpdate(16);
  }
  return {initial,hp:brkBoss.hp,state:brkState};
 });assert.ok(boss.initial>0);assert.equal(boss.hp,0);assert.equal(boss.state,'done');
 const drops=await p.evaluate(()=>{
  const names=[...new Set([...BRK_DROPS_GOOD,...BRK_DROPS_BAD,'coin'])];
  for(const type of names){brkLevel=1;brkStartGame();brkApplyDrop(type);brkUpdate(16);
   if(brkBalls.filter(b=>b.alive).length>BRK_MAX_BALLS)throw Error('Ball cap '+type);
   if(!Number.isFinite(brkPadX)||!Number.isFinite(brkPadW)||!Number.isFinite(getCoinData().balance))throw Error('Invalid effect '+type);
  }return names.length;
 });assert.deepEqual(errors,[]);console.log(`PASS engine unit scenarios: all ${hits} layouts instantiate and take collision damage, ${boss.initial}-hit boss defeated through collisions, ${drops} drop effects preserve valid state.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
