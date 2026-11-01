const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const chrome=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const safari=require(process.env.WEBKIT_PLAYWRIGHT_MODULE||process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const output=process.env.NEON_TEST_RESULTS||path.join(process.cwd(),'test-results/neon');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,timeout=15000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await delay(80);}throw Error('Timed out: '+label);}
function watch(){
  window.__qaApps=[];window.__PIXI_APP_INIT__=app=>window.__qaApps.push(app);
  window.__qaMusic=[];const Native=window.Audio;
  window.Audio=function(...args){const audio=new Native(...args);window.__qaMusic.push(audio);return audio;};
  window.Audio.prototype=Native.prototype;Object.setPrototypeOf(window.Audio,Native);
}
function snapshot(){
  const app=window.__qaApps.filter(app=>app.stage&&!app.stage.destroyed).at(-1);
  if(!app)return null;
  const world=app.stage.children[0],players=[],texts=[],frame=[];
  for(const child of world?.children||[])if(child.sprites instanceof Map&&child.sprites.size===5 || child.texture?.source&&Math.abs(child.width-112)<.1&&Math.abs(child.height-112)<.1)players.push({uid:child.uid,x:child.x,y:child.y,banks:child.sprites?.size||1});
  function walk(child,depth=0){
    if(typeof child.text==='string')texts.push(child.text);
    frame.push([child.uid,child.x,child.y,child.rotation,child.alpha,child.visible]);
    if(depth<4)for(const next of child.children||[])walk(next,depth+1);
  }walk(app.stage);
  return {players,texts,frame,screen:[app.screen.width,app.screen.height],music:window.__qaMusic.map(audio=>({src:audio.currentSrc||audio.src,time:audio.currentTime,paused:audio.paused,volume:audio.volume}))};
}
async function main(){fs.mkdirSync(output,{recursive:true});for(const engine of (process.env.NEON_ENGINE?[process.env.NEON_ENGINE]:['chromium','webkit'])){
 const browser=await (engine==='chromium'?chrome.chromium:safari.webkit).launch({headless:true,...(engine==='chromium'?{args:['--disk-cache-size=1'],...(process.env.NEON_HEADLESS_SHELL?{}:{channel:'chrome'})}:{})});
 try{for(const edition of ['interceptor','manta']){
  const base=process.env.NEON_LOCAL_URL||`https://${edition==='manta'?'manta':'neon'}-interceptor.joynez11.chatgpt.site/`;
  const context=await browser.newContext({viewport:{width:1180,height:820},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(watch);
  await page.goto(base+(process.env.NEON_LOCAL_URL?'?game='+edition:''));await page.locator('.launch-screen').waitFor();
  assert.match(await page.locator('.version-badge').textContent(),new RegExp(`v0\\.3\\.15.*${edition==='manta'&&!process.env.NEON_LOCAL_URL?'a5a6424':'e497f79'}`));
  assert.match(await page.locator('[data-action="map"]').textContent(),edition==='manta'?/21 SECTORS/:/20 SECTORS/);
  await page.screenshot({path:path.join(output,`${engine}-${edition}-menu.png`)});
  await page.locator('[data-action="map"]').click();assert.equal(await page.locator('.map-node').count(),edition==='manta'?21:20);await page.locator('[data-action="home"]').click();
  await page.locator('[data-action="shop"]').click();await page.locator('[data-ship="ship_15"]').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('neon-selected-ship')),'ship_15');await page.reload();await page.locator('.launch-screen').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('neon-selected-ship')),'ship_15');
  await page.locator('[data-action="audio"]').click();
  for(const [kind,value] of [['music',30],['sfx',20]])await page.locator(`[data-volume="${kind}"]`).evaluate((element,value)=>{element.value=String(value);element.dispatchEvent(new Event('input',{bubbles:true}));},value);
  assert.equal(await page.evaluate(()=>localStorage.getItem('neon-music-volume')),'30');assert.equal(await page.evaluate(()=>localStorage.getItem('neon-sfx-volume')),'20');await page.locator('[data-action="home"]').click();
  await page.locator('[data-action="map"]').click();await page.locator(`[${edition==='manta'?'data-enemy-stage':'data-stage'}="0"]`).click();
  await page.locator('.scene-loading').waitFor({state:'detached'});await page.locator('canvas').waitFor();await until(async()=>(await page.evaluate(snapshot))?.players.length===1,'rendered player');
  const before=(await page.evaluate(snapshot)).players[0];await page.keyboard.down('ArrowRight');await delay(300);await page.keyboard.up('ArrowRight');await delay(120);const after=(await page.evaluate(snapshot)).players[0];assert.ok(after.x>before.x+100,'ordinary keyboard moves the rendered aircraft');
  await page.keyboard.down('ArrowLeft');await delay(300);await page.keyboard.up('ArrowLeft');await delay(150);
  if(engine==='chromium'){
    const cdp=await context.newCDPSession(page),box=await page.locator('canvas').boundingBox();
    const start={id:1,x:box.x+box.width*.4,y:box.y+box.height*.65},moved={...start,x:start.x+65};const p=(await page.evaluate(snapshot)).players[0];
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[moved]});await delay(350);assert.ok((await page.evaluate(snapshot)).players[0].x>p.x+50,'real relative touch drag moves aircraft');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await delay(350);const stopped=(await page.evaluate(snapshot)).players[0];await delay(300);assert.ok(Math.abs((await page.evaluate(snapshot)).players[0].x-stopped.x)<2,'touch cancellation holds visible position');await cdp.detach();
  }else{
    const box=await page.locator('canvas').boundingBox(),p=(await page.evaluate(snapshot)).players[0];await page.mouse.move(box.x+box.width*.4,box.y+box.height*.65);await page.mouse.down();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.65,{steps:5});await delay(350);await page.mouse.up();assert.ok((await page.evaluate(snapshot)).players[0].x>p.x+50,'relative pointer drag moves aircraft in WebKit');
  }
  await page.keyboard.press('b');await until(async()=>!(await page.locator('.touch-bomb').getAttribute('class')).includes('is-ready'),'actual bomb cooldown');
  await until(async()=>{const state=await page.evaluate(snapshot);return state.music.some(music=>music.src.includes('/music/'+edition+'/stage-1.mp3')&&!music.paused&&music.time>.1);},'real stage soundtrack playing');
  await page.screenshot({path:path.join(output,`${engine}-${edition}-flight.png`)});
  await page.locator('.flight-pause').click();await page.locator('.pause-menu').waitFor();const paused=(await page.evaluate(snapshot)).frame;await delay(350);assert.deepEqual((await page.evaluate(snapshot)).frame,paused,'pause freezes the actual scene');
  await page.keyboard.press('Escape');await page.locator('.resume-countdown').waitFor({state:'visible'});await page.locator('.resume-countdown').waitFor({state:'detached',timeout:10000});await delay(250);assert.notDeepEqual((await page.evaluate(snapshot)).frame,paused);
  if(await page.evaluate(()=>!!(document.fullscreenElement||document.webkitFullscreenElement))){await page.keyboard.press('f');await page.waitForFunction(()=>!document.fullscreenElement&&!document.webkitFullscreenElement);}
  await page.setViewportSize({width:390,height:844});await page.locator('.orientation-notice').waitFor();await page.screenshot({path:path.join(output,`${engine}-${edition}-portrait.png`)});await page.setViewportSize({width:1180,height:820});
  if(await page.locator('.viewport-recovery').isVisible()){await page.locator('[data-continue]').click();await page.locator('.resume-countdown').waitFor({state:'detached',timeout:10000});}
  await page.locator('.flight-back').click();await page.locator('.launch-screen').waitFor();assert.equal(await page.locator('canvas').count(),0);
  const sounds=await page.evaluate(()=>window.__qaMusic.filter(audio=>(audio.currentSrc||audio.src).includes('/stage-')).map(audio=>audio.paused));assert.ok(sounds.every(Boolean),'stage audio stops or switches to menu on exit');
  assert.deepEqual(errors,[]);console.log(`PASS ${engine} ${browser.version()} ${edition}: exact live badge, complete campaign map, free Pikachu and persisted choice, audio mixer, ordinary keyboard/relative drag/cancel, real bomb and soundtrack, actual scene pause/countdown, portrait recovery and exit cleanup; no game-state injection.`);await context.close();
 }}finally{await browser.close();}
}}
module.exports={watch,snapshot,until,delay};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1});
