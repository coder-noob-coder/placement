'use client';

import React from 'react';
import { ClockWidget } from './ClockWidget';

export const GreetingCard: React.FC = () => {
  return (
    <div className="bg-[#0c1520] border border-[#1b2d3e] shadow-sm shadow-black/20 rounded-lg px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between font-mono shadow-xs transition-colors select-none">
      {/* Left side: Greeting + Neutral Title in single line */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        <span className="text-[10px] uppercase tracking-widest text-[#546b80] font-semibold shrink-0">
          HELLO,
        </span>
        <span className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1 shrink-0">
          <span>Candidate</span>
          <span className="text-[#00ff66] animate-cursor font-normal">_</span>
        </span>
        <span className="text-[11px] text-[#546b80] uppercase tracking-wider hidden md:inline">
          &bull; PLACEMENT OVERVIEW
        </span>
      </div>

      {/* Right side: Live Digital Date & Clock in single line */}
      <div className="shrink-0 pl-2">
        <ClockWidget />
      </div>
    </div>
  );
};
