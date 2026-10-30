'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NavTab } from './MobileBottomNav';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  index: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', index: '[01]', label: 'DASHBOARD' },
  { id: 'pipeline', index: '[02]', label: 'PIPELINE' },
  { id: 'applications', index: '[03]', label: 'APPLICATIONS' },
  { id: 'interviews', index: '[04]', label: 'INTERVIEWS' },
  { id: 'calendar', index: '[05]', label: 'CALENDAR' },
  { id: 'notes', index: '[06]', label: 'NOTES' },
  { id: 'analytics', index: '[07]', label: 'ANALYTICS' },
  { id: 'past', index: '[08]', label: 'PAST DRIVES' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="hidden md:flex flex-col w-48 lg:w-52 shrink-0 font-mono py-1 select-none">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs tracking-wider transition-all text-left cursor-pointer ${
                isActive
                  ? 'border border-[#00ff66]/50 bg-[#00ff66]/5 text-[#00ff66] font-semibold'
                  : 'text-[#61788d] hover:text-slate-200 hover:bg-[#0a1219] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={isActive ? 'text-[#00ff66]' : 'text-[#415568]'}>
                  {item.index}
                </span>
                <span>{item.label}</span>
              </div>

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-[#00ff66]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
