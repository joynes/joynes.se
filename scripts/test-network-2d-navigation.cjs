const assert=require('node:assert/strict');const{chromium}=require('playwright');
const base=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{for(const viewport of[{width:390,height:844},{width:1280,height:1000}]){
 const p=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'#games/ai/network-2d');await p.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Hello Multiplayer Game');assert.equal(await p.locator('iframe').count(),0);
 for(const[label,url]of[['Öppna spelplanen','https://test-network-game.fly.dev/'],['Autopilot','https://test-network-game.fly.dev/?bot=1']]){
  const link=p.getByRole('link',{name:label,exact:true}).first();assert.equal(await link.getAttribute('href'),url);assert.equal(await link.getAttribute('target'),'_blank');
  const[game]=await Promise.all([p.context().waitForEvent('page'),link.click()]);game.on('pageerror',e=>errors.push(e.message));await game.locator('#connection-status[data-state="connected"]').waitFor();await game.locator('#game-canvas').waitFor();if(label==='Autopilot')assert.match(await game.locator('#mode').innerText(),/Autopilot/);await game.close();
 }
 await p.goto(base+'#games/retro');assert.ok(!(await p.locator('#contentList').innerText()).includes('Hello Multiplayer Game'));await p.goto(base+'#games/ai');assert.ok((await p.locator('#contentList').innerText()).includes('Hello Multiplayer Game'));assert.deepEqual(errors,[]);await p.close();
}console.log('Passed: own-tab live multiplayer/autopilot links at desktop/mobile, real server connection, AI category and retro exclusion.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
