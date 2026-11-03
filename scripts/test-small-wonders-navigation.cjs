const assert=require('node:assert/strict');const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.HOMEPAGE_BASE_URL||'http://127.0.0.1:8767/';
async function openGame(parent,label,errors){
 const [page]=await Promise.all([parent.context().waitForEvent('page'),parent.getByRole('link',{name:label,exact:true}).first().click()]);page.on('pageerror',e=>errors.push(e.message));return page;
}
(async()=>{const browser=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{headless:true}:{headless:true,channel:'chrome'});try{
 for(const viewport of [{width:360,height:740},{width:1440,height:1000}]){
  const p=await browser.newPage({viewport,reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'#games/ai/small-wonders');await p.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Small Wonders / Inuti språkmodellen');
  for(const [label,url]of [['LLM tower','https://joynes.github.io/llmspel-play/'],['Name workshop','https://joynes.github.io/llmspel-play/?demo'],['Maths adventure','https://joynes.github.io/llmspel-play/?garden']]){
   const link=p.getByRole('link',{name:label,exact:true}).first();assert.equal(await link.getAttribute('href'),url);assert.equal(await link.getAttribute('target'),'_blank');
  }
  const tower=await openGame(p,'LLM tower',errors);await tower.locator('[data-do="enter"]').click();await tower.locator('[data-do="pick"]').click();await tower.locator('[data-do="insert"]').click();await tower.locator('[data-do="next"]').waitFor();await tower.close();
  const name=await openGame(p,'Name workshop',errors);
  await name.locator('[data-action="begin"]').click();await name.locator('[data-action="learn"]').click();for(const example of ['milo','mira','mina'])await name.locator(`[data-example="${example}"]`).click();
  await name.locator('[data-action="try-before"]').click();await name.locator('[data-action="more"]').click();await name.locator('[data-example="mila"]').click();await name.locator('[data-action="answer-l"]').click();await name.locator('[data-action="sample"]').click();await name.locator('[data-action="use"]').click();
  assert.equal(await name.locator('#name-demo').getAttribute('data-phase'),'complete');
  assert.equal(await name.evaluate(()=>document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth),false);
  await name.screenshot({path:`test-results/small-wonders-name-${viewport.width}.png`});await name.close();
  const garden=await openGame(p,'Maths adventure',errors);await garden.locator('#world[data-player-x]').waitFor();await garden.getByRole('button',{name:'Open satchel'}).click();assert.equal(await garden.locator('#satchel').isVisible(),true);await garden.close();
  await p.screenshot({path:`test-results/small-wonders-launcher-${viewport.width}.png`,fullPage:true});assert.deepEqual(errors,[]);
  console.log('PASS full-window game links, tower input station, complete name mission and legacy inventory at',viewport);await p.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
