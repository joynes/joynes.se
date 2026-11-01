const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.SHADOW_HEADLESS_SHELL==='1'?{}:{channel:'chrome'})});
try{for(const viewport of [{width:390,height:844},{width:1280,height:1000}]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'#games/retro/shadow-racer');await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='ShadowRacer');
 const iframe=page.frameLocator('iframe[title="ShadowRacer"]');assert.equal(await page.locator('iframe').count(),1);await iframe.locator('#start').click();
 const frame=page.frames().find(f=>new URL(f.url()).pathname.endsWith('/games/shadow-racer/'));assert.ok(frame);
 await frame.waitForFunction(()=>window.shadowRacerDiagnostics?.().phase==='running'&&!document.querySelector('#reset').disabled);
 const x=await frame.evaluate(()=>shadowRacerDiagnostics().native.x);await page.keyboard.down('ArrowUp');await page.waitForTimeout(600);await page.keyboard.up('ArrowUp');
 assert.ok(await frame.evaluate(x=>shadowRacerDiagnostics().native.x>x+20,x));
 assert.equal(await frame.locator('#version option').count(),2);assert.ok(await frame.locator('#choose').isVisible());
 await page.goto(base+'#games/ai');assert.ok(!(await page.locator('#contentList').innerText()).includes('ShadowRacer'));
 await page.goto(base+'#games/retro');assert.ok((await page.locator('#contentList').innerText()).includes('ShadowRacer'));assert.deepEqual(errors,[]);await page.close();
}console.log('PASS: embedded native ShadowRacer plays from desktop/mobile homepage, both editions available, Retro inclusion and AI exclusion.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
