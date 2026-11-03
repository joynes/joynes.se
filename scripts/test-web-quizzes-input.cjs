const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.CHROMIUM_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.GAME_BASE_URL || 'http://127.0.0.1:8804/games/web-quizzes/';
const bank = JSON.parse(fs.readFileSync(path.join(__dirname, '../games/web-quizzes/questions.json')));
const artifacts = path.join(__dirname, '../test-results/web-quizzes-input');
fs.mkdirSync(artifacts, {recursive:true});
async function state(page) {
  return page.evaluate(async () => {
    const {game} = await import(new URL('app.mjs', location.href).href);
    return {id:game.current?.id, score:game.score, position:game.position, status:game.status};
  });
}
async function answer(page, stage=0) {
  const s = await state(page);
  const q = bank[stage].questions.find(q=>q.id===s.id);
  return page.locator('#options').getByRole('button',{name:q.options[q.answer],exact:true});
}
async function keyboardFinish(page) {
  while (await page.locator('#play').isVisible()) {
    await (await answer(page)).focus();
    await page.keyboard.press('Space');
    assert.equal((await state(page)).status,'answered');
    assert.equal(await page.locator('#next').evaluate(e=>e===document.activeElement),true);
    await page.keyboard.press('Enter');
  }
  assert.equal((await state(page)).score,bank[0].questions.length);
}
(async()=>{
 const browser = await chromium.launch();
 try {
  for (const mobile of [false,true]) {
    const context = await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile,isMobile:mobile});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);await page.locator('.stage-button').first().waitFor();
    await page.locator('.stage-button').first().focus();await page.keyboard.press('Enter');
    await keyboardFinish(page);
    await page.locator('#restart').focus();await page.keyboard.press('Space');
    assert.deepEqual({...await state(page),id:null},{id:null,score:0,position:0,status:'playing'});
    const correct=await answer(page);await correct.focus();await page.keyboard.down('Space');
    await page.locator('#back-menu').focus();await page.keyboard.up('Space');
    assert.equal((await state(page)).status,'playing','focus change cancels a held answer');
    await page.keyboard.press('Enter');assert.equal(await page.locator('#menu').isVisible(),true);
    await page.keyboard.up('Enter');
    if(mobile){
      await page.locator('.stage-button').nth(1).tap();
      const cdp=await context.newCDPSession(page);
      async function point(locator,id=1){await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();return{x:b.x+b.width/2,y:b.y+b.height/2,id};}
      const button=await answer(page,1),p=await point(button);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      assert.equal((await state(page)).status,'playing','canceled answer never submits');
      const other=page.locator('#options button').filter({hasNotText:await button.innerText()}).first();
      const a=await point(button),b=await point(other,2);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      assert.equal((await state(page)).position,0,'multi-touch never advances the question');
      assert((await state(page)).score<=1,'multi-touch cannot award twice');
      if((await state(page)).status!=='answered')await button.tap();
      assert.equal((await state(page)).score,1);
      const n=await point(page.locator('#next'));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[n]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      assert.equal((await state(page)).position,0,'canceled next does not skip a question');
      await page.locator('#next').tap();assert.equal((await state(page)).position,1);
      // A touch-capable mobile page must also work with its attached keyboard.
      await (await answer(page,1)).focus();await page.keyboard.press('Space');await page.keyboard.press('Enter');
      assert.equal((await state(page)).position,2);
      const held=await point(await answer(page,1));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held]});
      const second=await context.newPage();await second.goto('about:blank');await second.bringToFront();
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      await page.bringToFront();await second.close();
      assert.equal((await state(page)).position,2);assert.equal((await state(page)).status,'playing');
      await (await answer(page,1)).tap();assert.equal((await state(page)).status,'answered');
      await page.screenshot({path:path.join(artifacts,'mobile-portrait.png'),fullPage:true});
      await page.setViewportSize({width:844,height:390});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:path.join(artifacts,'mobile-landscape.png'),fullPage:true});
      await page.locator('#back-menu').tap();await page.locator('.stage-button').first().tap();
      assert.equal((await state(page)).score,0);assert.equal((await state(page)).position,0);
      await cdp.detach();
    }
    assert.deepEqual(errors,[]);await context.close();
    console.log('PASS quiz input:',mobile?'mobile touch, attached keyboard, multi-touch, cancel, focus, restart':'desktop keyboard full stage, key release and restart');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
