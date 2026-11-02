'use client';

import React, { useEffect } from 'react';
import { PlacementDrive } from '@/lib/db';
import { X, Calendar, GraduationCap, Clock, Users, Building, ExternalLink } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface CompanyDetailModalProps {
  drive: PlacementDrive | null;
  onClose: () => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ drive, onClose }) => {
  useEffect(() => {
    if (!drive) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [drive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!drive) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overscroll-contain touch-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain bg-[#0c141f] border border-[#1b2737] rounded-2xl shadow-2xl p-4 sm:p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Logo + Company Name + Role + Close Button */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#172332]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CompanyLogo company={drive.company} size="sm" className="sm:w-12 sm:h-12" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
                  {drive.company}
                </h2>
                <span className="border border-emerald-500/50 text-emerald-400 bg-emerald-950/20 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
                  {drive.tier}
                </span>
                {drive.studentsPlaced ? (
                  <span className="border border-emerald-500/50 bg-emerald-950/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
                    {drive.studentsPlaced} Placed
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[#8fa0b2] truncate mt-0.5">
                {drive.role || 'Job Profile'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl border border-[#1b2737] hover:border-slate-500 bg-[#131d2a] text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compensation & Stipend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#131d2a] border border-[#1e2c3c]">
            <span className="text-[10px] text-[#70879d] font-medium uppercase tracking-wider block">
              Package (CTC)
            </span>
            <span className="text-sm sm:text-base font-bold text-[#22c55e] block mt-0.5 truncate">
              {drive.ctc || 'Not Specified'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#131d2a] border border-[#1e2c3c]">
            <span className="text-[10px] text-[#70879d] font-medium uppercase tracking-wider block">
              Stipend
            </span>
            <span className="text-sm sm:text-base font-bold text-white block mt-0.5 truncate">
              {drive.stipend || '—'}
            </span>
          </div>
        </div>

        {/* 1. Academic Cutoff & Criteria (NOT on card) */}
        {drive.cgpaCutoff && (
          <div className="p-2.5 rounded-xl bg-[#131d2a] border border-amber-500/30 flex items-start gap-2.5 text-xs">
            <GraduationCap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                Academic Cutoff &amp; Eligibility
              </span>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-medium leading-relaxed">
                {drive.cgpaCutoff}
              </p>
            </div>
          </div>
        )}

        {/* 2. Full Timeline: Deadline, OA, Interview, Listed Date (NOT all on card) */}
        <div className="p-2.5 rounded-xl bg-[#131d2a] border border-[#1e2c3c] space-y-1.5 text-xs">
          <span className="text-[10px] text-[#70879d] font-medium uppercase tracking-wider block">
            Drive Timeline &amp; Dates
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#0c141f] border border-[#1b2737]">
              <span className="text-[#70879d]">Deadline:</span>
              <span className="text-red-400 font-semibold truncate ml-1">
                {drive.deadline || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#0c141f] border border-[#1b2737]">
              <span className="text-[#70879d]">OA Date:</span>
              <span className="text-sky-400 font-semibold truncate ml-1">
                {drive.oaDate || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#0c141f] border border-[#1b2737]">
              <span className="text-[#70879d]">Interview:</span>
              <span className="text-purple-400 font-semibold truncate ml-1">
                {drive.interviewDate || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#0c141f] border border-[#1b2737]">
              <span className="text-[#70879d]">Listed:</span>
              <span className="text-slate-300 font-semibold truncate ml-1">
                {drive.dateListed || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Eligible Branches (NOT on card) */}
        {drive.eligibleBranches && drive.eligibleBranches.length > 0 && (
          <div className="p-2.5 rounded-xl bg-[#131d2a] border border-[#1e2c3c] text-xs">
            <span className="text-[10px] text-[#70879d] font-medium uppercase tracking-wider block mb-1.5">
              Eligible Branches ({drive.eligibleBranches.length})
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto scrollbar-none">
              {drive.eligibleBranches.map((branch, idx) => (
                <span
                  key={`${branch}_${idx}`}
                  className="px-2 py-0.5 rounded-lg bg-[#0c141f] border border-[#1b2737] text-[11px] text-slate-300 shrink-0 font-medium"
                >
                  {branch}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
