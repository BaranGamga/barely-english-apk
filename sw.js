// Barely English web sürümü: önce internetten yükler (her açılışta güncel kalır), internet yoksa son kaydı kullanır.
const CACHE = "barely-english-v4";
const CORE = ["./", "index.html", "winter.html", "lessons.json", "manifest.webmanifest",
  "img/zohre-hosgeldin.png", "img/zohre-ders.png", "img/zohre-sikicalis.png", "img/zohre-tebrik.png",
  "icons/icon-180.png", "icons/icon-192.png"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return; // ders içeriği (Gist) ve fontlar doğrudan gider
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match("index.html")))
  );
});
