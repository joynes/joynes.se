const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
execFileSync('swiftc',['scripts/ocr-game-frame.swift','-o','/tmp/joynes-driving-frame-ocr']);
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:8767/games/simple-driving/';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(base);await page.getByRole('button',{name:'Starta körspelet'}).click();
  await page.waitForFunction(()=>document.body.dataset.state==='playing',{},{timeout:90000});
  await page.getByRole('button',{name:'Helskärm',exact:true}).click();await page.waitForFunction(()=>Boolean(document.fullscreenElement));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   const canvas=await page.locator('canvas').boundingBox();assert(Math.abs(canvas.width/canvas.height-1.6)<.01);
   for(const selector of ['canvas','[data-control="left"]','[data-control="right"]','[data-control="gas"]','[data-control="brake"]','#fullscreen-pause','#fullscreen-exit']){
    const box=await page.locator(selector).boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1,selector+' must fit fullscreen '+JSON.stringify(viewport));
   }
   await page.screenshot({path:`test-results/driving-fullscreen-${viewport.width}.png`});
  }
  await page.getByRole('button',{name:'Paus',exact:true}).click();await page.waitForTimeout(350);
  const path='test-results/driving-fullscreen-pause.png';await page.locator('canvas').screenshot({path});
  const text=JSON.parse(execFileSync('/tmp/joynes-driving-frame-ocr',[path],{encoding:'utf8'})).join('\n');assert.match(text,/Menu/);assert.match(text,/Shadows/);
  await page.getByRole('button',{name:'Paus',exact:true}).click();await page.waitForTimeout(250);
  await page.getByRole('button',{name:'Lämna helskärm',exact:true}).click();await page.waitForFunction(()=>!document.fullscreenElement);
  await page.evaluate(()=>instance.Quit());assert.deepEqual(errors,[]);
  console.log('Fullscreen portrait/landscape: complete canvas, all four driving controls, real native pause and visible exit passed');
 }finally{await browser.close();assert(!browser.isConnected());}
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
