/* ÓRALE service worker — version-aware offline cache.
   Registered by orale.html as "sw.js?v=<APP_VERSION>" (only over http/https; the
   file:// double-click path never registers this). The version rides in on the
   query string so the cache name always matches the app that registered it:
   bumping APP_VERSION in orale.html automatically retires every older cache. */
"use strict";
const V = new URL(self.location.href).searchParams.get("v") || "0";
const CACHE = "orale-v" + V;
const CORE = ["./", "./orale.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("orale-v") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return; // never touch cross-origin (TTS voices, external links)
  /* S13: the app shell (navigations / orale.html) is network-first with cache fallback.
     Cache-first here permanently pinned installed users to the version they installed:
     the cached HTML re-registered its own old sw.js?v=..., so a new APP_VERSION on the
     server was never fetched and the version-aware cache retirement never triggered.
     Static assets stay cache-first for speed. Offline behavior is unchanged. */
  const shell = e.request.mode === "navigate" || u.pathname.endsWith("/orale.html") || u.pathname.endsWith("/");
  if (shell) {
    e.respondWith(
      fetch(e.request).then(net => {
        if (net && net.ok) { const clone = net.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
        return net;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./orale.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(net => {
      if (net && net.ok) { const clone = net.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
      return net;
    })).catch(() => caches.match("./orale.html"))
  );
});
