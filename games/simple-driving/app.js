'use strict';
const canvas = document.querySelector('canvas');
const engineRoot = new URL('Build/', document.currentScript.src).href;
const streamingRoot = new URL('StreamingAssets/', document.currentScript.src).href;
const status = document.querySelector('#status');
const start = document.querySelector('#start');
const pause = document.querySelector('#pause');
const restart = document.querySelector('#restart');
const progress = document.querySelector('#progress');
const controls = [...document.querySelectorAll('[data-control]')];
const heldKeys = new Set();
const heldPointers = new Map();
const keys = {ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right'};
let instance;
let busy = false;
let virtualDown = false;
let lastPoint = {x: 0, y: 0};
function mouse(type, point, down) {
  canvas.dispatchEvent(new MouseEvent(type, {bubbles: true, cancelable: true,
    clientX: point.x, clientY: point.y, button: 0, buttons: down ? 1 : 0}));
}
function syncInput() {
  const active = new Set([...heldKeys].map(key => keys[key]).concat([...heldPointers.values()]));
  for (const button of controls) button.setAttribute('aria-pressed', String(active.has(button.dataset.control)));
  const down = active.has('gas') || active.has('brake');
  const turn = Number(active.has('right')) - Number(active.has('left'));
  const box = canvas.getBoundingClientRect();
  const point = {x: box.left + box.width * (.5 + .49 * turn), y: box.top + box.height * (active.has('brake') ? .975 : .5)};
  if (down) {
    mouse('mousemove', point, virtualDown);
    if (!virtualDown) mouse('mousedown', point, true);
    lastPoint = point;
  } else if (virtualDown) mouse('mouseup', lastPoint, false);
  virtualDown = down;
}
function releaseInput() { heldKeys.clear(); heldPointers.clear(); syncInput(); }
function togglePause() {
  releaseInput();
  // Send the original pause key: it is ignored safely on menus and result screens.
  const event = type => canvas.dispatchEvent(new KeyboardEvent(type, {key: 'Tab', code: 'Tab', keyCode: 9, which: 9, bubbles: true}));
  event('keydown');
  requestAnimationFrame(() => requestAnimationFrame(() => event('keyup')));
}
for (const button of controls) {
  button.disabled = true;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('pointerdown', event => {
    if (button.disabled) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    heldPointers.set(event.pointerId, button.dataset.control);
    canvas.focus({preventScroll: true});
    syncInput();
  });
  const release = event => { heldPointers.delete(event.pointerId); syncInput(); };
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, release);
  // Enter/Space on a focused touch button use the same held-input route.
  button.addEventListener('keydown', event => {
    if (!['Space', 'Enter'].includes(event.code) || button.disabled) return;
    event.preventDefault(); heldPointers.set('keyboard-' + button.dataset.control, button.dataset.control); syncInput();
  });
  button.addEventListener('keyup', event => {
    if (!['Space', 'Enter'].includes(event.code)) return;
    event.preventDefault(); heldPointers.delete('keyboard-' + button.dataset.control); syncInput();
  });
}
document.addEventListener('keydown', event => {
  // Keep real Tab available for HTML keyboard navigation, instead of Unity's global capture.
  if (instance && event.code === 'Tab' && event.isTrusted) { releaseInput(); event.stopImmediatePropagation(); return; }
  if (!instance || busy || document.activeElement !== canvas) return;
  if (keys[event.code]) { event.preventDefault(); event.stopImmediatePropagation(); heldKeys.add(event.code); syncInput(); }
  if (event.code === 'KeyP' && !event.repeat) { event.preventDefault(); event.stopImmediatePropagation(); togglePause(); }
  if (event.code === 'Escape') releaseInput();
}, true);
document.addEventListener('keyup', event => {
  if (instance && event.code === 'Tab' && event.isTrusted) { event.stopImmediatePropagation(); return; }
  if (heldKeys.has(event.code)) { event.preventDefault(); event.stopImmediatePropagation(); heldKeys.delete(event.code); syncInput(); }
}, true);
canvas.addEventListener('pointerdown', () => { releaseInput(); canvas.focus({preventScroll: true}); });
canvas.addEventListener('blur', releaseInput);
window.addEventListener('blur', () => { releaseInput(); mouse('mouseup', lastPoint, false); });
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseInput(); });
function warmUp() {
  // Unity 2021's splash scene precedes menu creation. Count visible rendered time,
  // so loading a background tab cannot send a scene message before it exists.
  return new Promise(resolve => {
    let elapsed = 0, previous;
    function frame(time) {
      if (!document.hidden && previous !== undefined) elapsed += Math.min(time - previous, 100);
      previous = time;
      if (elapsed >= 4500) resolve(); else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
async function downloadAsset(url, type, weight, offset) {
  const response = await fetch(url, {cache: 'no-cache'});
  if (!response.ok) throw new Error('Spelfilen kunde inte hämtas');
  const chunks = [];
  const reader = response.body.getReader();
  const total = Number(response.headers.get('Content-Length'));
  let loaded = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    chunks.push(value); loaded += value.byteLength;
    if (total) progress.value = offset + weight * Math.min(loaded / total, 1);
  }
  progress.value = offset + weight;
  return URL.createObjectURL(new Blob(chunks, {type}));
}
async function launch() {
  if (busy || instance) return;
  busy = true; start.disabled = true; progress.hidden = false; progress.value = 0;
  status.textContent = 'Laddar körspelet…'; document.body.dataset.state = 'loading';
  const objectUrls = [];
  try {
    if (typeof createUnityInstance !== 'function') await new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = engineRoot + 'cartWeb2.loader.js';
      script.onload = resolve; script.onerror = () => { script.remove(); reject(new Error('Laddaren saknas')); }; document.body.append(script);
    });
    // Unity 2021's stock data/framework download failures can leave its startup
    // promise pending. Fetch these first, so failure happens before engine startup.
    const dataUrl = await downloadAsset('Build/cartWeb2.data', 'application/octet-stream', .45, 0);
    objectUrls.push(dataUrl);
    const frameworkUrl = await downloadAsset(engineRoot + 'cartWeb2.framework.js', 'application/javascript', .01, .45);
    objectUrls.push(frameworkUrl);
    instance = await createUnityInstance(canvas, {
      dataUrl, frameworkUrl, codeUrl: engineRoot + 'cartWeb2.wasm', cacheControl: () => 'no-store',
      streamingAssetsUrl: streamingRoot, companyName: 'DefaultCompany', productName: 'My project', productVersion: '5.0.1',
      matchWebGLToCanvasSize: false, devicePixelRatio: 1,
      showBanner(message, type) { if (type === 'error') status.textContent = 'Spelmotorn rapporterar ett fel. Prova att börja om.'; }
    }, value => { progress.value = .46 + value * .54; });
    status.textContent = 'Startar Unity-motorn…';
    document.body.dataset.state = 'warming';
    await warmUp();
    instance.SendMessage('StartButton', 'LoadTargetScene');
    start.hidden = true; pause.disabled = restart.disabled = false;
    for (const button of controls) button.disabled = false;
    document.body.dataset.state = 'playing';
    status.textContent = 'Samla alla tre portar. Klicka i banan för tangentbord, eller håll körknapparna.';
  } catch (error) {
    status.textContent = 'Spelet kunde inte laddas. Kontrollera anslutningen och försök igen.';
    start.disabled = false; start.textContent = 'Försök igen'; document.body.dataset.state = 'error';
  } finally { for (const url of objectUrls) URL.revokeObjectURL(url); busy = false; progress.hidden = true; }
}
start.addEventListener('click', launch);
pause.addEventListener('click', togglePause);
document.querySelector('#fullscreen-pause').addEventListener('click', togglePause);
document.querySelector('#fullscreen-exit').addEventListener('click', () => { releaseInput(); document.exitFullscreen(); });
restart.addEventListener('click', () => location.reload());
document.querySelector('#fullscreen').addEventListener('click', async () => {
  releaseInput();
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.querySelector('#play-shell').requestFullscreen(); }
  catch { status.textContent = 'Helskärm stöds inte här. Prova att vrida skärmen.'; }
});
