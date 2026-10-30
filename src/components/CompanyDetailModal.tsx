'use client';

import React, { useEffect } from 'react';
import { PlacementDrive } from '@/lib/db';
import { X, Calendar, GraduationCap, Clock, Users, Briefcase, Award } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-mono animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-[#0b131b] border border-[#1e3547] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#162531] bg-[#070c12]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md border border-[#1e3345] bg-[#0c151e] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {getInitials(drive.company)}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-semibold">
                COMPANY DOSSIER
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white truncate tracking-wide">
                {drive.company}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md border border-[#162531] hover:border-slate-600 bg-[#0c141c] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Role & Tier Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#162531]">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">ROLE</span>
              <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                {drive.role}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded border font-semibold ${getTierTag(drive.tier)}`}>
                [ {drive.tier} ]
              </span>

              {drive.studentsPlaced && (
                <span className="text-xs px-2.5 py-1 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-950/20 flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{drive.studentsPlaced} Placed</span>
                </span>
              )}
            </div>
          </div>

          {/* Compensation Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#070c12] border border-[#162531]">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                CTC PACKAGE
              </span>
              <span className="text-base sm:text-lg font-bold text-[#00ff66] block mt-1">
                {drive.ctc}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#070c12] border border-[#162531]">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                STIPEND
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-200 block mt-1">
                {drive.stipend || '—'}
              </span>
            </div>
          </div>

          {/* Academic Cutoff Criteria */}
          {drive.cgpaCutoff && (
            <div className="p-3 rounded-lg bg-[#070c12] border border-amber-500/30">
              <span className="text-[11px] text-amber-400 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                ACADEMIC CUTOFF &amp; CRITERIA
              </span>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                {drive.cgpaCutoff}
              </p>
            </div>
          )}

          {/* Placement & Drive Timeline */}
          <div className="p-3 rounded-lg bg-[#070c12] border border-[#162531] space-y-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold mb-2">
              SCHEDULE &amp; TIMELINE
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#0b131b] border border-[#162531]">
                <span className="text-slate-400">Date Listed:</span>
                <span className="text-slate-200 font-semibold">{drive.dateListed || '—'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#0b131b] border border-[#162531]">
                <span className="text-slate-400">Deadline:</span>
                <span className="text-red-400 font-semibold">{drive.deadline || '—'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#0b131b] border border-[#162531]">
                <span className="text-slate-400">Online Assessment:</span>
                <span className="text-sky-400 font-semibold">{drive.oaDate || '—'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#0b131b] border border-[#162531]">
                <span className="text-slate-400">Interview Date:</span>
                <span className="text-purple-400 font-semibold">{drive.interviewDate || '—'}</span>
              </div>
            </div>
          </div>

          {/* Eligible Branches */}
          {drive.eligibleBranches && drive.eligibleBranches.length > 0 && (
            <div className="p-3 rounded-lg bg-[#070c12] border border-[#162531]">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold mb-2">
                ELIGIBLE BRANCHES ({drive.eligibleBranches.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {drive.eligibleBranches.map((branch, idx) => (
                  <span
                    key={`${branch}_${idx}`}
                    className="px-2 py-0.5 rounded bg-[#0b131b] border border-[#162531] text-[11px] text-slate-300"
                  >
                    {branch}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#162531] bg-[#070c12] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-[#162531] hover:border-slate-500 bg-[#0c141c] text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer uppercase"
          >
            [ CLOSE ]
          </button>
        </div>
      </div>
    </div>
  );
};

