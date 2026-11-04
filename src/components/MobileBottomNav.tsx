'use client';

import React from 'react';
import { Home, History, Bookmark, BarChart2 } from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'pipeline'
  | 'applications'
  | 'interviews'
  | 'applied'
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
  const isApplied = activeTab === 'applied' || activeTab === 'notes';
  const isStats = activeTab === 'analytics';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070c12]/95 backdrop-blur-md border-t border-[#172332] px-4 py-2 flex items-center justify-around select-none">
      {/* 1. HOME */}
      <button
        onClick={() => onTabChange('dashboard')}
        className="flex flex-col items-center justify-center py-1 px-3 transition-colors relative min-w-[58px] cursor-pointer"
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
        className="flex flex-col items-center justify-center py-1 px-3 transition-colors relative min-w-[58px] cursor-pointer"
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

      {/* 3. APPLIED / MY LIST */}
      <button
        onClick={() => onTabChange('applied')}
        className="flex flex-col items-center justify-center py-1 px-3 transition-colors relative min-w-[58px] cursor-pointer"
      >
        <Bookmark
          className={`w-5 h-5 ${isApplied ? 'text-[#22c55e] fill-emerald-500/20' : 'text-slate-400'}`}
        />
        <span
          className={`text-[11px] font-medium mt-1 transition-colors ${
            isApplied ? 'text-white font-semibold' : 'text-[#70879d]'
          }`}
        >
          Applied
        </span>
        {isApplied && (
          <div className="w-6 h-0.5 bg-[#22c55e] rounded-full mt-1" />
        )}
      </button>

      {/* 4. STATS */}
      <button
        onClick={() => onTabChange('analytics')}
        className="flex flex-col items-center justify-center py-1 px-3 transition-colors relative min-w-[58px] cursor-pointer"
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
