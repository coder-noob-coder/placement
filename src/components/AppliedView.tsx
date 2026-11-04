'use client';

import React, { useState, useMemo } from 'react';
import { PlacementDrive } from '@/lib/db';
import { CompanyLogo } from './CompanyLogo';
import { formatDateShort, formatCtc, formatStipend } from './CompanyCard';
import { Bookmark, Briefcase, ChevronRight } from 'lucide-react';
import { useSavedDrives } from '@/hooks/useSavedDrives';

interface AppliedViewProps {
  drives: PlacementDrive[];
  onSelectCompany?: (drive: PlacementDrive) => void;
  onNavigateHome?: () => void;
  isPastDrive?: (drive: PlacementDrive) => boolean;
}

type RoundFilter = 'oa' | 'interview' | null;

/** Robust event date parser that handles "4 Nov '26", "2 Nov", ISO, DD/MM/YYYY */
export function parseEventDate(raw?: string): Date | null {
  if (!raw) return null;
  const clean = raw.trim();
  if (
    clean.toLowerCase().includes('tba') ||
    clean.toLowerCase().includes('tbd') ||
    clean.toLowerCase().includes('not') ||
    clean.toLowerCase().includes('completed') ||
    clean === '—' ||
    clean === '-'
  ) {
    return null;
  }

  // Normalize '26 -> 2026, Sept -> Sep
  const normalized = clean
    .replace(/'(?=\d{2}\b)/g, '20')
    .replace(/Sept\b/i, 'Sep');

  const parsed = new Date(normalized);
  if (!isNaN(parsed.getTime())) {
    if (parsed.getFullYear() < 2020) {
      parsed.setFullYear(new Date().getFullYear());
    }
    return parsed;
  }

  const mIso = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (mIso) {
    return new Date(parseInt(mIso[1]), parseInt(mIso[2]) - 1, parseInt(mIso[3]));
  }

  const mDmy = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (mDmy) {
    return new Date(parseInt(mDmy[3]), parseInt(mDmy[2]) - 1, parseInt(mDmy[1]));
  }

  return null;
}

/** Check if date matches real-time today */
export function isDateToday(raw?: string): boolean {
  const d = parseEventDate(raw);
  if (!d) return false;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/** Check if date is upcoming or today */
export function isDateUpcomingOrToday(raw?: string): boolean {
  const d = parseEventDate(raw);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(d);
  eventDay.setHours(0, 0, 0, 0);
  return eventDay.getTime() >= today.getTime();
}

/** Check if drive qualifies for Interview round */
function hasInterviewEvent(drive: PlacementDrive, stage?: string): boolean {
  if (stage === 'Interview') return true;
  if (isDateToday(drive.interviewDate)) return true;
  if (isDateUpcomingOrToday(drive.interviewDate)) return true;
  return false;
}

/** Check if drive qualifies for OA round */
function hasOaEvent(drive: PlacementDrive, stage?: string): boolean {
  if (stage === 'OA Round') return true;
  if (isDateToday(drive.oaDate)) return true;
  if (isDateUpcomingOrToday(drive.oaDate)) return true;
  return false;
}

export const AppliedView: React.FC<AppliedViewProps> = ({
  drives,
  onSelectCompany,
  onNavigateHome,
}) => {
  const { isSaved, getStage, mounted } = useSavedDrives();
  const [activeRoundFilter, setActiveRoundFilter] = useState<RoundFilter>(null);

  // Filter drives saved in localStorage
  const savedDrivesList = useMemo(() => {
    if (!mounted) return [];
    return drives.filter((drive) => isSaved(drive.id, drive.company));
  }, [drives, isSaved, mounted]);

  // Dynamic counts for only the two active round filter chips
  const { oaCount, interviewCount, totalTodayEvents } = useMemo(() => {
    let oa = 0;
    let interview = 0;
    let todayEvents = 0;

    savedDrivesList.forEach((drive) => {
      const stage = getStage(drive.id, drive.company);
      if (hasOaEvent(drive, stage)) oa++;
      if (hasInterviewEvent(drive, stage)) interview++;

      if (isDateToday(drive.interviewDate) || isDateToday(drive.oaDate)) {
        todayEvents++;
      }
    });

    return {
      oaCount: oa,
      interviewCount: interview,
      totalTodayEvents: todayEvents,
    };
  }, [savedDrivesList, getStage]);

  // Filter and sort drives
  const displayedDrives = useMemo(() => {
    let list = savedDrivesList;

    if (activeRoundFilter === 'oa') {
      list = list.filter((drive) =>
        hasOaEvent(drive, getStage(drive.id, drive.company))
      );
    } else if (activeRoundFilter === 'interview') {
      list = list.filter((drive) =>
        hasInterviewEvent(drive, getStage(drive.id, drive.company))
      );
    }

    // Pin "Today's Event" at the very top: 1st Interview today, 2nd OA today, then others
    return [...list].sort((a, b) => {
      const aIntToday = isDateToday(a.interviewDate);
      const bIntToday = isDateToday(b.interviewDate);
      if (aIntToday && !bIntToday) return -1;
      if (!aIntToday && bIntToday) return 1;

      const aOaToday = isDateToday(a.oaDate);
      const bOaToday = isDateToday(b.oaDate);
      if (aOaToday && !bOaToday) return -1;
      if (!aOaToday && bOaToday) return 1;

      return 0;
    });
  }, [savedDrivesList, activeRoundFilter, getStage]);

  return (
    <div className="space-y-3 select-none">
      {/* Compact Header Bar */}
      <div className="bg-[#0c141f] border border-[#1b2737] rounded-xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Bookmark className="w-4 h-4 fill-emerald-500/20" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight truncate">
                My Active Applications
              </h1>
              <p className="text-[11px] text-[#70879d] mt-0.5 truncate">
                Tracking {savedDrivesList.length}{' '}
                {savedDrivesList.length === 1 ? 'company' : 'companies'} on device
              </p>
            </div>
          </div>

          {savedDrivesList.length > 0 && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg shrink-0">
              {savedDrivesList.length} Active
            </span>
          )}
        </div>

        {/* Top Filter Chips: Exactly 2 Tabs (OA Round | Interview) */}
        {savedDrivesList.length > 0 && (
          <div className="pt-2 border-t border-[#172332]/80 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Chip 1: OA Round */}
            <button
              onClick={() => setActiveRoundFilter((prev) => (prev === 'oa' ? null : 'oa'))}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 font-mono ${
                activeRoundFilter === 'oa'
                  ? 'bg-emerald-500 text-black font-semibold shadow-xs ring-1 ring-emerald-400/30'
                  : 'bg-[#131d2a] hover:bg-[#1a2636] text-[#8fa0b2] hover:text-white border border-[#1e2c3c]'
              }`}
            >
              <span>OA Round</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeRoundFilter === 'oa'
                    ? 'bg-black/20 text-black'
                    : 'bg-[#0c141f] text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {oaCount}
              </span>
            </button>

            {/* Chip 2: Interview */}
            <button
              onClick={() => setActiveRoundFilter((prev) => (prev === 'interview' ? null : 'interview'))}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 font-mono ${
                activeRoundFilter === 'interview'
                  ? 'bg-emerald-500 text-black font-semibold shadow-xs ring-1 ring-emerald-400/30'
                  : 'bg-[#131d2a] hover:bg-[#1a2636] text-[#8fa0b2] hover:text-white border border-[#1e2c3c]'
              }`}
            >
              <span>Interview</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeRoundFilter === 'interview'
                    ? 'bg-black/20 text-black'
                    : 'bg-[#0c141f] text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {interviewCount}
              </span>
            </button>

            {activeRoundFilter && (
              <button
                onClick={() => setActiveRoundFilter(null)}
                className="text-[11px] text-[#70879d] hover:text-white underline ml-1 cursor-pointer font-sans"
              >
                Show all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Needed Today Compact Alert Banner */}
      {totalTodayEvents > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[#0c141f] border border-rose-500/40 rounded-xl py-2.5 px-3.5 flex items-center gap-2.5 shadow-md shadow-rose-950/20 animate-in fade-in">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-sm shrink-0">
            🔥
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight">
                Action Needed Today
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold animate-pulse">
                URGENT
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
              You have {totalTodayEvents} {totalTodayEvents === 1 ? 'interview / OA' : 'interviews / OAs'} scheduled for today.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!mounted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-[#0c141f] rounded-xl p-3 border border-[#1b2737] animate-pulse space-y-2"
            >
              <div className="h-4 bg-[#1b2737] rounded w-1/3" />
              <div className="h-5 bg-[#1b2737] rounded w-3/4" />
              <div className="h-8 bg-[#1b2737] rounded" />
            </div>
          ))}
        </div>
      ) : savedDrivesList.length === 0 ? (
        /* Empty State */
        <div className="bg-[#0c141f] border border-[#1b2737] rounded-xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#131d2a] border border-[#1e2c3c] flex items-center justify-center mx-auto text-[#70879d]">
            <Bookmark className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-bold text-white">
              No drives tracked yet
            </h3>
            <p className="text-xs text-[#70879d] leading-relaxed">
              Star or mark companies from the Home pipeline to track upcoming deadlines &amp; OAs here.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-black transition-colors cursor-pointer shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Browse Companies</span>
          </button>
        </div>
      ) : displayedDrives.length === 0 ? (
        /* Filter Empty State */
        <div className="bg-[#0c141f] border border-[#1b2737] rounded-xl p-6 text-center space-y-2">
          <p className="text-xs text-[#70879d]">
            No saved companies currently in &quot;{activeRoundFilter === 'oa' ? 'OA Round' : 'Interview'}&quot;.
          </p>
          <button
            onClick={() => setActiveRoundFilter(null)}
            className="text-xs text-[#22c55e] hover:underline cursor-pointer"
          >
            Show all saved ({savedDrivesList.length})
          </button>
        </div>
      ) : (
        /* Compact Cards Grid with Full Important Details */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {displayedDrives.map((drive) => {
            const currentStage = getStage(drive.id, drive.company);
            const isInterviewToday = isDateToday(drive.interviewDate);
            const isOaToday = isDateToday(drive.oaDate);
            const ctcInfo = formatCtc(drive.ctc);
            const formattedStipend = formatStipend(drive.stipend);

            return (
              <div
                key={drive.id}
                onClick={() => onSelectCompany?.(drive)}
                className={`bg-[#0c141f] rounded-xl p-3 sm:p-3.5 transition-all space-y-2 cursor-pointer group hover:border-[#2a3c50] shadow-xs relative ${
                  isInterviewToday
                    ? 'border border-rose-500/70 shadow-md shadow-rose-950/30'
                    : isOaToday
                    ? 'border border-amber-500/70 shadow-md shadow-amber-950/30'
                    : 'border border-[#1b2737]'
                }`}
              >
                {/* Urgent Today's Badge if any */}
                {isInterviewToday ? (
                  <div className="flex items-center pb-0.5">
                    <span className="animate-pulse bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                      🚨 Interview Today
                    </span>
                  </div>
                ) : isOaToday ? (
                  <div className="flex items-center pb-0.5">
                    <span className="animate-pulse bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                      ⚡ OA Assessment Today
                    </span>
                  </div>
                ) : null}

                {/* Row 1: Logo + Company Name (Left) & Package CTC / Stipend (Right) */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Logo & Company Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <CompanyLogo company={drive.company} size="sm" className="w-8 h-8 rounded-lg shrink-0" />
                    <h3 className="font-bold text-white text-sm sm:text-base leading-tight truncate group-hover:text-[#22c55e] transition-colors">
                      {drive.company}
                    </h3>
                  </div>

                  {/* Right: Package CTC + Stipend */}
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-bold text-[#22c55e] font-mono leading-none">
                      {ctcInfo.value}
                    </div>
                    {formattedStipend ? (
                      <div className="text-[10px] text-[#70879d] mt-0.5">
                        {formattedStipend}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Row 2: Event Schedule & Details */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#172332]/70 text-[11px]">
                  {/* Left: Schedule Date / Placed Count */}
                  <div className="flex items-center gap-2 min-w-0">
                    {drive.interviewDate ? (
                      <span className="text-[#8fa0b2] truncate font-medium">
                        INT: <span className="text-slate-300">{formatDateShort(drive.interviewDate)}</span>
                      </span>
                    ) : drive.oaDate ? (
                      <span className="text-[#8fa0b2] truncate font-medium">
                        OA: <span className="text-slate-300">{formatDateShort(drive.oaDate)}</span>
                      </span>
                    ) : drive.deadline ? (
                      <span className="text-[#8fa0b2] truncate font-medium">
                        Deadline: <span className="text-slate-300">{formatDateShort(drive.deadline)}</span>
                      </span>
                    ) : null}

                    {drive.studentsPlaced ? (
                      <span className="border border-emerald-500/30 text-emerald-400 bg-emerald-950/20 text-[10px] px-1.5 py-0.2 rounded-full font-medium shrink-0">
                        {drive.studentsPlaced} Placed
                      </span>
                    ) : null}
                  </div>

                  {/* Right: Details Chevron */}
                  <div className="flex items-center gap-0.5 text-[11px] text-[#70879d] group-hover:text-slate-200 transition-colors shrink-0">
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#546b80] group-hover:text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
