#!/usr/bin/env node
/**
 * Quản lý push subscriptions trong Redis.
 *
 * ============================================================
 *  CÁCH DÙNG
 * ============================================================
 *
 *  1) LIST — Lấy & in ra TẤT CẢ subscriptions (mỗi entry = 1
 *     trình duyệt đã bấm "Bật thông báo"):
 *
 *       node --env-file=.env.local scripts/subscriptions.mjs list
 *
 *     → in tổng số sub + endpoint, p256dh, auth của từng sub.
 *
 *  2) CLEAR — Xoá HẾT subscriptions (xoá key `subscriptions`
 *     trong Redis). Sau lệnh này không client nào còn nhận
 *     được push cho tới khi họ đăng ký lại:
 *
 *       node --env-file=.env.local scripts/subscriptions.mjs clear
 *
 *     ⚠️  Thao tác không hoàn tác được — chạy cẩn thận.
 *
 * ============================================================
 *  YÊU CẦU
 * ============================================================
 *  - File `.env.local` phải có biến `REDIS_URL=redis://...`.
 *  - Hoặc set tay trước khi chạy (PowerShell):
 *        $env:REDIS_URL="redis://..."; node scripts/subscriptions.mjs list
 *
 *  Hai hàm `getAll()` và `clearAll()` cũng được export để
 *  import từ script khác nếu cần.
 * ============================================================
 */

import { createClient } from 'redis';

const KEY = 'subscriptions';

async function connect() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL chưa được set');
  }
  const client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('[Redis] Error', err));
  await client.connect();
  return client;
}

/** Lấy toàn bộ subscriptions đã đăng ký (mỗi entry là 1 client/trình duyệt). */
export async function getAll() {
  const client = await connect();
  try {
    const raw = await client.get(KEY);
    const subs = raw ? JSON.parse(raw) : [];
    return Array.isArray(subs) ? subs : [];
  } finally {
    await client.quit();
  }
}

/** Xoá toàn bộ subscriptions. */
export async function clearAll() {
  const client = await connect();
  try {
    const removed = await client.del(KEY);
    return removed > 0;
  } finally {
    await client.quit();
  }
}

const cmd = process.argv[2];

if (cmd === 'list') {
  const subs = await getAll();
  console.log(`Tổng cộng ${subs.length} subscription(s):\n`);
  subs.forEach((s, i) => {
    const origin = (() => {
      try { return new URL(s.endpoint).origin; } catch { return '?'; }
    })();
    console.log(`#${i + 1}  [${origin}]`);
    console.log(`     endpoint: ${s.endpoint}`);
    if (s.keys) {
      console.log(`     p256dh:   ${s.keys.p256dh}`);
      console.log(`     auth:     ${s.keys.auth}`);
    }
    console.log();
  });
} else if (cmd === 'clear') {
  const ok = await clearAll();
  console.log(ok ? 'Đã xoá toàn bộ subscriptions.' : 'Không có gì để xoá.');
} else {
  console.log('Dùng: node scripts/subscriptions.mjs <list|clear>');
  process.exit(1);
}
