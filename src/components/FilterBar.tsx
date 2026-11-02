'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';

export type DateSortOption = 'deadline-asc' | 'deadline-desc' | 'listed-desc' | 'listed-asc';
export type CtcFilterOption = 'all' | '5' | '10' | '15' | '20' | '25';
export type StatusFilterOption = 'all' | 'active' | 'past';

interface FilterBarProps {
  selectedTier: string;
  onTierChange: (val: string) => void;
  availableTiers: string[];
  tierCounts?: Record<string, number>;
  ctcFilter: CtcFilterOption;
  onCtcFilterChange: (val: CtcFilterOption) => void;
  sortByDate: DateSortOption;
  onSortByDateChange: (val: DateSortOption) => void;
  totalFiltered?: number;
  onReset?: () => void;
  isFiltered?: boolean;
  // Optional / backwards compatibility props
  search?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: StatusFilterOption;
  onStatusFilterChange?: (val: StatusFilterOption) => void;
  showTodayOnly?: boolean;
  onToggleTodayOnly?: () => void;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
}

const CTC_OPTIONS: { id: CtcFilterOption; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: '5', label: '>5L' },
  { id: '10', label: '>10L' },
  { id: '15', label: '>15L' },
  { id: '20', label: '>20L' },
  { id: '25', label: '>25L' },
];

const SORT_OPTIONS: { id: DateSortOption; label: string; short: string }[] = [
  { id: 'deadline-asc', label: 'SOONEST DEADLINE', short: 'SOONEST' },
  { id: 'deadline-desc', label: 'LATEST DEADLINE', short: 'LATEST' },
  { id: 'listed-desc', label: 'NEWEST LISTED', short: 'NEWEST' },
  { id: 'listed-asc', label: 'OLDEST LISTED', short: 'OLDEST' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedTier,
  onTierChange,
  availableTiers,
  ctcFilter,
  onCtcFilterChange,
  sortByDate,
  onSortByDateChange,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or touch
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSortOpen]);

  const currentSortOption =
    SORT_OPTIONS.find((opt) => opt.id === sortByDate) || SORT_OPTIONS[0];

  return (
    <div className="bg-[#0c1520] border border-[#1b2d3e] rounded-xl p-3 sm:p-3.5 mb-4 space-y-2 font-mono transition-colors shadow-md shadow-black/30">
      {/* Row 1: Tiers on left, Sort button on right — clean, fixed, no reset button */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Tier Filters: ALL · TIER 1 · TIER 2 */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-[#546b80] uppercase tracking-wider mr-0.5 font-semibold shrink-0">
            TIERS:
          </span>
          {availableTiers.map((tier) => {
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => onTierChange(tier)}
                className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10 font-bold'
                    : 'border border-[#172535] bg-[#070d14] text-[#70879d] hover:text-white'
                }`}
              >
                {tier.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Right side: Simple Sort Button with Popup */}
        <div className="relative shrink-0" ref={sortMenuRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-[#172535] bg-[#070d14] text-[#70879d] hover:text-white hover:border-[#28425b] text-[10px] sm:text-xs font-mono transition-colors cursor-pointer"
            title="Sort drives"
            aria-label="Sort options"
          >
            <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00ff66] shrink-0" />
            <span className="text-white font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">
              {currentSortOption.short}
            </span>
            <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#546b80] shrink-0" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-lg bg-[#0c1520] border border-[#1b2d3e] shadow-2xl py-1 z-50 font-mono text-xs divide-y divide-[#172535]">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortByDate === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSortByDateChange(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#00ff66]/10 text-[#00ff66] font-bold'
                        : 'text-slate-300 hover:bg-[#070d14] hover:text-white'
                    }`}
                  >
                    <span className="tracking-wider uppercase text-[11px]">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#00ff66] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Compact CTC Range Pills (full width, fits in 1 line without swiping) */}
      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-[#172535]">
        <div className="flex items-center gap-1 w-full justify-between sm:justify-start">
          <span className="text-[10px] text-[#546b80] uppercase tracking-wider mr-0.5 font-semibold shrink-0">
            CTC:
          </span>
          {CTC_OPTIONS.map((opt) => {
            const isSelected = ctcFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onCtcFilterChange(opt.id)}
                className={`flex-1 sm:flex-none text-center px-1.5 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  isSelected
                    ? 'border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10 font-bold'
                    : 'border border-[#172535] bg-[#070d14] text-[#70879d] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
