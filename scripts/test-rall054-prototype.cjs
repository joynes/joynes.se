// Explicit local prototype check; this does not mark rall0054 as a released game.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.CHROMIUM_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.RALL054_PROBE_URL || 'http://127.0.0.1:8798/controls/';
const out = process.env.RALL054_TEST_RESULTS || 'test-results/rall054-input';
fs.mkdirSync(out,{recursive:true});
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
const held = p => p.locator('#pads button[aria-pressed="true"]').count();
async function nativeFrame(p) {
  const frame = p.frames().find(f => f.url().includes('/boxedwine.html'));
  assert(frame,'original runtime iframe exists');
  return frame;
}
async function tankPosition(p,player='blue') {
  return (await nativeFrame(p)).evaluate(([red,green,blue]) => {
    const c = document.querySelector('#canvas');
    const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    const mask = new Uint8Array(c.width*c.height), components=[];
    // Original tank body colour, with 16-bit display quantisation tolerance.
    for (let y=32;y<512;y++) for (let x=32;x<672;x++) {
      const n=y*c.width+x, i=n*4;
      if (Math.abs(data[i]-red)<=4 && Math.abs(data[i+1]-green)<=4 && Math.abs(data[i+2]-blue)<=4) mask[n]=1;
    }
    for (let n=0;n<mask.length;n++) if (mask[n]) {
      mask[n]=0; const pending=[n]; let count=0,sx=0,sy=0;
      while (pending.length) {
        const q=pending.pop(); count++; sx+=q%c.width; sy+=Math.floor(q/c.width);
        for (const r of [q-1,q+1,q-c.width,q+c.width]) if (r>=0 && r<mask.length && mask[r]) {mask[r]=0;pending.push(r);}
      }
      if (count>40 && count<900) components.push({count,sx,sy});
    }
    const count=components.reduce((n,c)=>n+c.count,0);
    return {count,x:components.reduce((n,c)=>n+c.sx,0)/count,
      y:components.reduce((n,c)=>n+c.sy,0)/count};
  },player==='blue'?[8,40,115]:[49,89,0]);
}
async function startWithKeyboard(p) {
  await p.goto(base);
  await p.waitForFunction(()=>!document.querySelector('#start').disabled,undefined,{timeout:120000});
  await p.keyboard.press('Tab');
  assert.equal(await p.locator(':focus').getAttribute('id'),'start');
  await p.keyboard.press('Enter');
  await finishStartup(p);
}
async function finishStartup(p) {
  for (let i=0;i<50;i++) {
    await sleep(2000);
    if ((await p.locator('#status').innerText()).startsWith('Original game running')) break;
    await p.keyboard.press('Enter',{delay:100});
  }
  if (!(await p.locator('#status').innerText()).startsWith('Original game running')) {
    await p.screenshot({path:`${out}/startup-failure.png`});
    const f=await nativeFrame(p);
    await f.locator('#canvas').screenshot({path:`${out}/startup-native-failure.png`});
    console.log('STARTUP FAILURE',await f.evaluate(()=>({
      output:document.querySelector('#output').value.slice(-3500),
      width:canvas.width,height:canvas.height,focus:document.activeElement?.id,
    })));
  }
  assert.match(await p.locator('#status').innerText(),/^Original game running/);
  let tank, opponent;
  for(let i=0;i<24;i++) {
    await sleep(1500); tank=await tankPosition(p);
    opponent=await tankPosition(p,'green');
    // In single player the blue tank is drawn before the stage prompt. Wait
    // for the opponent too, so input is not sent during enemy loading.
    if(tank.count>80 && opponent.count>80)break;
    await p.keyboard.press('Enter',{delay:100});
  }
  if(tank.count<=80) {
    await p.screenshot({path:`${out}/tank-startup-failure.png`});
    console.log('TANK FAILURE',tank,await (await nativeFrame(p)).evaluate(()=>({width:canvas.width,height:canvas.height,focus:document.activeElement?.id})));
  }
  assert(tank.count>80,'native player tank rendered, not only a menu');
  assert(opponent.count>80,'native opponent or second player has loaded');
  await sleep(500);
}
async function scenario(browser,mobile) {
  const name=mobile?'mobile':'desktop';
  const context=await browser.newContext(mobile?
    {viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}:
    {viewport:{width:1100,height:950}});
  const p=await context.newPage(), errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  try {
    await startWithKeyboard(p);
    // The blue spawn points toward foreground scenery on some native maps.
    // Turn into the open field before checking translation.
    await p.keyboard.down('ArrowLeft'); await sleep(500); await p.keyboard.up('ArrowLeft');
    await sleep(150);
    const before=await tankPosition(p);
    await p.keyboard.down('ArrowUp'); await p.keyboard.down('p');
    for(let i=0;i<25;i++) {
      await sleep(200);
      const current=await tankPosition(p);
      if(i>=2 && Math.hypot(current.x-before.x,current.y-before.y)>10)break;
      if(i===7){await p.keyboard.down('ArrowLeft');await sleep(300);await p.keyboard.up('ArrowLeft');}
    }
    await p.keyboard.up('ArrowUp');
    assert.equal(await p.locator('[data-code="ArrowUp"]').getAttribute('aria-pressed'),'false');
    assert.equal(await p.locator('[data-code="KeyP"]').getAttribute('aria-pressed'),'true');
    await p.keyboard.up('p'); assert.equal(await held(p),0);
    const after=await tankPosition(p);
    console.log(name,'native keyboard positions',before,after);
    await p.screenshot({path:`${out}/${name}-movement.png`});
    assert(after.count>80);
    assert(Math.hypot(after.x-before.x,after.y-before.y)>8,'physical keyboard moved the native tank');
    console.log(name,'native keyboard movement',before,after);
    if (mobile) {
      const back=p.locator('[data-code="ArrowDown"]'), fire=p.locator('[data-code="KeyP"]');
      await back.scrollIntoViewIfNeeded();
      const a=await back.boundingBox(), b=await fire.boundingBox();
      const point=(id,r)=>({id,x:r.x+r.width/2,y:r.y+r.height/2});
      assert(a.y>=0 && b.y+b.height<=844,'touch controls fit the mobile viewport');
      const cdp=await context.newCDPSession(p);
      const touchBefore=await tankPosition(p);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(1,a),point(2,b)]});
      for(let i=0;i<25;i++) {
        await sleep(200);const current=await tankPosition(p);
        if(Math.hypot(current.x-touchBefore.x,current.y-touchBefore.y)>6)break;
      }
      assert.equal(await held(p),2);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point(1,a)]});
      await sleep(150); assert.equal(await held(p),1,'lifting movement leaves fire held');
      assert.equal(await fire.getAttribute('aria-pressed'),'true');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      await sleep(150); assert.equal(await held(p),0,'touch cancellation releases controls');
      const touchAfter=await tankPosition(p);
      console.log('native touch movement',touchBefore,touchAfter);
      assert(Math.hypot(touchAfter.x-touchBefore.x,touchAfter.y-touchBefore.y)>4,'real touch moved the native tank');
      await p.screenshot({path:`${out}/${name}-portrait.png`});
      await p.setViewportSize({width:844,height:390});
      await p.locator('#stage').scrollIntoViewIfNeeded();
      await p.screenshot({path:`${out}/${name}-landscape.png`});
    }
    await p.keyboard.down('ArrowUp');
    await p.keyboard.press('Shift+Tab');
    assert.equal(await p.locator(':focus').getAttribute('id'),'pause');
    assert.equal(await held(p),0,'leaving the game releases physical keys');
    await p.keyboard.up('ArrowUp');
    await p.screenshot({path:`${out}/${name}-keyboard.png`});
    if (mobile) {
      await p.setViewportSize({width:390,height:844});
      await p.locator('#mode').selectOption('two');
      await p.waitForFunction(()=>!document.querySelector('#start').disabled,undefined,{timeout:120000});
      await p.locator('#start').tap();
      await finishStartup(p);
      const idleBlue=await tankPosition(p), idleGreen=await tankPosition(p,'green');
      await sleep(700);
      const stillBlue=await tankPosition(p), stillGreen=await tankPosition(p,'green');
      assert(Math.hypot(stillBlue.x-idleBlue.x,stillBlue.y-idleBlue.y)<3,'first human tank stays still without input');
      assert(Math.hypot(stillGreen.x-idleGreen.x,stillGreen.y-idleGreen.y)<3,'second human tank is not an AI opponent');
      const secondBefore=await tankPosition(p,'green');
      assert(secondBefore.count>80,'second native tank rendered');
      // Steer while driving so a foreground obstacle at the spawn does not
      // turn a valid control into a stationary collision test.
      await p.keyboard.down('d'); await p.keyboard.down('c');
      for(let i=0;i<25;i++) {
        await sleep(200); const current=await tankPosition(p,'green');
        if(Math.hypot(current.x-secondBefore.x,current.y-secondBefore.y)>10)break;
      }
      await p.keyboard.up('c'); await p.keyboard.up('d');
      const secondAfter=await tankPosition(p,'green');
      console.log('second human tank',secondBefore,secondAfter);
      await p.screenshot({path:`${out}/mobile-second-human.png`});
      assert(Math.hypot(secondAfter.x-secondBefore.x,secondAfter.y-secondBefore.y)>8,'attached keyboard moves the second native tank');
      const cdp=await context.newCDPSession(p);
      const a=await p.locator('[data-code="ArrowUp"]').boundingBox();
      const b=await p.locator('[data-code="KeyD"]').boundingBox();
      const c=await p.locator('[data-code="KeyZ"]').boundingBox();
      const point=(id,r)=>({id,x:r.x+r.width/2,y:r.y+r.height/2});
      const touchBefore=await tankPosition(p,'green');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(1,a),point(2,b),point(3,c)]});
      for(let i=0;i<15;i++) {
        await sleep(200); const current=await tankPosition(p,'green');
        if(Math.hypot(current.x-touchBefore.x,current.y-touchBefore.y)>6)break;
      }
      assert.equal(await held(p),3);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point(1,a)]});
      await sleep(100); assert.equal(await held(p),2);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      await sleep(100); assert.equal(await held(p),0);
      const touchAfter=await tankPosition(p,'green');
      assert(Math.hypot(touchAfter.x-touchBefore.x,touchAfter.y-touchBefore.y)>4,'touch moves the second native tank');
      await p.screenshot({path:`${out}/mobile-two-player.png`});
      // Establish a clear traversed path. Pause/resume then checks reverse
      // movement on that path instead of accidentally testing a map boundary.
      await p.keyboard.down('ArrowLeft');await sleep(500);await p.keyboard.up('ArrowLeft');
      const pathStart=await tankPosition(p);
      await p.keyboard.down('ArrowUp');
      for(let i=0;i<25;i++) {
        await sleep(200);const current=await tankPosition(p);
        if(Math.hypot(current.x-pathStart.x,current.y-pathStart.y)>20)break;
      }
      await p.keyboard.up('ArrowUp');
      const pathEnd=await tankPosition(p);
      assert(Math.hypot(pathEnd.x-pathStart.x,pathEnd.y-pathStart.y)>12,'clear path available for the native pause check');
      await (await nativeFrame(p)).evaluate(()=>{
        window.qaPauseEvents=[];
        for(const type of ['keydown','keyup','focus','blur'])window.addEventListener(type,e=>{
          if(type==='focus'||type==='blur'||e.code==='KeyW')qaPauseEvents.push({type,code:e.code,keyCode:e.keyCode,t:performance.now(),focused:document.hasFocus()});
        },true);
      });
      await p.locator('#pause').tap(); await sleep(300);
      const paused=await tankPosition(p);
      await p.keyboard.down('ArrowDown'); await sleep(900);
      const frozen=await tankPosition(p);
      console.log('PAUSE',paused,frozen,await (await nativeFrame(p)).evaluate(()=>qaPauseEvents));
      assert(Math.hypot(frozen.x-paused.x,frozen.y-paused.y)<3,'native pause stops movement while a physical key is held');
      await p.locator('#pause').tap(); await sleep(300);
      const resumed=await tankPosition(p);
      await p.keyboard.down('ArrowDown');
      for(let i=0;i<25;i++) {
        await sleep(200); const current=await tankPosition(p);
        if(Math.hypot(current.x-resumed.x,current.y-resumed.y)>7)break;
      }
      await p.keyboard.up('ArrowDown');
      const moving=await tankPosition(p);
      assert(Math.hypot(moving.x-resumed.x,moving.y-resumed.y)>5,'native movement resumes after pause');
      await p.locator('#fullscreen').tap();
      await p.waitForFunction(()=>!!document.fullscreenElement);
      assert(await p.locator('#pause').isVisible(),'touch toolbar stays available in fullscreen');
      assert.deepEqual(await (await nativeFrame(p)).evaluate(()=>[canvas.width,canvas.height]),[800,600]);
      await p.keyboard.press('Escape');
      await p.waitForFunction(()=>!document.fullscreenElement);
      await p.keyboard.down('ArrowUp');
      await p.locator('#restart').tap();
      await p.keyboard.up('ArrowUp');
      assert.equal(await held(p),0);
      await p.waitForFunction(()=>!document.querySelector('#start').disabled,undefined,{timeout:120000});
      await p.locator('#start').tap(); await finishStartup(p);
      assert((await tankPosition(p)).count>80);
      console.log('PASS mobile two-player native keyboard/touch movement, fullscreen and restarted gameplay');
    }
    assert.deepEqual(errors,[]);
    console.log('PASS',name,'native movement, keyboard navigation and independent release');
  } finally {await context.close();}
}
module.exports={tankPosition,finishStartup,nativeFrame};
if(require.main===module)(async()=>{
  const browser=await chromium.launch();
  try {
    if(!process.env.RALL054_ONLY_MOBILE)await scenario(browser,false);
    if(!process.env.RALL054_ONLY_DESKTOP)await scenario(browser,true);
  }
  finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
