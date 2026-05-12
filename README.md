# Lịch Âm Việt Nam

Ứng dụng web xem **lịch âm dương Việt Nam** và nhận **thông báo nhắc cúng lễ Mùng 1 / Rằm** ngay trong trình duyệt (Web Push, không cần cài app).

🔗 Demo: <https://lichamgiadinh.vercel.app>

## Tính năng

- 📅 Xem lịch âm — dương song song theo tháng, đánh dấu Mùng 1 (🙏) và ngày Rằm (🌕).
- ⏰ Đồng hồ thời gian thực + hiển thị ngày âm của hôm nay.
- 🔔 **Nhắc cúng lễ** qua Web Push: tự động báo trước **3 ngày, 1 ngày và đúng ngày** Mùng 1 / Rằm.
- 📱 PWA — cài về màn hình chính (Add to Home Screen) để nhận thông báo cả khi đóng trình duyệt.
- 🎨 Giao diện tối, ấm, responsive cho mobile.

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **Framer Motion** cho animation
- **Redis** lưu push subscriptions
- **web-push** gửi notification
- **Vercel Cron** chạy job kiểm tra hàng ngày

## Phát triển

```bash
npm install
npm run dev
```

Mở <http://localhost:3000>.

### Biến môi trường (`.env.local`)

```bash
REDIS_URL=redis://...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
CRON_SECRET=...                  # bảo vệ endpoint /api/cron/check-notification
NEXT_PUBLIC_VAPID_PUBLIC_KEY=... # cùng giá trị với VAPID_PUBLIC_KEY
```

Tạo cặp VAPID:

```bash
npx web-push generate-vapid-keys
```

## Quản lý subscriptions

Script CLI để liệt kê / xoá toàn bộ subscriptions trong Redis:

```bash
# Liệt kê tất cả client đã đăng ký push
node --env-file=.env.local scripts/subscriptions.mjs list

# Xoá hết (cẩn thận — không hoàn tác được)
node --env-file=.env.local scripts/subscriptions.mjs clear
```

Xem [scripts/subscriptions.mjs](scripts/subscriptions.mjs).

## Triển khai

Deploy trực tiếp lên [Vercel](https://vercel.com). Thêm Redis (Upstash hoặc tương đương) và set các biến môi trường ở trên. Cron đã được khai báo trong `vercel.json` (nếu có) — gọi `/api/cron/check-notification` mỗi ngày.
