const assert=require('node:assert/strict');const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/hardword/';
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{headless:true}:{headless:true,channel:'chrome'});
 try{
  const context=await browser.newContext({viewport:{width:900,height:1000},serviceWorkers:'block'});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base);await p.clock.install();await p.addStyleTag({content:'*{animation:none!important;transition:none!important;scroll-behavior:auto!important}'});await p.locator('#ageCard8').click();await p.locator('#s-hub [onclick="openBreakout()"] ').click();await p.locator('#brkLevelGrid .bana-card').first().click();
  await p.locator('#brkCanvas').focus();const initial=await p.evaluate(()=>brkPadX);await p.keyboard.press('ArrowLeft');await p.clock.runFor(100);assert.ok(await p.evaluate(start=>brkPadX<start,initial));await p.keyboard.press('Space');assert.equal(await p.evaluate(()=>brkState),'playing');
  // This player only sends paddle and launch input. It never changes balls, blocks,
  // score, lives, completion flags, or the physics engine.
  await p.evaluate(()=>{
   let tick=0;
   window.breakoutBot=setInterval(()=>{
    if(!['ready','playing'].includes(brkState))return;
    const c=document.getElementById('brkCanvas'),r=c.getBoundingClientRect();
    if(brkBalls.some(b=>b.alive&&b.onPad))c.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));
    const balls=brkBalls.filter(b=>b.alive&&!b.onPad);
    const descending=balls.filter(b=>b.vy>0).sort((a,b)=>(brkPadY-a.y)/a.vy-(brkPadY-b.y)/b.vy);
    const b=descending[0]||balls[0];if(!b)return;
    let x=b.x;
    if(b.vy>0){
     const width=brkW-2*b.r;let projected=(b.x-b.r)+b.vx*Math.max(0,(brkPadY-b.r-b.y)/b.vy);
     projected=((projected%(width*2))+width*2)%(width*2);x=b.r+(projected>width?2*width-projected:projected);
     const targets=brkBlocks.filter(t=>t.alive&&!t.isMetal);const target=targets[Math.floor(tick/120)%Math.max(1,targets.length)];
     const aim=target?Math.atan2(target.x+target.w/2-x,brkPadY-target.y):0;
     x-=Math.max(-.7,Math.min(.7,aim/(Math.PI*.38)))*brkPadW/2;
    }
    const now=Date.now();if((brkEffects.invert||0)>now||(brkEffects.padflip||0)>now)x=brkW-x;
    c.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:r.left+x/brkW*r.width,clientY:r.top+r.height-20}));tick++;
   },16);
  });
  let won=false,attempts=1;
  for(let chunk=0;chunk<360;chunk++){
   await p.clock.runFor(1000);
   const state=await p.evaluate(()=>({state:brkState,cleared:brkBlocksCleared,total:brkBlocksTotal,lives:brkLives}));
   if(chunk%15===0)console.log('Breakout actual play',chunk,state);
   if(state.state==='done'){won=true;break;}
   if(state.state==='over'){if(attempts++>=3)throw Error('Breakout player lost three attempts');console.log('Retrying through the Game Over control',attempts);await p.locator('#brkOverlayBtns button').getByText('Försök igen',{exact:false}).click();}
  }
  console.log('Completed paddle-controlled win:',won);assert.ok(won,'A real paddle-controlled game must win level one');await p.evaluate(()=>clearInterval(window.breakoutBot));
  assert.equal(await p.evaluate(()=>appStorage.getItem('brk_done_1')),'1');assert.match(await p.locator('#brkOverlayTitle').innerText(),/klar/);await p.screenshot({path:'test-results/hardword-breakout-win.png',fullPage:true});
  await p.locator('#brkOverlayBtns button').getByText('Försök igen',{exact:false}).click();assert.equal(await p.evaluate(()=>brkState),'ready');assert.equal(await p.evaluate(()=>brkBlocksCleared),0);
  // Leave the paddle stationary: real misses must lead to game over, then replay.
  await p.locator('#brkCanvas').focus();await p.keyboard.press('Space');
  for(let i=0;i<180;i++){if(await p.evaluate(()=>brkState==='ready')){await p.locator('#brkCanvas').focus();await p.keyboard.press('Space');}await p.clock.runFor(1000);if(i%30===0)console.log('Stationary paddle loss check',i,await p.evaluate(()=>({state:brkState,lives:brkLives})));if(await p.evaluate(()=>brkState==='over'))break;}
  assert.equal(await p.evaluate(()=>brkState),'over');await p.locator('#brkOverlayBtns button').getByText('Försök igen',{exact:false}).click();assert.equal(await p.evaluate(()=>brkLives),3);
  await p.locator('#brkBackBtn').click();assert.equal(await p.evaluate(()=>brkRaf),null);assert.deepEqual(errors,[]);console.log('PASS Breakout: real input/physics win, save, game over, restart, keyboard and stopped loop.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
