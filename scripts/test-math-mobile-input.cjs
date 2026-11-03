const assert=require('node:assert/strict'),fs=require('node:fs');
const{chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const id=process.env.MATH_GAME_ID||'grimace-gemini';
const base=process.env.GAME_BASE_URL||`http://127.0.0.1:8804/games/${id}/`;
const codex=id==='grimace-codex';
async function correct(p){const t=await p.locator('#question').innerText();const[,a,op,b]=t.match(/(\d+)\s*([+−-])\s*(\d+)/);return p.locator('#options').getByRole('button',{name:String(op==='+'?+a + +b:+a - +b),exact:true});}
async function score(p){return +(await p.locator('#score').innerText()).match(/\d+/)[0];}
(async()=>{fs.mkdirSync('test-results',{recursive:true});const b=await chromium.launch();try{
 const desktop=await b.newPage({viewport:{width:1280,height:900}});await desktop.goto(base);
 for(const mode of ['plus','minus']){await desktop.locator(`[data-mode="${mode}"]`).focus();await desktop.keyboard.press('Enter');for(let n=0;n<3;n++){await (await correct(desktop)).focus();await desktop.keyboard.press('Space');assert.equal(await score(desktop),n+1);await desktop.keyboard.press('Enter');}await desktop.locator('#back').focus();await desktop.keyboard.press('Enter');}
 await desktop.close();
 const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);const cdp=await ctx.newCDPSession(p);
 async function point(l,id=1){await l.scrollIntoViewIfNeeded();const r=await l.boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2,id};}
 async function cancel(l){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point(l)]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});}
 for(const mode of ['plus','minus']){
  await p.locator(`[data-mode="${mode}"]`).focus();await p.keyboard.press('Enter');
  let a=await correct(p);await cancel(a);assert.equal(await score(p),0);assert.equal(await p.locator('#next').isVisible(),false);
  await a.focus();await p.keyboard.down('Space');await p.locator('#back').focus();await p.keyboard.up('Space');assert.equal(await score(p),0,'moving keyboard focus cancels the held answer');
  const held=await point(a);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held]});const second=await ctx.newPage();await second.goto('about:blank');await second.bringToFront();await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await p.bringToFront();await second.close();assert.equal(await score(p),0,'cancel after lost focus never answers');
  const other=p.locator('#options button').filter({hasNotText:await a.innerText()}).first();const one=await point(a),two=await point(other,2);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[one]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[one,two]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[two]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert((await score(p))<=1,'independent contact release cannot award twice');
  if(!(await p.locator('#next').isVisible()))await a.tap();assert.equal(await score(p),1);assert.equal(await p.locator('#options button:disabled').count(),4);
  await cancel(p.locator('#next'));assert.equal(await score(p),1);assert.equal(await p.locator('#next').isVisible(),true);
  await p.locator('#next').tap();await (await correct(p)).focus();await p.keyboard.press('Space');assert.equal(await score(p),2);await p.keyboard.press('Enter');
  // Complete the fixed Codex course; sample the open-ended Gemini progression.
  for(let n=2;n<(codex?10:6);n++){await (await correct(p)).tap();assert.equal(await score(p),n+1);await p.locator('#next').tap();}
  if(codex){assert.equal(await p.locator('#restart').isVisible(),true);await p.locator('#restart').focus();await p.keyboard.press('Space');assert.equal(await score(p),0);assert.equal(await p.locator('#options button').count(),4);}
  await p.locator('#back').focus();await p.keyboard.press('Enter');await p.keyboard.up('Enter');assert.equal(await p.locator('#menu').isVisible(),true);
 }
 await p.locator('[data-mode="plus"]').tap();await p.screenshot({path:`test-results/${id}-input-portrait.png`,fullPage:true});await p.setViewportSize({width:844,height:390});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:`test-results/${id}-input-landscape.png`,fullPage:true});await p.locator('#back').tap();await p.locator('[data-mode="minus"]').tap();assert.equal(await p.locator('#options button').count(),4);assert.deepEqual(errors,[]);await ctx.close();console.log('PASS',id,'mobile keyboard, real touch, two contacts/independent release, cancel, blur, both modes, progress and replay');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
