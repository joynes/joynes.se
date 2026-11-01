const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
(async()=>{const browser=await chromium.launch(process.env.RALL_HEADLESS_SHELL==='1'?{}:{channel:'chrome'});
try{for(const viewport of [{width:390,height:844},{width:1280,height:1000}]){
 const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'#games/retro/rall-026');await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Rall v026 — ASCII');
 const iframe=page.frameLocator('iframe[title="Rall v026 — ASCII"]');assert.equal(await page.locator('iframe').count(),1);await iframe.locator('#start').click();
 const frame=page.frames().find(f=>new URL(f.url()).pathname.endsWith('/games/rall-026/'));assert(frame);
 for(const phase of ['intro','title','menu']){await frame.waitForFunction(phase=>rall026Diagnostics().phase===phase&&!document.querySelector('#continue').disabled,phase,{timeout:30000});if(phase!=='menu')await frame.locator('#continue').click();}
 await frame.locator('#continue').click();await frame.waitForFunction(()=>rall026Diagnostics().phase==='ai-intro'&&!document.querySelector('#continue').disabled);await frame.locator('#continue').click();await frame.waitForFunction(()=>rall026Diagnostics().phase==='playing');
 await frame.locator('#view').focus();const before=await frame.evaluate(()=>rall026Diagnostics().screen.players.find(v=>v.id===1).x);await page.keyboard.down('ArrowRight');await page.waitForTimeout(450);await page.keyboard.up('ArrowRight');
 assert(await frame.evaluate(x=>rall026Diagnostics().screen.players.find(v=>v.id===1).x>x,before));
 await page.goto(base+'#games/ai');assert(!(await page.locator('#contentList').innerText()).includes('Rall v026'));
 await page.goto(base+'#games/retro');assert((await page.locator('#contentList').innerText()).includes('Rall v026'));assert.deepEqual(errors,[]);await page.close();
}console.log('PASS: original DOS duel plays in homepage iframe on desktop/mobile, Retro inclusion and AI exclusion.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
