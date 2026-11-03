/* Local input prototype: normal browser events enter the original runtime. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const frame = $('runtime'), stage = $('stage');
  const definitions = [
    [['Forward','ArrowUp',38],['Back','ArrowDown',40],['Turn left','ArrowLeft',37],['Turn right','ArrowRight',39],['Gun left','KeyI',73],['Gun right','KeyO',79],['Fire','KeyP',80],['Siege','KeyU',85]],
    [['Forward','KeyD',68],['Back','KeyX',88],['Turn left','KeyZ',90],['Turn right','KeyC',67],['Gun left','KeyB',66],['Gun right','KeyN',78],['Fire','KeyV',86],['Siege','KeyM',77]],
  ];
  const keyCodes = new Map(definitions.flat().map(([,code,n]) => [code,n]));
  for (const [code,n] of [['Enter',13],['KeyW',87],['Tab',9],['Escape',27],['F5',116]]) keyCodes.set(code,n);
  const keyNames = new Map();
  let win, canvas, timer, generation = 0, started = false, selected = false;
  let origin = {x:32,y:32}, templates = [];
  let fullscreenExit = 0;
  const held = new Map();
  const nativeDownAt = new Map(), pendingRelease = new Map(), pendingDown = new Map();
  const pulsed = new Set(['KeyW','KeyU','KeyM','KeyP','KeyV','Enter','Tab','F5']);
  const status = (text) => { $('status').textContent = text; };
  const focusGame = () => { win?.focus(); canvas?.focus({preventScroll:true}); };
  function fit() {
    const scale = stage.getBoundingClientRect().width / 640;
    frame.style.transform = `scale(${scale})`;
    frame.style.left = `${-origin.x * scale}px`;
    frame.style.top = `${-origin.y * scale}px`;
  }
  new ResizeObserver(fit).observe(stage);
  function sendKey(code,down) {
    if (!canvas) return;
    clearTimeout(pendingRelease.get(code)); pendingRelease.delete(code);
    if (down) nativeDownAt.set(code,performance.now());
    else nativeDownAt.delete(code);
    const key = keyNames.get(code) || (code.startsWith('Key') ? code.slice(3).toLowerCase() : code);
    const event = new win.KeyboardEvent(down ? 'keydown' : 'keyup', {
      key,code,keyCode:keyCodes.get(code),which:keyCodes.get(code),bubbles:true,cancelable:true,
    });
    Object.defineProperty(event,'rallTouchInput',{value:true});
    canvas.dispatchEvent(event);
  }
  function remainingPulse(code) {
    return pulsed.has(code) ? Math.max(0,250-(performance.now()-(nativeDownAt.get(code) || 0))) : 0;
  }
  function keyUp(code,force=false) {
    if (pendingDown.has(code)) {
      if (!force) return; // Preserve a quick tap until focus has settled.
      clearTimeout(pendingDown.get(code)); pendingDown.delete(code);
    }
    const remaining=force?0:remainingPulse(code);
    if (!remaining) { sendKey(code,false); return; }
    clearTimeout(pendingRelease.get(code));
    pendingRelease.set(code,setTimeout(() => {
      pendingRelease.delete(code);
      if (!held.has(code)) sendKey(code,false);
    },remaining));
  }
  function paint() {
    document.querySelectorAll('[data-code]').forEach(b => {
      const active = held.has(b.dataset.code);
      b.dataset.held = String(active);
      b.setAttribute('aria-pressed',String(active));
    });
  }
  function press(code,owner) {
    const owners = held.get(code) || new Set();
    if (owners.has(owner)) return;
    const first = !owners.size;
    owners.add(owner); held.set(code,owners);
    if (first) {
      clearTimeout(pendingDown.get(code));
      const token=generation;
      pendingDown.set(code,setTimeout(() => {
        pendingDown.delete(code);
        if (token!==generation || !started) return;
        sendKey(code,true);
        if (!held.has(code)) {
          // A tap released during the focus transition still needs a pulse.
          pendingRelease.set(code,setTimeout(() => { if (!held.has(code)) sendKey(code,false); },250));
        }
      },100));
    }
    paint();
  }
  function release(code,owner,force=false) {
    const owners = held.get(code);
    if (!owners?.delete(owner)) return;
    if (!owners.size) { held.delete(code); keyUp(code,force); }
    paint();
  }
  function releaseAll() {
    for (const code of new Set([...held.keys(),...nativeDownAt.keys()])) sendKey(code,false);
    for (const timer of pendingRelease.values()) clearTimeout(timer);
    for (const timer of pendingDown.values()) clearTimeout(timer);
    pendingDown.clear();
    pendingRelease.clear(); nativeDownAt.clear();
    held.clear(); paint();
  }
  function pads() {
    releaseAll(); $('pads').replaceChildren();
    const count = $('mode').value === 'two' ? 2 : 1;
    definitions.slice(0,count).forEach((keys,i) => {
      const panel = document.createElement('section'); panel.className = 'pad';
      const title = document.createElement('h2'); title.textContent = i ? 'Green tank · Player 2' : 'Blue tank · Player 1';
      const grid = document.createElement('div'); grid.className = 'keys';
      for (const [label,code] of keys) {
        const button = document.createElement('button'); button.type = 'button';
        const compact = {Forward:'↑\nDrive',Back:'↓\nBack','Turn left':'↶\nTurn','Turn right':'↷\nTurn','Gun left':'Aim\n↶','Gun right':'Aim\n↷'};
        button.textContent = compact[label] || label;
        button.title=label; button.dataset.code = code; button.disabled = !started;
        button.setAttribute('aria-label',`${title.textContent}: ${label}`);
        button.addEventListener('pointerdown',e => {
          e.preventDefault(); button.setPointerCapture(e.pointerId); focusGame();
          press(code,`touch:${e.pointerId}`);
        });
        for (const type of ['pointerup','pointercancel','lostpointercapture']) {
          button.addEventListener(type,e => release(code,`touch:${e.pointerId}`,type!=='pointerup'));
        }
        // Keyboard activation of a touch control holds it for a short action.
        button.addEventListener('click',e => {
          if (e.detail !== 0) return;
          focusGame(); press(code,'button'); setTimeout(() => release(code,'button'),180);
        });
        grid.append(button);
      }
      panel.append(title,grid); $('pads').append(panel);
    });
    paint();
  }
  function attachKeyboard() {
    const runtimeWindow=win, token=generation;
    const physicalCode = e => e.code && e.code!=='Unidentified' ? e.code :
      (/^[a-z]$/i.test(e.key) ? `Key${e.key.toUpperCase()}` :
        [...keyCodes].find(([,n])=>n===e.keyCode)?.[0] || e.key || `KeyCode${e.keyCode}`);
    win.addEventListener('keydown',e => {
      if (token!==generation) return;
      if (e.rallTouchInput) return;
      const code=physicalCode(e);
      if (code==='Escape' && (document.fullscreenElement || Date.now()-fullscreenExit<250)) {
        e.preventDefault(); e.stopImmediatePropagation(); releaseAll();
        if (document.fullscreenElement) document.exitFullscreen();
        return;
      }
      if (code === 'Tab' && e.shiftKey) {
        e.preventDefault(); e.stopImmediatePropagation(); releaseAll(); $('pause').focus(); return;
      }
      keyCodes.set(code,e.keyCode); keyNames.set(code,e.key);
      const owners = held.get(code) || new Set();
      if (owners.size && !owners.has('keyboard')) { e.preventDefault(); e.stopImmediatePropagation(); }
      if (!owners.size) {
        clearTimeout(pendingDown.get(code)); pendingDown.delete(code);
        clearTimeout(pendingRelease.get(code)); pendingRelease.delete(code);
        nativeDownAt.set(code,performance.now());
      }
      owners.add('keyboard'); held.set(code,owners); paint();
    },true);
    win.addEventListener('keyup',e => {
      if (token!==generation) return;
      if (e.rallTouchInput) return;
      const code=physicalCode(e);
      if (!keyCodes.has(code)) return;
      const owners = held.get(code);
      owners?.delete('keyboard');
      if (owners?.size) { e.preventDefault(); e.stopImmediatePropagation(); }
      else {
        held.delete(code);
        if (remainingPulse(code)>0) { e.preventDefault(); e.stopImmediatePropagation(); keyUp(code); }
        else { nativeDownAt.delete(code); clearTimeout(pendingRelease.get(code)); pendingRelease.delete(code); }
      }
      paint();
    },true);
    win.addEventListener('blur',() => {
      setTimeout(() => { if (token===generation && !runtimeWindow.document.hasFocus()) releaseAll(); },0);
    });
    win.document.addEventListener('visibilitychange',() => {
      if (token===generation && runtimeWindow.document.hidden) releaseAll();
    });
  }
  // Observe original pixels; never write emulator memory or gameplay state.
  function findMenu() {
    if (!canvas || !templates.length || canvas.width < 640) return null;
    const data = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    for (const t of templates) {
      for (let oy=0;oy<=100;oy++) for (let ox=0;ox<=140;ox++) {
        let match = true;
        for (const [dx,dy,r,g,b] of t.samples) {
          const n = ((184+oy+dy)*canvas.width + 208+ox+dx)*4;
          if (Math.abs(data[n]-r)>10 || Math.abs(data[n+1]-g)>10 || Math.abs(data[n+2]-b)>10) { match=false; break; }
        }
        if (match) return {x:ox,y:oy};
      }
    }
    return null;
  }
  const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
  async function chooseMode(token) {
    selected = true;
    const x=origin.x+308, y=origin.y+($('mode').value==='two'?265:209);
    focusGame();
    for (let i=0;i<2;i++) {
      if (token !== generation) return;
      for (const [type,buttons] of [['mousemove',0],['mousedown',1]]) canvas.dispatchEvent(new win.MouseEvent(type,{view:win,clientX:x,clientY:y,button:0,buttons,bubbles:true,cancelable:true}));
      await delay(220);
      if (token !== generation) return;
      canvas.dispatchEvent(new win.MouseEvent('mouseup',{view:win,clientX:x,clientY:y,button:0,buttons:0,bubbles:true,cancelable:true}));
      await delay(600);
      if (token !== generation) return;
      if (!findMenu()) break;
    }
    if (findMenu()) {
      selected=false; status('The original menu is still open. Retrying the mode selection…'); return;
    }
    status('Original game running. Press Continue / Enter when prompted.');
    $('continue').disabled = $('pause').disabled = false;
  }
  function load() {
    releaseAll(); clearInterval(timer); generation++;
    started = selected = false; win = canvas = null;
    frame.style.visibility = 'hidden';
    $('start').disabled = true; $('start').textContent = 'Loading runtime…';
    $('continue').disabled = $('pause').disabled = true;
    status('Preparing the original game…'); pads();
    const token = generation;
    frame.onload = () => {
      if (token !== generation) return;
      win = frame.contentWindow; canvas = win.document.getElementById('canvas');
      // SDL's host display must fit the 800x600 Windows desktop on a phone too.
      // The visible game is scaled by this page, with touch input kept available.
      win.Module.rallDisplayWidth=1024; win.Module.rallDisplayHeight=768;
      canvas.tabIndex = 0; win.document.body.append(canvas);
      const style = win.document.createElement('style');
      style.textContent = 'html,body{margin:0!important;padding:0!important;overflow:hidden!important;background:#000!important}body>*{display:none!important}body>#canvas{display:block!important;margin:0!important;border:0!important;width:800px!important;height:600px!important}';
      win.document.head.append(style); attachKeyboard(); fit();
      let ticks = 0;
      timer = setInterval(() => {
        if (token !== generation) return;
        ticks++;
        if (!started) {
          const button = win.document.getElementById('startbtn');
          if (button && !button.disabled && button.style.display !== 'none') {
            $('start').disabled = false; $('start').textContent = 'Start original game';
            status('Ready. Start the original game to enable sound and controls.');
          }
          return;
        }
        const found = findMenu();
        if (found) {
          origin=found; fit(); frame.style.visibility='visible';
          if (!selected) chooseMode(token).catch(e => status(`Input error: ${e.message}`));
        }
        if (ticks > 240 && !selected) status('Startup is taking longer than expected. Restart to try again.');
      },500);
    };
    frame.src = '../boxedwine.html?app=rall&p=rall.exe&auto=false&sound=true&resolution=800x600';
  }
  $('start').onclick = () => {
    if (!win || started) return;
    started=true; $('start').disabled=true; $('start').textContent='Original game started';
    frame.style.visibility='visible';
    win.document.getElementById('startbtn').click();
    $('continue').disabled = false;
    status('Starting the original game. Press Continue / Enter to advance its intro. Startup can take about 30 seconds.');
    pads(); focusGame();
  };
  function action(code) {
    if (!started) return;
    releaseAll(); focusGame();
    // Wine processes the focus transition asynchronously. Send the action
    // after that transition, rather than letting focus cleanup erase it.
    press(code,'action'); setTimeout(() => release(code,'action'),150);
  }
  for (const id of ['continue','pause','fullscreen']) $(id).addEventListener('pointerdown',e => e.preventDefault());
  $('continue').onclick = () => action('Enter');
  $('pause').onclick = () => action('KeyW');
  $('restart').onclick = load;
  $('mode').onchange = load;
  $('fullscreen').onclick = async () => {
    releaseAll();
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('game').requestFullscreen();
    fit(); focusGame();
  };
  window.addEventListener('blur',() => { if (!document.hasFocus()) releaseAll(); });
  document.addEventListener('visibilitychange',() => { if (document.hidden) releaseAll(); });
  window.addEventListener('pagehide',releaseAll);
  document.addEventListener('fullscreenchange',() => {
    if (!document.fullscreenElement) fullscreenExit=Date.now();
    releaseAll(); fit();
    const token=generation;
    requestAnimationFrame(() => { if (token===generation && started) focusGame(); });
  });
  fetch('menu-templates.json').then(r => {
    if (!r.ok) throw new Error(`Menu data: HTTP ${r.status}`);
    return r.json();
  }).then(data => { templates=data; load(); }).catch(e => status(e.message));
})();
