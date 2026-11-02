'use client';

import React from 'react';
import { PlacementDrive } from '@/lib/db';
import { Calendar, ChevronRight } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface CompanyCardProps {
  drive: PlacementDrive;
  onSelect?: (drive: PlacementDrive) => void;
  isPast?: boolean;
}

function formatDateShort(str?: string): string {
  if (!str) return '—';
  const clean = str.trim();
  if (
    clean.toLowerCase().includes('not') ||
    clean.toLowerCase().includes('tba') ||
    clean.toLowerCase().includes('tbd')
  ) {
    return 'TBA';
  }
  // Replace 2026 with '26, 2025 with '25
  return clean.replace(/\b20(\d{2})\b/, "'$1");
}

function formatCtc(rawCtc?: string): { value: string; isNotSpecified: boolean } {
  if (!rawCtc || !rawCtc.trim()) {
    return { value: 'Not Specified', isNotSpecified: true };
  }
  const clean = rawCtc.trim();
  const lower = clean.toLowerCase();
  if (
    lower.includes('not') ||
    lower.includes('check') ||
    lower.includes('tba') ||
    lower.includes('tbd') ||
    lower === '—' ||
    lower === '-'
  ) {
    return { value: 'Not Specified', isNotSpecified: true };
  }

  // If contains numbers, ensure ₹ prefix
  if (/\d/.test(clean)) {
    if (!clean.startsWith('₹') && !clean.startsWith('Rs') && !clean.startsWith('INR')) {
      return { value: `₹${clean}`, isNotSpecified: false };
    }
  }
  return { value: clean, isNotSpecified: false };
}

function formatStipend(rawStipend?: string): string {
  if (!rawStipend || !rawStipend.trim()) return '';
  const clean = rawStipend.trim();
  const lower = clean.toLowerCase();
  if (
    lower === '—' ||
    lower === '-' ||
    lower === 'nil' ||
    lower === 'na' ||
    lower === 'n/a'
  ) {
    return '';
  }
  if (/\d/.test(clean) && !clean.startsWith('₹')) {
    return `₹${clean}`;
  }
  return clean;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  drive,
  onSelect,
  isPast = false,
}) => {
  const ctcInfo = formatCtc(drive.ctc);
  const formattedStipend = formatStipend(drive.stipend);

  return (
    <div
      id={`drive-${drive.id}`}
      onClick={() => onSelect?.(drive)}
      className="bg-[#0c141f] border border-[#1b2737] hover:border-[#2a3c50] rounded-2xl p-4 transition-all space-y-3 cursor-pointer group shadow-sm shadow-black/20 select-none"
    >
      {/* Top Header: Logo + Company Info + Placed Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* White rounded square logo container */}
          <CompanyLogo company={drive.company} size="md" />

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-base sm:text-lg leading-tight truncate group-hover:text-[#22c55e] transition-colors">
              {drive.company}
            </h3>
            <p className="text-xs text-[#8fa0b2] truncate mt-0.5 font-normal">
              {drive.role || 'Job Profile'}
            </p>

            {/* Badges: Tier 1/2, Past */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="border border-emerald-500/50 text-emerald-400 bg-emerald-950/20 text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center">
                {drive.tier}
              </span>
              {isPast && (
                <span className="border border-[#223345] text-[#8fa0b2] bg-[#131e2b] text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center">
                  Past
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Placed Badge (shows number of placed students instead of tick symbol) */}
        {drive.studentsPlaced ? (
          <span className="border border-emerald-500/50 bg-emerald-950/30 text-emerald-400 text-xs px-2.5 py-1 rounded-xl flex items-center font-semibold shrink-0">
            {/placed/i.test(drive.studentsPlaced)
              ? drive.studentsPlaced
              : `${drive.studentsPlaced} Placed`}
          </span>
        ) : null}
      </div>

      {/* Divider */}
      <div className="border-t border-[#172332]" />

      {/* Middle Section: Compensation (Package & Stipend) */}
      <div className="flex items-center">
        {/* Package Column */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-base sm:text-lg font-bold truncate ${
              ctcInfo.isNotSpecified ? 'text-white' : 'text-[#22c55e]'
            }`}
          >
            {ctcInfo.value}
          </div>
          <div className="text-[11px] text-[#70879d] font-normal mt-0.5">
            Package
          </div>
        </div>

        {/* Stipend Column (if available) */}
        {formattedStipend ? (
          <>
            <div className="w-px h-8 bg-[#172332] mx-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-bold text-white truncate">
                {formattedStipend}
              </div>
              <div className="text-[11px] text-[#70879d] font-normal mt-0.5">
                Stipend
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Divider */}
      <div className="border-t border-[#172332]" />

      {/* Bottom Section: Schedule Dates & Chevron */}
      <div className="flex items-center justify-between text-xs text-[#8fa0b2] font-medium pt-0.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* OA Date */}
          {drive.oaDate ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#70879d]" />
              <span>OA: {formatDateShort(drive.oaDate)}</span>
            </div>
          ) : null}

          {/* Divider between OA and Interview */}
          {drive.oaDate && drive.interviewDate ? (
            <span className="text-[#1e2c3c] mx-0.5">|</span>
          ) : null}

          {/* Interview Date */}
          {drive.interviewDate ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#70879d]" />
              <span>INT: {formatDateShort(drive.interviewDate)}</span>
            </div>
          ) : null}

          {/* If neither OA nor Interview exists, show Deadline */}
          {!drive.oaDate && !drive.interviewDate && drive.deadline ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#70879d]" />
              <span>Deadline: {formatDateShort(drive.deadline)}</span>
            </div>
          ) : null}
        </div>

        {/* Details > */}
        <div className="flex items-center gap-0.5 text-[11px] text-[#70879d] group-hover:text-white transition-colors ml-auto shrink-0 font-medium">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
