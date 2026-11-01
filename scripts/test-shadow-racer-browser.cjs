const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8790/';
const output=process.env.SHADOW_TEST_RESULTS||path.resolve('test-results/shadow-racer');
fs.mkdirSync(output,{recursive:true});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const snapshot=page=>page.evaluate(()=>window.shadowRacerDiagnostics());
async function until(fn,label,timeout=25000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await delay(30);}throw Error('Timed out: '+label);}
async function started(page,button='#start'){
 await page.locator(button).click();await until(async()=>{const d=await snapshot(page);return d.phase==='running'&&!await page.locator('#reset').isDisabled();},'actual native running',65000);
 const d=await snapshot(page);assert.equal(d.metadata.isActionScript3,true);assert.equal(d.metadata.width,650);assert.equal(d.metadata.height,350);assert.ok(d.native.frame>0);
}
// This pilot reads the real native observer and sends only standard keyboard
// events through the same page controls. It never changes a game object,
// position, collision, score, timer, mode, or RNG value.
async function driveToFinish(page){
 await page.evaluate(()=>{
  const pulses=[{at:900,key:'ArrowRight'},{at:1700,key:'ArrowRight'},{at:2600,key:'ArrowLeft'}];
  let pulse=0,began=null,steer=null,frame=-1,start=performance.now();const samples=[];
  const key=(type,key)=>document.dispatchEvent(new KeyboardEvent(type,{key,code:key,bubbles:true,composed:true,cancelable:true}));
  key('keydown','ArrowUp');
  function tick(){const d=shadowRacerDiagnostics(),s=d.native;
   if(d.phase!=='running'||performance.now()-start>35000){key('keyup','ArrowUp');if(steer)key('keyup',steer);window.shadowPilotResult={phase:d.phase,native:s,samples};return;}
   if(s&&s.frame!==frame){frame=s.frame;let next=null;
    if(began===null&&pulse<pulses.length&&s.x>=pulses[pulse].at)began=s.frame;
    if(began!==null){next=pulses[pulse].key;if(s.frame-began>=2){pulse++;began=null;next=null;}}
    if(next!==steer){if(steer)key('keyup',steer);if(next)key('keydown',next);steer=next;}
    samples.push({...s});
   }requestAnimationFrame(tick);
  }requestAnimationFrame(tick);
 });
 await until(()=>page.evaluate(()=>!!window.shadowPilotResult),'normal controls reach native end',40000);
 const result=await page.evaluate(()=>{const result=window.shadowPilotResult;delete window.shadowPilotResult;return result;});
 assert.equal(result.phase,'finished','genuine original finish reached');assert.ok(result.native.x>3400);assert.ok(result.native.crashes<=5);assert.ok(result.samples.length>300);
 assert.ok(result.samples.some(s=>s.key===38));assert.ok(result.samples.some(s=>s.key===39));assert.ok(result.samples.some(s=>s.key===37));
 return result;
}
function observe(page){
 const errors=[],external=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{const url=new URL(request.url());if(/^https?:/.test(url.protocol)&&url.origin!==new URL(base).origin)external.push(url.origin);});return{errors,external};
}
(async()=>{const browser=await chromium.launch({timeout:30000,headless:true,...(process.env.SHADOW_HEADLESS_SHELL==='1'?{}:{channel:'chrome'})});
try{
 const recoveryOnly=process.env.SHADOW_TEST_FOCUS==='recovery';
 if(!recoveryOnly){
 for(const version of ['20081005','20080928']){
  const context=await browser.newContext({viewport:{width:1280,height:1000}});
  try{const page=await context.newPage(),watch=observe(page);await page.goto(base+'?version='+version);await page.locator('#name').fill('Webbtest');await started(page);
   const initial=(await snapshot(page)).native;await page.keyboard.down('s');await delay(650);assert.equal((await snapshot(page)).native.key,40);await page.keyboard.up('s');await delay(70);assert.equal((await snapshot(page)).native.key,0);assert.ok((await snapshot(page)).native.x<initial.x-3,'real reverse');
   const before=(await snapshot(page)).native.x;await page.keyboard.down('w');await delay(1200);assert.equal((await snapshot(page)).native.key,38);await page.keyboard.up('w');assert.ok((await snapshot(page)).native.x>before+20,'real forward movement');
   await page.keyboard.press('p');await until(async()=>(await snapshot(page)).paused,'pause');const frozen=(await snapshot(page)).native;await delay(650);assert.deepEqual((await snapshot(page)).native,frozen,'native timer and physics freeze');
   await page.locator('#resume').click();await delay(180);const resumed=(await snapshot(page)).native;assert.ok(resumed.frame>frozen.frame);assert.ok(resumed.ticks-frozen.ticks<50,'paused wall time never added to native lap time');
   await started(page,'#reset');await page.keyboard.down('ArrowUp');await until(async()=>(await snapshot(page)).phase==='crashed','real collision ends straight driving',16000);await page.keyboard.up('ArrowUp');
   const crash=(await snapshot(page)).native;assert.ok(crash.crashes>5);assert.ok(crash.x<3400);assert.ok(await page.locator('#again').isVisible());await page.screenshot({path:path.join(output,'crash-'+version+'.jpg')});
   await started(page,'#again');const result=await driveToFinish(page);const finished=await snapshot(page);const record=finished.records.find(r=>r.version===version&&r.name==='Webbtest');assert.ok(record&&record.ticks>0);assert.equal(finished.phase,'finished');assert.ok(await page.locator('#overlay-title').getByText('Mål!',{exact:true}).isVisible());
   assert.ok((await page.locator('#time').textContent()).includes((record.ticks/100).toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})));
   await page.screenshot({path:path.join(output,'finish-'+version+'.jpg')});fs.writeFileSync(path.join(output,'native-finish-'+version+'.json'),JSON.stringify({version,record,native:result.native,frames:result.samples.length,sourceInputSamples:result.samples},null,2)+'\n');
   await page.reload();assert.ok((await snapshot(page)).records.some(r=>r.version===version&&r.ticks===record.ticks));assert.ok((await page.locator('#records').textContent()).includes('Webbtest'));
   await started(page);await page.locator('#choose').click();assert.equal(await page.locator('ruffle-player').count(),0);assert.ok(await page.locator('#intro').isVisible());assert.equal((await snapshot(page)).native,null);
   await page.locator('#version').selectOption(version==='20081005'?'20080928':'20081005');assert.ok((await page.locator('#records').textContent()).includes('Inga målgångar'));
   assert.deepEqual(watch.errors,[]);assert.deepEqual(watch.external,[]);console.log('PASS native '+version+': keyboard/back/forward, true pause/timer, actual crash/retry, full ordinary-input finish, native lap record/persistence, edition switch/cleanup and zero external requests.');
  }finally{await context.close();}
 }
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 try{const page=await context.newPage(),watch=observe(page);await page.goto(base);await started(page);const cdp=await context.newCDPSession(page),gas=await page.locator('[data-key="ArrowUp"]').boundingBox(),lean=await page.locator('[data-key="ArrowLeft"]').boundingBox();
  const point=(box,id)=>({x:box.x+box.width/2,y:box.y+box.height/2,id,radiusX:8,radiusY:8,force:1}),a=point(gas,1),b=point(lean,2),before=(await snapshot(page)).native.x;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await delay(550);assert.equal((await snapshot(page)).native.key,38);assert.ok((await snapshot(page)).native.x>before+20);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});await delay(100);assert.equal((await snapshot(page)).native.key,37);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b]});await delay(100);assert.equal((await snapshot(page)).native.key,38,'remaining thumb resumes gas');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await delay(90);assert.equal((await snapshot(page)).native.key,0);assert.deepEqual((await snapshot(page)).held,[]);
  for(const viewport of [{width:844,height:390},{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await delay(120);for(const selector of ['#board','#pause','#reset','#choose','[data-key="ArrowUp"]']){const box=await page.locator(selector).boundingBox();assert.ok(box&&box.x>=-1&&box.x+box.width<=viewport.width+1,selector+' stays on screen');}await page.screenshot({path:path.join(output,`touch-${viewport.width}x${viewport.height}.jpg`)});}
  assert.deepEqual(watch.errors,[]);assert.deepEqual(watch.external,[]);console.log('PASS native touch: real multi-touch gas/lean, surviving-thumb resume, cancel release and portrait/landscape recovery.');
 }finally{await context.close();}
 }
 for(const [label,pattern] of [['interface','**/app.mjs'],['loader','**/vendor/ruffle/ruffle.js'],['movie','**/shadow-racer-20081005.swf'],['wasm','**/*.wasm']]){
  const context=await browser.newContext();try{const page=await context.newPage();let failed=false;await page.route(pattern,route=>{if(!failed){failed=true;return route.fulfill({status:503,body:'temporary test failure'});}return route.continue();});await page.goto(base);
   if(label!=='interface')await page.locator('#start').click();await until(()=>page.locator('#error').isVisible(),label+' visible recovery',65000);assert.ok(failed);
   await Promise.all([page.waitForNavigation(),page.locator('#retry').click()]);
   await until(async()=>{const d=await snapshot(page);return d.phase==='running'&&!await page.locator('#reset').isDisabled();},label+' retry plays native movie',65000);
   assert.ok((await snapshot(page)).native.frame>0);console.log('PASS '+label+' real 503 and playable retry');
  }finally{await context.close();}
 }
 const blocked=await browser.newContext();try{await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('blocked','SecurityError');};Storage.prototype.setItem=()=>{throw new DOMException('blocked','SecurityError');};});const page=await blocked.newPage();await page.goto(base);await started(page);assert.equal((await snapshot(page)).storageAvailable,false);await page.keyboard.down('ArrowUp');await delay(500);await page.keyboard.up('ArrowUp');assert.ok((await snapshot(page)).native.x>145);console.log('PASS blocked storage: actual native game remains playable, records limitation visible.');}finally{await blocked.close();}
 console.log(recoveryOnly?'PASS ShadowRacer focused recovery and blocked storage.':'PASS ShadowRacer: both complete original native releases, genuine controls/results/persistence, mobile and recovery. No game-state injection.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
