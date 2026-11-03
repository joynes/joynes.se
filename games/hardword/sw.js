const CACHE_PREFIX = 'joynes-hardword-';
const CACHE = CACHE_PREFIX + 'v2';
const ROOT = new URL('./', self.location.href);
const ASSETS = ['./', './index.html', './storage.js', './accessibility.js', './manifest.json',
  './icon-192.png', './icon-512.png', './fonts/nunito-latin.woff2', './fonts/nunito-latin-ext.woff2',
  './music.mp3', './music2.mp3', './music3.mp3', './music4.mp3', './music5.mp3'].map(p => new URL(p, ROOT).href);
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('message', e => { if (e.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const html = e.request.mode === 'navigate' || url.pathname === ROOT.pathname + 'index.html';
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = html ? ROOT.href : e.request;
    if (!html) { const cached = await cache.match(key); if (cached) return cached; }
    try {
      const response = await fetch(e.request);
      if (response.ok) await cache.put(key, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(key);
      if (cached) return cached;
      throw error;
    }
  })());
});
