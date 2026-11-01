const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/grimace-codex/';
async function answer(page,wrong=false,touch=false){
 const text=await page.locator('#question').innerText();const [,a,op,b]=text.match(/(\d+) ([+−]) (\d+)/);const result=op==='+'?+a + +b:+a - +b;
 if(wrong){for(const button of await page.locator('#options button').all()){if(+(await button.innerText())!==result){await button.click();break;}}assert.match(await page.locator('#feedback').innerText(),/Försök igen/);}
 const button=page.locator('#options').getByRole('button',{name:String(result),exact:true});
 await button[touch?'tap':'click']();assert.equal(await page.locator('#options button:disabled').count(),4);
}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  for(const mode of ['plus','minus']){
   await page.locator(`[data-mode="${mode}"]`).click();
   for(let n=0;n<10;n++){await answer(page,n===0);assert.match(await page.locator('#score').innerText(),new RegExp(`${n+1} av 10`));await page.locator('#next').click();}
   assert.match(await page.locator('#question').innerText(),/alla frågor/);assert.equal(await page.locator('#restart').isVisible(),true);
   if(mode==='plus')await page.screenshot({path:'test-results/grimace-codex-desktop.png',fullPage:true});
   await page.locator('#back').click();
  }
  await page.reload();assert.match(await page.locator('#progress').innerText(),/Plus 10\/10 · Minus 10\/10/);
  await page.locator('[data-mode="plus"]').focus();await page.keyboard.press('Enter');await page.locator('#restart').click();
  assert.match(await page.locator('#question').innerText(),/1 \+ 2/);await answer(page);
  await page.reload();await page.locator('[data-mode="plus"]').click();assert.match(await page.locator('#question').innerText(),/2 \+ 5/);
  await page.locator('#back').click();await page.locator('#exit').click();assert.equal(await page.locator('#exit-screen').isVisible(),true);
  await page.locator('#return').click();assert.equal(await page.locator('#menu').isVisible(),true);assert.deepEqual(errors,[]);
  const ctx=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const p=await ctx.newPage();await p.goto(base);await p.locator('[data-mode="minus"]').tap();await answer(p,true,true);
  await p.screenshot({path:'test-results/grimace-codex-mobile.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  for(const blocked of [false,true]){
   const c=await browser.newContext();await c.addInitScript(block=>{if(block)Object.defineProperty(window,'localStorage',{get(){throw Error()}});else {localStorage.setItem('plusIndex','broken');localStorage.setItem('minusIndex','999');}},blocked);
   const q=await c.newPage();const errs=[];q.on('pageerror',e=>errs.push(e.message));await q.goto(base);await q.locator('[data-mode="plus"]').click();await answer(q);await q.locator('#next').click();
   if(blocked)assert.equal(await q.locator('#storage-note').isVisible(),true);assert.deepEqual(errs,[]);await c.close();
  }
  console.log('Passed: all 20 questions, both endings, replay, answer lock, retry, saved resume, exit, keyboard, touch and storage recovery.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
