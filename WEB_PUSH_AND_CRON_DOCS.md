# Tài Liệu Kiến Thức: Web Push Notifications & Vercel Cron

Tài liệu này tóm tắt cơ chế hoạt động của hệ thống thông báo đẩy (Web Push Notifications), cách cấu hình tự động hóa (Cron Job), và các lưu ý bảo mật khi triển khai ứng dụng Next.js trên Vercel.

---

## 1. Cơ chế hoạt động của Web Push Notifications

Hệ thống thông báo đẩy hoạt động dựa trên sự phối hợp của 3 thành phần: **Trình duyệt**, **Máy chủ thông báo (Push Service)**, và **Máy chủ của bạn**.

### Cấu trúc của một Subscription (Đăng ký)
Khi người dùng bấm "Cho phép nhận thông báo" trên trình duyệt, trình duyệt sẽ liên hệ với Push Service (như Google FCM cho Chrome, Apple APNs cho Safari) và trả về một đối tượng JSON. Đối tượng này được lưu lại (ví dụ trong `subscriptions.json`) với 3 thành phần chính:

*   **`endpoint`**: URL đích (Ví dụ: `https://fcm.googleapis.com/fcm/send/...`). Đây là "địa chỉ nhà" của thiết bị. Máy chủ của bạn sẽ bắn dữ liệu vào link này để gửi thông báo.
*   **`p256dh`**: Khóa mã hóa công khai (Public Key). Máy chủ của bạn dùng khóa này để mã hóa nội dung tin nhắn. Chỉ trình duyệt của thiết bị đó mới có chìa khóa riêng (Private Key) để mở ra đọc.
*   **`auth`**: Mã xác thực phụ trợ đi kèm, giúp chống lại việc tin nhắn bị thay đổi nội dung trên đường truyền.

### Vấn đề Bảo mật
*   **Nếu lộ file `subscriptions.json` thì sao?** Nhìn chung là **KHÔNG SAO**. File này chỉ chứa "địa chỉ" và "khóa công khai" của người dùng.
*   **Tại sao kẻ gian không thể lợi dụng?** Để gửi được thông báo tới các `endpoint` này, Push Service (Google/Apple) yêu cầu kẻ gửi phải chứng minh danh tính bằng **`VAPID_PRIVATE_KEY`** (Khóa bí mật máy chủ). Nếu kẻ gian không có file `.env.local` chứa khóa bí mật này, mọi yêu cầu gửi thông báo sẽ bị từ chối (Lỗi 401 Unauthorized).

### Hướng dẫn tạo VAPID Keys và file `.env.local`
Để ứng dụng có thể gửi thông báo, bạn cần tạo bộ khóa VAPID (Voluntary Application Server Identification) và đưa vào cấu hình môi trường.

**Bước 1: Tạo bộ khóa VAPID**
Bạn mở terminal (Command Prompt/PowerShell) tại thư mục gốc của dự án và chạy lệnh sau (yêu cầu máy đã cài Node.js):
```bash
npx web-push generate-vapid-keys
```
Hệ thống sẽ in ra màn hình 2 chuỗi ký tự:
- `Public Key` (Khóa công khai)
- `Private Key` (Khóa bí mật)

**Bước 2: Tạo file `.env.local`**
1. Tạo một file tên là `.env.local` ở thư mục gốc dự án (ngang hàng với `package.json`).
2. Copy 2 khóa vừa tạo ở Bước 1 vào file này theo cấu trúc sau:
```env
# Khóa công khai - dùng ở Frontend để xin quyền trình duyệt
NEXT_PUBLIC_VAPID_PUBLIC_KEY="<điền Public Key vào đây>"

# Khóa bí mật - dùng ở Backend để chứng minh danh tính với Google/Apple
VAPID_PRIVATE_KEY="<điền Private Key vào đây>"

# Mã bảo mật tùy chọn dùng để bảo vệ API Cron Job khỏi bị người ngoài gọi lén
CRON_SECRET="mot-chuoi-ky-tu-bat-ky-cua-ban"
```
*Lưu ý: File `.env.local` đã được cấu hình mặc định đưa vào `.gitignore` để không bị đẩy lên Github, tránh việc lộ khóa bí mật.*

---

## 2. Hệ thống tự động hóa (Cron Job)

Các ứng dụng web (như Next.js) hoạt động theo nguyên tắc "Gọi - Trả lời" (Request - Response). Nếu không có ai truy cập, máy chủ sẽ "ngủ" và không tự động làm gì cả.

### Tại sao cần Cron Job?
Để ứng dụng có thể tự động kiểm tra ngày tháng và gửi thông báo nhắc nhở (VD: trước 3 ngày Rằm, đúng ngày Mùng 1...) mà không cần con người can thiệp, ta cần một chiếc "đồng hồ báo thức" gọi là **Cron Job**.

### Vercel Cron
*   Nếu deploy trên Vercel, ta sử dụng file cấu hình `vercel.json` để hẹn giờ.
*   **Cấu trúc:** `schedule: "0 0 * * *"` (Chạy vào lúc 00:00 UTC mỗi ngày, tương đương 07:00 sáng giờ Việt Nam).
*   Đúng giờ này, Vercel sẽ tự động thực thi một API cụ thể (ví dụ: `/api/cron/check-notification`). API này chứa logic kiểm tra ngày tháng và gọi lệnh bắn thông báo.

---

## 3. Lưu ý sống còn khi Deploy lên Vercel (Serverless)

### Giới hạn của Ổ cứng tạm thời (Ephemeral Storage)
*   Vercel sử dụng kiến trúc **Serverless** (phi máy chủ). Điều này có nghĩa là ổ cứng của máy chủ Vercel là "ổ cứng tạm thời".
*   Mỗi khi mã nguồn được chạy (hàm API được gọi), một môi trường mới được tạo ra. Khi chạy xong, toàn bộ môi trường (bao gồm cả các file được tạo mới) sẽ bị xóa sạch.
*   Do đó, việc dùng lệnh `fs.writeFileSync` để lưu danh sách người đăng ký vào file `data/subscriptions.json` sẽ **KHÔNG LƯU TRỮ ĐƯỢC LÂU DÀI**. Danh sách sẽ biến mất sau một khoảng thời gian ngắn hoặc sau mỗi lần ứng dụng khởi động lại.

### Giải pháp
Để ứng dụng hoạt động thực tế trên Vercel, bắt buộc phải thay thế file `.json` bằng một Cơ sở dữ liệu thực thụ (Database).
*   **Đề xuất:** Vercel KV (Redis), Supabase, MongoDB, hoặc PostgreSQL. Các cơ sở dữ liệu này lưu trữ dữ liệu vĩnh viễn và hoàn toàn tách biệt với ổ cứng tạm thời của Vercel.
