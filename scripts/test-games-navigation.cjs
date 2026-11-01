const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.HOMEPAGE_BASE_URL || 'http://127.0.0.1:8767/';

(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:412,height:915},reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'#games/retro');
    await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Retrospel');
    assert.equal(await page.locator('#categoryGrid .active').getAttribute('data-category'),'games');
    assert.ok((await page.locator('#contentList').innerText()).includes('Frågespelet'));
    await page.locator('#contentList .item-title a').getByText('Frågespelet',{exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#games/retro/web-quizzes' && document.querySelector('#stageTitle')?.textContent==='Frågespelet');
    const frame=page.frameLocator('iframe[title="Frågespelet"]');
    await frame.locator('.stage-button').first().click();
    assert.equal(await frame.locator('#play').isVisible(),true);
    assert.ok(await frame.getByText('AI-remake av retrospel · Original 2023',{exact:true}).isVisible());
    await page.locator('#gameControls').getByRole('link',{name:'AI-spel',exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#games/ai' && document.querySelector('#stageTitle')?.textContent==='AI-spel');
    assert.equal(await page.locator('#contentList .item').count(),0);
    await page.locator('#gameControls').getByRole('link',{name:'Alla spel',exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#games' && document.querySelector('#stageTitle')?.textContent==='Games');
    assert.ok((await page.locator('#contentList').innerText()).includes('Frågespelet'));
    await page.goto(base+'#music/ai/ichbinstark');
    await page.waitForSelector('.song-version');
    assert.equal(await page.locator('.song-version').count(),7);
    assert.deepEqual(errors,[]);
    console.log('Passed: Retro/AI categories, nested routes, embedded playable quiz, all-games view and music regression.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
