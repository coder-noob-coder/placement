'use client';

import React, { useState, useMemo } from 'react';
import { PlacementDrive } from '@/lib/db';
import { CompanyCard } from './CompanyCard';
import { Bookmark, Briefcase } from 'lucide-react';
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
    // If year wasn't present, default to current year
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
  isPastDrive,
}) => {
  const { isSaved, getStage, toggleSave, updateStage, mounted } = useSavedDrives();
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

    // Sort to pin "Today's Event" at the very top:
    // 1st: Interview today
    // 2nd: OA today
    // 3rd: Others
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
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#0c141f] border border-[#1b2737] rounded-2xl p-4 sm:p-5 shadow-sm shadow-black/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Bookmark className="w-5 h-5 fill-emerald-500/20" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                My Active Applications
              </h1>
              <p className="text-xs sm:text-sm text-[#70879d] mt-0.5">
                Tracking {savedDrivesList.length}{' '}
                {savedDrivesList.length === 1 ? 'company' : 'companies'} saved on this device
              </p>
            </div>
          </div>

          {savedDrivesList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-xl">
                {savedDrivesList.length} Active
              </span>
            </div>
          )}
        </div>

        {/* Top Filter Chips: EXACTLY 2 Tabs (OA Round | Interview) */}
        {savedDrivesList.length > 0 && (
          <div className="pt-2 border-t border-[#172332] flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Chip 1: OA Round */}
            <button
              onClick={() => setActiveRoundFilter((prev) => (prev === 'oa' ? null : 'oa'))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 font-mono ${
                activeRoundFilter === 'oa'
                  ? 'bg-emerald-500 text-black font-semibold shadow-xs ring-2 ring-emerald-400/30'
                  : 'bg-[#131d2a] hover:bg-[#1a2636] text-[#8fa0b2] hover:text-white border border-[#1e2c3c]'
              }`}
            >
              <span>OA Round</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 font-mono ${
                activeRoundFilter === 'interview'
                  ? 'bg-emerald-500 text-black font-semibold shadow-xs ring-2 ring-emerald-400/30'
                  : 'bg-[#131d2a] hover:bg-[#1a2636] text-[#8fa0b2] hover:text-white border border-[#1e2c3c]'
              }`}
            >
              <span>Interview</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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
                className="text-xs text-[#70879d] hover:text-white underline ml-1 cursor-pointer font-sans"
              >
                Show all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Needed Today Callout Alert Banner */}
      {totalTodayEvents > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[#0c141f] border border-rose-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-rose-950/20 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shrink-0">
            🔥
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Action Needed Today
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold animate-pulse">
                URGENT
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-medium">
              You have {totalTodayEvents} {totalTodayEvents === 1 ? 'interview / OA' : 'interviews / OAs'} scheduled for today.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!mounted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-[#0c141f] rounded-2xl p-4 border border-[#1b2737] animate-pulse space-y-3"
            >
              <div className="h-4 bg-[#1b2737] rounded w-1/3" />
              <div className="h-6 bg-[#1b2737] rounded w-3/4" />
              <div className="h-10 bg-[#1b2737] rounded" />
            </div>
          ))}
        </div>
      ) : savedDrivesList.length === 0 ? (
        /* Empty State */
        <div className="bg-[#0c141f] border border-[#1b2737] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm shadow-black/20">
          <div className="w-14 h-14 rounded-2xl bg-[#131d2a] border border-[#1e2c3c] flex items-center justify-center mx-auto text-[#70879d]">
            <Bookmark className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-white">
              No drives tracked yet
            </h3>
            <p className="text-xs sm:text-sm text-[#70879d] leading-relaxed">
              Star or mark companies from the Home pipeline to track upcoming deadlines &amp; OAs here.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-black transition-colors cursor-pointer shadow-xs"
          >
            <Briefcase className="w-4 h-4 stroke-[2.2]" />
            <span>Browse Companies</span>
          </button>
        </div>
      ) : displayedDrives.length === 0 ? (
        /* Filter Empty State */
        <div className="bg-[#0c141f] border border-[#1b2737] rounded-2xl p-8 text-center space-y-2">
          <p className="text-xs sm:text-sm text-[#70879d]">
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
        /* Cards Grid with Pinned Urgency */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedDrives.map((drive) => {
            const isPast = isPastDrive ? isPastDrive(drive) : false;
            const currentStage = getStage(drive.id, drive.company);
            const isInterviewToday = isDateToday(drive.interviewDate);
            const isOaToday = isDateToday(drive.oaDate);

            return (
              <CompanyCard
                key={drive.id}
                drive={drive}
                isPast={isPast}
                isSaved={true}
                onToggleSave={(d) => toggleSave(d.id, d.company)}
                savedStage={currentStage}
                onStageChange={(d, newStage) => updateStage(d.id, newStage, d.company)}
                showStageBadge={true}
                isInterviewToday={isInterviewToday}
                isOaToday={isOaToday}
                onSelect={(d) => onSelectCompany?.(d)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
