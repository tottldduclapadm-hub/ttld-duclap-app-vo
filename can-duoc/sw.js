/* Service worker của vỏ: chỉ lưu sẵn trang vỏ + icon (mở nhanh, mất mạng vẫn hiện thông báo).
   KHÔNG lưu dữ liệu app (app chạy trong iframe từ script.google.com, không đi qua đây).
   Đổi file vỏ -> tăng PHIEN để máy người dùng lấy bản mới.
   Vỏ tổ khác (thư mục con, VD can-duoc/) dùng chung file này, dang.js đổi PHIEN thành 'vo-<mã>-vN' (28/11/2026):
   bộ nhớ đệm CHUNG nguồn (github.io) -> mỗi vỏ chỉ xóa bản cũ CÙNG tiền tố của mình, không xóa của vỏ khác. */
const PHIEN = 'vo-cd-v8';
const TIEN_TO = PHIEN.replace(/\d+$/, '');
const FILE = ['./', './index.html', './cau-hinh.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(PHIEN).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf(TIEN_TO) === 0 && k !== PHIEN).map(k => caches.delete(k))))
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
