import { NextRequest, NextResponse } from 'next/server';
import { solarToLunar, getLunarMonthName } from '@/lib/lunar';

// We reuse the existing notification sender logic. 
// Note: Since Vercel uses edge/serverless, hitting localhost inside Vercel might fail if not using the public URL.
// Instead of making an HTTP request to ourselves, we could abstract the sending logic, but for simplicity, 
// we will fetch the absolute URL if available, or just call the logic directly.
import webpush from 'web-push';
import { getSubscriptions, setSubscriptions } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    webpush.setVapidDetails(
      'mailto:licham@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );
    // Vercel Cron Security Check
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lấy thời gian hiện tại theo múi giờ Việt Nam
    const now = new Date();
    const vnTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
    
    const today = new Date(vnTimeStr);
    const tomorrow = new Date(vnTimeStr);
    tomorrow.setDate(today.getDate() + 1);
    const in3Days = new Date(vnTimeStr);
    in3Days.setDate(today.getDate() + 3);

    // Tính ngày âm lịch
    const lunarToday = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
    const lunarTomorrow = solarToLunar(tomorrow.getDate(), tomorrow.getMonth() + 1, tomorrow.getFullYear());
    const lunarIn3Days = solarToLunar(in3Days.getDate(), in3Days.getMonth() + 1, in3Days.getFullYear());

    let title = '';
    let body = '';

    // Logic kiểm tra: Ưu tiên sự kiện gần nhất (Hôm nay > Ngày mai > 3 ngày)
    if (lunarToday.day === 1) {
      title = '🙏 Hôm nay là Mùng Một';
      body = `Hôm nay là Mùng Một ${getLunarMonthName(lunarToday.month)}. Nhớ chuẩn bị lễ vật nhé!`;
    } else if (lunarToday.day === 15) {
      title = '🌕 Hôm nay là Ngày Rằm';
      body = `Hôm nay là Rằm ${getLunarMonthName(lunarToday.month)}. Chúc bạn một ngày an lành!`;
    } else if (lunarTomorrow.day === 1) {
      title = '🙏 Ngày mai là Mùng Một';
      body = `Ngày mai là Mùng Một ${getLunarMonthName(lunarTomorrow.month)}.`;
    } else if (lunarTomorrow.day === 15) {
      title = '🌕 Ngày mai là Ngày Rằm';
      body = `Ngày mai là Rằm ${getLunarMonthName(lunarTomorrow.month)}.`;
    } else if (lunarIn3Days.day === 1) {
      title = '🙏 Sắp đến Mùng Một';
      body = `Còn 3 ngày nữa là đến Mùng Một ${getLunarMonthName(lunarIn3Days.month)}.`;
    } else if (lunarIn3Days.day === 15) {
      title = '🌕 Sắp đến Ngày Rằm';
      body = `Còn 3 ngày nữa là đến Rằm ${getLunarMonthName(lunarIn3Days.month)}.`;
    }

    // Nếu không có sự kiện gì, trả về 200 OK
    if (!title) {
      return NextResponse.json({ ok: true, message: 'No events today' });
    }

    // Nếu có sự kiện, gửi thông báo
    const subs = await getSubscriptions() as any[];
    if (subs.length === 0) {
      return NextResponse.json({ ok: true, message: 'No subscribers to notify', event: title });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'licham-reminder',
      data: { url: '/' },
    });

    const results = await Promise.allSettled(
      subs.map((sub) => webpush.sendNotification(sub, payload))
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({ ok: true, sent, failed, event: title });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
