'use client';

import React, { useMemo, useState } from 'react';
import { PlacementDrive } from '@/lib/db';
import { Clock, ChevronRight } from 'lucide-react';

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

    list.sort((a, b) => {
      if (!a.dateObj) return 1;
      if (!b.dateObj) return -1;
      return a.dateObj.getTime() - b.dateObj.getTime();
    });

    return list;
  }, [drives]);

  const todayActivities = useMemo(() => {
    return allActivities.filter((a) => a.isToday);
  }, [allActivities]);

  const tomorrowActivities = useMemo(() => {
    return allActivities.filter((a) => a.isTomorrow);
  }, [allActivities]);

  const now = new Date();
  const todayDateFormatted = now
    .toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    .toUpperCase();

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDateFormatted = tomorrowDate
    .toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    .toUpperCase();

  const currentActivities = activeTab === 'today' ? todayActivities : tomorrowActivities;
  const currentDateFormatted = activeTab === 'today' ? todayDateFormatted : tomorrowDateFormatted;

  const getCompanyInitials = (name: string) => {
    const clean = name.replace(/[^a-zA-Z]/g, ' ').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <section className="bg-[#0a1219] border border-[#142330] rounded-xl p-4 sm:p-5 font-mono shadow-xs transition-colors">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#142330]">
        <div className="flex items-start sm:items-center gap-3">
          {/* Retro terminal list icon */}
          <div className="w-8 h-8 rounded-md bg-[#070c12] border border-[#142330] flex items-center justify-center shrink-0 text-slate-300">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wider uppercase">
                Daily Action Agenda
              </h2>
              {/* Mobile count badge */}
              <span className="sm:hidden text-xs font-bold px-2 py-0.5 rounded border border-[#142330] text-white bg-[#070c12]">
                {todayActivities.length}
              </span>
            </div>
            <p className="text-xs text-[#61788d] mt-0.5 tracking-tight">
              Scheduled assessments &amp; interviews.
            </p>
          </div>
        </div>

        {/* Tab Controls: TODAY and TOMORROW */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10 font-bold'
                : 'border border-[#142330] text-[#61788d] hover:text-slate-200'
            }`}
          >
            TODAY ({todayActivities.length})
          </button>

          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'tomorrow'
                ? 'border border-[#00ff66] text-[#00ff66] bg-[#00ff66]/10 font-bold'
                : 'border border-[#142330] text-[#61788d] hover:text-slate-200'
            }`}
          >
            TOMORROW ({tomorrowActivities.length})
          </button>
        </div>
      </div>

      {/* Subheader: Lineup & Date */}
      <div className="pt-3 pb-1">
        <div className="flex items-center justify-between text-xs text-[#61788d] uppercase tracking-widest pb-2.5 border-b border-[#142330]">
          <span className="font-semibold text-slate-300">
            {activeTab === 'today' ? "TODAY'S LINEUP" : "TOMORROW'S LINEUP"}
          </span>
          <span className="font-mono text-[#61788d]">
            {currentDateFormatted}
          </span>
        </div>

        {/* List of Lineup items */}
        {currentActivities.length > 0 ? (
          <div className="divide-y divide-dashed divide-[#142330]">
            {currentActivities.map((act, index) => {
              const itemNumber = `[${String(index + 1).padStart(2, '0')}]`;
              const initials = getCompanyInitials(act.displayCompany);
              const isInterview = act.type === 'Interview';

              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (onSelectCompany) {
                      onSelectCompany(act.company);
                    }
                  }}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-[#0e1720]/80 px-2 rounded-md transition-colors cursor-pointer"
                  title="Click to view full details"
                >
                  {/* Left: Number (desktop only) + Avatar + Company Info */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span className="hidden sm:inline-block text-xs sm:text-sm text-[#546b80] font-mono shrink-0 w-8">
                      {itemNumber}
                    </span>

                    {/* Badge / Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md border border-[#142330] bg-[#070c12] text-slate-100 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 group-hover:border-[#00ff66]/60 transition-colors">
                      {initials}
                    </div>

                    {/* Text Details & Badges */}
                    <div className="min-w-0 flex-1">
                      {/* Row 1: Company + Type Badge */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-xs sm:text-sm md:text-base text-white truncate tracking-wide group-hover:text-slate-100 transition-colors">
                          {act.displayCompany}
                        </span>

                        <span
                          className={`text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded font-mono font-semibold tracking-wider shrink-0 ${
                            isInterview
                              ? 'border border-sky-500/50 text-sky-400 bg-sky-950/20'
                              : 'border border-emerald-500/50 text-emerald-400 bg-emerald-950/20'
                          }`}
                        >
                          {isInterview ? 'INTERVIEW' : 'OA'}
                        </span>
                      </div>

                      {/* Row 2: Role + Schedule Date */}
                      <div className="flex items-center justify-between gap-2 mt-0.5 text-xs text-[#70879d]">
                        <span className="truncate text-[11px] sm:text-xs">
                          {act.role}
                        </span>

                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#546b80] shrink-0">
                          <Clock className="w-3 h-3 text-[#546b80] shrink-0" />
                          <span className="uppercase tracking-wider">
                            <span className="sm:hidden">{activeTab === 'today' ? 'TODAY' : 'TOMORROW'}</span>
                            <span className="hidden sm:inline">{act.dateStr} &bull; {activeTab === 'today' ? 'TODAY' : 'TOMORROW'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Chevron */}
                  <div className="hidden sm:flex items-center pl-1 shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#546b80] group-hover:text-slate-100 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#546b80] tracking-wider">
            [ NO ACTIVITIES SCHEDULED FOR {activeTab.toUpperCase()} ]
          </div>
        )}
      </div>
    </section>
  );
};
