'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Search, X, MoreVertical } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-40 w-full border-b border-[#142330] bg-[#070c12]/95 backdrop-blur-md font-mono select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-14">
          {/* Left: [>] PLACEMENT TRACKER 2026 */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[#00ff66] font-bold text-xs sm:text-sm tracking-wider shrink-0">
              [&gt;]
            </span>
            <span className="font-bold text-xs sm:text-sm text-white tracking-wider whitespace-nowrap truncate">
              PLACEMENT TRACKER 2026
            </span>
          </div>

          {/* Right: Search & Refresh [R] */}
          <div className="flex items-center gap-2">
            {/* Desktop Search Input with clean minimal styling */}
            <div className="hidden sm:flex items-center relative">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#546b80] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="SEARCH..."
                  className="w-40 md:w-52 pl-8 pr-7 py-1 rounded-md bg-[#0a1219] text-xs text-white placeholder-[#546b80] border border-[#142330] focus:outline-none focus:border-[#00ff66]/50 transition-colors uppercase tracking-wider cursor-text"
                />
                {search && (
                  <button
                    onClick={() => onSearchChange?.('')}
                    className="absolute right-2 text-[#546b80] hover:text-white p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden p-1.5 rounded-md border border-[#142330] bg-[#0a1219] text-[#70879d] hover:text-white transition-colors cursor-pointer"
              title="Search"
              aria-label="Toggle mobile search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Refresh Button [R] */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-2 py-1 rounded-md border border-[#142330] bg-[#0a1219] text-[#70879d] hover:text-white hover:border-[#1d354a] transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00ff66]' : ''}`}
              />
              <span className="hidden sm:inline">[R]</span>
            </button>

            {/* Mobile 3-Dots Menu Button */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-md border border-[#142330] bg-[#0a1219] text-[#70879d] hover:text-white transition-colors cursor-pointer"
                title="Options"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md bg-[#0a1219] border border-[#142330] shadow-xl py-1 text-xs z-50 divide-y divide-[#142330]">
                  <button
                    onClick={() => {
                      onTabChange?.('pipeline');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:bg-[#0e1720] hover:text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>View All Drives</span>
                    <span className="text-[#00ff66]">&gt;</span>
                  </button>
                  <button
                    onClick={() => {
                      onTabChange?.('past');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:bg-[#0e1720] hover:text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>Past Companies</span>
                    <span className="text-slate-400">&gt;</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-2.5 pt-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#546b80]" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="SEARCH COMPANIES, ROLES..."
                className="w-full pl-8 pr-8 py-1.5 rounded-md bg-[#0a1219] text-xs text-white placeholder-[#546b80] border border-[#142330] focus:outline-none focus:border-[#00ff66]/60 uppercase tracking-wider cursor-text"
              />
              {search && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#546b80] p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs text-[#70879d] hover:text-white px-2 py-1 cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        )}


      </div>
    </header>
  );
};
