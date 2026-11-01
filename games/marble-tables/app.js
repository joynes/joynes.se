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
  status.textContent = 'Laddar kulbanan…';
  try {
    if (typeof createUnityInstance !== 'function') throw new Error('Laddaren saknas');
    instance = await createUnityInstance(canvas, {
      dataUrl: 'Build/webtest2.data', frameworkUrl: 'Build/webtest2.framework.js',
      codeUrl: 'Build/webtest2.wasm', streamingAssetsUrl: 'StreamingAssets',
      companyName: 'DefaultCompany', productName: 'Marble tables', productVersion: '1.0.2',
      matchWebGLToCanvasSize: false, devicePixelRatio: 1,
      showBanner(message, type) { if (type === 'error') status.textContent = 'Spelmotorn rapporterar ett fel. Prova att börja om eller ladda om sidan.'; }
    }, value => { progress.value = value; });
    start.hidden = true;
    restart.disabled = false;
    status.textContent = 'Kulbanan är igång. Dra en kula och släpp!';
    document.body.dataset.state = 'playing';
  } catch (error) {
    status.textContent = 'Spelet kunde inte laddas. Kontrollera anslutningen och försök igen.';
    start.disabled = false;
    start.textContent = 'Försök igen';
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
  } catch { status.textContent = 'Helskärm stöds inte här. Prova webbläsarens helskärmsläge eller vrid skärmen.'; }
});
canvas.addEventListener('pointerdown', () => canvas.focus({preventScroll: true}));
