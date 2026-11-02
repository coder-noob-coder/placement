'use client';

import React from 'react';
import { PlacementDrive } from '@/lib/db';
import { Calendar, GraduationCap, Clock, Users } from 'lucide-react';

interface CompanyCardProps {
  drive: PlacementDrive;
  onSelect?: (drive: PlacementDrive) => void;
  isPast?: boolean;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ drive, onSelect, isPast = false }) => {
  const getTierTag = (tier: string) => {
    const t = (tier || '').toLowerCase();
    if (t.includes('super dream')) {
      return 'border-amber-500/50 text-amber-400 bg-amber-950/10';
    }
    if (t.includes('dream')) {
      return 'border-indigo-500/50 text-indigo-400 bg-indigo-950/10';
    }
    if (t.includes('tier 1')) {
      return 'border-emerald-500/50 text-emerald-400 bg-emerald-950/10';
    }
    if (t.includes('tier 2') || t === '2') {
      return 'border-sky-500/50 text-sky-400 bg-sky-950/10';
    }
    return 'border-[#142330] text-[#70879d] bg-[#070c12]';
  };

  const getCompanyInitials = (name: string) => {
    const clean = name.replace(/[^a-zA-Z]/g, ' ').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      id={`drive-${drive.id}`}
      onClick={() => onSelect?.(drive)}
      className="bg-[#0c1520] border border-[#1b2d3e] hover:border-[#28425b] hover:bg-[#0f1a28] rounded-xl p-4 flex flex-col justify-between transition-all group font-mono shadow-md shadow-black/30 cursor-pointer select-none"
    >
      <div>
        {/* Top Header Row: Tier + Past tag + Placed count */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getTierTag(
                drive.tier
              )}`}
            >
              {drive.tier}
            </span>

            {isPast && (
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-[#142330] text-[#546b80] bg-[#070c12]">
                PAST
              </span>
            )}
          </div>

          {/* Minimal Students Placed Pill */}
          {drive.studentsPlaced ? (
            <span className="text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-950/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{drive.studentsPlaced} Placed</span>
            </span>
          ) : drive.dateListed ? (
            <span className="text-[10px] text-[#546b80]">
              {drive.dateListed.toUpperCase()}
            </span>
          ) : null}
        </div>

        {/* Company Identity & Role */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-md border border-[#142330] bg-[#070c12] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-[#00ff66]/50 transition-colors">
            {getCompanyInitials(drive.company)}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-sm sm:text-base leading-snug truncate group-hover:text-[#00ff66] transition-colors">
              {drive.company}
            </h3>
            <p className="text-xs text-[#70879d] mt-0.5 line-clamp-1">{drive.role}</p>
          </div>
        </div>

        {/* Clean Minimal Compensation Row */}
        <div className="py-2 px-2.5 rounded bg-[#070c12] border border-[#142330] mb-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase text-[#546b80] block">PACKAGE</span>
            <span className="font-bold text-[#00ff66] block mt-0.5">{drive.ctc}</span>
          </div>
          {drive.stipend && (
            <div className="text-right">
              <span className="text-[10px] uppercase text-[#546b80] block">STIPEND</span>
              <span className="font-medium text-slate-300 block mt-0.5">{drive.stipend}</span>
            </div>
          )}
        </div>

        {/* Schedule & Requirements Badges (Minimal Line) */}
        {(drive.cgpaCutoff || drive.oaDate || drive.interviewDate) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px]">
            {drive.cgpaCutoff && (
              <span className="px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 bg-amber-950/10 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>Min {drive.cgpaCutoff}</span>
              </span>
            )}

            {drive.oaDate && (
              <span className="px-2 py-0.5 rounded border border-sky-500/30 text-sky-400 bg-sky-950/10 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>OA: {drive.oaDate}</span>
              </span>
            )}

            {drive.interviewDate && (
              <span className="px-2 py-0.5 rounded border border-purple-500/30 text-purple-400 bg-purple-950/10 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>INT: {drive.interviewDate}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Registration Deadline (Clean & Minimal) */}
      <div className="pt-2.5 border-t border-[#142330] flex items-center justify-between gap-2 mt-auto text-xs">
        <div className="flex items-center gap-1.5 text-[#546b80]">
          <Clock className="w-3.5 h-3.5 text-[#546b80] shrink-0" />
          <span className="truncate text-[11px]">
            {drive.deadline ? `ENDS ${drive.deadline.toUpperCase()}` : 'NO DEADLINE'}
          </span>
        </div>

        <span className="text-[11px] text-[#546b80] group-hover:text-[#00ff66] transition-colors flex items-center gap-0.5">
          <span>DETAILS</span>
          <span>&gt;</span>
        </span>
      </div>
    </div>
  );
};
