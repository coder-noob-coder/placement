'use client';

import React from 'react';
import { PlacementDrive } from '@/lib/db';
import { ChevronRight } from 'lucide-react';

interface CompanyTableProps {
  drives: PlacementDrive[];
  onSelect?: (drive: PlacementDrive) => void;
  isPastDrive?: (drive: PlacementDrive) => boolean;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({ drives, onSelect, isPastDrive }) => {
  const getTierTag = (tier: string) => {
    const t = (tier || '').toLowerCase();
    if (t.includes('super dream')) return 'border-amber-500/40 text-amber-400 bg-amber-950/10';
    if (t.includes('dream')) return 'border-indigo-500/40 text-indigo-400 bg-indigo-950/10';
    if (t.includes('tier 1')) return 'border-emerald-500/40 text-emerald-400 bg-emerald-950/10';
    if (t.includes('tier 2') || t === '2') return 'border-sky-500/40 text-sky-400 bg-sky-950/10';
    return 'border-[#142330] text-[#70879d] bg-[#070c12]';
  };

  return (
    <div className="bg-[#0a1219] rounded-xl border border-[#142330] overflow-hidden font-mono shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#070c12] border-b border-[#142330] uppercase text-[#61788d] text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3.5 font-bold">COMPANY &amp; ROLE</th>
              <th className="py-2.5 px-3 font-bold">TIER</th>
              <th className="py-2.5 px-3 font-bold">CTC</th>
              <th className="py-2.5 px-3 font-bold">STIPEND</th>
              <th className="py-2.5 px-3 font-bold">CUTOFF</th>
              <th className="py-2.5 px-3 font-bold">SCHEDULE</th>
              <th className="py-2.5 px-3 font-bold">PLACED</th>
              <th className="py-2.5 px-3 font-bold">DEADLINE</th>
              <th className="py-2.5 px-3.5 font-bold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#142330]">
            {drives.map((drive) => {
              const isPast = isPastDrive?.(drive);
              return (
                <tr
                  key={drive.id}
                  onClick={() => onSelect?.(drive)}
                  className="hover:bg-[#0e1720]/80 transition-colors cursor-pointer group"
                >
                  {/* Company & Role */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs truncate max-w-xs group-hover:text-[#00ff66] transition-colors">
                        {drive.company}
                      </span>
                      {isPast && (
                        <span className="text-[9px] uppercase px-1 py-0.2 rounded border border-[#142330] text-[#546b80] bg-[#070c12]">
                          PAST
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#70879d] truncate max-w-xs mt-0.5">
                      {drive.role}
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${getTierTag(
                        drive.tier
                      )}`}
                    >
                      {drive.tier}
                    </span>
                  </td>

                  {/* CTC */}
                  <td className="py-2.5 px-3 font-bold text-[#00ff66] whitespace-nowrap">
                    {drive.ctc}
                  </td>

                  {/* Stipend */}
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap text-[11px]">
                    {drive.stipend || '—'}
                  </td>

                  {/* Cutoff */}
                  <td className="py-2.5 px-3 text-[#70879d] whitespace-nowrap text-[11px]">
                    {drive.cgpaCutoff ? `${drive.cgpaCutoff}` : '—'}
                  </td>

                  {/* Schedule */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {drive.oaDate && (
                      <div className="mb-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] border border-sky-500/30 text-sky-400 bg-sky-950/10">
                          OA: {drive.oaDate}
                        </span>
                      </div>
                    )}
                    {drive.interviewDate && (
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] border border-purple-500/30 text-purple-400 bg-purple-950/10">
                          INT: {drive.interviewDate}
                        </span>
                      </div>
                    )}
                    {!drive.oaDate && !drive.interviewDate && (
                      <span className="text-[#546b80]">—</span>
                    )}
                  </td>

                  {/* Placed */}
                  <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                    {drive.studentsPlaced ? (
                      <span className="text-emerald-400 font-bold text-xs px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-950/10">
                        {drive.studentsPlaced}
                      </span>
                    ) : (
                      <span className="text-[#546b80]">—</span>
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap text-[11px]">
                    {drive.deadline || '—'}
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#546b80] group-hover:text-[#00ff66] transition-colors">
                      <span>VIEW</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
