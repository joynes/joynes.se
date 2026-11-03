const assert=require('node:assert/strict'),fs=require('node:fs');const{chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8804/games/quiz-sdl/';
async function answer(p){const word=await p.locator('#letters img').evaluateAll(imgs=>imgs.map(i=>i.alt).join('').toLowerCase());return p.locator('#options').getByRole('button',{name:word,exact:true});}
async function coins(p){return +(await p.locator('#coins').innerText());}
(async()=>{fs.mkdirSync('test-results',{recursive:true});const b=await chromium.launch();try{
 for(const mobile of[false,true]){const ctx=await b.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.locator('#stages button').first().focus();await p.keyboard.press('Enter');
 for(let i=0;i<5;i++){await (await answer(p)).focus();await p.keyboard.press('Space');assert.equal(await coins(p),i+1);await p.keyboard.press('Enter');}
 assert.equal(await p.locator('#replay').isVisible(),true);await p.locator('#replay').focus();await p.keyboard.press('Space');assert.equal(await coins(p),0);
 const a=await answer(p);await a.focus();await p.keyboard.down('Space');await p.locator('#back').focus();await p.keyboard.up('Space');assert.equal(await coins(p),0);await p.keyboard.press('Enter');
 if(mobile){await p.locator('#stages button').nth(1).tap();const cdp=await ctx.newCDPSession(p);
  async function point(l,id=1){await l.scrollIntoViewIfNeeded();const r=await l.boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2,id};}
  async function cancel(l){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point(l)]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});}
  let correct=await answer(p);await cancel(correct);assert.equal(await coins(p),0);assert.equal(await p.locator('#next').isVisible(),false);
  const other=p.locator('#options button').filter({hasNot:p.locator('img[alt="'+await correct.locator('img').getAttribute('alt')+'"]')}).first();
  const one=await point(correct),two=await point(other,2);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[one]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[one,two]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[two]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert((await coins(p))<=1);
  if(!(await p.locator('#next').isVisible()))await correct.tap();assert.equal(await coins(p),1);await cancel(p.locator('#next'));assert.equal(await p.locator('#next').isVisible(),true);await p.locator('#next').tap();
  const held=await point(await answer(p));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held]});const second=await ctx.newPage();await second.goto('about:blank');await second.bringToFront();await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await p.bringToFront();await second.close();assert.equal(await coins(p),1);
  for(let i=1;i<12;i++){const correct=await answer(p);if(i%2){await correct.focus();await p.keyboard.press('Space');await p.keyboard.press('Enter');}else{await correct.tap();await p.locator('#next').tap();}assert.equal(await coins(p),i+1);}
  assert.equal(await p.locator('#replay').isVisible(),true);await p.locator('#replay').tap();assert.equal(await coins(p),0);await p.screenshot({path:'test-results/quiz-sdl-input-portrait.png',fullPage:true});await p.setViewportSize({width:844,height:390});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:'test-results/quiz-sdl-input-landscape.png',fullPage:true});await (await answer(p)).tap();assert.equal(await coins(p),1);await cdp.detach();
 }
 assert.deepEqual(errors,[]);await ctx.close();console.log('PASS reading input:',mobile?'touch, attached keyboard, multi-touch release/cancel, focus, replay and orientation':'full keyboard course, focus cleanup and replay');}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
