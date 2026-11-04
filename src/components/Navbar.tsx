'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Search, X, Code2, Plus, Bookmark } from 'lucide-react';
import { NavTab } from './MobileBottomNav';

interface NavbarProps {
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  search?: string;
  onSearchChange?: (val: string) => void;
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  isRefreshing = false,
  search = '',
  onSearchChange,
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isMobileSearchOpen]);

  const handleRefresh = async () => {
    await onRefresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#172332] bg-[#070c12]/95 backdrop-blur-md select-none transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left: </> Placement Tracker 2026 */}
          <div
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
            onClick={() => onTabChange?.('dashboard')}
          >
            <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22c55e]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-base text-white tracking-tight truncate block leading-tight">
                Placement Tracker 2026
              </span>
              
            </div>
          </div>

          {/* Right Action Icons: Search, Notifications Bell, Plus Button, Refresh */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Search Input */}
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#546b80] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search..."
                className="w-40 md:w-56 pl-8 pr-7 py-1.5 rounded-xl bg-[#0c141f] text-xs text-white placeholder-[#70879d] border border-[#1b2737] focus:outline-none focus:border-[#22c55e] transition-colors cursor-text"
              />
              {search && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-2 text-[#70879d] hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#131d2a] transition-colors cursor-pointer"
              title="Search"
              aria-label="Toggle mobile search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Refresh Data (Desktop & Tablet) */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="hidden sm:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#131d2a] transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Refresh Data"
              aria-label="Refresh data"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#22c55e]' : ''}`}
              />
            </button>

            

            {/* Saved / Applied Applications Quick Access Button */}
            <button
              onClick={() => onTabChange?.('applied')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="My Applications"
              aria-label="My Applications"
            >
              <Bookmark className="w-4 h-4 stroke-[2.2] fill-black/20" />
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#546b80]" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search companies, roles..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0c141f] text-xs text-white placeholder-[#70879d] border border-[#1b2737] focus:outline-none focus:border-[#22c55e] cursor-text"
              />
              {search && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#70879d] p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                onSearchChange?.('');
                setIsMobileSearchOpen(false);
              }}
              className="text-xs text-[#70879d] hover:text-white px-2 py-1 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
