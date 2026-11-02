const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const {observeDriver}=require('./driving-native-observer.cjs');
const gameId=process.env.DRIVING_GAME_ID||'simple-driving';
assert(['simple-driving','unity-bus'].includes(gameId));
const gameTitle=gameId==='unity-bus'?'Bus Test Game — Buss':'Simple Driving Game — Polisbil';
const artifactPrefix=gameId==='unity-bus'?'bus':'driving';
const base=process.env.GAME_BASE_URL||`http://127.0.0.1:8767/games/${gameId}/`;
fs.mkdirSync('test-results',{recursive:true});
const ocrBinary=`/tmp/joynes-${gameId}-frame-ocr`;
execFileSync('swiftc',['scripts/ocr-game-frame.swift','-o',ocrBinary]);
// Vision sometimes drops the thin slash in the native font; counter assertions stay line-anchored.
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
async function readFrame(page,name,counter=false){const path=`test-results/${artifactPrefix}-${name}.png`;await page.locator('canvas').screenshot({path});return JSON.parse(execFileSync(ocrBinary,[path,...(counter?['--counter']:[])],{encoding:'utf8'})).join('\n');}
async function startGame(page,navigate=true){
 if(navigate)await page.goto(base);await page.getByRole('button',{name:'Starta körspelet'}).click();
 await page.waitForFunction(()=>document.body.dataset.state==='warming',{},{timeout:90000});
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+500)));
 await page.clock.runFor(7000);await page.waitForFunction(()=>document.body.dataset.state==='playing');
 await page.clock.runFor(7000);await page.locator('canvas').scrollIntoViewIfNeeded();
 const box=await page.locator('canvas').boundingBox();assert(Math.abs(box.width/box.height-1.6)<.01);
 assert.deepEqual(await page.locator('canvas').evaluate(c=>[c.width,c.height]),[960,600]);
 return box;
}
async function mission(page,box,pose,mobile,cdp){
 let down=false;
 async function drive(turn,reverse=false){
  const point={x:box.x+box.width*(.5+.49*Math.max(-1,Math.min(1,turn))),y:box.y+box.height*(reverse?.975:.5)};
  if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:down?'touchMove':'touchStart',touchPoints:[{...point,id:7}]});
  else {await page.mouse.move(point.x,point.y);if(!down)await page.mouse.down();}
  down=true;
 }
 async function release(){if(!down)return;if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();down=false;}
 await drive(0,true);let reversed=false;
 for(let step=0;step<60;step++){await page.clock.runFor(100);if((await pose()).z < -4){reversed=true;break;}}
 assert(reversed,'Native brake/back must reverse through first gate');await release();await page.clock.runFor(700);
 let text=await readFrame(page,`${mobile?'touch':'mouse'}-gate-one`,true);
 if(!mobile)assert.match(text,/^1\s*\/?\s*3$/m,'Actual native HUD must count the first gate');
 // Approach from the south-west around the original parked cars and house.
 // Limit speed using the game's real brake so corners stay on this route.
 const targets=[{at:[16,34]},{at:[-32,32]},{at:[-39.64,49.64],gate:2},{at:[-39.6,-40],gate:3}];
 let previous=await pose();
 for(let targetIndex=0;targetIndex<targets.length;targetIndex++){
  const {at:target,gate}=targets[targetIndex];let reached=false;
  for(let step=0;step<800;step++){
   if(step%100===0){const sample=await pose();console.log('Mission',mobile?'touch':'mouse','target',targetIndex,'step',step,'position',JSON.stringify(sample));}
   const actual=await pose();assert(Math.abs(actual.x)<300&&Math.abs(actual.z)<300&&Math.abs(actual.y)<20,'Vehicle must remain in the real city');
   const remaining=Math.hypot(target[0]-actual.x,target[1]-actual.z);
   if(remaining<(gate?1:3)){reached=true;break;}
   const angle=Math.atan2(target[0]-actual.x,target[1]-actual.z)-actual.yaw;
   const error=Math.atan2(Math.sin(angle),Math.cos(angle));
   const signedSpeed=((actual.x-previous.x)*Math.sin(actual.yaw)+(actual.z-previous.z)*Math.cos(actual.yaw))/.1;
   const desiredSpeed=(Math.abs(error)>.3||remaining<12)?4:8;
   previous=actual;await drive(error*1.8,signedSpeed>desiredSpeed);await page.clock.runFor(100);
  }
  if(!reached){await page.screenshot({path:`test-results/${artifactPrefix}-${mobile?'touch':'mouse'}-stuck.png`});if(pose.samples)console.log('Observed native pose candidates',JSON.stringify(await pose.samples()));}
  assert(reached,'Drive to every actual gate using browser input');
  if(gate===2){text=await readFrame(page,`${mobile?'touch':'mouse'}-gate-two`,true);if(!mobile)assert.match(text,/^2\s*\/?\s*3$/m);}
 }
 await release();await page.clock.runFor(12000);
 text=await readFrame(page,`${mobile?'touch':'mouse'}-win`);assert.match(text,/You\s+WIN/i,'Actual native victory screen must appear');
 // Replay uses the real native button in the canvas, never a scene/state injection.
 const point={x:box.x+box.width*.5,y:box.y+box.height*.9};
 if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:7}]});await page.clock.runFor(120);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else {await page.mouse.move(point.x,point.y);await page.mouse.down();await page.clock.runFor(120);await page.mouse.up();}
 await page.clock.runFor(7000);
 text=await readFrame(page,`${mobile?'touch':'mouse'}-replay`,true);if(!mobile)assert.match(text,/^0\s*\/?\s*3$/m,'Replay must reset every gate');assert(!/You\s+WIN/i.test(text));
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 if(!process.env.DRIVING_TEST_RECOVERY_ONLY) {
 for(const mobile of (process.env.DRIVING_INPUT_MODE==='touch'?[true]:process.env.DRIVING_INPUT_MODE==='desktop'?[false]:[false,true])){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:1000},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:mobile?2:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.clock.install();let box=await startGame(page);const cdp=mobile?await context.newCDPSession(page):null;
  let pose=await observeDriver(page,async()=>{
   if(mobile){const gas=await page.locator('[data-control="gas"]').boundingBox();const point={x:gas.x+gas.width/2,y:gas.y+gas.height/2};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});await page.clock.runFor(300);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else {await page.locator('canvas').focus();await page.keyboard.down('ArrowUp');await page.clock.runFor(300);await page.keyboard.up('ArrowUp');}
  });
  if(!mobile){
   await page.locator('canvas').focus();await page.keyboard.down('ArrowUp');await page.clock.runFor(500);
   await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement?.tagName),'CANVAS');
   const coastStart=await pose();await page.clock.runFor(400);const coastEarly=distance(coastStart,await pose());
   await page.clock.runFor(2000);const coastLateStart=await pose();await page.clock.runFor(400);
   assert(distance(coastLateStart,await pose())<coastEarly*.8+.05,'Leaving keyboard focus must release gas and let native friction slow the car');
   await page.keyboard.up('ArrowUp');
   const before=await pose();await page.getByRole('button',{name:'Paus / alternativ'}).click();await page.clock.runFor(200);const paused=await pose();
   const text=await readFrame(page,'pause');assert.match(text,/Menu/);assert.match(text,/Shadows/);assert.match(text,/Framerate Counter/);
   await page.clock.runFor(2000);assert(distance(paused,await pose())<.005,'Actual native physics must stop while paused');
   await page.locator('canvas').focus();await page.keyboard.press('KeyP');await page.clock.runFor(200);assert(!/Framerate Counter/.test(await readFrame(page,'resumed')),'P must close native menu');
   // A real Tab navigates the HTML controls instead of trapping keyboard focus in Unity.
   await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement?.tagName),'CANVAS');
   assert(distance(before,paused)<2);
  }else{
   const gas=await page.locator('[data-control="gas"]').boundingBox(),right=await page.locator('[data-control="right"]').boundingBox();
   const points=[{x:gas.x+gas.width/2,y:gas.y+gas.height/2,id:1},{x:right.x+right.width/2,y:right.y+right.height/2,id:2}];
   const before=await pose();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await page.clock.runFor(1200);const turned=await pose();
   assert(distance(before,turned)>2);assert(Math.abs(turned.yaw-before.yaw)>.2,'Two fingers must really accelerate and steer');
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
   assert.equal(await page.locator('[aria-pressed="true"]').count(),0,'Canceled fingers must release every virtual button');
   await page.clock.runFor(1000);
   // Restore the initial city through the visible restart control for the full touch mission.
   await page.getByRole('button',{name:'Börja om'}).click();await page.getByRole('button',{name:'Starta körspelet'}).waitFor();box=await startGame(page,false);
   pose=await observeDriver(page,async()=>{const pt={x:box.x+box.width*.5,y:box.y+box.height*.5};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...pt,id:7}]});await page.clock.runFor(300);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});});
  }
  await page.screenshot({path:`test-results/${artifactPrefix}-${mobile?'mobile':'desktop'}-page.png`,fullPage:true});
  box=await page.locator('canvas').boundingBox();await mission(page,box,pose,mobile,cdp);
  await page.getByRole('button',{name:'Helskärm',exact:true}).click();await page.waitForFunction(()=>Boolean(document.fullscreenElement));
  const full=await page.locator('canvas').boundingBox();assert(Math.abs(full.width/full.height-1.6)<.01);
  assert(await page.locator('[data-control="gas"]').isVisible());
  assert(await page.getByRole('button',{name:'Paus',exact:true}).isVisible());
  await page.getByRole('button',{name:'Lämna helskärm',exact:true}).click();await page.waitForFunction(()=>!document.fullscreenElement);
  assert.deepEqual(errors,[]);
  await page.evaluate(()=>{window.__testQuitDone=false;instance.Quit().then(()=>window.__testQuitDone=true)});
  for(let attempt=0;attempt<50;attempt++){await page.clock.runFor(100);if(await page.evaluate(()=>window.__testQuitDone))break;}
  assert(await page.evaluate(()=>window.__testQuitDone),'Official Unity Quit must release the runtime');
  await context.close();console.log(`${mobile?'Mobile touch':'Desktop keyboard/mouse'}: full three-gate mission, actual victory/replay, steering, pause/release, aspect and fullscreen passed`);
 }

 const homebase=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
 const home=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await home.goto(homebase+'#games/retro');
 await home.locator('#contentList .item-title a').getByText(gameTitle,{exact:true}).click();
 await home.waitForFunction(id=>location.hash==='#games/retro/'+id,gameId);
 const [opened]=await Promise.all([home.context().waitForEvent('page'),home.getByRole('link',{name:'Play',exact:true}).first().click()]);
 await opened.waitForLoadState();assert.equal(new URL(opened.url()).pathname,new URL(base).pathname);
 await opened.getByRole('button',{name:'Starta körspelet'}).waitFor();
 await home.goto(homebase+'#games/ai');await home.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='AI games');
 assert(!(await home.locator('#contentList').innerText()).includes(gameTitle));
 await opened.close();await home.close();console.log('Homepage: Retro detail, actual game link in own tab and AI exclusion passed');
 }
 for(const blocked of ['cartWeb2.loader.js','cartWeb2.wasm','cartWeb2.data','cartWeb2.framework.js']){
  const context=await browser.newContext({viewport:{width:1280,height:1000}});const page=await context.newPage();await page.clock.install();
  await page.route('**/Build/'+blocked,route=>route.abort());await page.goto(base);
  await page.getByRole('button',{name:'Starta körspelet'}).click();
  await page.waitForFunction(()=>document.body.dataset.state==='error',{},{timeout:90000});
  assert.match(await page.locator('#status').innerText(),/kunde inte laddas/);
  await page.unroute('**/Build/'+blocked);await page.getByRole('button',{name:'Försök igen'}).click();
  await page.waitForFunction(()=>document.body.dataset.state==='warming',{},{timeout:90000});
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+500)));await page.clock.runFor(7000);
  await page.waitForFunction(()=>document.body.dataset.state==='playing');await page.clock.runFor(7000);await page.locator('canvas').scrollIntoViewIfNeeded();
  const pose=await observeDriver(page,async()=>{await page.locator('canvas').focus();await page.keyboard.down('ArrowUp');await page.clock.runFor(300);await page.keyboard.up('ArrowUp');});
  assert((await pose()).z>3.3,'Recovery must reach a genuinely driveable native scene');
  await page.evaluate(()=>{window.__testQuitDone=false;instance.Quit().then(()=>window.__testQuitDone=true)});
  for(let attempt=0;attempt<50;attempt++){await page.clock.runFor(100);if(await page.evaluate(()=>window.__testQuitDone))break;}
  assert(await page.evaluate(()=>window.__testQuitDone));await context.close();console.log('Blocked '+blocked+': visible error, retry and actual driving passed');
 }
 }finally{let timer;await Promise.race([browser.close(),new Promise(resolve=>{timer=setTimeout(resolve,10000)})]);clearTimeout(timer);assert(!browser.isConnected(),'Browser must disconnect after runtime cleanup');}
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
