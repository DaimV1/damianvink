// Minimal, narrowly-scoped offline cache for the engineering toolkit —
// a workshop with bad wifi should still be able to reopen a reference
// page it already visited. Deliberately does NOT touch /project (live,
// authenticated data), the platform's own /__grok/* PWA chrome, or
// anything outside /toolkit — this is not an app-shell precache.

const CACHE_NAME = "toolkit-offline-v1";

function isToolkitPath(pathname) {
  return pathname === "/toolkit" || pathname.startsWith("/toolkit/");
}

function isStaticAsset(pathname) {
  return pathname.startsWith("/assets/");
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (!isToolkitPath(url.pathname)) return;
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
