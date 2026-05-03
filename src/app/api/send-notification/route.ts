import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'subscriptions.json');

webpush.setVapidDetails(
  'mailto:licham@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

function readSubscriptions(): PushSubscriptionJSON[] {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, icon, tag } = await req.json();
    const subs = readSubscriptions();

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
    const validSubs: PushSubscriptionJSON[] = [];
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
    fs.writeFileSync(DB_PATH, JSON.stringify(validSubs, null, 2));

    return NextResponse.json({ ok: true, sent, failed });
  } catch (err) {
    console.error('[send-notification POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET: trigger a test notification
export async function GET() {
  return NextResponse.json({ message: 'Use POST to send notifications' });
}
