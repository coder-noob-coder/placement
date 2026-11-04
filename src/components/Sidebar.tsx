'use client';

import React from 'react';
import { ChevronRight, Home, History, Bookmark, BarChart2, Briefcase, Clock, Users } from 'lucide-react';
import { NavTab } from './MobileBottomNav';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'past', label: 'Past Drives', icon: History },
  { id: 'applied', label: 'Applied', icon: Bookmark },
  { id: 'analytics', label: 'Stats', icon: BarChart2 },
  { id: 'interviews', label: 'Interviews', icon: Clock },
  { id: 'applications', label: 'Applications', icon: Users },
  { id: 'pipeline', label: 'Pipeline', icon: Briefcase },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="hidden md:flex flex-col w-48 lg:w-52 shrink-0 py-1 select-none">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-[#22c55e]/15 text-[#22c55e] font-semibold border border-[#22c55e]/30'
                  : 'text-[#8fa0b2] hover:text-white hover:bg-[#131d2a] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#22c55e]' : 'text-[#70879d]'}`} />
                <span>{item.label}</span>
              </div>

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-[#22c55e]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
