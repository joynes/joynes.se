const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/quiz-sdl/';
async function solve(page,wrong=false,touch=false){
 const letters=await page.locator('#letters img').evaluateAll(imgs=>imgs.map(i=>i.alt).join('').toLowerCase());
 if(wrong){for(const b of await page.locator('#options button').all())if(await b.getAttribute('class')!== 'correct' && (await b.locator('img').getAttribute('alt'))!==letters){await b.click();break;}assert.match(await page.locator('#feedback').innerText(),/Försök igen/);}
 const correct=page.locator('#options').getByRole('button',{name:letters,exact:true});await correct[touch?'tap':'click']();assert.equal(await page.locator('#options button:disabled').count(),4);return letters;
}
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{headless:true}:{headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],bad=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
  await page.addInitScript(()=>{const OriginalAudio=window.Audio;window.audioEvents=[];window.Audio=function(src){const a=new OriginalAudio(src);a.addEventListener('playing',()=>window.audioEvents.push(src));return a;};});
  await page.goto(base);await page.locator('#stages button').first().click();
  await page.locator('#letters button').first().click();await page.waitForFunction(()=>audioEvents.some(s=>s.includes('letter_')));
  await page.locator('#back').click();
  for(const [stage,count]of [5,12,18].entries()){
   await page.locator('#stages button').nth(stage).click();const seen=[];
   for(let i=0;i<count;i++){
    seen.push(await solve(page,i===0));assert.equal(await page.locator('#coins').innerText(),String(i+1));
    const images=await page.locator('#options img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().then(()=>true,()=>false))));assert.ok(images.every(Boolean));
    if(i===0&&stage===2)await page.screenshot({path:'test-results/quiz-sdl-desktop.png',fullPage:true});
    await page.locator('#next').click();
   }
   assert.equal(new Set(seen).size,count);assert.match(await page.locator('#prompt').innerText(),/Banan klar/);
   await page.locator('#replay').click();assert.equal(await page.locator('#coins').innerText(),'0');await page.locator('#back').click();
  }
  assert.ok(await page.evaluate(()=>audioEvents.some(s=>s.includes('correct_answer'))));
  await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
  await page.locator('#stages button').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#prompt').evaluate(e=>e===document.activeElement),true);
  assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
  const ctx=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true});const p=await ctx.newPage();await p.goto(base);await p.locator('#stages button').nth(1).tap();await solve(p,true,true);await p.screenshot({path:'test-results/quiz-sdl-mobile.png',fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const failed=await browser.newPage();let fail=true;await failed.route('**/words.json',route=>fail?route.fulfill({status:503,body:'Unavailable'}):route.continue());await failed.goto(base);assert.equal(await failed.locator('#error').isVisible(),true);fail=false;await failed.locator('#retry').click();await failed.locator('#stages button').first().waitFor();
  console.log('Passed: all 35 words / 3 stages, images decode, actual letter and reward audio, retry, coin floor, replay, keyboard, touch, sound toggle and fetch recovery.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
