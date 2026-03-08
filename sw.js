// Service Worker - 羽毛球体能训练 PWA
const CACHE_NAME = 'badminton-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './exercises.js',
  './planner.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 安装：缓存 App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 拦截请求：Cache First（App Shell），Network First（视频）
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // MuscleWiki 视频不缓存（节省空间）
  if (url.hostname === 'media.musclewiki.com') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // 只缓存同源的成功响应
        if (
          response.ok &&
          url.origin === self.location.origin
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 离线时返回主页
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// 推送通知
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '羽毛球训练提醒';
  const options = {
    body: data.body || '今天是训练日，30分钟专项体能训练等你！💪',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 点击通知：打开 App
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow('./');
    })
  );
});
