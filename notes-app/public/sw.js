const CACHE_NAME = "notes-pwa-v3";
const DYNAMIC_CACHE = "notes-dynamic-v3";

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

// ========== ОБРАБОТЧИК PUSH УВЕДОМЛЕНИЙ ==========
self.addEventListener('push', (event) => {
  console.log('[SW] Получено push-уведомление:', event);
  
  let data = {
    title: 'Новое уведомление',
    body: '',
    icon: '/icons/favicon-128x128.png',
    badge: '/icons/favicon-48x48.png',
    reminderId: null
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: {
      reminderId: data.reminderId,
      url: '/'
    }
  };
  
  // Добавляем кнопку "Отложить", если это напоминание
  if (data.reminderId) {
    options.actions = [
      {
        action: 'snooze',
        title: '⏰ Отложить на 5 минут'
      }
    ];
    options.requireInteraction = true; // Уведомление не закрывается автоматически
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ========== ОБРАБОТЧИК КЛИКА ПО УВЕДОМЛЕНИЮ ==========
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const reminderId = notification.data?.reminderId;
  
  notification.close();
  
  if (action === 'snooze' && reminderId) {
    console.log(`⏰ Откладываем напоминание: ${reminderId}`);
    
    // Отправляем запрос на сервер для откладывания
    event.waitUntil(
      fetch(`/api/snooze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reminderId: reminderId })
      })
      .then(response => response.json())
      .then(data => {
        console.log('✅ Напоминание отложено:', data);
      })
      .catch(err => {
        console.error('❌ Ошибка откладывания:', err);
      })
    );
  } else {
    // Обычный клик — открываем приложение
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return clients.openWindow('/');
        })
    );
  }
});

// Стратегия: Network First с fallback на кэш
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
