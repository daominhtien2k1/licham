import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => console.error('[Redis] Client Error', err));

let connected = false;

export async function getRedis() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

export async function getSubscriptions(): Promise<object[]> {
  const redis = await getRedis();
  const raw = await redis.get('subscriptions');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function setSubscriptions(subs: object[]): Promise<void> {
  const redis = await getRedis();
  await redis.set('subscriptions', JSON.stringify(subs));
}
