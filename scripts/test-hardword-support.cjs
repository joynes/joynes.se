const assert=require('node:assert/strict'),fs=require('node:fs');const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/hardword/';
const settings={viewport:{width:1000,height:1000},serviceWorkers:'block',reducedMotion:'reduce'};
async function choose8(p){await p.locator('#ageCard8').click();}
async function solveMath(p){const i=await p.locator('#mathOptionsGrid button').evaluateAll(b=>b.findIndex(x=>x._ok));await p.locator('#mathOptionsGrid button').nth(i).click();}
async function openMath(p,name='Analog klocka'){await p.locator('#s-hub [onclick="openMathMenu()"] ').click();await p.locator('#mathMenuGrid .subject-card').filter({hasText:name}).click();await p.locator('#mathLevelsGrid .level-card').first().click();await p.locator('#mathBanorGrid .bana-card').first().click();}
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{headless:true}:{headless:true,channel:'chrome'});
 try{
  let c=await browser.newContext(settings),p=await c.newPage();await p.goto(base);await choose8(p);
  const integrity=await p.evaluate(()=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg);};let questions=0;
   for(const [type,build]of [['plus',buildPlusQ],['minus',buildMinusQ],['mult',buildMultQ]])for(let lv=1;lv<=5;lv++)for(const q of build(120,lv)){
    const [,a,op,b]=q.label.match(/(\d+) ([+−×]) (\d+)/);const expected=op==='+'?+a + +b:op==='−'?+a - +b:+a * +b;
    check(+q.opts[q.ans]===expected,'Arithmetic '+q.label);check(new Set(q.opts).size===4,'Duplicate choice');
    if(type==='plus'&&lv===3)check(+a<=25&&+b<=25,'Plus level 3 range');if(type==='minus'&&lv===3)check(+a<=99&&+b<=99,'Minus level 3 range');if(type==='mult'&&lv===5)check(+b<10,'Single digit multiplier');questions++;
   }
   for(let lv=1;lv<=5;lv++)for(const q of buildAddQ(120,lv)){check(q.a>0&&q.b>0,'Operands');if(lv===3)check(q.a<=999&&q.b<=99,'Mixed size addition');questions++;}
   const spoken=(h,m)=>m===0?`Klockan är ${h}`:m===15?`Kvart över ${h}`:m===30?`Halv ${h===12?1:h+1}`:m===45?`Kvart i ${h===12?1:h+1}`:`${h}:${String(m).padStart(2,'0')}`;
   for(let lv=1;lv<=7;lv++)for(const q of buildClockQ(12,lv)){
    const box=document.createElement('div');box.innerHTML=q.visual;
    const hour=box.querySelector('line[stroke="white"]'),minute=box.querySelector('line[stroke="#FF6B9D"]');check(hour&&minute,'Clock hands');
    const angle=line=>(Math.atan2(+line.getAttribute('y2')- +line.getAttribute('y1'),+line.getAttribute('x2')- +line.getAttribute('x1'))*180/Math.PI+450)%360;
    const m=Math.round(angle(minute)/6)%60,h=Math.round((angle(hour)-m*.5+360)%360/30)%12;
    const result=(h*60+m+(lv===6?15:lv===7?-30:0)+720)%720;
    check(q.opts[q.ans]===spoken(Math.floor(result/60)||12,result%60),'Clock answer');check(new Set(q.opts).size===q.opts.length,'Clock choices');questions++;
   }
   for(const puzzle of KORSORD_DATA)check(puzzle.words.map(w=>w.word[puzzle.secretCol-w.sc]).join('')===puzzle.secretWord,'Crossword '+puzzle.id);
   for(const lv of [...LASNING_LEVELS,...INLANDSISEN_LEVELS])for(const b of lv.banor)for(const q of b.questions)check(q.opts.length===6&&q.opts[q.a],'Reading options');
   const available=availableLearningCourses();check(available===252,'Available courses');
   for(let lv=1;lv<=15;lv++){check(getBrkCourseRequirement(lv)<=available,'Unreachable Breakout');check(BRK_LVS[lv-1].rows.every(row=>row.length===8&&row.every(x=>[0,1,2,3,4,9].includes(x))),'Block layout');}
   check(AVATARS.every(a=>avatarRequirement(a)<=available),'Unreachable avatar');
   return {questions,available};
  });
  assert.ok(integrity.questions>2400);console.log('PASS content integrity',integrity);await c.close();
  // Import actual progress earned by the four complete education/browser suites.
  const saved={};for(const phase of ['stories','math','reading','crosswords']){
   const state=JSON.parse(fs.readFileSync(`test-results/hardword-${phase}-storage.json`));
   for(const origin of state.origins)for(const item of origin.localStorage)if(item.name.startsWith('joynes.hardword.'))saved[item.name.slice(16)]=item.value;
  }
  const code=Buffer.from(JSON.stringify(saved)).toString('base64');c=await browser.newContext(settings);p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(base);await choose8(p);await p.locator('#s-hub .extra-card').filter({hasText:'Affär'}).click();await p.locator('[onclick="showImportPanel()"]').click();await p.locator('#importCode').fill(code);await p.locator('[onclick="doImport()"]').click();assert.match(await p.locator('#importMsg').innerText(),/återställd/);assert.equal(await p.evaluate(()=>countAllBanorDone()),252);
  await p.locator('[onclick="showExportPanel()"]').click();const exported=JSON.parse(Buffer.from(await p.locator('#exportCode').inputValue(),'base64').toString());
  for(const [key,value]of Object.entries(saved))assert.equal(exported[key],value,key);assert.ok(exported['ordhjälten_v1']);assert.ok(exported['korsord_v1_19']);
  const invalid=Buffer.from(JSON.stringify({coins_v1:'{broken'})).toString('base64');
  await p.locator('[onclick="showImportPanel()"]').click();await p.locator('#importCode').fill(invalid);await p.locator('[onclick="doImport()"]').click();assert.match(await p.locator('#importMsg').innerText(),/Ogiltig/);assert.equal(await p.evaluate(()=>countAllBanorDone()),252);

  const before=await p.evaluate(()=>getCoinData());const cool=p.locator('#shopAvatarGrid .shop-item').filter({hasText:'Cool'});await cool.getByRole('button').filter({hasText:'💰'}).click();assert.equal(await p.evaluate(()=>isAvatarOwned('cool')),true);assert.equal(await p.evaluate(()=>getCoinData().balance),before.balance-15);
  await p.locator('#shopBackBtn').click();await p.locator('#s-hub .extra-card').filter({hasText:'Ryggsäck'}).click();await p.locator('#bpAvatarGrid .bp-avatar').filter({hasText:'Cool'}).click();assert.equal(await p.evaluate(()=>getActiveAvatar()),'cool');await p.locator('#backpackBackBtn').click();
  await p.locator('#coinBar').click({clickCount:3});await p.locator('#ppViewEntry').waitFor();
  const pin=await p.evaluate(()=>_PP_PIN);for(const d of pin)await p.locator('#ppEntryNumpad button').getByText(d,{exact:true}).click();await p.locator('#ppRedeemInput').fill('1');await p.locator('#ppRedeemBtn').click();assert.equal(await p.locator('#ppViewSuccess').isVisible(),true);await p.locator('#ppViewSuccess button').getByText('Stäng',{exact:true}).click();
  assert.deepEqual(errs,[]);await c.close();console.log('PASS full progress transfer, 252 earned courses, purchase, avatar and local parent panel.');
  // Malformed storage and denied storage must not stop startup or a whole round.
  for(const blocked of [false,true]){
   c=await browser.newContext(settings);await c.addInitScript(block=>{
    if(block)Object.defineProperty(window,'localStorage',{get(){throw Error('Denied')}});
    else{
     localStorage.setItem('joynes.hardword.app_age','999');localStorage.setItem('joynes.hardword.music_vol','NaN');localStorage.setItem('joynes.hardword.math_prog','{"plus":42}');localStorage.setItem('joynes.hardword.ordhjälten_v1','{"bear":{"stars":-1,"max":-4}}');localStorage.setItem('joynes.hardword.coins_v1','{"balance":"bad","owned":1,"avatars":{},"plays":false}');
    }
   },blocked);p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.clock.install();await choose8(p);await openMath(p);
   for(let i=0;i<6;i++){await solveMath(p);await p.clock.fastForward(650);await p.locator('#mathNextWrap button').click();}
   await p.locator('#s-math-end.active').waitFor();if(blocked)assert.equal(await p.locator('#storageNotice').isVisible(),true);assert.deepEqual(errors,[]);await c.close();
  }
  console.log('PASS corrupt/blocked storage through completed math courses.');
  // Mobile: all digits remain visible; real touch selects and enters a number.
  c=await browser.newContext({...settings,viewport:{width:360,height:740},hasTouch:true,isMobile:true});p=await c.newPage();await p.goto(base);await choose8(p);await openMath(p,'Uppställning');
  await p.locator('.calc-np-btn').getByText('0',{exact:true}).tap();assert.ok(await p.locator('.ci-digit').evaluateAll(a=>a.some(x=>x.textContent==='0')));
  await p.locator('.ci-digit').filter({hasText:/^0$/}).tap();await p.locator('.calc-np-del').tap();assert.ok(await p.locator('.ci-digit').evaluateAll(a=>a.every(x=>x.textContent==='?')));
  const bounds=await p.locator('.calc-grid').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=360);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:'test-results/hardword-mobile.png',fullPage:true});
  // Component layout scenario for the widest possible sum, without claiming a solved course.
  await p.evaluate(()=>{document.getElementById('mathVisual').innerHTML=calcHTML(8999,1999);calcInitNumpad(5);});
  const wide=await p.locator('.calc-grid').boundingBox();assert.ok(wide.x>=0&&wide.x+wide.width<=360);await p.screenshot({path:'test-results/hardword-mobile-wide-sum.png',fullPage:true});
  await p.locator('#s-math-quiz .back-btn').click();await p.locator('#s-math-banor .back-btn').click();await p.locator('#s-math-levels .back-btn').click();await p.locator('#s-math-menu .back-btn').click();
  await p.clock.install();await p.locator('#s-hub [onclick="openBreakout()"] ').tap();await p.locator('#brkLevelGrid .bana-card').first().tap();await p.locator('#brkCanvas').scrollIntoViewIfNeeded();
  const box=await p.locator('#brkCanvas').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=360);const start=await p.evaluate(()=>brkPadX);const cdp=await c.newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height*.75}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+55,y:box.y+box.height*.75}]});await p.clock.runFor(120);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok(await p.evaluate(start=>brkPadX>start,start));assert.equal(await p.evaluate(()=>brkState),'playing');await p.screenshot({path:'test-results/hardword-breakout-mobile.png',fullPage:true});
  const track=await p.locator('#bgMusic').getAttribute('src');await p.locator('#bgMusic').dispatchEvent('ended');assert.notEqual(await p.locator('#bgMusic').getAttribute('src'),track);
  await c.close();console.log('PASS mobile input, five-digit layout, Breakout touch drag and music shuffle.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
