'use client';

import { motion } from 'framer-motion';
import { solarToLunar } from '@/lib/lunar';

interface DayCellProps {
  date: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: (date: Date) => void;
  index: number;
}

const LUNAR_SHORT: Record<number, string> = {
  1: 'M.1', 15: 'Rằm', 30: 'B.30',
};

export default function DayCell({ date, isCurrentMonth, isToday, isSelected, onClick, index }: DayCellProps) {
  if (!date) return <div className="day-cell" style={{ background: 'transparent', border: 'none', cursor: 'default' }} />;

  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  const lunar = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const isMung1 = lunar.day === 1;
  const isRam = lunar.day === 15;
  const isSpecial = (isMung1 || isRam) && isCurrentMonth;

  // Lunar label for cell
  const lunarLabel = (() => {
    if (lunar.day === 1) return 'Mùng 1';
    if (lunar.day === 15) return 'Rằm';
    if (lunar.day < 10) return `Mùng ${lunar.day}`;
    if (lunar.day === 10) return 'Mùng 10';
    if (lunar.day === 30) return 'Ba Mươi';
    return String(lunar.day);
  })();

  const classNames = [
    'day-cell',
    !isCurrentMonth ? 'other-month' : '',
    isToday ? 'today' : '',
    isMung1 ? 'mung1' : '',
    isRam ? 'ram' : '',
    isSelected ? 'selected' : '',
    isSunday ? 'sunday' : '',
    isSaturday ? 'saturday' : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={classNames}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: !isCurrentMonth ? 0.5 : 1, scale: 1 }}
      transition={{ duration: 0.15, delay: index * 0.007, ease: 'easeOut' }}
      onClick={() => onClick(date)}
      role="button"
      aria-label={`Ngày ${date.getDate()} tháng ${date.getMonth() + 1}, âm lịch ngày ${lunar.day} tháng ${lunar.month}`}
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(date)}
      style={{ overflow: 'visible', position: 'relative' }}
    >
      {/* Animated SVG dashed border for today */}
      {isToday && (
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute', inset: '-1px',
            width: 'calc(100% + 2px)', height: 'calc(100% + 2px)',
            pointerEvents: 'none', overflow: 'visible',
          }}
        >
          <rect
            x="1" y="1"
            width="calc(100% - 2px)" height="calc(100% - 2px)"
            rx="9" ry="9"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.8"
            strokeDasharray="5 3"
            style={{ animation: 'dash-march 1.2s linear infinite' }}
          />
        </svg>
      )}

      {/* Special icon overlay — big and glowing */}
      {isSpecial && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '16px',
            lineHeight: 1,
            filter: isMung1
              ? 'drop-shadow(0 0 5px rgba(255,180,50,0.9)) drop-shadow(0 0 10px rgba(255,150,0,0.5))'
              : 'drop-shadow(0 0 5px rgba(255,230,80,0.9)) drop-shadow(0 0 10px rgba(255,220,50,0.5))',
            zIndex: 2,
          }}
        >
          {isMung1 ? '🙏' : '🌕'}
        </div>
      )}

      {/* Solar date */}
      <span
        className="solar-day"
        style={{ marginTop: isSpecial ? '7px' : undefined }}
      >
        {date.getDate()}
      </span>

      {/* Lunar label — compact */}
      <span
        className="lunar-day"
        style={{
          fontWeight: isSpecial ? 700 : undefined,
          color: isMung1 ? '#FFB830' : isRam ? '#FFE066' : undefined,
        }}
      >
        {lunarLabel}
      </span>
    </motion.div>
  );
}
