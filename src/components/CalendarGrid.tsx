'use client';

import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DayCell from './DayCell';

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  direction: number;
}

// Week starts Monday: T2 T3 T4 T5 T6 T7 CN
const DAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function CalendarGrid({ year, month, selectedDate, onSelectDate, direction }: CalendarGridProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const cells = useMemo(() => {
    const rawFirstDay = new Date(year, month, 1).getDay(); // 0=Sun,1=Mon,...,6=Sat
    // Convert to Mon-based index: Mon=0, Tue=1,..., Sun=6
    const firstDay = (rawFirstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const result: Array<{ date: Date | null; isCurrentMonth: boolean }> = [];

    // Fill previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }

    // Fill next month to complete 6 rows (42 cells)
    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      result.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }

    return result;
  }, [year, month]);

  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const isSelected = (date: Date) =>
    selectedDate !== null &&
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate();

  if (!mounted) {
    // Render skeleton on SSR to avoid hydration mismatch
    return (
      <div>
        <div className="calendar-grid mb-2">
          {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '14px', fontWeight: 600,
              padding: '10px 0',
              color: i === 6 ? '#E74C3C' : i === 5 ? '#60a5fa' : '#A0AEC0',
            }}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="day-cell" style={{ opacity: 0 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Day headers — Mon first, Sun last (red) */}
      <div className="calendar-grid mb-2">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 600,
              padding: '10px 0',
              // T7=index5 blue, CN=index6 red
              color: i === 6 ? '#E74C3C' : i === 5 ? '#60a5fa' : '#A0AEC0',
              letterSpacing: '0.03em',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${year}-${month}`}
          custom={direction}
          initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <div className="calendar-grid">
            {cells.map((cell, idx) => (
              <DayCell
                key={cell.date
                  ? `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`
                  : `empty-${idx}`}
                date={cell.date}
                isCurrentMonth={cell.isCurrentMonth}
                isToday={cell.date ? isToday(cell.date) : false}
                isSelected={cell.date ? isSelected(cell.date) : false}
                onClick={onSelectDate}
                index={idx}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
