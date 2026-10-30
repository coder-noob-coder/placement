'use client';

import React from 'react';
import { Home, FileSpreadsheet, History, Calendar, BarChart2 } from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'pipeline'
  | 'applications'
  | 'interviews'
  | 'calendar'
  | 'notes'
  | 'analytics'
  | 'past';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const isHome = activeTab === 'dashboard';
  const isPipeline = activeTab === 'pipeline';
  const isPast = activeTab === 'past';
  const isCalendar = activeTab === 'calendar';
  const isStats = activeTab === 'analytics';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070c12]/95 backdrop-blur-md border-t border-[#162531] px-3 py-2 flex items-center justify-around font-mono">
      {/* 1. HOME */}
      <button
        onClick={() => onTabChange('dashboard')}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <Home className={`w-5 h-5 ${isHome ? 'text-[#00ff66]' : 'text-slate-500'}`} />
        <span
          className={`text-[10px] tracking-wider font-semibold uppercase ${
            isHome ? 'text-[#00ff66]' : 'text-slate-500'
          }`}
        >
          HOME
        </span>
        {isHome && (
          <span className="w-1 h-1 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66] mt-0.5" />
        )}
      </button>

      {/* 2. PIPELINE */}
      <button
        onClick={() => onTabChange('pipeline')}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <FileSpreadsheet
          className={`w-5 h-5 ${isPipeline ? 'text-[#00ff66]' : 'text-slate-500'}`}
        />
        <span
          className={`text-[10px] tracking-wider font-semibold uppercase ${
            isPipeline ? 'text-[#00ff66]' : 'text-slate-500'
          }`}
        >
          PIPELINE
        </span>
        {isPipeline && (
          <span className="w-1 h-1 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66] mt-0.5" />
        )}
      </button>

      {/* 3. PAST COMPANIES */}
      <button
        onClick={() => onTabChange('past')}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <History
          className={`w-5 h-5 ${isPast ? 'text-[#00ff66]' : 'text-slate-500'}`}
        />
        <span
          className={`text-[10px] tracking-wider font-semibold uppercase ${
            isPast ? 'text-[#00ff66]' : 'text-slate-500'
          }`}
        >
          PAST
        </span>
        {isPast && (
          <span className="w-1 h-1 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66] mt-0.5" />
        )}
      </button>

      {/* 4. CALENDAR */}
      <button
        onClick={() => onTabChange('calendar')}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <Calendar
          className={`w-5 h-5 ${isCalendar ? 'text-[#00ff66]' : 'text-slate-500'}`}
        />
        <span
          className={`text-[10px] tracking-wider font-semibold uppercase ${
            isCalendar ? 'text-[#00ff66]' : 'text-slate-500'
          }`}
        >
          CALENDAR
        </span>
        {isCalendar && (
          <span className="w-1 h-1 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66] mt-0.5" />
        )}
      </button>

      {/* 5. STATS */}
      <button
        onClick={() => onTabChange('analytics')}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <BarChart2
          className={`w-5 h-5 ${isStats ? 'text-[#00ff66]' : 'text-slate-500'}`}
        />
        <span
          className={`text-[10px] tracking-wider font-semibold uppercase ${
            isStats ? 'text-[#00ff66]' : 'text-slate-500'
          }`}
        >
          STATS
        </span>
        {isStats && (
          <span className="w-1 h-1 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66] mt-0.5" />
        )}
      </button>
    </nav>
  );
};
