const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const pack=JSON.parse(fs.readFileSync('games/memit/dota-heroes.json')).items;
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/memit/';
async function nameFromPortrait(page){const path=await page.locator('#portrait').getAttribute('src');const entry=pack.find(i=>i.image===path);assert.ok(entry);return entry.name;}
async function typeCorrect(page,name){await page.locator('#answer').fill(name);await page.locator('#answer').press('Enter');await page.locator('#next').waitFor();assert.equal(await page.locator('#answer').isDisabled(),true);}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
  await page.goto(base);await page.locator('#menu').waitFor();assert.match(await page.locator('#dataset').innerText(),/127 hjältar/);
  await page.locator('[data-mode="practice"]').click();const practiced=new Set();
  for(let i=0;i<127;i++){
   const name=await nameFromPortrait(page);assert.equal(await page.locator('#name').innerText(),name);practiced.add(name);await page.locator('#portrait').evaluate(img=>img.decode());await page.locator('#next').click();
  }
  assert.equal(practiced.size,127);assert.match(await page.locator('#result-title').innerText(),/övat på alla/);await page.locator('#replay').click();assert.match(await page.locator('#position').innerText(),/^1 av 127/);await page.locator('#back').click();
  await page.locator('[data-mode="guess"]').click();const guessed=new Set();
  for(let i=0;i<10;i++){
   const name=(await page.locator('#prompt').innerText()).replace('Välj bilden: ','');guessed.add(name);assert.equal(await page.locator('#grid button').count(),6);
   const names=await page.locator('#grid img').evaluateAll(imgs=>imgs.map(i=>i.alt));assert.equal(new Set(names).size,6);
   if(i===0){const wrong=names.find(n=>n!==name);await page.locator('#grid').getByRole('button',{name:wrong,exact:true}).click();assert.match(await page.locator('#score').innerText(),/Poäng: -1.00/);assert.match(await page.locator('#feedback').innerText(),/Fel bild/);}
   await page.locator('#grid').getByRole('button',{name,exact:true}).click();assert.equal(await page.locator('#grid button:disabled').count(),6);
   if(i===0)await page.screenshot({path:'test-results/memit-desktop.png',fullPage:true});await page.locator('#next').click();
  }
  assert.equal(guessed.size,10);assert.match(await page.locator('#result-title').innerText(),/9.00/);await page.locator('#back').click();
  for(const [mode,count]of [['take10',10],['exam',127]]){
   await page.locator(`[data-mode="${mode}"]`).click();const seen=new Set();
   for(let i=0;i<count;i++){
    const name=await nameFromPortrait(page);seen.add(name);
    if(i===0&&mode==='take10'){
     await page.locator('#answer').fill(name.slice(0,-1));await page.locator('#answer').press('Enter');assert.match(await page.locator('#feedback').innerText(),/Rätt namn är/);assert.match(await page.locator('#feedback').innerText(),/stavningslikhet/);
    }
    await typeCorrect(page,' '+name.toUpperCase()+' ');await page.locator('#next').click();
   }
   assert.equal(seen.size,count);assert.equal(await page.locator('#result').isVisible(),true);
   if(mode==='exam'){assert.match(await page.locator('#result-title').innerText(),/Full pott/);assert.match(await page.locator('#score').innerText(),/127.00/);}
   await page.locator('#back').click();
  }
  await page.locator('[data-mode="guess"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#prompt').evaluate(e=>e===document.activeElement),true);
  assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
  const ctx=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true});const touch=await ctx.newPage();await touch.goto(base);await touch.locator('[data-mode="take10"]').tap();await typeCorrect(touch,await nameFromPortrait(touch));await touch.screenshot({path:'test-results/memit-mobile.png',fullPage:true});assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await touch.locator('#back').tap();await touch.locator('[data-mode="guess"]').tap();const answer=(await touch.locator('#prompt').innerText()).replace('Välj bilden: ','');await touch.locator('#grid').getByRole('button',{name:answer,exact:true}).tap();await touch.locator('#next').waitFor();
  const failed=await browser.newPage();let fail=true;await failed.route('**/dota-heroes.json',r=>fail?r.fulfill({status:503,body:'Unavailable'}):r.continue());await failed.goto(base);await failed.locator('#retry').waitFor();fail=false;await failed.locator('#retry').click();await failed.locator('#menu').waitFor();
  console.log('Passed: 127 practice cards, ten six-image questions, ten typed answers, full 127-question exam, all images decode, original negative/similarity scoring, replay, keyboard, mobile and fetch recovery.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
