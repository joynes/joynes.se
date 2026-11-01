const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.CHROMIUM_PLAYWRIGHT_MODULE||'playwright');
const {watch,snapshot,until,delay}=require('./test-neon-interceptor-browser.cjs');
const output=process.env.NEON_TEST_RESULTS||path.join(process.cwd(),'test-results/neon');
(async()=>{fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({headless:true,args:['--disk-cache-size=1'],...(process.env.NEON_HEADLESS_SHELL?{}:{channel:'chrome'})});
try {for(const edition of ['interceptor','manta']){
 const base=`https://${edition==='manta'?'manta':'neon'}-interceptor.joynez11.chatgpt.site/`,clients=[];let roomId=null;
 async function join(index){
  const context=await browser.newContext({viewport:{width:1180,height:820},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
  const client={context,page,errors,seat:null};clients.push(client);await page.addInitScript(watch);page.on('pageerror',e=>errors.push(e.message));
  // Use genuine tickets and production sockets. Isolate matchmaking in a room
  // created for this test, so existing players' waiting rooms are never joined.
  await page.route('**/matchmake/joinOrCreate/**',async route=>{
    const url=new URL(route.request().url());
    url.pathname=index===0?url.pathname.replace('/joinOrCreate/','/create/'):`/matchmake/joinById/${roomId}`;
    const response=await route.fetch({url:url.href});
    if(response.ok()){
      const body=await response.json(),id=body.room?.roomId||body.roomId;
      assert.ok(typeof id==='string'&&/^[a-zA-Z0-9_-]+$/.test(id));
      if(index===0)roomId=id;else assert.equal(id,roomId);
      client.seat=body.sessionId;
    }
    await route.fulfill({response});
  });
  await page.goto(base);await page.locator('.launch-screen').waitFor();await page.locator('[data-action="multiplayer"]').click();return client;
 }
 try{
  const a=await join(0);await a.page.locator('#coop-start').waitFor();assert.equal(await a.page.locator('#coop-start').isDisabled(),true);
  const b=await join(1);await b.page.getByText('SQUADRON READY',{exact:true}).waitFor();
  const c=await join(2);await c.page.getByText('SQUADRON READY',{exact:true}).waitFor();
  await until(async()=>(await a.page.locator('.coop-count').textContent()).includes('3 / 3'),'three isolated live pilots');
  assert.equal(new Set(clients.map(c=>c.seat)).size,3);
  const fourth=await join(3);await fourth.page.getByText('CO-OP UNAVAILABLE',{exact:true}).waitFor();await fourth.context.close();clients.pop();
  assert.equal(await a.page.locator('#coop-stage option').count(),edition==='manta'?21:20);
  await a.page.locator('#coop-stage').selectOption(edition==='manta'?'20':'19');
  assert.equal(await a.page.locator('#coop-revive').inputValue(),'2');assert.equal(await a.page.locator('#coop-revive-lives').inputValue(),'3');assert.equal(await a.page.locator('#coop-revive-resume').inputValue(),'yes');
  await a.page.locator('#coop-start').click();for(const client of clients)await client.page.locator('canvas').waitFor();
  await until(async()=>(await Promise.all(clients.map(c=>c.page.evaluate(snapshot)))).every(s=>s?.players.length===3),'three genuine rendered ships in every client',30000);
  await a.page.bringToFront();const before=(await a.page.evaluate(snapshot)).players,box=await a.page.locator('canvas').boundingBox(),cdp=await a.context.newCDPSession(a.page),finger={id:1,x:box.x+box.width*.5,y:box.y+box.height*.6},moved={...finger,x:finger.x-box.width*.18};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[moved]});await until(async()=>(await a.page.evaluate(snapshot)).players.some(p=>{const old=before.find(o=>o.uid===p.uid);return old&&p.x<old.x-100;}),'local aircraft responds to touch',3000);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[moved]});await delay(300);
  const after=(await a.page.evaluate(snapshot)).players;

  const own=after.find(p=>{const old=before.find(o=>o.uid===p.uid);return old&&p.x<old.x-100;});assert.ok(own,'real local touch moved one aircraft left');
  for(const client of [b,c])await until(async()=>(await client.page.evaluate(snapshot)).players.some(p=>Math.hypot(p.x-own.x,p.y-own.y)<12),'remote client renders touched pilot',12000);
  const stopped=(await a.page.evaluate(snapshot)).players.find(p=>p.uid===own.uid);await delay(300);const held=(await a.page.evaluate(snapshot)).players.find(p=>p.uid===own.uid);assert.ok(Math.hypot(held.x-stopped.x,held.y-stopped.y)<3,'release holds rendered aircraft');
  await a.page.locator('#coop-bomb').tap();await until(async()=>!(await a.page.locator('#coop-bomb').getAttribute('class')).includes('is-ready'),'real multiplayer bomb cooldown');
  for(let i=0;i<clients.length;i++){await clients[i].page.screenshot({path:path.join(output,`${edition}-coop-client-${i+1}.png`)});assert.deepEqual(clients[i].errors,[]);}
  await cdp.detach();console.log(`PASS ${edition}: three real production browser clients in an isolated room, fourth-seat rejection, final campaign sector, original rescue controls, actual touch movement rendered on both peers, release hold and bomb cooldown; no fabricated tickets or game-state injection.`);
 }finally{
  // Leave through the normal in-game control where possible, then close our contexts.
  for(const client of clients){try{if(await client.page.locator('.flight-back').isVisible())await client.page.locator('.flight-back').click();else if(await client.page.locator('#coop-leave').isVisible())await client.page.locator('#coop-leave').click();}catch{}await client.context.close();}
 }
}}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
