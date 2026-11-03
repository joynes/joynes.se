const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/hardword/';
const phase=process.argv[2]||'all';
const phases=phase==='all'?['stories','math','reading','crosswords']: [phase];
async function active(page,id){await page.locator('#'+id+'.active').waitFor();}
async function chooseAge(page,age){
 if(await page.locator('#s-hub').isVisible())await page.locator('#hubAgeBadgeWrap .age-badge').click();
 await page.locator('#ageCard'+age).click();await active(page,'s-hub');
}
async function hub(page){
 const button=page.locator('.screen.active button').filter({hasText:/Alla ämnen/}).first();
 if(await button.count())await button.click();else {
  // Back through actual menus; no direct screen-state changes.
  for(let n=0;n<6 && !(await page.locator('#s-hub').isVisible());n++)await page.locator('.screen.active .back-btn').first().click();
 }
 await active(page,'s-hub');
}
async function correctIndex(page,selector,prop){return page.locator(selector).evaluateAll((buttons,key)=>buttons.findIndex(b=>b[key]),prop);}
async function stories(page){
 const stories=await page.evaluate(()=>STORIES.map(s=>({id:s.id,level:s.level,count:s.steps.filter(q=>q.type==='quiz').length})));
 let count=0;
 for(let level=1;level<=6;level++){
  if(level===3||level===5){await chooseAge(page,level===3?7:8);}
  await page.locator('#s-hub [onclick="openSvenska()"] ').click();
  await page.locator('[onclick="openOrdhjälten()"]').click();
  await page.locator('#svenskaLevelsGrid .level-card').filter({hasText:`Nivå ${level} —`}).click();
  for(const story of stories.filter(s=>s.level===level)){
   await page.locator('#scard-'+story.id).click();await page.locator('#s-start button[onclick="startGame()"]').click();
   for(let i=0;i<story.count;i++){
    await active(page,'s-quiz');const right=await correctIndex(page,'#optionsGrid button','_isCorrect');assert.ok(right>=0);
    await page.locator('#optionsGrid button').nth(right).click();assert.equal(await page.locator('#optionsGrid button:not([disabled])').count(),0);
    await page.locator('#quizNextWrap button').click();count++;
   }
   await active(page,'s-end');assert.equal(await page.evaluate(()=>stars),story.count);
   if(await page.locator('#dailyLimitOverlay').isVisible())await page.locator('[onclick="closeDailyLimitPopup()"]').click();
   await page.locator('#s-end button[onclick="restartGame()"]').click();
   if(await page.locator('#dailyLimitOverlay').isVisible())await page.locator('[onclick="closeDailyLimitPopup()"]').click();
  }
  console.log(`Stories level ${level} completed; ${count} questions.`);await hub(page);
 }
 assert.equal(count,192);assert.equal(await page.evaluate(()=>Object.keys(loadProgress()).length),44);
 await page.reload();assert.equal(await page.evaluate(()=>Object.keys(loadProgress()).length),44);
}
async function math(page){
 await page.clock.install();let answers=0;
 for(const [type,age,levels]of [['plus',6,5],['minus',7,5],['mult',7,5],['uppstallning',8,5],['klocka',8,7]]){
  if(await page.locator('#s-hub').isVisible())await chooseAge(page,age);
  await page.locator('#s-hub [onclick="openMathMenu()"] ').click();
  await page.locator('#mathMenuGrid .subject-card').filter({hasText:({plus:'Addition',minus:'Subtraktion',mult:'Multiplikation',uppstallning:'Uppställning',klocka:'Analog klocka'})[type]}).click();
  for(let level=1;level<=levels;level++){
   const card=page.locator('#mathLevelsGrid .level-card').nth(level-1);assert.ok(!(await card.getAttribute('class')).includes('locked'));await card.click();
   for(let bana=1;bana<=5;bana++){
    await page.locator('#mathBanorGrid .bana-card').nth(bana-1).click();
    for(let i=0;i<6;i++){
     if(type==='uppstallning'){
      const operands=await page.evaluate(()=>({a:mathQ[mathIdx].a,b:mathQ[mathIdx].b}));const digits=String(operands.a+operands.b);
      for(let d=digits.length-1;d>=0;d--){await page.locator('#ci'+d).click();await page.locator('.calc-np-btn').getByText(digits[d],{exact:true}).click();}
      await page.locator('button[onclick^="checkCalc"]').click();
      // A second real press must not add a second star.
      await page.locator('button[onclick^="checkCalc"]').click();
     }else{
      const right=await correctIndex(page,'#mathOptionsGrid button','_ok');assert.ok(right>=0);await page.locator('#mathOptionsGrid button').nth(right).click();
     }
     assert.equal(+(await page.locator('#mathStarCount').innerText()),i+1);await page.clock.fastForward(650);await page.locator('#mathNextWrap button').click();answers++;
    }
    await active(page,'s-math-end');assert.match(await page.locator('#mathEndMsg').innerText(),/Perfekt/);
    if(await page.locator('#dailyLimitOverlay').isVisible())await page.locator('[onclick="closeDailyLimitPopup()"]').click();
    await page.locator('#s-math-end button[onclick="openLevel(mathCurrentLevel)"]').click();
   }
   await page.locator('#s-math-banor .back-btn').click();console.log(`Math ${type} level ${level}: all five courses done (${answers} answers).`);
  }
  await hub(page);
 }
 assert.equal(answers,810);
}
async function reading(page){
 await chooseAge(page,8);let answered=0;
 for(const ice of [false,true]){
  if(ice)await page.locator('#inlandsisenCard').click();else{await page.locator('#s-hub [onclick="openSvenska()"] ').click();await page.locator('[onclick="openSvenska_Lasning()"]').click();}
  const sizes=await page.evaluate(ice=>(ice?INLANDSISEN_LEVELS:LASNING_LEVELS).map(l=>l.banor.map(b=>b.questions.length)),ice);
  for(let lv=0;lv<sizes.length;lv++){
   await page.locator('#lasningLevelsGrid .level-card').nth(lv).click();await page.locator('#lasningBanorGrid .bana-card').first().click();
   for(const [bana,count]of sizes[lv].entries()){
    assert.ok((await page.locator('#lasningText').innerText()).length>20);await page.locator('[onclick="showLasningQuestion()"]').click();
    for(let q=0;q<count;q++){
     const right=await page.evaluate(()=>lasningShuffledCorrect);await page.locator('#lasningOptionsGrid button').nth(right).click();await page.locator('#lasningNextBtn').click();answered++;
    }
    if(await page.locator('#dailyLimitOverlay').isVisible())await page.locator('[onclick="closeDailyLimitPopup()"]').click();
   }
   await active(page,'s-lasning-end');assert.match(await page.locator('#lasningEndMsg').innerText(),/alla/);await page.locator('#lasningChooseBtn').click();
   console.log(`${ice?'Ice age':'Reading'} level ${lv+1} passed; ${answered} questions.`);
  }
  await hub(page);
 }
 assert.equal(answered,174);
}
async function crosswords(page){
 await chooseAge(page,8);await page.locator('#s-hub [onclick="openSvenska()"] ').click();await page.locator('[onclick="openKorsord()"]').click();
 const puzzles=await page.evaluate(()=>KORSORD_DATA.map(p=>({words:p.words.map(w=>w.word),secret:p.secretWord})));
 let words=0;
 for(const [i,puzzle]of puzzles.entries()){
  await page.locator('#korsordGrid .bana-card').nth(i).click();
  for(const [row,word]of puzzle.words.entries()){
   await page.locator(`[onclick="kxSelectRow(${row})"]`).first().click();await page.locator('.kx-word').getByText(word,{exact:true}).click();words++;
  }
  assert.ok((await page.locator('.kx-reveal').innerText()).includes(puzzle.secret));
  if(await page.locator('#dailyLimitOverlay').isVisible())await page.locator('[onclick="closeDailyLimitPopup()"]').click();
  await page.locator('button[onclick="kxFinish()"]').click();
  if(await page.locator('#dailyLimitOverlay').isVisible())await page.locator('[onclick="closeDailyLimitPopup()"]').click();
 }
 console.log(`All ${puzzles.length} crosswords and ${words} words passed.`);
 assert.equal(await page.evaluate(()=>KORSORD_DATA.filter(p=>appStorage.getItem('korsord_v1_'+p.id)).length),19);
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  for(const phase of phases){
   const context=await browser.newContext({viewport:{width:1000,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});const page=await context.newPage();const errors=[],bad=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
   await page.goto(base);await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'});
   if(phase!=='reading'&&phase!=='crosswords')await chooseAge(page,6);
   await ({stories,math,reading,crosswords})[phase](page);
   assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
   await context.storageState({path:`test-results/hardword-${phase}-storage.json`});await page.screenshot({path:`test-results/hardword-${phase}.png`,fullPage:true});await context.close();
   console.log(`PASS ${phase}: no browser errors or missing resources.`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
