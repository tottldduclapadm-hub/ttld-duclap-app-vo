/* Service worker của vỏ: chỉ lưu sẵn trang vỏ + icon (mở nhanh, mất mạng vẫn hiện thông báo).
   KHÔNG lưu dữ liệu app (app chạy trong iframe từ script.google.com, không đi qua đây).
   Đổi file vỏ -> tăng PHIEN để máy người dùng lấy bản mới. */
const PHIEN = 'vo-v7';
const FILE = ['./', './index.html', './cau-hinh.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(PHIEN).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== PHIEN).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Mạng trước, mất mạng thì dùng bản đã lưu (chỉ file của vỏ, cùng nguồn) */
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const ban = r.clone();
    caches.open(PHIEN).then(c => c.put(e.request, ban));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
