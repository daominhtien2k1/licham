import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getSubscriptions, setSubscriptions } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    webpush.setVapidDetails(
      'mailto:licham@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );
    const { title, body, icon, tag } = await req.json();

    const subs = await getSubscriptions() as any[];

    if (subs.length === 0) {
      return NextResponse.json({ ok: false, message: 'No subscribers' });
    }

    const payload = JSON.stringify({
      title: title || '🗓️ Lịch Âm Nhắc Nhở',
      body: body || 'Bạn có sự kiện lịch âm sắp đến!',
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: tag || 'licham-reminder',
      data: { url: '/' },
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(sub as Parameters<typeof webpush.sendNotification>[0], payload)
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Remove expired subscriptions (410 Gone)
    const validSubs: any[] = [];
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        validSubs.push(subs[idx]);
      } else {
        const err = (result as PromiseRejectedResult).reason;
        if (err?.statusCode !== 410) {
          validSubs.push(subs[idx]);
        }
      }
    });

    await setSubscriptions(validSubs);

    return NextResponse.json({ ok: true, sent, failed });
  } catch (err) {
    console.error('[send-notification POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to send notifications' });
}
