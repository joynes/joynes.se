const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.WORLDFORGE_HEADLESS_SHELL==='1'?{}:{channel:'chrome'})});
try {for(const viewport of [{width:390,height:844},{width:1280,height:1000}]) {
 const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'#games/ai/worldforge');await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='WorldForge');
 assert.equal(await page.locator('iframe').count(),0);
 const link=page.getByRole('link',{name:'Öppna WorldForge',exact:true}).first();assert.equal(await link.getAttribute('href'),'https://worldforge-self-test.joynez11.chatgpt.site/');assert.equal(await link.getAttribute('target'),'_blank');
 const [game]=await Promise.all([page.context().waitForEvent('page'),link.click()]);game.on('pageerror',e=>errors.push(e.message));
 await game.getByTestId('join-world').waitFor();await game.waitForFunction(()=>!document.querySelector('[data-testid="join-world"]').disabled);
 assert.ok(await game.getByTestId('start-plot-select').isVisible());
 const health=await (await game.request.get('https://worldforge-self-test.joynez11.chatgpt.site/api/health')).json();assert.equal(health.status,'ready');assert.equal(health.startupSelfTest,'passed');
 await game.close();await page.goto(base+'#games/retro');assert.ok(!(await page.locator('#contentList').innerText()).includes('WorldForge'));
 await page.goto(base+'#games/ai');assert.ok((await page.locator('#contentList').innerText()).includes('WorldForge'));assert.deepEqual(errors,[]);await page.close();
}console.log('PASS: desktop/mobile own-tab WorldForge links, real live lobby/health, AI inclusion and retro exclusion.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
