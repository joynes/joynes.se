const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.CHROMIUM_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.GAME_BASE_URL || 'http://127.0.0.1:8767/games/car-topview/';
const home = process.env.HOMEPAGE_BASE_URL || 'http://127.0.0.1:8767/';
async function pose(game) { return game.locator('#view').evaluate(c => ({x:+c.dataset.x, angle:+c.dataset.angle, speed:+c.dataset.speed})); }
async function active(game, control, expected) { assert.equal(await game.locator(`[data-control="${control}"]`).evaluate(b=>b.classList.contains('active')), expected, control); }
(async () => {
  fs.mkdirSync('test-results', {recursive:true});
  const browser = await chromium.launch();
  try {
    for (const viewport of [{width:1280,height:1000},{width:390,height:844},{width:844,height:390}]) {
      const mobile = viewport.width < 1000;
      const context = await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile});
      const p = await context.newPage(), errors=[];
      p.on('pageerror', e=>errors.push(e.message));
      await p.clock.install();
      await p.goto(base);
      await p.locator('#start').focus(); await p.keyboard.press('Enter');
      await p.locator('#view').waitFor();
      await p.keyboard.down('ArrowUp'); await p.keyboard.down('KeyW');
      await p.clock.runFor(400); await p.keyboard.up('ArrowUp');
      await active(p,'up',true);
      const first=await pose(p); await p.clock.runFor(300);
      assert((await pose(p)).x<first.x-10,'remaining accelerator key continues driving');
      await p.keyboard.down('KeyD'); await p.clock.runFor(300);
      assert((await pose(p)).angle>.8);
      await p.keyboard.up('KeyW'); await active(p,'up',false); await active(p,'right',true);
      await p.keyboard.up('KeyD');
      // Reset, pause and focus cleanup must discard old hardware autorepeat.
      for (const action of ['reset','pause','focus']) {
        await p.locator('#reset').focus(); await p.keyboard.press('Enter');
        await p.keyboard.down('ArrowUp'); await p.clock.runFor(300);
        if(action==='reset') { await p.locator('#reset').focus(); await p.keyboard.press('Enter'); }
        if(action==='pause') { await p.keyboard.press('KeyP'); await p.locator('#resume').focus(); await p.keyboard.press('Enter'); }
        if(action==='focus') { await p.locator('#sound').focus(); await p.locator('#view').focus(); }
        await p.keyboard.down('ArrowUp'); await active(p,'up',false);
        await p.keyboard.up('ArrowUp'); await p.keyboard.down('ArrowUp'); await active(p,'up',true);
        await p.keyboard.up('ArrowUp');
      }
      if(mobile) {
        const cdp=await context.newCDPSession(p);
        const point=async(control,id)=>{const r=await p.locator(`[data-control="${control}"]`).boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2,id};};
        await p.locator('#reset').focus(); await p.keyboard.press('Enter');
        const up=await point('up',1),right=await point('right',2);
        await p.keyboard.down('ArrowUp');
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[up]});
        await p.keyboard.up('ArrowUp'); await active(p,'up',true);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[up,right]});
        await p.clock.runFor(400); assert((await pose(p)).angle>1);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[up]});
        await active(p,'up',false); await active(p,'right',true);
        await p.keyboard.down('ArrowUp');
        await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
        await active(p,'up',true); await active(p,'right',false); await p.keyboard.up('ArrowUp');
        const old=await point('up',3);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[old]});
        await p.locator('#reset').focus(); await p.keyboard.press('Enter');
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...old,x:old.x+2}]});
        await p.clock.runFor(300); assert.deepEqual(await pose(p),{x:512,angle:0,speed:0});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
        // A real frame-window focus change must pause and release touch, too.
        await p.goto(home+'#games/ai/car-topview');
        const frame=p.locator('iframe[title="Top-down Driving"]');
        const game=p.frameLocator('iframe[title="Top-down Driving"]');
        await frame.scrollIntoViewIfNeeded(); await game.locator('#start').focus(); await p.keyboard.press('Enter');
        await game.locator('#view').waitFor(); await frame.scrollIntoViewIfNeeded();
        if(viewport.width===844) for(const selector of ['#board','.controls']) {
          const r=await game.locator(selector).boundingBox();
          assert(r.y>=48&&r.y+r.height<=viewport.height,`${selector} fully visible inside the site`);
        }
        const r=await game.locator('[data-control="up"]').boundingBox();
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2,id:4}]});
        await p.clock.runFor(400); assert((await pose(game)).x<500);
        await p.locator('#choose-title').focus();
        assert.equal(await game.locator('#pause-screen').isVisible(),true);
        assert.equal(await game.locator('.controls .active').count(),0);
        const frozen=await pose(game); await p.clock.runFor(400); assert.deepEqual(await pose(game),frozen);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
        await game.locator('#resume').focus(); await p.keyboard.press('Enter');
        await p.keyboard.down('KeyW'); await p.clock.runFor(400); await p.keyboard.up('KeyW');
        assert((await pose(game)).x<frozen.x-10);
        if(viewport.width===844) await p.setViewportSize({width:390,height:844});
        await game.getByRole('link',{name:'← AI games',exact:true}).tap();
        await p.waitForFunction(()=>location.hash==='#games/ai'&&!document.querySelector('iframe'));
        await cdp.detach();
      }
      assert.deepEqual(errors,[]);
      await p.screenshot({path:`test-results/car-topview-input-${viewport.width}.png`,fullPage:true});
      await context.close();
      console.log('PASS driving controls',viewport.width,'keyboard aliases, stale-repeat cleanup, simultaneous touch, independent release/cancel, restart and frame focus');
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
