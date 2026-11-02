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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 select-none">
      {/* Card 1: Total Pipeline */}
      <div
        onClick={() => onSelectMetric?.('all')}
        className="bg-[#0c141f] border border-[#1b2737] hover:border-[#2a3c50] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-sm shadow-black/20"
        title="View Total Pipeline"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-[#22c55e]" />
          </div>
          <span className="text-xs font-medium text-[#70879d] tracking-normal truncate">
            <span className="sm:hidden">Total</span>
            <span className="hidden sm:inline">Total Pipeline</span>
          </span>
        </div>

        <span className="text-base sm:text-xl font-bold text-[#22c55e] shrink-0">
          {total}
        </span>
      </div>

      {/* Card 2: Today's Events */}
      <div
        onClick={() => onSelectMetric?.('todayEvents')}
        className="bg-[#0c141f] border border-[#1b2737] hover:border-[#2a3c50] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-sm shadow-black/20"
        title="View Today's Scheduled Events"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#131d2a] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-slate-300" />
          </div>
          <span className="text-xs font-medium text-[#70879d] tracking-normal truncate">
            <span className="sm:hidden">Today</span>
            <span className="hidden sm:inline">Today&apos;s Events</span>
          </span>
        </div>

        <span className="text-base sm:text-xl font-bold text-white shrink-0">
          {todayEvents}
        </span>
      </div>

      {/* Card 3: Tomorrow */}
      <div
        onClick={() => onSelectMetric?.('tomorrow')}
        className="bg-[#0c141f] border border-[#1b2737] hover:border-[#2a3c50] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-sm shadow-black/20"
        title="View Tomorrow's Events"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#131d2a] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[#fbbf24]" />
          </div>
          <span className="text-xs font-medium text-[#70879d] tracking-normal truncate">
            Tomorrow
          </span>
        </div>

        <span className="text-base sm:text-xl font-bold text-[#fbbf24] shrink-0">
          {tomorrowEvents}
        </span>
      </div>

      {/* Card 4: Closing Today */}
      <div
        onClick={() => onSelectMetric?.('closing')}
        className="bg-[#0c141f] border border-[#1b2737] hover:border-[#2a3c50] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-sm shadow-black/20"
        title="View Registrations Closing Today"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#ef4444]/15 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-[#ef4444]" />
          </div>
          <span className="text-xs font-medium text-[#70879d] tracking-normal truncate">
            <span className="sm:hidden">Closing</span>
            <span className="hidden sm:inline">Closing Today</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base sm:text-xl font-bold text-[#ef4444]">
            {closingToday}
          </span>
          
        </div>
      </div>
    </div>
  );
};
