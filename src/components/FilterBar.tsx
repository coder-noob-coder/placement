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
  { id: 'all', label: 'All' },
  { id: '5', label: '>5L' },
  { id: '10', label: '>10L' },
  { id: '15', label: '>15L' },
  { id: '20', label: '>20L' },
  { id: '25', label: '>25L' },
];

const SORT_OPTIONS: { id: DateSortOption; label: string; short: string }[] = [
  { id: 'deadline-asc', label: 'Soonest Deadline', short: 'Soonest' },
  { id: 'deadline-desc', label: 'Latest Deadline', short: 'Latest' },
  { id: 'listed-desc', label: 'Newest Listed', short: 'Newest' },
  { id: 'listed-asc', label: 'Oldest Listed', short: 'Oldest' },
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
    <div className="bg-[#0c141f] border border-[#1b2737] rounded-2xl p-3 sm:p-3.5 mb-4 space-y-2.5 transition-colors shadow-sm shadow-black/20 select-none">
      {/* Row 1: Tier Filters | Sort Button */}
      <div className="flex items-center justify-between gap-2 flex-nowrap">
        {/* Tier Group */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs sm:text-sm text-[#70879d] font-medium mr-1 shrink-0">
            Tier:
          </span>
          {availableTiers.map((tier) => {
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => onTierChange(tier)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                    : 'bg-[#131d2a] text-[#8fa0b2] border border-[#1e2c3c] hover:text-white hover:border-[#2a3c50]'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>

        {/* Divider & Sort Button */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <div className="w-px h-5 bg-[#1b2737] shrink-0 hidden sm:block" />

          {/* Sort Selector Button */}
          <div className="relative shrink-0" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="bg-[#131d2a] border border-[#1e2c3c] hover:border-[#2a3c50] text-white px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              title="Change sort order"
              aria-label="Sort options"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
              <span className="font-medium text-xs text-white">
                {currentSortOption.short}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#70879d] shrink-0" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#0c141f] border border-[#1b2737] shadow-2xl py-1 z-50 text-xs divide-y divide-[#172332]">
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
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#22c55e]/15 text-[#22c55e] font-semibold'
                          : 'text-slate-300 hover:bg-[#131d2a] hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: CTC Range Pills (compact, spans neatly without scroll) */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-xs sm:text-sm text-[#70879d] font-medium mr-1 shrink-0">
          CTC:
        </span>
        <div className="flex items-center gap-1.5 flex-1 justify-between sm:justify-start">
          {CTC_OPTIONS.map((opt) => {
            const isSelected = ctcFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onCtcFilterChange(opt.id)}
                className={`flex-1 sm:flex-none text-center px-2 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                    : 'bg-[#131d2a] text-[#8fa0b2] border border-[#1e2c3c] hover:text-white hover:border-[#2a3c50]'
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
