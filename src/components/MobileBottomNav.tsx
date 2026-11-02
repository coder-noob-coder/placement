'use client';

import React from 'react';
import { Home, History, StickyNote, Calendar, BarChart2 } from 'lucide-react';

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
  const isHome = activeTab === 'dashboard' || activeTab === 'pipeline';
  const isPast = activeTab === 'past';
  const isNotes = activeTab === 'notes';
  const isCalendar = activeTab === 'calendar';
  const isStats = activeTab === 'analytics';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070c12]/95 backdrop-blur-md border-t border-[#172332] px-3 py-1.5 flex items-center justify-around select-none">
      {/* 1. HOME */}
      <button
        onClick={() => onTabChange('dashboard')}
        className="flex flex-col items-center justify-center py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <Home className={`w-5 h-5 ${isHome ? 'text-[#22c55e]' : 'text-slate-400'}`} />
        <span
          className={`text-[11px] font-medium mt-1 transition-colors ${
            isHome ? 'text-white font-semibold' : 'text-[#70879d]'
          }`}
        >
          Home
        </span>
        {isHome && (
          <div className="w-6 h-0.5 bg-[#22c55e] rounded-full mt-1" />
        )}
      </button>

      {/* 2. PAST */}
      <button
        onClick={() => onTabChange('past')}
        className="flex flex-col items-center justify-center py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <History
          className={`w-5 h-5 ${isPast ? 'text-[#22c55e]' : 'text-slate-400'}`}
        />
        <span
          className={`text-[11px] font-medium mt-1 transition-colors ${
            isPast ? 'text-white font-semibold' : 'text-[#70879d]'
          }`}
        >
          Past
        </span>
        {isPast && (
          <div className="w-6 h-0.5 bg-[#22c55e] rounded-full mt-1" />
        )}
      </button>

      {/* 3. NOTES */}
      <button
        onClick={() => onTabChange('notes')}
        className="flex flex-col items-center justify-center py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <StickyNote
          className={`w-5 h-5 ${isNotes ? 'text-[#22c55e]' : 'text-slate-400'}`}
        />
        <span
          className={`text-[11px] font-medium mt-1 transition-colors ${
            isNotes ? 'text-white font-semibold' : 'text-[#70879d]'
          }`}
        >
          Notes
        </span>
        {isNotes && (
          <div className="w-6 h-0.5 bg-[#22c55e] rounded-full mt-1" />
        )}
      </button>

      {/* 4. CALENDAR */}
      <button
        onClick={() => onTabChange('calendar')}
        className="flex flex-col items-center justify-center py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <Calendar
          className={`w-5 h-5 ${isCalendar ? 'text-[#22c55e]' : 'text-slate-400'}`}
        />
        <span
          className={`text-[11px] font-medium mt-1 transition-colors ${
            isCalendar ? 'text-white font-semibold' : 'text-[#70879d]'
          }`}
        >
          Calendar
        </span>
        {isCalendar && (
          <div className="w-6 h-0.5 bg-[#22c55e] rounded-full mt-1" />
        )}
      </button>

      {/* 5. STATS */}
      <button
        onClick={() => onTabChange('analytics')}
        className="flex flex-col items-center justify-center py-1 px-2.5 transition-colors relative min-w-[54px] cursor-pointer"
      >
        <BarChart2
          className={`w-5 h-5 ${isStats ? 'text-[#22c55e]' : 'text-slate-400'}`}
        />
        <span
          className={`text-[11px] font-medium mt-1 transition-colors ${
            isStats ? 'text-white font-semibold' : 'text-[#70879d]'
          }`}
        >
          Stats
        </span>
        {isStats && (
          <div className="w-6 h-0.5 bg-[#22c55e] rounded-full mt-1" />
        )}
      </button>
    </nav>
  );
};
