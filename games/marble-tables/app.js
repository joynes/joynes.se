'use strict';
const canvas = document.querySelector('canvas');
const start = document.querySelector('#start');
const restart = document.querySelector('#restart');
const status = document.querySelector('#status');
const progress = document.querySelector('#progress');
let instance;
let busy = false;
async function launch() {
  if (busy || instance) return;
  busy = true;
  start.disabled = true;
  progress.hidden = false;
  progress.value = 0;
  status.textContent = 'Loading playground…';
  try {
    if (typeof createUnityInstance !== 'function') await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'Build/webtest2.loader.js';
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error('The loader is unavailable')); };
      document.body.append(script);
    });
    instance = await createUnityInstance(canvas, {
      dataUrl: 'Build/webtest2.data', frameworkUrl: 'Build/webtest2.framework.js',
      codeUrl: 'Build/webtest2.wasm', streamingAssetsUrl: 'StreamingAssets',
      companyName: 'DefaultCompany', productName: 'Marble tables', productVersion: '1.0.2',
      matchWebGLToCanvasSize: false, devicePixelRatio: 1,
      showBanner(message, type) { if (type === 'error') status.textContent = 'The game engine reported an error. Try restarting or reloading the page.'; }
    }, value => { progress.value = value; });
    start.hidden = true;
    restart.disabled = false;
    status.textContent = 'Playground ready. Drag a marble with touch, mouse or the keyboard crosshair.';
    document.body.dataset.state = 'playing';
    canvas.focus({preventScroll:true});
  } catch (error) {
    status.textContent = 'The game could not load. Check your connection and try again.';
    start.disabled = false;
    start.textContent = 'Try again';
    document.body.dataset.state = 'error';
  } finally { busy = false; progress.hidden = true; }
}
start.addEventListener('click', launch);
// A new document releases the old WebGL runtime and all native input state.
restart.addEventListener('click', () => location.reload());
document.querySelector('#fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector('#stage').requestFullscreen();
  } catch { status.textContent = 'Fullscreen is unavailable here. Try the browser fullscreen mode or rotate the screen.'; }
});
canvas.addEventListener('pointerdown', () => canvas.focus({preventScroll: true}));

const keyboardPointer=installKeyboardPointer(canvas,document.querySelector('#stage'),()=>Boolean(instance));
