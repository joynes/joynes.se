const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
(async()=>{const browser=await chromium.launch({headless:true,args:['--disk-cache-size=1'],...(process.env.NEON_HEADLESS_SHELL?{}:{channel:'chrome'})});
try{for(const viewport of [{width:390,height:844},{width:1280,height:1000}]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'#games/ai/neon-interceptor');await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Neon Bastion & Manta');
 assert.equal(await page.locator('iframe').count(),0);
 for(const [label,url,variant,sectors] of [['Play Bastion','https://neon-interceptor.joynez11.chatgpt.site/','interceptor',20],['Play Manta','https://manta-interceptor.joynez11.chatgpt.site/','manta',21]]){
  const link=page.getByRole('link',{name:label,exact:true}).first();assert.equal(await link.getAttribute('href'),url);assert.equal(await link.getAttribute('target'),'_blank');
  const [game]=await Promise.all([page.context().waitForEvent('page'),link.click()]);game.on('pageerror',e=>errors.push(e.message));
  if(viewport.width<viewport.height){await game.locator('.orientation-notice').waitFor();await game.setViewportSize({width:844,height:390});}
  await game.locator('.launch-screen').waitFor();assert.match(await game.locator('.version-badge').textContent(),/v0\.3\.15/);
  assert.match(await game.locator('[data-action="map"]').textContent(),new RegExp(sectors+' SECTORS'));
  assert.equal(await game.evaluate(()=>document.body.classList.contains('manta-edition')),variant==='manta');
  const config=await (await game.request.get(new URL('api/game-config',url).href)).json();assert.equal(config.variant,variant);
  await game.close();
 }
 await page.goto(base+'#games/retro');assert.ok(!(await page.locator('#contentList').innerText()).includes('Neon Bastion & Manta'));
 await page.goto(base+'#games/ai');assert.ok((await page.locator('#contentList').innerText()).includes('Neon Bastion & Manta'));
 assert.deepEqual(errors,[]);await page.close();
}console.log('Passed: Bastion/Manta own-tab public links at mobile/desktop, real current menus and runtime editions, complete campaign counts, AI inclusion and retro exclusion.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
