const assert=require('node:assert/strict');const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/hardword/';
(async()=>{const browser=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{headless:true}:{headless:true,channel:'chrome'});try{
 const context=await browser.newContext({viewport:{width:1000,height:1000}});const p=await context.newPage();const errors=[];let navigations=0;p.on('pageerror',e=>errors.push(e.message));p.on('framenavigated',frame=>{if(frame===p.mainFrame())navigations++;});
 await p.goto(base);await p.locator('#ageCard8').click();
 await p.evaluate(async()=>{localStorage.setItem('sibling-game','keep');await caches.open('sibling-cache');await navigator.serviceWorker.ready;});
 await p.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:30000});
 const scope=await p.evaluate(async()=>({scope:(await navigator.serviceWorker.ready).scope,keys:await caches.keys()}));assert.equal(scope.scope,new URL('./',base).href);assert.ok(scope.keys.includes('sibling-cache'));assert.equal(navigations,1,'First worker installation must not reload an active game');
 await context.setOffline(true);await p.reload();await p.locator('#s-hub.active').waitFor();await p.locator('#s-hub [onclick="openSvenska()"] ').click();await p.locator('[onclick="openOrdhjälten()"]').click();await p.locator('#svenskaLevelsGrid .level-card').first().click();await p.locator('#storyGrid12 .story-card:visible').first().click();await p.locator('#s-start [onclick="startGame()"]').click();
 const i=await p.locator('#optionsGrid button').evaluateAll(b=>b.findIndex(x=>x._isCorrect));await p.locator('#optionsGrid button').nth(i).click();assert.equal(await p.locator('#feedbackBox.ok').isVisible(),true);assert.equal(await p.evaluate(()=>localStorage.getItem('sibling-game')),'keep');assert.deepEqual(errors,[]);
 console.log('PASS offline: app-only SW scope/cache, no initial reload, saved age and playable offline quiz, sibling data preserved.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
