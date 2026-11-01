const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');

const base = process.env.GAME_BASE_URL || 'http://127.0.0.1:8767/games/web-quizzes/';
const bank = JSON.parse(fs.readFileSync(path.join(__dirname, '../games/web-quizzes/questions.json')));
const artifacts = path.join(__dirname, '../test-results/web-quizzes');
fs.mkdirSync(artifacts, {recursive: true});

async function questionState(page) {
  return page.evaluate(async () => {
    const {game} = await import(new URL('app.mjs', location.href).href);
    return {id: game.current?.id, score: game.score, position: game.position, status: game.status, stageIndex: game.stageIndex};
  });
}

async function finishStage(page, index, touch = false) {
  const stage = bank[index];
  const seen = new Set();
  while (await page.locator('#play').isVisible()) {
    const state = await questionState(page);
    const q = stage.questions.find(q => q.id === state.id);
    assert.ok(q, `question belongs to stage ${index + 1}`);
    assert.ok(!seen.has(q.id), 'question is not repeated within an attempt');
    seen.add(q.id);
    const answer = page.locator('#options').getByRole('button', {name: q.options[q.answer], exact: true});
    if (touch) await answer.tap(); else await answer.click();
    assert.equal((await questionState(page)).score, seen.size);
    assert.equal(await page.locator('#options button:enabled').count(), 0);
    assert.match(await page.locator('#feedback').innerText(), /Rätt!/);
    if (touch) await page.locator('#next').tap(); else await page.locator('#next').click();
  }
  assert.equal(seen.size, stage.questions.length);
  assert.equal(await page.locator('#final-score').innerText(), `${stage.questions.length} av ${stage.questions.length} poäng`);
}

(async () => {
  const browser = await chromium.launch({headless: true, channel: 'chrome'});
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', async d => { errors.push('Unexpected dialog: ' + d.message()); await d.dismiss(); });
    await page.goto(base);
    await page.waitForSelector('.stage-button');
    assert.equal(await page.locator('.stage-button').count(), 12);
    // Wrong answers stay on the question, score has a floor and switching resets play.
    await page.locator('.stage-button').nth(0).click();
    let state = await questionState(page);
    const q = bank[0].questions.find(q => q.id === state.id);
    await page.locator('#options').getByRole('button', {name: q.options.find((_, i) => i !== q.answer), exact: true}).click();
    assert.equal((await questionState(page)).score, 0);
    assert.equal((await questionState(page)).id, state.id);
    assert.equal(await page.locator('#options button:disabled').count(), 1);
    await page.locator('#back-menu').click();
    // Every real stage and every one of the 154 records is completed through visible controls.
    for (let index = 0; index < bank.length; index++) {
      await page.locator('.stage-button').nth(index).click();
      assert.equal((await questionState(page)).score, 0);
      if (index === 1) await page.screenshot({path: path.join(artifacts, 'desktop-question.png')});
      await finishStage(page, index);
      console.log(`Passed stage ${index + 1}: ${bank[index].questions.length} questions`);
      if (index === 0) {
        await page.locator('#restart').click();
        assert.equal((await questionState(page)).score, 0);
        assert.equal((await questionState(page)).position, 0);
        await page.locator('#back-menu').click();
      } else await page.locator('#choose-stage').click();
    }
    await page.reload();
    await page.waitForSelector('.stage-button');
    assert.equal(await page.locator('.stage-button.complete').count(), 12, 'records survive reload');
    // Keyboard activation and focus work without pointer input.
    await page.locator('.stage-button').first().focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#play').isVisible(), true);
    assert.equal(await page.locator('#question').evaluate(e => e === document.activeElement), true);
    assert.deepEqual(errors, []);

    const mobile = await browser.newContext({viewport: {width: 412, height: 915},hasTouch: true,isMobile: true});
    const phone = await mobile.newPage();
    await phone.goto(base);
    await phone.waitForSelector('.stage-button');
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await phone.locator('.stage-button').nth(11).tap();
    await phone.screenshot({path: path.join(artifacts, 'mobile-question.png'),fullPage:true});
    await finishStage(phone, 11, true);
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobile.close();

    const blocked = await browser.newContext();
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', {get() {throw new Error('blocked')}}));
    const noStore = await blocked.newPage();
    await noStore.goto(base);
    await noStore.waitForSelector('.stage-button');
    await noStore.locator('.stage-button').first().click();
    await finishStage(noStore, 0);
    assert.equal(await noStore.locator('#storage-notice').isVisible(), true);
    await blocked.close();

    const recovery = await browser.newPage();
    await recovery.route('**/questions.json', route => route.fulfill({status:503,body:'unavailable'}), {times:1});
    await recovery.goto(base);
    await recovery.getByRole('button', {name:'Försök igen',exact:true}).click();
    await recovery.waitForSelector('.stage-button');
    assert.equal(await recovery.locator('.stage-button').count(), 12);
    await recovery.close();
    console.log('All browser checks passed: full game, restart, stage switch, records, keyboard, mobile touch, blocked storage and load recovery.');
  } finally { await browser.close(); }
})().catch(e => {console.error(e);process.exitCode=1});
