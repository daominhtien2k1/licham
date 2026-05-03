// Notification helpers - runs client-side only
'use client';

export interface NotificationSchedule {
  eventLabel: string;
  eventType: 'mung1' | 'ram';
  lunarMonth: number;
  lunarYear: number;
  solarDate: Date;
  daysUntil: number;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('[SW] Registered:', reg.scope);
    return reg;
  } catch (err) {
    console.error('[SW] Registration failed:', err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return await Notification.requestPermission();
}

export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('[Push] No VAPID public key found');
      return null;
    }
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    return sub;
  } catch (err) {
    console.error('[Push] Subscribe failed:', err);
    return null;
  }
}

export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(registration: ServiceWorkerRegistration): Promise<boolean> {
  try {
    const sub = await registration.pushManager.getSubscription();
    if (!sub) return true;
    await sub.unsubscribe();
    // Tell server
    await fetch('/api/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    return true;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function checkNotificationDue(
  upcomingEvents: Array<{ type: 'mung1' | 'ram'; solarDate: Date; label: string }>,
  notifyDays: number[] = [3, 1, 0]
): NotificationSchedule[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due: NotificationSchedule[] = [];

  for (const event of upcomingEvents) {
    const eventDate = new Date(event.solarDate);
    eventDate.setHours(0, 0, 0, 0);
    const diff = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (notifyDays.includes(diff)) {
      due.push({
        eventLabel: event.label,
        eventType: event.type,
        lunarMonth: 0,
        lunarYear: 0,
        solarDate: event.solarDate,
        daysUntil: diff,
      });
    }
  }
  return due;
}

export function getNotificationMessage(schedule: NotificationSchedule): { title: string; body: string } {
  const { eventType, eventLabel, daysUntil } = schedule;
  const emoji = eventType === 'mung1' ? '🙏' : '🌕';

  if (daysUntil === 0) {
    return {
      title: `${emoji} Hôm nay là ${eventType === 'mung1' ? 'Mùng Một' : 'Ngày Rằm'}!`,
      body: `${eventLabel} — Đừng quên cúng lễ cầu bình an cho gia đình! ${emoji}`,
    };
  } else if (daysUntil === 1) {
    return {
      title: `${emoji} Ngày mai là ${eventType === 'mung1' ? 'Mùng Một' : 'Ngày Rằm'}`,
      body: `Chuẩn bị lễ vật cho ${eventLabel} nhé! 🕯️`,
    };
  } else {
    return {
      title: `📅 ${daysUntil} ngày nữa là ${eventType === 'mung1' ? 'Mùng Một' : 'Ngày Rằm'}`,
      body: `${eventLabel} sắp đến rồi! Hãy chuẩn bị trước nhé 🙏`,
    };
  }
}
