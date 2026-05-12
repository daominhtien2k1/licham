'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';
import CalendarGrid from '@/components/CalendarGrid';
import MonthNavigator from '@/components/MonthNavigator';
import NotificationPanel from '@/components/NotificationPanel';
import { getFullLunarInfo, getCanChiNam, solarToLunar } from '@/lib/lunar';

export default function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [direction, setDirection] = useState(0);
  const [clock, setClock] = useState('');
  const [clockDate, setClockDate] = useState('');

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setClockDate(
        now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);


  const goToPrevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentMonth((m) => {
      if (m === 0) { setCurrentYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setDirection(1);
    setCurrentMonth((m) => {
      if (m === 11) { setCurrentYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    setDirection(0);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(new Date(today));
  }, [today]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Today's lunar info for header
  const todayLunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
  const todayCanChi = getCanChiNam(todayLunar.year);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 16px 40px',
        }}
      >
        {/* ====== COMPACT HEADER ====== */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '20px', paddingTop: '12px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 20px',
            borderRadius: '16px',
            background: 'rgba(20,28,46,0.7)',
            border: '1px solid rgba(212,175,55,0.15)',
            backdropFilter: 'blur(12px)',
          }}>
            {/* Left: Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#D4AF37', fontSize: '18px' }}>☽</span>
              <h1 className="font-display title-glow" style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                fontWeight: 800,
                color: '#D4AF37',
                letterSpacing: '0.04em',
                lineHeight: 1,
                margin: 0,
              }}>
                LỊCH ÂM
              </h1>
            </div>

            {/* Center: Live clock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                color: '#D4AF37', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
              }}>
                {clock}
              </span>
              <span style={{ color: '#4A5568' }}>·</span>
              <span style={{ color: '#A0AEC0', fontSize: '12px' }}>{clockDate}</span>
            </div>

            {/* Right: Lunar date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="info-tag tag-gold" style={{ margin: 0 }}>
                🌙 Âm: {todayLunar.day}/{todayLunar.month} · {todayCanChi.name}
              </span>
              {todayLunar.day === 1 && <span className="info-tag tag-red" style={{ margin: 0 }}>🙏 Mùng Một</span>}
              {todayLunar.day === 15 && <span className="info-tag" style={{ margin: 0, background: 'rgba(255,224,102,0.1)', borderColor: 'rgba(255,224,102,0.3)', color: '#FFE066' }}>🌕 Rằm</span>}
            </div>
          </div>
        </motion.header>

        {/* ====== MAIN LAYOUT — 3 columns ====== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 200px) minmax(0, 1fr) minmax(0, 340px)',
          gap: '20px',
          alignItems: 'start',
        }}
          className="main-layout"
        >
          {/* ---- LEFT: Legend ---- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="glass-card" style={{ padding: '16px 18px' }}>
              <p style={{
                fontSize: '11px', color: '#4A5568', textTransform: 'uppercase',
                letterSpacing: '0.12em', fontWeight: 600, marginBottom: '14px',
              }}>
                Chú thích
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'today', color: 'rgba(212,175,55,0.05)', border: 'transparent', label: 'Hôm nay', icon: null },
                  { id: 'mung1', color: 'rgba(255, 160, 30, 0.07)', border: 'rgba(255, 180, 50, 0.45)', label: 'Mùng Một', icon: '🙏' },
                  { id: 'ram', color: 'rgba(255, 224, 102, 0.05)', border: 'rgba(255, 224, 102, 0.5)', label: 'Ngày Rằm', icon: '🌕' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: item.color, border: item.border !== 'transparent' ? `1px solid ${item.border}` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', flexShrink: 0,
                      position: 'relative',
                    }}>
                      {item.id === 'today' && (
                        <svg
                          style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            pointerEvents: 'none', overflow: 'visible',
                          }}
                        >
                          <rect
                            x="0.5" y="0.5"
                            width="calc(100% - 1px)" height="calc(100% - 1px)"
                            rx="7" ry="7"
                            fill="none"
                            stroke="#D4AF37"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            style={{ animation: 'dash-march 1.2s linear infinite' }}
                          />
                        </svg>
                      )}
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '13px', color: '#A0AEC0', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Selected date quick info */}
              <div style={{
                marginTop: '18px', paddingTop: '14px',
                borderTop: '1px solid rgba(212,175,55,0.1)',
              }}>
                <p style={{ fontSize: '10px', color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Ngày chọn
                </p>
                <p style={{ fontSize: '14px', color: '#D4AF37', fontWeight: 600, lineHeight: 1.4 }}>
                  {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
                </p>
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                  Âm: {(() => {
                    const l = solarToLunar(selectedDate.getDate(), selectedDate.getMonth() + 1, selectedDate.getFullYear());
                    return `${l.day}/${l.month}/${l.year}`;
                  })()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ---- CENTER: Calendar ---- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="glass-card" style={{ padding: '20px' }}>
              <MonthNavigator
                year={currentYear}
                month={currentMonth}
                onPrev={goToPrevMonth}
                onNext={goToNextMonth}
                onToday={goToToday}
                direction={direction}
              />

              <CalendarGrid
                year={currentYear}
                month={currentMonth}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                direction={direction}
              />
            </div>
          </motion.div>

          {/* ---- RIGHT: Info panel ---- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >

            {/* Notification Panel */}
            <NotificationPanel onNavigateToDate={(date: Date) => {
              setSelectedDate(date);
              setCurrentYear(date.getFullYear());
              setCurrentMonth(date.getMonth());
              setDirection(0);
            }} />
          </motion.div>
        </div>

      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .main-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
