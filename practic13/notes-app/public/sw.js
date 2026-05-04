const CACHE_NAME = "notes-pwa-v2";
const DYNAMIC_CACHE = "notes-dynamic-v2";

// Ресурсы для кэширования при установке
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/vite.svg",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
  "/icons/favicon-48x48.png",
  "/icons/favicon-64x64.png",
  "/icons/favicon-128x128.png",
  "/icons/favicon-256x256.png",
  "/icons/favicon-512x512.png"
];

self.addEventListener("install", (event) => {
  console.log("[SW] Установка...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[SW] Кэширование статических ресурсов");
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
          console.log(`[SW] Закэшировано: ${asset}`);
        } catch (error) {
          console.log(`[SW] Не удалось закэшировать: ${asset}`, error);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Активация...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log(`[SW] Удаляем старый кэш: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          console.log(`[SW] Из кэша: ${url.pathname}`);
          return cachedResponse;
        }
        const fallbackResponse = await caches.match("/");
        if (fallbackResponse) return fallbackResponse;
        return new Response("Офлайн режим: страница не закэширована", {
          status: 404,
          headers: { "Content-Type": "text/plain" }
        });
      })
  );
});
