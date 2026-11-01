const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = process.env.WORLDFORGE_ENGINE || 'chromium';
const pw = require(process.env[engine === 'webkit' ? 'WEBKIT_PLAYWRIGHT_MODULE' : 'CHROMIUM_PLAYWRIGHT_MODULE'] || 'playwright');
const base = process.env.WORLDFORGE_BASE_URL || 'https://worldforge-self-test.joynez11.chatgpt.site/';
const output = process.env.WORLDFORGE_TEST_RESULTS || path.resolve('test-results/worldforge');
fs.mkdirSync(output, {recursive:true});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label, timeout=25000) {
  const end=Date.now()+timeout;
  while(Date.now()<end) { if(await fn()) return; await delay(90); }
  throw Error('Timed out: '+label);
}
const journalPath=path.join(output,'test-identities.json');
const journal=fs.existsSync(journalPath)?JSON.parse(fs.readFileSync(journalPath)):{};
const saveJournal=()=>fs.writeFileSync(journalPath,JSON.stringify(journal,null,2));
const profiles=new Set();
async function api(client,body) {
  return client.page.evaluate(async body=>{
    const response=await fetch('/api/game',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    return {status:response.status,data:await response.json()};
  },body);
}
async function ownParts(client) {
  const snapshot=await api(client,{action:'worldSnapshot'});
  assert.equal(snapshot.status,200);
  return snapshot.data.world.parts.filter(part=>part.creatorProfileId===client.profile);
}
async function cleanup(client) {
  if(!client.session) return;
  const recorded=new Set(journal[client.role]?.parts||[]);
  for(const part of await ownParts(client)) if(recorded.has(part.id)) {
    assert.equal((await api(client,{action:'buildRemove',sessionId:client.session,partId:part.id})).status,200);
  }
}
async function leave(client) {
  if(await client.page.getByTestId('game-menu-toggle').isVisible()) {
    if(await client.page.getByTestId('game-menu-toggle').getAttribute('aria-expanded')!=='true') await client.page.getByTestId('game-menu-toggle').click();
    await client.page.getByRole('menuitem',{name:'Leave world',exact:true}).click();
    await until(()=>client.page.getByTestId('join-world').isVisible(),'normal leave completed');client.session=null;
  }
}
async function position(client) {
  return client.page.getByTestId('game-canvas').evaluate(c=>({x:+c.dataset.localX,y:+c.dataset.localY,z:+c.dataset.localZ,grounded:c.dataset.localGrounded==='true'}));
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
async function walk(client,key,ms=650) {
  const before=await position(client);await client.page.keyboard.down(key);
  try {await delay(ms);} finally {await client.page.keyboard.up(key);}
  const after=await position(client);assert.ok(distance(before,after)>1,'real keyboard movement');return after;
}
async function stalledTick(client,kind) {
  let intercepted=false,finished=false,failure;
  await client.page.route('**/api/game',async route=>{
    if(intercepted||route.request().postDataJSON()?.action!=='tick') return route.continue();
    intercepted=true;
    try {
      if(kind==='upload') await delay(3000);
      const response=await route.fetch();
      if(kind==='response') await delay(3000);
      await route.fulfill({response});
    } catch(error) {failure=error;} finally {finished=true;}
  });
  try {
    await until(()=>intercepted,'actual intercepted tick');
    const end=await walk(client,kind==='response'?'w':'s');
    await until(()=>finished,'actual delayed tick delivery',20000);
    if(failure) throw failure;
    await delay(500);assert.ok(distance(end,await position(client))<0.7,'no stale rewind after delayed tick');
    assert.ok((await position(client)).grounded,'landed player stays grounded');
  } finally {await client.page.keyboard.up('w');await client.page.keyboard.up('s');await client.page.unrouteAll({behavior:'wait'});}
}
(async()=>{
  const browser=await pw[engine].launch(engine==='chromium'&&process.env.WORLDFORGE_HEADLESS_SHELL!=='1'?{timeout:30000,channel:'chrome',args:['--disk-cache-size=1']}:{timeout:30000,headless:true});
  console.log('Browser launched:',engine);const clients=[];
  try {
    for(const [role,viewport] of [['desktop',{width:1280,height:800}],['touch',{width:844,height:390}]]) {
      const context=await browser.newContext({viewport,hasTouch:role==='touch',isMobile:role==='touch',acceptDownloads:true});
      if(journal[role]?.profile) await context.addInitScript(profile=>localStorage.setItem('worldforge-profile-id',profile),journal[role].profile);
      const page=await context.newPage(),client={role,context,page,profile:null,session:null,players:[],errors:[],failures:[],apiErrors:[],navigations:[]};clients.push(client);
      page.on('pageerror',error=>client.errors.push({message:error.message,at:Date.now()}));
      page.on('requestfailed',request=>client.failures.push({path:new URL(request.url()).pathname,error:request.failure()?.errorText,at:Date.now()}));
      page.on('request',request=>{if(new URL(request.url()).pathname!=='/api/game'||request.method()!=='POST')return;
        const body=request.postDataJSON();if(!body)return;
        if(body.action==='join') {client.profile=body.profileId;client.session=body.sessionId;profiles.add(body.profileId);journal[role]||={profile:body.profileId,parts:[]};saveJournal();}
        if(body.action==='buildPlace'&&body.part?.id) {journal[role].parts.push(body.part.id);saveJournal();}
      });
      page.on('response',async response=>{try {const request=response.request();if(new URL(response.url()).pathname!=='/api/game'||request.method()!=='POST')return;
        if(response.status()>=500)client.apiErrors.push(response.status());if(!response.ok())return;
        const data=await response.json();if(data.players)client.players=data.players.filter(player=>profiles.has(player.profileId));
      }catch{}});
      console.log('Opening',role);await page.goto(base);await until(()=>page.getByTestId('join-world').isEnabled(),'join ready');
      if(role==='touch') {
        const select=page.getByTestId('start-plot-select');await select.focus();
        const slot=await clients[0].page.getByTestId('game-canvas').getAttribute('data-plot-slot');
        await until(async()=>await select.locator(`option[value="${slot}"]`).count()>0,'own QA area available');await select.selectOption(slot);
      }
      await page.getByTestId('player-name').fill('Webbtest '+role);await page.getByTestId('join-world').click();
      const canvas=page.getByTestId('game-canvas');await until(async()=>await canvas.getAttribute('data-renderer-ready')==='true'&&await canvas.getAttribute('data-local-x')!==null,'real rendered avatar');
      assert.equal(await canvas.getAttribute('data-network-transport'),'http-authoritative-fallback');
      assert.equal(await canvas.getAttribute('data-camera-visibility-policy'),'opaque');
      assert.ok(Math.abs(Number(await canvas.getAttribute('data-camera-distance'))-14.5)<0.05);
      await cleanup(client);console.log('Joined',role);
    }
    const [a,b]=clients,canvas=a.page.getByTestId('game-canvas');
    console.log('Testing movement');const end=await walk(a,'w');
    await until(()=>b.players.some(p=>p.profileId===a.profile&&Math.hypot(p.position[0]-end.x,p.position[2]-end.z)<0.8),'actual peer movement');
    await walk(a,'s');await until(async()=>(await position(a)).grounded,'standing');
    const floor=(await position(a)).y;await a.page.keyboard.down('Space');
    try {await until(async()=>(await position(a)).y>floor+0.35,'real jump');} finally {await a.page.keyboard.up('Space');}
    await until(async()=>(await position(a)).grounded,'real landing');
    if(engine==='chromium') {
      await stalledTick(a,'response');await stalledTick(a,'upload');
      const cdp=await b.context.newCDPSession(b.page),box=await b.page.getByTestId('touch-joystick').boundingBox();
      const x=box.x+box.width/2,y=box.y+box.height/2,start=await position(b);
      const touch=(type,dy=0)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchCancel'?[]:[{x,y:y+dy,id:1,radiusX:8,radiusY:8,force:1}]});
      await touch('touchStart');await touch('touchMove',-45);await delay(600);await touch('touchCancel');
      const stop=await position(b);assert.ok(distance(start,stop)>1,'real native touch');await delay(500);assert.ok(distance(stop,await position(b))<0.7,'cancel releases movement');
    }
    console.log('Testing avatars');await a.page.locator('.topbar-actions > .tool-button').click();
    await until(async()=>await a.page.getByTestId('character-3d-preview').getAttribute('data-model-ready')==='true','real character preview');
    await a.page.getByLabel('Choose character part').selectOption('hairId');
    await a.page.getByRole('button',{name:'Hair: Braids',exact:true}).click();await a.page.getByRole('button',{name:'Hair: Mohawk',exact:true}).click();
    await a.page.getByLabel('Character name',{exact:true}).fill('Webbtest character');await a.page.getByRole('button',{name:'Save',exact:true}).click();
    const downloading=a.page.waitForEvent('download');await a.page.getByTestId('export-characters').click();const exported=fs.readFileSync(await (await downloading).path());JSON.parse(exported);
    await a.page.getByTestId('close-avatar-editor').click();
    await until(()=>b.players.some(p=>p.profileId===a.profile&&p.avatar.hairId==='hair.mohawk'),'autosave visible to peer');
    await b.page.locator('.topbar-actions > .tool-button').click();await b.page.getByTestId('character-import-file').setInputFiles({name:'character.json',mimeType:'application/json',buffer:exported});
    await b.page.getByRole('button',{name:'Use character Webbtest character',exact:true}).click();await b.page.getByTestId('close-avatar-editor').click();
    await until(async()=>JSON.parse(await b.page.getByTestId('game-canvas').getAttribute('data-local-avatar'))?.hairId==='hair.mohawk','imported avatar rendered');
    console.log('Testing persistent building');await a.page.getByTestId('block-style-toggle').click();await a.page.getByRole('option',{name:'Wood',exact:true}).click();
    const prior=new Set((await ownParts(a)).map(p=>p.id)),bounds=await canvas.boundingBox();let placed;
    for(const [rx,ry] of [[.5,.4],[.62,.42],[.72,.48],[.42,.52],[.58,.56],[.75,.58]]) {
      const x=bounds.x+bounds.width*rx,y=bounds.y+bounds.height*ry;await a.page.mouse.move(x,y);await delay(120);
      if(await canvas.getAttribute('data-placement-target-valid')==='true') {await a.page.mouse.click(x,y);placed=true;break;}
    }
    assert.ok(placed,'valid normal raycast build point');
    let part;await until(async()=>{part=(await ownParts(a)).find(p=>!prior.has(p.id));return !!part;},'actual persisted block');assert.equal(part.styleId,'style.wood');
    await until(async()=>await canvas.getAttribute('data-styled-part-textures-ready')==='true','real textured mesh');
    assert.equal((await api(b,{action:'buildRemove',sessionId:b.session,partId:part.id})).status,403,'foreign profile denied');
    console.log('Reloading persisted block');const nav={start:Date.now(),end:null};a.navigations.push(nav);await a.page.reload();nav.end=Date.now();
    await until(()=>a.page.getByTestId('join-world').isEnabled(),'reload join ready');await a.page.getByTestId('join-world').click();
    await until(async()=>(await ownParts(a)).some(p=>p.id===part.id),'D1 persistence');
    await until(async()=>JSON.parse(await canvas.getAttribute('data-local-avatar'))?.hairId==='hair.mohawk','avatar persistence');
    for(const client of clients)await client.page.screenshot({path:path.join(output,`worldforge-${engine}-${client.role}.jpg`),type:'jpeg',quality:80});
    await a.page.getByTestId('pickaxe-tool').click();let removed=false;const box=await canvas.boundingBox();
    for(let ry=.2;ry<=.8&&!removed;ry+=.065)for(let rx=.12;rx<=.88&&!removed;rx+=.065) {
      const x=box.x+box.width*rx,y=box.y+box.height*ry;await a.page.mouse.move(x,y);await delay(35);
      if(await canvas.getAttribute('data-removal-target')===part.id) {await a.page.mouse.click(x,y);removed=true;}
    }
    assert.ok(removed,'ordinary pickaxe targeted only exact own block');await until(async()=>!(await ownParts(a)).some(p=>p.id===part.id),'pickaxe save');
    for(const client of clients) {
      const expected=error=>engine==='webkit'&&/Load failed|Fetch API cannot load.*access control checks/i.test(error.message)&&client.navigations.some(n=>n.end&&error.at>=n.start&&error.at<=n.end+200)&&client.failures.some(r=>r.path==='/api/game'&&/cancelled/i.test(r.error)&&Math.abs(r.at-error.at)<1500);
      assert.deepEqual(client.errors.filter(error=>!expected(error)),[]);assert.deepEqual(client.apiErrors,[]);await leave(client);
    }
    console.log(`PASS ${engine}: real renderer/camera, keyboard/jump, two HTTP/D1 clients, peer movement, character preview/autosave/export/import, normal styled building, ownership, reload persistence, exact pickaxe cleanup${engine==='chromium'?', native touch/cancel and delivered 3-second upload/response stalls':''}.`);
  } finally {
    for(const client of clients) {try {await cleanup(client);await leave(client);} catch(error){console.error('QA cleanup failed:',error.message);}await client.context.close();}
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
