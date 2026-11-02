'use client';

import React, { useMemo, useState } from 'react';
import { PlacementDrive } from '@/lib/db';
import { ChevronRight } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface ActivityItem {
  id: string;
  company: string;
  displayCompany: string;
  role: string;
  type: 'Online Assessment' | 'Interview';
  dateStr: string;
  dateObj: Date | null;
  isToday: boolean;
  isTomorrow: boolean;
}

function parseActivityDate(str?: string): Date | null {
  if (!str) return null;
  const clean = str.trim();
  if (
    !clean ||
    clean.toLowerCase().includes('check') ||
    clean.toLowerCase().includes('not') ||
    clean.toLowerCase().includes('tba') ||
    clean.toLowerCase().includes('tbd')
  ) {
    return null;
  }
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  const m2 = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m2) {
    return new Date(parseInt(m2[3]), parseInt(m2[2]) - 1, parseInt(m2[1]));
  }
  return null;
}

function isSameDay(d1: Date | null, d2: Date): boolean {
  if (!d1) return false;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function isDateToday(date: Date | null): boolean {
  return isSameDay(date, new Date());
}

function isDateTomorrow(date: Date | null): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

export const UpcomingActivities: React.FC<{
  drives: PlacementDrive[];
  onSelectCompany?: (companyName: string) => void;
}> = ({ drives, onSelectCompany }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');

  const allActivities = useMemo(() => {
    const list: ActivityItem[] = [];

    drives.forEach((d) => {
      // 1. Online Assessment Date
      if (d.oaDate) {
        const dObj = parseActivityDate(d.oaDate);
        list.push({
          id: `${d.id}_oa`,
          company: d.company,
          displayCompany: d.company.replace(/\(Internship\)/i, '(Intern)'),
          role: d.role,
          type: 'Online Assessment',
          dateStr: d.oaDate,
          dateObj: dObj,
          isToday: isDateToday(dObj),
          isTomorrow: isDateTomorrow(dObj),
        });
      }

      // 2. Interview Date
      if (d.interviewDate) {
        const dObj = parseActivityDate(d.interviewDate);
        list.push({
          id: `${d.id}_interview`,
          company: d.company,
          displayCompany: d.company.replace(/\(Internship\)/i, '(Intern)'),
          role: d.role,
          type: 'Interview',
          dateStr: d.interviewDate,
          dateObj: dObj,
          isToday: isDateToday(dObj),
          isTomorrow: isDateTomorrow(dObj),
        });
      }
    });

    return list;
  }, [drives]);

  const todayActivities = useMemo(() => {
    return allActivities.filter((a) => a.isToday);
  }, [allActivities]);

  const tomorrowActivities = useMemo(() => {
    return allActivities.filter((a) => a.isTomorrow);
  }, [allActivities]);

  const currentActivities = activeTab === 'today' ? todayActivities : tomorrowActivities;

  const currentDateFormatted = useMemo(() => {
    const d = new Date();
    if (activeTab === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }, [activeTab]);

  return (
    <section className="bg-[#0c141f] border border-[#1b2737] rounded-2xl p-4 sm:p-5 shadow-sm shadow-black/20 space-y-3.5 transition-colors select-none">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172332]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Daily Action Agenda
          </h2>
          <p className="text-xs text-[#70879d] mt-0.5 font-normal">
            Scheduled assessments &amp; interviews
          </p>
        </div>

        {/* Tab Controls: TODAY and TOMORROW */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                : 'bg-[#131d2a] text-[#8fa0b2] border border-[#1e2c3c] hover:text-white'
            }`}
          >
            Today ({todayActivities.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'tomorrow'
                ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                : 'bg-[#131d2a] text-[#8fa0b2] border border-[#1e2c3c] hover:text-white'
            }`}
          >
            Tomorrow ({tomorrowActivities.length})
          </button>
        </div>
      </div>

      {/* Subheader: Lineup & Date */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#70879d] font-medium pb-2 border-b border-[#172332]">
          <span className="font-semibold text-slate-300">
            {activeTab === 'today' ? "Today's Lineup" : "Tomorrow's Lineup"}
          </span>
          <span>{currentDateFormatted}</span>
        </div>

        {/* List of Lineup items */}
        {currentActivities.length > 0 ? (
          <div className="divide-y divide-[#172332]">
            {currentActivities.map((act) => {
              const isInterview = act.type === 'Interview';

              return (
                <div
                  key={act.id}
                  onClick={() => onSelectCompany?.(act.company)}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-[#131d2a]/60 px-2 rounded-xl transition-colors cursor-pointer"
                  title="Click to view full details"
                >
                  {/* Left: Logo + Company Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CompanyLogo company={act.company} size="sm" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm sm:text-base text-white truncate group-hover:text-[#22c55e] transition-colors">
                          {act.displayCompany}
                        </span>

                        <span
                          className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${
                            isInterview
                              ? 'border border-purple-500/50 text-purple-400 bg-purple-950/20'
                              : 'border border-emerald-500/50 text-emerald-400 bg-emerald-950/20'
                          }`}
                        >
                          {isInterview ? 'Interview' : 'OA'}
                        </span>
                      </div>

                      <div className="mt-0.5 text-xs text-[#8fa0b2] truncate">
                        {act.role || 'Job Profile'}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#70879d] group-hover:text-white transition-all shrink-0 ml-1" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#70879d]">
            No activities scheduled for {activeTab}
          </div>
        )}
      </div>
    </section>
  );
};
