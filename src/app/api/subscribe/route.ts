import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'subscriptions.json');

function readSubscriptions(): PushSubscriptionJSON[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, '[]');
      return [];
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSubscriptions(subs: PushSubscriptionJSON[]) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(subs, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json();
    if (!sub?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    const subs = readSubscriptions();
    const exists = subs.find((s) => s.endpoint === sub.endpoint);
    if (!exists) {
      subs.push(sub);
      writeSubscriptions(subs);
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
    const subs = readSubscriptions().filter((s) => s.endpoint !== endpoint);
    writeSubscriptions(subs);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const subs = readSubscriptions();
  return NextResponse.json({ count: subs.length });
}
