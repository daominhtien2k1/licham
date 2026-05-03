import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions, setSubscriptions } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json();
    if (!sub?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const subs = await getSubscriptions();
    const exists = (subs as any[]).find((s: any) => s.endpoint === sub.endpoint);
    if (!exists) {
      (subs as any[]).push(sub);
      await setSubscriptions(subs);
    }

    return NextResponse.json({ ok: true, count: subs.length });
  } catch (err) {
    console.error('[subscribe POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    const subs = await getSubscriptions() as any[];
    const newSubs = subs.filter((s: any) => s.endpoint !== endpoint);
    await setSubscriptions(newSubs);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const subs = await getSubscriptions();
  return NextResponse.json({ count: subs.length });
}
