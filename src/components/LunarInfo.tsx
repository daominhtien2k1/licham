'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getFullLunarInfo, getDayName, getLunarMonthName } from '@/lib/lunar';

interface LunarInfoProps {
  date: Date;
}



export default function LunarInfo({ date }: LunarInfoProps) {
  const info = getFullLunarInfo(date);
  const { lunar, canChiNam, canChiThang, canChiNgay, tietKhi, special } = info;
  const isBigDay = special.isMung1 || special.isRam;

  const lunarDayLabel = (() => {
    if (lunar.day === 1) return 'Mùng Một';
    if (lunar.day === 15) return 'Rằm';
    if (lunar.day < 10) return `Mùng ${lunar.day}`;
    return `${lunar.day}`;
  })();

  const moonEmoji = special.isRam ? '🌕'
    : special.isMung1 ? '🌑'
    : lunar.day <= 7 ? '🌒'
    : lunar.day <= 13 ? '🌓'
    : lunar.day <= 20 ? '🌖' : '🌘';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={date.toISOString()}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col gap-3"
      >
        {/* ── BIG DAY BANNER ── */}
        {isBigDay && (
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card-gold text-center px-3 py-2.5"
          >
            <div style={{ fontSize: '28px', lineHeight: 1, marginBottom: '6px' }}>
              {special.isMung1 ? '🙏' : '🕯️'}
            </div>
            <p className="font-display font-bold" style={{
              color: special.isMung1 ? '#FFB830' : '#FFE066',
              fontSize: '1rem', letterSpacing: '0.06em',
            }}>
              {special.isMung1 ? '🙏 MÙNG MỘT' : '🌕 NGÀY RẰM'} THÁNG {lunar.month}
            </p>
            <p style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
              Năm {canChiNam.name} · Cúng lễ cầu bình an
            </p>
          </motion.div>
        )}

        {/* ── DATE HEADER ── */}
        <div className="glass-card px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '10px', color: '#718096', marginBottom: '1px' }}>
                {getDayName(date.getDay())}, {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-extrabold" style={{
                  fontSize: '2.2rem', lineHeight: 1,
                  color: special.isMung1 ? '#FFB830' : special.isRam ? '#FFE066' : '#D4AF37',
                }}>
                  {lunarDayLabel}
                </span>
                {lunar.leap && (
                  <span className="info-tag tag-gold" style={{ fontSize: '9px', padding: '1px 5px' }}>Nhuận</span>
                )}
              </div>
              <p style={{ fontSize: '10px', color: '#4A5568', marginTop: '3px' }}>
                {getLunarMonthName(lunar.month)} · Năm {lunar.year}
              </p>
            </div>
            {/* Moon */}
            <div className="text-center flex-shrink-0">
              <div style={{ fontSize: '32px', lineHeight: 1 }}>{moonEmoji}</div>
              <p style={{ fontSize: '9px', color: '#4A5568', marginTop: '2px' }}>Ngày {lunar.day}</p>
            </div>
          </div>
        </div>

        {/* ── CAN CHI (compact row) ── */}
        <div className="glass-card px-4 py-3">
          <p style={{ fontSize: '10px', color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Can Chi</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {[
              { label: 'Năm', value: canChiNam.name },
              { label: 'Tháng', value: canChiThang.name },
              { label: 'Ngày', value: canChiNgay.name },
            ].map((item) => (
              <div key={item.label} className="text-center py-2 rounded-lg" style={{
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.12)',
              }}>
                <p style={{ fontSize: '10px', color: '#4A5568', marginBottom: '2px' }}>{item.label}</p>
                <p className="font-display font-semibold" style={{ fontSize: '13px', color: '#D4AF37' }}>{item.value}</p>
              </div>
            ))}
          </div>

          {tietKhi && (
            <div className="flex items-center gap-2 mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
              <span style={{ fontSize: '10px', color: '#4A5568' }}>Tiết:</span>
              <span className="info-tag tag-green" style={{ fontSize: '11px', padding: '2px 8px' }}>{tietKhi}</span>
            </div>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
