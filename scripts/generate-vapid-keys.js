// Script tạo VAPID keys cho Web Push Notification
// Chạy: node scripts/generate-vapid-keys.js

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const keys = webpush.generateVAPIDKeys();

console.log('\n✅ VAPID Keys đã được tạo!\n');
console.log('Thêm vào file .env.local:\n');

const envContent = `# VAPID Keys cho Web Push Notification
# Tạo bởi: node scripts/generate-vapid-keys.js

NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}
`;

console.log(envContent);

// Tự động ghi vào .env.local nếu chưa có
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Đã tự động tạo file .env.local!');
} else {
  console.log('ℹ️ File .env.local đã tồn tại. Copy các key trên vào thủ công.');
}
