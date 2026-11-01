const assert=require('node:assert/strict');const{chromium}=require('playwright');const fs=require('node:fs');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/godot-reading/';
const home=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
async function center(page,id){const r=await page.locator(`[data-id="${id}"]`).boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2};}
async function at(page,x,y){const b=await page.locator('#board').boundingBox();return{x:b.x+x/1024*b.width,y:b.y+y/600*b.height};}
async function drag(page,id,x,y,{touch=false,hold=false,cancel=false}={}){
 const p=await center(page,id),q=await at(page,x,y);let cdp;
 if(touch){cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});}
 else{await page.mouse.move(p.x,p.y);await page.mouse.down();}
 for(let i=1;i<=30;i++){const xy={x:p.x+(q.x-p.x)*i/30,y:p.y+(q.y-p.y)*i/30};if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...xy,id:1}]});else await page.mouse.move(xy.x,xy.y);}
 if(!hold){if(touch)await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});else await page.mouse.up();}
 if(cdp)await cdp.detach();
}
async function start(page){await page.goto(base);await page.clock.install();await page.locator('#start').click();await page.clock.runFor(6000);}
async function reset(page){await page.locator('#reset').click();await page.clock.runFor(6000);}
async function pos(page,id){return page.locator(`[data-id="${id}"]`).evaluate(b=>({x:parseFloat(b.style.left)*1024/100,y:parseFloat(b.style.top)*600/100}));}
async function success(page){assert.match(await page.locator('#feedback').innerText(),/^Rätt!/);}
async function notSuccess(page){assert.doesNotMatch(await page.locator('#feedback').innerText(),/^Rätt!/);}
(async()=>{fs.mkdirSync('test-results',{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'}),errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});await start(page);
 assert.equal(await page.locator('.object').count(),3);assert.equal(await page.locator('.platform').count(),2);
 assert.ok((await pos(page,'rocket')).y>540);await notSuccess(page);
 // Right is not enough: both proximity and standing near a surface matter.
 await drag(page,'rocket',500,540);await drag(page,'baloon',700,540);await page.clock.runFor(1000);await notSuccess(page);
 await drag(page,'baloon',465,540);await page.clock.runFor(1000);await notSuccess(page);
 await drag(page,'baloon',535,250,{hold:true});await page.clock.runFor(2000);await notSuccess(page);assert.equal(await page.locator('[data-id="baloon"]').getAttribute('aria-pressed'),'true');await page.mouse.up();await page.clock.runFor(6000);await success(page);
 for(const[x,y]of[[150,205],[650,380],[500,540]]){
  await reset(page);await drag(page,'rocket',x,y);await drag(page,'baloon',x+35,y);await page.clock.runFor(6000);await success(page);
  const a=await pos(page,'baloon'),b=await pos(page,'rocket');assert.ok(a.x>b.x);assert.ok(Math.abs(a.y-b.y)<2);
 }
 await page.screenshot({path:'test-results/godot-reading-desktop.png',fullPage:true});
 await page.locator('#again').click();await page.clock.runFor(6000);await notSuccess(page);
 // Third original object remains physical and draggable; release from above a shelf.
 await drag(page,'gun',250,120);const before=await pos(page,'gun');await page.clock.runFor(6000);const after=await pos(page,'gun');assert.ok(after.y>before.y+50);assert.ok(after.y<230);
 await reset(page);const balloon=page.locator('[data-id="baloon"]');await balloon.focus();await page.keyboard.press('Space');for(let i=0;i<24;i++)await page.keyboard.press('ArrowRight');await page.keyboard.press('Space');await page.clock.runFor(1000);await success(page);
 await reset(page);await balloon.focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowUp');await page.keyboard.press('Escape');assert.equal(await balloon.getAttribute('aria-pressed'),'false');
 await page.keyboard.press('Space');await page.keyboard.press('Tab');assert.equal(await balloon.getAttribute('aria-pressed'),'false');
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await ctx.newPage();await start(mobile);
 await drag(mobile,'rocket',500,540,{touch:true});await drag(mobile,'baloon',535,540,{touch:true});await mobile.clock.runFor(1000);await success(mobile);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mobile.screenshot({path:'test-results/godot-reading-mobile.png',fullPage:true});const rocketBefore=await pos(mobile,'rocket');await drag(mobile,'baloon',750,540,{touch:true});await mobile.clock.runFor(1000);await notSuccess(mobile);assert.ok((await pos(mobile,'baloon')).x>700);assert.ok(Math.abs((await pos(mobile,'rocket')).x-rocketBefore.x)<2);await drag(mobile,'baloon',535,540,{touch:true});await mobile.clock.runFor(1000);await success(mobile);await reset(mobile);
 await drag(mobile,'gun',250,100,{touch:true,cancel:true});assert.equal(await mobile.locator('[data-id="gun"]').getAttribute('aria-pressed'),'false');await mobile.clock.runFor(6000);assert.ok((await pos(mobile,'gun')).y>200);
 await mobile.setViewportSize({width:844,height:390});await reset(mobile);await drag(mobile,'rocket',650,380,{touch:true});await drag(mobile,'baloon',685,380,{touch:true});await mobile.clock.runFor(6000);await success(mobile);await mobile.screenshot({path:'test-results/godot-reading-landscape.png',fullPage:true});
 const failed=await browser.newPage();let fail=true;await failed.route('**/core.mjs',r=>fail?r.fulfill({status:503,body:'Unavailable'}):r.continue());await failed.goto(base);await failed.locator('#load-error').waitFor();fail=false;await failed.getByRole('button',{name:'Försök igen',exact:true}).click();await failed.locator('#start').click();await failed.locator('#board').waitFor();
 if(process.env.CHECK_GAMES_NAV){await page.goto(home+'#games/retro');await page.getByRole('link',{name:'Läs och placera',exact:true}).first().click();await page.frameLocator('iframe[title="Läs och placera"]').locator('#start').click();await page.goto(home+'#games/ai');assert.ok(!(await page.locator('#contentList').innerText()).includes('Läs och placera'));}
 console.log('Passed: original three objects and two platforms; wrong/far/airborne placements; actual mouse solves on both platforms and floor; gravity and third object; replay; keyboard solve and release; real touch solve, cancellation, portrait/landscape; failed-module recovery; optional catalog categories.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
