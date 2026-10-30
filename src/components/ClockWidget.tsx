'use client';

import React, { useState, useEffect } from 'react';

interface ClockWidgetProps {
  className?: string;
  showSeconds?: boolean;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  className = '',
  showSeconds = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dateFormatted = mounted
    ? now
        .toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .toUpperCase()
    : 'FRI, 30 OCT 2026';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeFormatted = mounted
    ? `${pad(now.getHours())}:${pad(now.getMinutes())}${
        showSeconds ? `:${pad(now.getSeconds())}` : ''
      }`
    : '17:13:06';

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 font-mono ${className}`}>
      <span className="hidden sm:inline text-[11px] font-semibold text-[#748ba0] uppercase tracking-wider">
        {dateFormatted}
      </span>
      <span className="hidden sm:inline text-[#334657] text-xs">&bull;</span>
      <span className="text-xs sm:text-sm font-bold text-[#00ff66] sm:text-slate-100 tracking-wider">
        {timeFormatted}
      </span>
    </div>
  );
};
