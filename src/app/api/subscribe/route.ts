import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json();
    if (!sub?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    
    // Đọc danh sách cũ từ Vercel KV (trả về rỗng nếu chưa có)
    const subs: any[] = (await kv.get('subscriptions')) || [];
    
    // Kiểm tra xem đã đăng ký chưa
    const exists = subs.find((s: any) => s.endpoint === sub.endpoint);
    if (!exists) {
      subs.push(sub);
      // Lưu lại vào KV
      await kv.set('subscriptions', subs);
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
    const subs: any[] = (await kv.get('subscriptions')) || [];
    const newSubs = subs.filter((s: any) => s.endpoint !== endpoint);
    await kv.set('subscriptions', newSubs);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const subs: any[] = (await kv.get('subscriptions')) || [];
  return NextResponse.json({ count: subs.length });
}
