'use client';

import React from 'react';
import { ClockWidget } from './ClockWidget';

export const GreetingCard: React.FC = () => {
  return (
    <div className="bg-[#0c141f] border border-[#1b2737] rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm shadow-black/20 select-none">
      {/* Left side: Greeting + Subtitle */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm sm:text-base font-bold text-white tracking-tight shrink-0">
          Hello, Candidate
        </span>
        <span className="text-xs text-[#70879d] hidden sm:inline">
          &bull; Placement Overview
        </span>
      </div>

      {/* Right side: Live Digital Date & Clock */}
      <div className="shrink-0 pl-2">
        <ClockWidget />
      </div>
    </div>
  );
};
