'use client';

import React from 'react';
import { PlacementDrive } from '@/lib/db';
import { Calendar, ChevronRight, Bookmark } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { ApplicationStage } from '@/hooks/useSavedDrives';

interface CompanyCardProps {
  drive: PlacementDrive;
  onSelect?: (drive: PlacementDrive) => void;
  isPast?: boolean;
  isSaved?: boolean;
  onToggleSave?: (drive: PlacementDrive) => void;
  savedStage?: ApplicationStage;
  onStageChange?: (drive: PlacementDrive, stage: ApplicationStage) => void;
  showStageBadge?: boolean;
  isInterviewToday?: boolean;
  isOaToday?: boolean;
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
  isSaved = false,
  onToggleSave,
  savedStage,
  onStageChange,
  showStageBadge = false,
  isInterviewToday = false,
  isOaToday = false,
}) => {
  const ctcInfo = formatCtc(drive.ctc);
  const formattedStipend = formatStipend(drive.stipend);

  return (
    <div
      id={`drive-${drive.id}`}
      onClick={() => onSelect?.(drive)}
      className={`bg-[#0c141f] rounded-2xl p-4 transition-all space-y-3 cursor-pointer group select-none relative ${
        isInterviewToday
          ? 'border-2 border-rose-500/60 shadow-lg shadow-rose-950/30'
          : isOaToday
          ? 'border-2 border-amber-500/60 shadow-lg shadow-amber-950/30'
          : 'border border-[#1b2737] hover:border-[#2a3c50] shadow-sm shadow-black/20'
      }`}
    >
      {/* Urgent Today's Event Pill Banner */}
      {isInterviewToday ? (
        <div className="flex items-center pb-0.5">
          <span className="animate-pulse bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 font-mono shadow-xs">
            🚨 Interview Today
          </span>
        </div>
      ) : isOaToday ? (
        <div className="flex items-center pb-0.5">
          <span className="animate-pulse bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 font-mono shadow-xs">
            ⚡ OA Assessment Today
          </span>
        </div>
      ) : null}

      {/* Top Header: Logo + Company Info + Placed Status + Bookmark */}
      <div className="flex items-start justify-between gap-2.5">
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

            {/* Badges: Tier 1/2, Past, and Application Stage */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="border border-emerald-500/50 text-emerald-400 bg-emerald-950/20 text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center">
                {drive.tier}
              </span>
              {isPast && (
                <span className="border border-[#223345] text-[#8fa0b2] bg-[#131e2b] text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center">
                  Past
                </span>
              )}
              {isSaved && savedStage && (
                <span
                  onClick={(e) => {
                    if (onStageChange) {
                      e.stopPropagation();
                      const stages: ApplicationStage[] = ['Applied', 'OA Round', 'Interview', 'Offered'];
                      const nextIdx = (stages.indexOf(savedStage) + 1) % stages.length;
                      onStageChange(drive, stages[nextIdx]);
                    }
                  }}
                  title="Click to cycle status: Applied -> OA Round -> Interview -> Offered"
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 cursor-pointer transition-all ${
                    savedStage === 'Offered'
                      ? 'border border-emerald-500/60 text-emerald-300 bg-emerald-950/40 ring-1 ring-emerald-500/30 font-semibold'
                      : savedStage === 'Interview'
                      ? 'border border-purple-500/50 text-purple-300 bg-purple-950/30'
                      : savedStage === 'OA Round'
                      ? 'border border-amber-500/50 text-amber-300 bg-amber-950/30'
                      : 'border border-cyan-500/50 text-cyan-300 bg-cyan-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {savedStage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top-Right: Placed Badge and Bookmark Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {drive.studentsPlaced ? (
            <span className="border border-emerald-500/50 bg-emerald-950/30 text-emerald-400 text-xs px-2.5 py-1 rounded-xl flex items-center font-semibold shrink-0">
              {/placed/i.test(drive.studentsPlaced)
                ? drive.studentsPlaced
                : `${drive.studentsPlaced} Placed`}
            </span>
          ) : null}

          {/* Bookmark Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(drive);
            }}
            title={isSaved ? 'Remove from Applied' : 'Mark as Applied'}
            aria-label={isSaved ? 'Remove from Applied' : 'Mark as Applied'}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-500/15 border-emerald-500/40 text-[#22c55e] shadow-sm shadow-emerald-500/20'
                : 'bg-[#131d2a]/60 hover:bg-[#1a2636] border-[#1f2d3f] text-[#70879d] hover:text-white'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 transition-transform active:scale-90 ${
                isSaved ? 'fill-emerald-400 text-emerald-400' : ''
              }`}
            />
          </button>
        </div>
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
