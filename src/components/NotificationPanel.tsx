'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  sendSubscriptionToServer,
  unsubscribeFromPush,
} from '@/lib/notifications';
import { getUpcomingLunarEvents } from '@/lib/lunar';

interface UpcomingEvent {
  type: 'mung1' | 'ram';
  solarDate: Date;
  label: string;
}

interface NotificationPanelProps {
  onNavigateToDate?: (date: Date) => void;
}

/* ── Custom Toggle Switch ── */
function ToggleSwitch({ checked, onChange, loading }: { checked: boolean; onChange: () => void; loading: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      role="switch"
      aria-checked={checked}
      style={{
        width: '48px', height: '26px', borderRadius: '13px', padding: '3px',
        background: checked
          ? 'linear-gradient(135deg, #D4AF37, #B8962E)'
          : 'rgba(75, 85, 99, 0.5)',
        border: 'none', cursor: loading ? 'wait' : 'pointer',
        transition: 'background 0.25s ease',
        display: 'flex', alignItems: 'center',
        opacity: loading ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? 22 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

export default function NotificationPanel({ onNavigateToDate }: NotificationPanelProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    registerServiceWorker().then((reg) => {
      if (reg) {
        setSwReg(reg);
        reg.pushManager.getSubscription().then((sub) => setIsSubscribed(!!sub));
      }
    });

    const events = getUpcomingLunarEvents(60);
    setUpcomingEvents(
      events.slice(0, 3).map((e) => ({
        type: e.type,
        solarDate: new Date(e.solarDate),
        label: e.label,
      }))
    );
  }, []);

  const handleToggle = useCallback(async () => {
    if (!swReg) return;
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush(swReg);
        setIsSubscribed(false);
      } else {
        const perm = await requestNotificationPermission();
        if (perm !== 'granted') return;
        const sub = await subscribeToPush(swReg);
        if (!sub) return;
        await sendSubscriptionToServer(sub);
        setIsSubscribed(true);
      }
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, [swReg, isSubscribed]);

  const getDaysUntil = (d: Date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const t = new Date(d); t.setHours(0, 0, 0, 0);
    return Math.round((t.getTime() - today.getTime()) / 86400000);
  };

  const formatDate = (d: Date) => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${dayNames[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>

      {/* ═══ TOGGLE ROW ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0,
          }}>
            🔔
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '15px', color: '#F5F0E8', lineHeight: 1.3 }}>
              Nhắc Cúng Lễ
            </p>
            <p style={{ fontSize: '12px', color: '#718096', marginTop: '1px' }}>
              Mùng 1 & Rằm hàng tháng
            </p>
          </div>
        </div>
        <ToggleSwitch checked={isSubscribed} onChange={handleToggle} loading={isLoading} />
      </div>

      {/* ═══ DIVIDER ═══ */}
      <div style={{
        height: '1px', marginBottom: '16px',
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
      }} />

      {/* ═══ UPCOMING EVENTS ═══ */}
      {upcomingEvents.length > 0 && (
        <div>
          <p style={{
            fontSize: '11px', color: '#4A5568', textTransform: 'uppercase',
            letterSpacing: '0.12em', fontWeight: 600, marginBottom: '12px',
          }}>
            Sắp tới
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingEvents.map((event, i) => {
              const days = getDaysUntil(event.solarDate);
              const isMung1 = event.type === 'mung1';

              return (
                <div
                  key={i}
                  onClick={() => onNavigateToDate?.(event.solarDate)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onNavigateToDate?.(event.solarDate)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                    background: isMung1 ? 'rgba(255,160,30,0.06)' : 'rgba(255,224,102,0.04)',
                    border: `1px solid ${isMung1 ? 'rgba(255,180,50,0.2)' : 'rgba(255,224,102,0.15)'}`,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.borderColor = isMung1 ? 'rgba(255,180,50,0.4)' : 'rgba(255,224,102,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.borderColor = isMung1 ? 'rgba(255,180,50,0.2)' : 'rgba(255,224,102,0.15)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isMung1 ? 'rgba(255,160,30,0.12)' : 'rgba(255,224,102,0.1)',
                      fontSize: '20px', flexShrink: 0,
                    }}>
                      {isMung1 ? '🙏' : '🌕'}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '15px', fontWeight: 700, lineHeight: 1.3,
                        color: isMung1 ? '#FFB830' : '#FFE066',
                      }}>
                        {isMung1 ? 'Mùng Một' : 'Ngày Rằm'}
                      </p>
                      <p style={{ fontSize: '13px', color: '#718096', marginTop: '3px' }}>
                        {formatDate(event.solarDate)}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    padding: '5px 12px', borderRadius: '20px',
                    ...(days === 0 ? {
                      background: 'rgba(52,211,153,0.15)', color: '#6ee7b7',
                      border: '1px solid rgba(52,211,153,0.3)',
                    } : days <= 3 ? {
                      background: 'rgba(251,191,36,0.15)', color: '#FCD34D',
                      border: '1px solid rgba(251,191,36,0.3)',
                    } : {
                      background: 'rgba(160,174,192,0.08)', color: '#718096',
                      border: '1px solid rgba(160,174,192,0.12)',
                    }),
                  }}>
                    {days === 0 ? 'Hôm nay!' : days === 1 ? 'Ngày mai' : `${days} ngày`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <p style={{
        fontSize: '11px', color: '#4A5568', marginTop: '16px', lineHeight: 1.6,
      }}>
        💡 Cài app (Add to Home Screen) để nhận thông báo khi đóng trình duyệt.
      </p>
    </div>
  );
}
