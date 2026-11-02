'use client';

import React from 'react';
import { Search, X, ArrowUpDown, LayoutGrid, ListFilter } from 'lucide-react';

export type DateSortOption = 'deadline-asc' | 'deadline-desc' | 'listed-desc' | 'listed-asc';
export type CtcFilterOption = 'all' | '5' | '10' | '15' | '20' | '25';
export type StatusFilterOption = 'all' | 'active' | 'past';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedTier: string;
  onTierChange: (val: string) => void;
  availableTiers: string[];
  tierCounts: Record<string, number>;
  ctcFilter: CtcFilterOption;
  onCtcFilterChange: (val: CtcFilterOption) => void;
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (val: StatusFilterOption) => void;
  sortByDate: DateSortOption;
  onSortByDateChange: (val: DateSortOption) => void;
  showTodayOnly: boolean;
  onToggleTodayOnly: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFiltered: number;
  onReset: () => void;
}

const CTC_OPTIONS: { id: CtcFilterOption; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: '5', label: '> 5L' },
  { id: '10', label: '> 10L' },
  { id: '15', label: '> 15L' },
  { id: '20', label: '> 20L' },
  { id: '25', label: '> 25L' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedTier,
  onTierChange,
  availableTiers,
  tierCounts,
  ctcFilter,
  onCtcFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortByDate,
  onSortByDateChange,
  showTodayOnly,
  onToggleTodayOnly,
  viewMode,
  onViewModeChange,
  totalFiltered,
  onReset,
}) => {
  const isFiltered =
    search !== '' ||
    selectedTier !== 'All' ||
    ctcFilter !== 'all' ||
    statusFilter !== 'all' ||
    showTodayOnly ||
    sortByDate !== 'deadline-asc';

  return (
    <div className="bg-[#0a1219] border border-[#142330] rounded-xl p-3 sm:p-4 mb-4 space-y-2.5 font-mono transition-colors">
      {/* Row 1: Search + Status + Sort & View controls */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#546b80]" />
          <input
            id="company-search-input"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="SEARCH COMPANIES, ROLES..."
            className="w-full pl-8 pr-8 py-1.5 rounded-md bg-[#070c12] text-xs text-white placeholder-[#546b80] border border-[#142330] focus:outline-none focus:border-[#00ff66]/60 uppercase tracking-wider transition-colors cursor-text"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#546b80] hover:text-white p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status + Sort + View */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Status Filter: ALL · ACTIVE · PAST */}
          <div className="flex items-center rounded-md bg-[#070c12] border border-[#142330] p-0.5 shrink-0 text-xs">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#142330] text-[#00ff66] font-semibold'
                  : 'text-[#546b80] hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => onStatusFilterChange('active')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-[#142330] text-[#00ff66] font-semibold'
                  : 'text-[#546b80] hover:text-white'
              }`}
            >
              ACTIVE
            </button>
            <button
              onClick={() => onStatusFilterChange('past')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                statusFilter === 'past'
                  ? 'bg-[#142330] text-[#00ff66] font-semibold'
                  : 'text-[#546b80] hover:text-white'
              }`}
            >
              PAST
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sort Selector: Compact & Responsive */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#070c12] border border-[#142330] text-xs text-[#70879d] shrink-0">
              <ArrowUpDown className="w-3 h-3 text-[#546b80] shrink-0" />
              <select
                value={sortByDate}
                onChange={(e) => onSortByDateChange(e.target.value as DateSortOption)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-[11px] uppercase"
              >
                <option value="deadline-asc" className="bg-[#0a1219] text-white">
                  SOONEST
                </option>
                <option value="deadline-desc" className="bg-[#0a1219] text-white">
                  LATEST
                </option>
                <option value="listed-desc" className="bg-[#0a1219] text-white">
                  NEWEST
                </option>
                <option value="listed-asc" className="bg-[#0a1219] text-white">
                  OLDEST
                </option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center rounded-md bg-[#070c12] border border-[#142330] p-0.5 shrink-0">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#142330] text-[#00ff66]'
                    : 'text-[#546b80] hover:text-white'
                }`}
                title="Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#142330] text-[#00ff66]'
                    : 'text-[#546b80] hover:text-white'
                }`}
                title="Table"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Filter Controls */}
      <div className="pt-2 border-t border-[#142330] space-y-2">
        {/* Tiers & Total Counter */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Strictly ALL · TIER 1 · TIER 2 */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] text-[#546b80] uppercase tracking-wider mr-0.5 shrink-0 font-semibold">
              TIERS:
            </span>
            {availableTiers.map((tier) => {
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => onTierChange(tier)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10 font-bold'
                      : 'border border-[#142330] bg-[#070c12] text-[#70879d] hover:text-white'
                  }`}
                >
                  {tier.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Counter & Reset */}
          <div className="flex items-center gap-2 shrink-0 text-[#61788d] text-[11px] ml-auto">
            <span>
              <strong className="text-white">{totalFiltered}</strong> DRIVES
            </span>
            {isFiltered && (
              <button
                onClick={onReset}
                className="text-[#ef4444] hover:underline uppercase tracking-wider cursor-pointer font-bold text-[11px]"
              >
                RESET
              </button>
            )}
          </div>
        </div>

        {/* CTC Range Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] text-[#546b80] uppercase tracking-wider mr-0.5 shrink-0 font-semibold">
            CTC:
          </span>
          {CTC_OPTIONS.map((opt) => {
            const isSelected = ctcFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onCtcFilterChange(opt.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10 font-bold'
                    : 'border border-[#142330] bg-[#070c12] text-[#70879d] hover:text-white'
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
