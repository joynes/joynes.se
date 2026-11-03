const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/marble-tables/';
const regions=path=>JSON.parse(execFileSync('python3',['scripts/marble-vision.py',path],{encoding:'utf8'}));
(async()=>{
 fs.mkdirSync('test-results',{recursive:true});
 const browser=await chromium.launch(process.env.RALL_HEADLESS_SHELL?{args:['--enable-unsafe-swiftshader']}:{channel:'chrome',headless:true});
 try{
 for(const mobile of (process.env.MARBLE_TOUCH_CANCEL?[true]:[false,true])){
  const context=await browser.newContext({viewport:mobile?(process.env.MARBLE_LANDSCAPE?{width:844,height:390}:{width:390,height:844}):{width:1280,height:850},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.clock.install();await page.goto(base);await page.getByRole('button',{name:'Start playground'}).click();
  await page.waitForFunction(()=>document.body.dataset.state==='playing',{},{timeout:60000});
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+500)));
  const canvas=page.locator('canvas');await canvas.scrollIntoViewIfNeeded();const box=await canvas.boundingBox();
  assert(Math.abs(box.width/box.height-1.6)<.01);assert(box.x>=0&&box.x+box.width<=await page.evaluate(()=>innerWidth)+1);
  if(process.env.MARBLE_LANDSCAPE)assert(box.y>=0&&box.y+box.height<=390,'entire native scene must fit in the landscape viewport');
  assert.deepEqual(await canvas.evaluate(c=>[c.width,c.height]),[960,600]);
  const path=`test-results/marble-${mobile?'touch':'mouse'}.png`;
  const cdp=mobile?await context.newCDPSession(page):null;
  const to={x:box.x+box.width*80/960,y:box.y+box.height*90/600};
  let grabbed=false;
  await page.clock.runFor(6000);
  // A random moving/partly occluded sphere may escape the sampled pointer.
  // Resample actual frames; success still requires an observed held sphere and fall.
  for(let attempt=0;attempt<8&&!grabbed;attempt++){
   await page.clock.runFor(1000);await canvas.screenshot({path});
   const ball=regions(path).filter(r=>r.y>20&&r.y<box.height-30&&r.x>40&&r.x<box.width-30).sort((a,b)=>b.area-a.area)[0];
   if(!ball)continue;
   const from={x:box.x+ball.x,y:box.y+ball.y};
   if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...from,id:1}]});
   else {await page.mouse.move(from.x,from.y);await page.mouse.down();}
   await page.clock.runFor(100);
   if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...to,id:1}]});
   else await page.mouse.move(to.x,to.y);
   await page.clock.runFor(600);await canvas.screenshot({path});
   const near=regions(path).find(r=>Math.hypot(r.x-box.width*80/960,r.y-box.height*90/600)<box.width*35/960);
   if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:process.env.MARBLE_TOUCH_CANCEL?'touchCancel':'touchEnd',touchPoints:[]});else await page.mouse.up();
   await page.clock.runFor(500);await canvas.screenshot({path});
   if(near){
    assert(!regions(path).some(r=>Math.hypot(r.x-near.x,r.y-near.y)<box.width*30/960),'Released sphere must fall under native gravity');
    grabbed=true;
   }
  }
  assert(grabbed,`${mobile?'Touch':'Mouse'} must actually move and hold a native sphere`);
  await page.screenshot({path:`test-results/marble-${mobile?'mobile':'desktop'}-page.png`});
  await page.getByRole('button',{name:'Restart'}).click();await page.getByRole('button',{name:'Start playground'}).waitFor();
  await page.getByRole('button',{name:'Start playground'}).click();await page.waitForFunction(()=>document.body.dataset.state==='playing',{},{timeout:60000});
  await page.getByRole('button',{name:'Fullscreen',exact:true}).click();
  await page.waitForFunction(()=>Boolean(document.fullscreenElement));
  await page.evaluate(()=>document.exitFullscreen());
  assert.deepEqual(errors,[]);await context.close();console.log(`${mobile?'touch mobile':'mouse desktop'}: actual spawn, drag, hold, gravity, aspect ratio and restart passed`);
 }
 if(process.env.MARBLE_TOUCH_CANCEL){console.log('PASS actual touch cancellation releases the native marble under gravity');return;}
 const home=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const homebase=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
 await home.goto(homebase+'#games/retro');
 await home.locator('#contentList .item-title a').getByText('Marble Tables',{exact:true}).click();
 await home.waitForFunction(()=>location.hash==='#games/retro/marble-tables');
 const link=home.getByRole('link',{name:'Play',exact:true}).first();
 const [opened]=await Promise.all([home.context().waitForEvent('page'),link.click()]);
 await opened.waitForLoadState();
 assert.equal(new URL(opened.url()).pathname,new URL(base).pathname);
 await opened.getByRole('button',{name:'Start playground'}).click();
 await opened.waitForFunction(()=>document.body.dataset.state==='playing',{},{timeout:60000});
 await home.goto(homebase+'#games/ai');
 await home.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='AI games');
 assert(!(await home.locator('#contentList').innerText()).includes('Marble Tables'));
 await opened.close();await home.close();console.log('Homepage: Retro category, own-tab launch and AI filtering passed');
 for (const blocked of ['webtest2.wasm','webtest2.loader.js']) {
 const recovery=await browser.newPage();
 await recovery.route('**/Build/'+blocked,r=>r.abort());
 await recovery.goto(base);await recovery.getByRole('button',{name:'Start playground'}).click();
 await recovery.waitForFunction(()=>document.body.dataset.state==='error',{},{timeout:60000});
 await recovery.unroute('**/Build/'+blocked);
 await recovery.getByRole('button',{name:'Try again'}).click();
 await recovery.waitForFunction(()=>document.body.dataset.state==='playing',{},{timeout:60000});
 await recovery.close();console.log(`Blocked ${blocked}: visible error and successful retry passed`);
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
