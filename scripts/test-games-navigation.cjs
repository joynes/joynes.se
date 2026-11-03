const assert = require('node:assert/strict');
const {chromium} = require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const base = process.env.HOMEPAGE_BASE_URL || 'http://127.0.0.1:8767/';

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{headless:true}:{channel:'chrome',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:412,height:915},reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'#games/quizzes');
    await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Quiz games');
    assert.equal(await page.locator('#categoryGrid .active').getAttribute('data-category'),'games');
    assert.ok((await page.locator('#contentList').innerText()).includes('Quiz Game'));
    await page.locator('#contentList .item-title a').getByText('Quiz Game',{exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#games/quizzes/web-quizzes' && document.querySelector('#stageTitle')?.textContent==='Quiz Game');
    const frame=page.frameLocator('iframe[title="Quiz Game"]');
    await frame.locator('.stage-button').first().click();
    assert.equal(await frame.locator('#play').isVisible(),true);
    assert.ok(await frame.getByText('AI-remake av retrospel · Original 2023',{exact:true}).isVisible());
    await page.goto(base+'#games/quizzes/quiz-sdl');
    await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Word Quiz');
    const readingFrame=page.frameLocator('iframe[title="Word Quiz"]');
    await readingFrame.locator('#stages button').first().click();
    assert.equal(await readingFrame.locator('#options button').count(),4);
    await page.goto(base+'#games/retro/memit');
    await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Memit');
    const memitFrame=page.frameLocator('iframe[title="Memit"]');
    await memitFrame.locator('#menu').waitFor();
    await memitFrame.locator('[data-mode="guess"]').click();
    assert.equal(await memitFrame.locator('#grid button').count(),6);
    await page.locator('#gameControls').getByRole('link',{name:'Quiz games',exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#games/quizzes' && document.querySelector('#stageTitle')?.textContent==='Quiz games');
    assert.ok((await page.locator('#contentList').innerText()).includes('Grimace Maths — Gemini'));
    assert.ok((await page.locator('#contentList').innerText()).includes('Quiz Game'));
    await page.locator('#contentList .item-title a').getByText('Grimace Maths — Gemini',{exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#games/quizzes/grimace-gemini' && document.querySelector('#stageTitle')?.textContent==='Grimace Maths — Gemini');
    const mathFrame=page.frameLocator('iframe[title="Grimace Maths — Gemini"]');
    await page.waitForFunction(()=>{
      const doc=document.querySelector('iframe[title="Grimace Maths — Gemini"]')?.contentDocument;
      return doc?.readyState==='complete' && doc.querySelector('script[type="module"]');
    });
    await mathFrame.locator('[data-mode="plus"]').click();
    assert.equal(await mathFrame.locator('#options button').count(),4);
    await page.goto(base+'#games/quizzes/grimace-codex');
    await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Grimace Maths — Codex');
    const codexFrame=page.frameLocator('iframe[title="Grimace Maths — Codex"]');
    await page.waitForFunction(()=>{
      const doc=document.querySelector('iframe[title="Grimace Maths — Codex"]')?.contentDocument;
      return doc?.readyState==='complete' && doc.querySelector('script[type="module"]');
    });
    await codexFrame.locator('[data-mode="minus"]').click();
    assert.equal(await codexFrame.locator('#options button').count(),4);
    await page.goto(base+'#games/quizzes/hardword');
    await page.waitForFunction(()=>document.querySelector('#stageTitle')?.textContent==='Learning Games');
    const schoolFrame=page.frameLocator('iframe[title="Learning Games"]');
    await schoolFrame.locator('#ageCard8').click();
    await schoolFrame.locator('#s-hub [onclick="openMathMenu()"] ').click();
    assert.equal(await schoolFrame.locator('#mathMenuGrid .subject-card').count(),3);
    await page.locator('#gameControls').getByRole('link',{name:'All games',exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#games' && document.querySelector('#stageTitle')?.textContent==='Games');
    assert.ok((await page.locator('#contentList').innerText()).includes('Quiz Game'));
    await page.goto(base+'#music/ai/ichbinstark');
    await page.waitForSelector('.song-version');
    assert.equal(await page.locator('.song-version').count(),7);
    assert.deepEqual(errors,[]);
    console.log('Passed: Retro/AI categories, nested routes, embedded playable quiz, all-games view and music regression.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
