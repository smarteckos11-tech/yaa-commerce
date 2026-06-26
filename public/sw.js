const CACHE_NAME = "yaa-commerce-v1";
const OFFLINE_URL = "/offline";

// Assets to cache on install
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/icon.svg",
  "/manifest.json",
];

// Install — precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // If any precache fails, continue anyway
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first for assets, network-first for pages
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API routes and Supabase (always network)
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("cloudinary.com")
  ) {
    return;
  }

  const url = new URL(event.request.url);

  // Same-origin only
  if (url.origin !== location.origin) return;

  // Cache-first for static assets (images, fonts, CSS, JS)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/brands/") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Network-first for pages (with offline fallback)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful page responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Try cache, then offline page
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});

// Handle messages from client (e.g., manual cache clear)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage("CACHE_CLEARED"));
      });
    });
  }
});
