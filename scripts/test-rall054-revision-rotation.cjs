const assert=require('node:assert/strict');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const {read}=require('./test-rall054-browser.cjs');
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8855/games/rall-054/restored/';
(async()=>{const b=await chromium.launch(process.env.CHROMIUM_PLAYWRIGHT_MODULE?{}:{channel:'chrome'});try{
 const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),p=await c.newPage(),d=await c.newCDPSession(p);
 await p.goto(base);await p.locator('#start:enabled').press('Enter');await new Promise(r=>setTimeout(r,100));await p.locator('#fullscreen').tap();await p.waitForFunction(()=>document.fullscreenElement||document.querySelector('#board').classList.contains('game-view-expanded'));
 for(const v of[{width:844,height:390},{width:390,height:844}]){
  const r=await p.locator('.pad.blue.move').boundingBox(),pt={id:1,x:r.x+r.width/2,y:r.y+r.height*.15};
  await d.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height/2}]});await d.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pt]});await new Promise(r=>setTimeout(r,40));await new Promise(r=>setTimeout(r,100));assert(Math.abs((await read(p)).input.blue.throttle)>.1);
  await p.keyboard.down('KeyI');await d.send('Emulation.setDeviceMetricsOverride',{...v,deviceScaleFactor:1,mobile:true,screenOrientation:{type:v.width>v.height?'landscapePrimary':'portraitPrimary',angle:v.width>v.height?90:0}});await p.waitForFunction(v=>innerWidth===v.width&&innerHeight===v.height,v);await p.waitForFunction(async v=>{const s=(await import(document.querySelector('script[type=module]').src)).readGame();return s.graphics.viewport[0]===v.width&&s.graphics.viewport[1]===v.height&&s.input.blue.throttle===0;},v);await new Promise(r=>setTimeout(r,100));assert.equal((await read(p)).input.blue.throttle,0);assert.equal((await read(p)).input.blue.aim,-1);await p.keyboard.up('KeyI');
  try{await d.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});}catch(e){if(!e.message.includes('Must send a TouchStart first'))throw e;}
  const q=await p.locator('canvas').boundingBox();assert(Math.abs(q.width-v.width)<2&&Math.abs(q.height-v.height)<2);for(const el of await p.locator('.pad:visible,.siege-button:visible,.toolbar button').all()){const a=await el.boundingBox();assert(a.x>=q.x-2&&a.y>=q.y-2&&a.x+a.width<=q.x+q.width+2&&a.y+a.height<=q.y+q.height+2);}
  const before=(await read(p)).game.tanks[0].travel;await p.keyboard.down('ArrowUp');await new Promise(r=>setTimeout(r,160));await p.keyboard.up('ArrowUp');assert((await read(p)).game.tanks[0].travel>before+5);
 }
 await p.locator('#fullscreen').tap();await p.waitForFunction(()=>!document.fullscreenElement&&!document.querySelector('#board').classList.contains('game-view-expanded'));await c.close();console.log('PASS revised fullscreen rotation portrait/landscape/portrait, touch release, held/fresh physical keys, in-scene controls and exit');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
