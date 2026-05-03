'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  direction: number;
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export default function MonthNavigator({
  year,
  month,
  onPrev,
  onNext,
  onToday,
  direction,
}: MonthNavigatorProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '16px', gap: '8px',
    }}>
      {/* Prev button */}
      <button
        onClick={onPrev}
        aria-label="Tháng trước"
        style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          color: '#D4AF37', fontSize: '18px', fontWeight: 300,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.15)';
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
        }}
      >
        ‹
      </button>

      {/* Month/Year title */}
      <div style={{
        flex: 1, textAlign: 'center', overflow: 'hidden',
        position: 'relative', height: '40px',
      }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            initial={{ y: direction > 0 ? 24 : -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction > 0 ? -24 : 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ position: 'absolute', width: '100%', left: 0, top: 0 }}
          >
            <p style={{
              color: '#D4AF37', fontSize: '22px', fontWeight: 700,
              lineHeight: '40px', letterSpacing: '0.01em',
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {MONTH_NAMES[month]}, {year}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Today button */}
      <button
        onClick={onToday}
        aria-label="Về hôm nay"
        style={{
          height: '36px', padding: '0 14px', borderRadius: '10px',
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          color: '#D4AF37', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.15)';
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
        }}
      >
        Hôm nay
      </button>

      {/* Next button */}
      <button
        onClick={onNext}
        aria-label="Tháng sau"
        style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          color: '#D4AF37', fontSize: '18px', fontWeight: 300,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.15)';
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
        }}
      >
        ›
      </button>
    </div>
  );
}
