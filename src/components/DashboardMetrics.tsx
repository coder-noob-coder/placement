'use client';

import React from 'react';
import { Calendar, Clock, FileSpreadsheet } from 'lucide-react';

interface DashboardMetricsProps {
  total: number;
  todayEvents: number;
  tomorrowEvents: number;
  closingToday: number;
  onSelectMetric?: (metric: 'all' | 'todayEvents' | 'tomorrow' | 'closing') => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  total,
  todayEvents,
  tomorrowEvents,
  closingToday,
  onSelectMetric,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 font-mono select-none">
      {/* Card 1: Total Pipeline */}
      <div
        onClick={() => onSelectMetric?.('all')}
        className="bg-[#0a1219] border border-[#142330] hover:border-[#1d354a] hover:bg-[#0c151e] rounded-lg px-3 py-2 h-10 sm:h-11 flex items-center justify-between transition-all cursor-pointer group shadow-xs"
        title="View Total Pipeline"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#00ff66] shrink-0" />
          <span className="text-[11px] font-semibold text-[#748ba0] tracking-wider uppercase truncate">
            TOTAL PIPELINE
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base sm:text-lg font-extrabold text-[#00ff66]">
            {total}
          </span>
          <span className="text-[10px] text-[#546b80] group-hover:text-[#00ff66] transition-colors tracking-widest">
            &gt;&gt;&gt;
          </span>
        </div>
      </div>

      {/* Card 2: Today's Events */}
      <div
        onClick={() => onSelectMetric?.('todayEvents')}
        className="bg-[#0a1219] border border-[#142330] hover:border-[#1d354a] hover:bg-[#0c151e] rounded-lg px-3 py-2 h-10 sm:h-11 flex items-center justify-between transition-all cursor-pointer group shadow-xs"
        title="View Today's Scheduled Events"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-[11px] font-semibold text-[#748ba0] tracking-wider uppercase truncate">
            TODAY&apos;S EVENTS
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base sm:text-lg font-extrabold text-white">
            {todayEvents}
          </span>
          <span className="text-[10px] text-[#546b80] group-hover:text-white transition-colors tracking-widest">
            &gt;&gt;&gt;
          </span>
        </div>
      </div>

      {/* Card 3: Tomorrow */}
      <div
        onClick={() => onSelectMetric?.('tomorrow')}
        className="bg-[#0a1219] border border-[#142330] hover:border-[#1d354a] hover:bg-[#0c151e] rounded-lg px-3 py-2 h-10 sm:h-11 flex items-center justify-between transition-all cursor-pointer group shadow-xs"
        title="View Tomorrow's Events"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
          <span className="text-[11px] font-semibold text-[#748ba0] tracking-wider uppercase truncate">
            TOMORROW
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base sm:text-lg font-extrabold text-[#fbbf24]">
            {tomorrowEvents}
          </span>
          <span className="text-[10px] text-[#546b80] group-hover:text-[#fbbf24] transition-colors tracking-widest">
            &gt;&gt;&gt;
          </span>
        </div>
      </div>

      {/* Card 4: Closing Today */}
      <div
        onClick={() => onSelectMetric?.('closing')}
        className="bg-[#0a1219] border border-[#142330] hover:border-[#1d354a] hover:bg-[#0c151e] rounded-lg px-3 py-2 h-10 sm:h-11 flex items-center justify-between transition-all cursor-pointer group shadow-xs"
        title="View Registrations Closing Today"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
          <span className="text-[11px] font-semibold text-[#748ba0] tracking-wider uppercase truncate">
            CLOSING TODAY
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base sm:text-lg font-extrabold text-[#ef4444]">
            {closingToday}
          </span>
          <span className="text-[9px] text-[#ef4444] border border-[#ef4444]/40 bg-[#ef4444]/5 px-1 py-0.2 rounded uppercase">
            ACTION
          </span>
          <span className="text-[10px] text-[#546b80] group-hover:text-[#ef4444] transition-colors tracking-widest">
            &gt;&gt;&gt;
          </span>
        </div>
      </div>
    </div>
  );
};
