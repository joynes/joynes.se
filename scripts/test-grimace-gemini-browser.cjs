const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/grimace-gemini/';
async function solve(page, wrong=false) {
  const text=await page.locator('#question').innerText();
  const [,a,op,b]=text.match(/(\d+) ([+−]) (\d+)/);
  const answer=op==='+'?+a + +b:+a - +b;
  if(wrong) {
    const buttons=page.locator('#options button');
    for(let i=0;i<4;i++) if(+(await buttons.nth(i).innerText())!==answer) {await buttons.nth(i).click();break;}
    assert.match(await page.locator('#feedback').innerText(),/Försök igen/);
  }
  await page.locator('#options').getByRole('button',{name:String(answer),exact:true}).click();
  assert.equal(await page.locator('#options button:disabled').count(),4);
  assert.equal(await page.locator('#next').isVisible(),true);
}
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{headless:true}:{headless:true,channel:'chrome'});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('[data-mode="plus"]').click();
  for(let i=0;i<12;i++) {await solve(page,i===0);if(i<11) await page.locator('#next').click();}
  assert.match(await page.locator('#score').innerText(),/12 frågor/);
  await page.screenshot({path:'test-results/grimace-desktop.png',fullPage:true});
  await page.locator('#back').click();await page.locator('[data-mode="minus"]').click();
  await page.waitForTimeout(650); assert.match(await page.locator('#score').innerText(),/0 frågor/);
  await solve(page);await page.reload();
  assert.match(await page.locator('#progress').innerText(),/Plus 12 · Minus 1/);
  await page.keyboard.press('Tab'); // Keyboard activation is also tested with explicit focus.
  await page.locator('[data-mode="minus"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#question').evaluate(el=>el===document.activeElement),true);
  assert.deepEqual(errors,[]);
  const mobile=await browser.newContext({viewport:{width:360,height:740},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const touch=await mobile.newPage(); await touch.goto(base);await touch.locator('[data-mode="minus"]').tap();
  await solve(touch,true);await touch.locator('#next').tap();
  assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await touch.screenshot({path:'test-results/grimace-mobile.png',fullPage:true});
  for(const broken of ['corrupt','blocked']) {
    const context=await browser.newContext();
    await context.addInitScript(kind=>{
      if(kind==='blocked') Object.defineProperty(window,'localStorage',{get(){throw Error('Blocked')}});
      else localStorage.setItem('grimaceMathScores','{broken');
    },broken);
    const p=await context.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(base);await p.locator('[data-mode="plus"]').click();await solve(p);
    if(broken==='blocked') assert.equal(await p.locator('#storage-note').isVisible(),true);
    assert.deepEqual(errs,[]);await context.close();
  }
  console.log('Passed: plus/minus, 13 answers, retry, persistence, keyboard, mobile, canceled transitions and blocked/corrupt storage.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
