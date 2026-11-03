const assert=require('node:assert/strict'),fs=require('node:fs');
const{chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.ENHANCED_BASE_URL||'http://127.0.0.1:8834/games/car-topview/enhanced/';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const state=p=>p.evaluate(async()=>{const d=(await import(document.querySelector('script[type=module]').src)).readGame();return{...d,race:d.race?{...d.race,ghost:undefined}:null};});
function nearest(path,r){let min=Infinity,index=0;path.forEach((p,i)=>{const d=Math.hypot(p[0]-r.x,p[1]-r.y);if(d<min){min=d;index=i;}});return index;}
async function drive(p,touch=false){
 const c=(await state(p)).course,held=new Set();let cdp,origin,owner,boostPoint,boosting=false;
 if(touch){cdp=await p.context().newCDPSession(p);const r=await p.locator('canvas').boundingBox();origin={x:r.x+r.width*.2,y:r.y+r.height*.78,id:1};owner={...origin};const b=await p.locator('#boost').boundingBox();boostPoint={x:b.x+b.width/2,y:b.y+b.height/2,id:2};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[owner]});}
 let final;
 for(let tick=0;tick<700;tick++){
  const r=(await state(p)).race;final=r;if(r.status!=='running')break;
  const path=c.path,i=nearest(path,r),goal=path[(i+10)%path.length],aim=Math.atan2(goal[1]-r.y,goal[0]-r.x),error=Math.atan2(Math.sin(aim-r.angle),Math.cos(aim-r.angle)),steer=Math.max(-1,Math.min(1,error*2.5)),throttle=r.speed<155?1:0;
  if(touch){const rect=await p.locator('canvas').boundingBox();owner={...origin,x:origin.x+steer*55*rect.width/960,y:origin.y-throttle*55*rect.height/640};const wantBoost=Math.abs(error)<.10&&r.speed>100&&r.energy>30;
   if(wantBoost!==boosting){boosting=wantBoost;await cdp.send('Input.dispatchTouchEvent',{type:boosting?'touchStart':'touchEnd',touchPoints:boosting?[owner,boostPoint]:[boostPoint]});}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:boosting?[owner,boostPoint]:[owner]});
  }else{
   const wanted=new Set([...(throttle?['KeyW']:[]),...(error>.08?['ArrowRight']:error<-.08?['ArrowLeft']:[])]);
   for(const k of held)if(!wanted.has(k)){await p.keyboard.up(k);held.delete(k);}for(const k of wanted)if(!held.has(k)){await p.keyboard.down(k);held.add(k);}
  }
  await p.clock.runFor(80);
 }
 for(const k of held)await p.keyboard.up(k);if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();}
 final=(await state(p)).race;assert.equal(final.status,'won',c.id+' completes through '+(touch?'native touch':'physical keyboard')+' '+JSON.stringify(final));assert.equal(final.next,9);return final;
}
(async()=>{fs.mkdirSync('test-results',{recursive:true});const browser=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{}:{channel:'chrome',headless:true});try{
 for(const viewport of[{width:1280,height:1000},{width:390,height:844},{width:844,height:390}]){
  const mobile=viewport.width<1000,context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.clock.install();await p.goto(base);try{await p.locator('#start:enabled').waitFor();}catch(e){console.error({loading:await p.locator('#loading').textContent(),errors});throw e;}assert.equal(await p.locator('.course:disabled').count(),2);
  await p.locator('#start').focus();await p.keyboard.press('Enter');await p.clock.runFor(80);await delay(100);const initial=await state(p);assert.equal(initial.audio.state,'running');for(const b of Object.values(initial.audio.buffers))assert(b.duration>.4&&b.nonzero,'generated asset decodes to real audio');await delay(100);assert((await state(p)).audio.peak>.00001,'actual generated audio reaches the output');
  for(let course=0;course<3;course++){
   const won=await drive(p,mobile);assert.equal(won.penalty,0,'all courses have a clean playable line');await p.screenshot({path:`test-results/night-circuit-${viewport.width}-${course}.png`});
   if(course<2){await p.locator('#next').focus();await p.keyboard.press('Enter');await p.clock.runFor(60);}
  }
  assert.equal(await p.locator('#result-kicker').innerText(),'ALL COURSES CLEARED');await p.locator('#menu-button').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.course:disabled').count(),0);assert.equal(await p.locator('#progress').innerText(),'3 / 3 cleared');await p.reload();await p.locator('#start:enabled').waitFor();assert.equal(await p.locator('#progress').innerText(),'3 / 3 cleared','records and unlocks persist');
  await p.locator('#start').focus();await p.keyboard.press('Enter');await p.clock.runFor(100);assert((await p.evaluate(()=>JSON.parse(localStorage.getItem('joynes:night-circuit:v1')).courses.port.ghost.length))>30,'best-lap ghost stored separately from original game');if(mobile)await drive(p,false);
  assert.deepEqual(errors,[]);await context.close();console.log('PASS Night Circuit',viewport.width,'all three real courses, ordered checkpoints, medals, unlocks, saved ghost and '+(mobile?'simultaneous touch boost plus attached keyboard':'keyboard driving'));
 }
 for(const asset of['courses.json','car.png','course-port.jpg','course-switchback.jpg','course-garden.jpg','music.mp3','engine.mp3','chime.mp3','app.mjs','core.mjs','game-view.mjs']){
  const p=await browser.newPage();await p.clock.install();let blocked=true;await p.route('**/'+asset+'*',r=>blocked?r.fulfill({status:503,body:'Unavailable'}):r.continue());await p.goto(base);await p.locator('#retry:not([hidden])').waitFor();assert.equal(await p.locator('#start').isDisabled(),true);blocked=false;await p.locator('#retry').click();await p.locator('#start:enabled').waitFor();await p.locator('#start').click();await p.keyboard.down('KeyW');await p.clock.runFor(500);await p.keyboard.up('KeyW');assert((await state(p)).race.speed>80,'recovery returns to actual driving: '+asset);await p.close();
 }
 console.log('PASS all eleven failed asset/module loads recover to playable driving');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
