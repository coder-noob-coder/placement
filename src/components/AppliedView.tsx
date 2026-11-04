'use client';

import React, { useState, useMemo } from 'react';
import { PlacementDrive } from '@/lib/db';
import { CompanyCard } from './CompanyCard';
import { Bookmark, Sparkles, Filter, CheckCircle2, ChevronRight, Briefcase } from 'lucide-react';
import { ApplicationStage, useSavedDrives } from '@/hooks/useSavedDrives';

interface AppliedViewProps {
  drives: PlacementDrive[];
  onSelectCompany?: (drive: PlacementDrive) => void;
  onNavigateHome?: () => void;
  isPastDrive?: (drive: PlacementDrive) => boolean;
}

const STAGES: { id: 'all' | ApplicationStage; label: string }[] = [
  { id: 'all', label: 'All Saved' },
  { id: 'Applied', label: 'Applied' },
  { id: 'OA Round', label: 'OA Round' },
  { id: 'Interview', label: 'Interview' },
  { id: 'Offered', label: 'Offered' },
];

export const AppliedView: React.FC<AppliedViewProps> = ({
  drives,
  onSelectCompany,
  onNavigateHome,
  isPastDrive,
}) => {
  const { savedDrives, isSaved, getStage, toggleSave, updateStage, mounted } = useSavedDrives();
  const [selectedStage, setSelectedStage] = useState<'all' | ApplicationStage>('all');

  // Filter drives that are marked in localStorage
  const savedDrivesList = useMemo(() => {
    if (!mounted) return [];
    return drives.filter((drive) => isSaved(drive.id, drive.company));
  }, [drives, isSaved, mounted]);

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: savedDrivesList.length,
      Applied: 0,
      'OA Round': 0,
      Interview: 0,
      Offered: 0,
    };
    savedDrivesList.forEach((drive) => {
      const stage = getStage(drive.id, drive.company);
      if (counts[stage] !== undefined) {
        counts[stage]++;
      }
    });
    return counts;
  }, [savedDrivesList, getStage]);

  // Filtered by active stage tab
  const displayedDrives = useMemo(() => {
    if (selectedStage === 'all') return savedDrivesList;
    return savedDrivesList.filter(
      (drive) => getStage(drive.id, drive.company) === selectedStage
    );
  }, [savedDrivesList, selectedStage, getStage]);

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
                {stageCounts['Offered'] > 0
                  ? `${stageCounts['Offered']} Offered 🎉`
                  : `${savedDrivesList.length} Active`}
              </span>
            </div>
          )}
        </div>

        {/* Stage Filter Segmented Pills (only if drives are saved) */}
        {savedDrivesList.length > 0 && (
          <div className="pt-2 border-t border-[#172332] flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {STAGES.map((st) => {
              const isActive = selectedStage === st.id;
              const count = stageCounts[st.id] ?? 0;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStage(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500 text-black font-semibold shadow-xs'
                      : 'bg-[#131d2a] hover:bg-[#1a2636] text-[#8fa0b2] hover:text-white border border-[#1e2c3c]'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/20 text-black font-bold' : 'bg-[#0c141f] text-[#70879d]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area: Empty State or Cards Grid */}
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
            No saved companies currently in &quot;{selectedStage}&quot; stage.
          </p>
          <button
            onClick={() => setSelectedStage('all')}
            className="text-xs text-[#22c55e] hover:underline cursor-pointer"
          >
            Show all saved ({savedDrivesList.length})
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedDrives.map((drive) => {
            const isPast = isPastDrive ? isPastDrive(drive) : false;
            const currentStage = getStage(drive.id, drive.company);

            return (
              <div key={drive.id} className="relative group">
                <CompanyCard
                  drive={drive}
                  isPast={isPast}
                  isSaved={true}
                  onToggleSave={(d) => toggleSave(d.id, d.company)}
                  savedStage={currentStage}
                  onStageChange={(d, newStage) => updateStage(d.id, newStage, d.company)}
                  showStageBadge={true}
                  onSelect={(d) => onSelectCompany?.(d)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
