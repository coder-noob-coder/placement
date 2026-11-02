'use client';

import React, { useEffect } from 'react';
import { PlacementDrive } from '@/lib/db';
import { X, Calendar, GraduationCap, Clock, Users } from 'lucide-react';

interface CompanyDetailModalProps {
  drive: PlacementDrive | null;
  onClose: () => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ drive, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!drive) return null;

  const getTierTag = (tier: string) => {
    const t = (tier || '').toLowerCase();
    if (t.includes('super dream')) return 'border-amber-500/60 text-amber-400 bg-amber-950/20';
    if (t.includes('dream')) return 'border-indigo-500/60 text-indigo-400 bg-indigo-950/20';
    if (t.includes('tier 1')) return 'border-emerald-500/60 text-emerald-400 bg-emerald-950/20';
    if (t.includes('tier 2') || t === '2') return 'border-sky-500/60 text-sky-400 bg-sky-950/20';
    return 'border-slate-700 text-slate-400 bg-slate-900/40';
  };

  const getInitials = (name: string) => {
    const clean = name.replace(/[^a-zA-Z]/g, ' ').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-mono animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0c1520] border border-[#1b2d3e] rounded-xl shadow-2xl overflow-hidden p-3.5 sm:p-5 space-y-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Avatar + Company + Tier + Close Button */}
        <div className="flex items-start justify-between gap-2.5 pb-2 border-b border-[#172535]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-[#1b2d3e] bg-[#070d14] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(drive.company)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate tracking-wide">
                  {drive.company}
                </h2>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${getTierTag(drive.tier)}`}>
                  {drive.tier}
                </span>
              </div>
              <p className="text-[11px] text-[#70879d] truncate mt-0.5">{drive.role}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md border border-[#172535] hover:border-slate-500 bg-[#070d14] text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact Package & Stipend & Placed Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
          <div className="p-2 rounded-md bg-[#070d14] border border-[#172535]">
            <span className="text-[9px] sm:text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
              PACKAGE (CTC)
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#00ff66] block mt-0.5 truncate">
              {drive.ctc}
            </span>
          </div>

          <div className="p-2 rounded-md bg-[#070d14] border border-[#172535]">
            <span className="text-[9px] sm:text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
              STIPEND
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200 block mt-0.5 truncate">
              {drive.stipend || '—'}
            </span>
          </div>

          <div className="p-2 rounded-md bg-[#070d14] border border-[#172535] col-span-2 sm:col-span-1">
            <span className="text-[9px] sm:text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
              PLACED / STATUS
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 block mt-0.5 truncate">
              {drive.studentsPlaced ? `${drive.studentsPlaced} Placed` : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Academic Criteria (if any) */}
        {drive.cgpaCutoff && (
          <div className="p-1.5 sm:p-2 rounded-md bg-[#070d14] border border-amber-500/30 flex items-center gap-2 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold uppercase tracking-wider shrink-0">
              MIN CGPA:
            </span>
            <span className="text-slate-200 text-[11px] sm:text-xs truncate font-medium">
              {drive.cgpaCutoff}
            </span>
          </div>
        )}

        {/* Schedule & Key Dates (2x2 Compact Grid) */}
        <div className="p-2 sm:p-2.5 rounded-md bg-[#070d14] border border-[#172535] space-y-1 text-xs">
          <span className="text-[9px] sm:text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
            TIMELINE &amp; SCHEDULE
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1520] border border-[#172535]">
              <span className="text-[#546b80]">Deadline:</span>
              <span className="text-red-400 font-semibold truncate ml-1">{drive.deadline || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1520] border border-[#172535]">
              <span className="text-[#546b80]">OA Date:</span>
              <span className="text-sky-400 font-semibold truncate ml-1">{drive.oaDate || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1520] border border-[#172535]">
              <span className="text-[#546b80]">Interview:</span>
              <span className="text-purple-400 font-semibold truncate ml-1">{drive.interviewDate || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1520] border border-[#172535]">
              <span className="text-[#546b80]">Listed:</span>
              <span className="text-slate-300 font-semibold truncate ml-1">{drive.dateListed || '—'}</span>
            </div>
          </div>
        </div>

        {/* Eligible Branches */}
        {drive.eligibleBranches && drive.eligibleBranches.length > 0 && (
          <div className="p-2 rounded-md bg-[#070d14] border border-[#172535] text-xs">
            <span className="text-[9px] sm:text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold mb-1">
              ELIGIBLE BRANCHES ({drive.eligibleBranches.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {drive.eligibleBranches.map((branch, idx) => (
                <span
                  key={`${branch}_${idx}`}
                  className="px-1.5 py-0.5 rounded bg-[#0c1520] border border-[#172535] text-[9px] sm:text-[10px] text-slate-300 shrink-0"
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
