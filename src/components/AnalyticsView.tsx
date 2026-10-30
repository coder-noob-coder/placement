'use client';

import React, { useState, useMemo } from 'react';
import { PlacementDrive } from '@/lib/db';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  drives: PlacementDrive[];
  onSelectCtcFilter?: (minLpa: number) => void;
}

function parseCtcMax(str?: string): number {
  if (!str) return 0;
  const clean = str.replace(/,/g, '');
  const matches = clean.match(/(\d+(?:\.\d+)?)/g);
  if (!matches || matches.length === 0) return 0;
  return Math.max(...matches.map(Number));
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ drives, onSelectCtcFilter }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Range Brackets (5-10, 10-15, 15-20, 20-25, 25+)
  const rangeData = useMemo(() => {
    const ctcs = drives.map((p) => ({ company: p.company, val: parseCtcMax(p.ctc) }));
    const total = drives.length || 1;

    const b5_10 = ctcs.filter((x) => x.val >= 5 && x.val < 10).length;
    const b10_15 = ctcs.filter((x) => x.val >= 10 && x.val < 15).length;
    const b15_20 = ctcs.filter((x) => x.val >= 15 && x.val < 20).length;
    const b20_25 = ctcs.filter((x) => x.val >= 20 && x.val < 25).length;
    const b25Plus = ctcs.filter((x) => x.val >= 25).length;
    const under5 = ctcs.filter((x) => x.val > 0 && x.val < 5).length;
    const notSpec = ctcs.filter((x) => x.val === 0).length;

    const maxCount = Math.max(b5_10, b10_15, b15_20, b20_25, b25Plus, 1);

    const primaryRanges = [
      {
        label: '5 - 10 LPA',
        min: 5,
        max: 10,
        count: b5_10,
        percent: Math.round((b5_10 / total) * 100),
        barWidth: Math.round((b5_10 / maxCount) * 100),
        color: '#00ff66',
      },
      {
        label: '10 - 15 LPA',
        min: 10,
        max: 15,
        count: b10_15,
        percent: Math.round((b10_15 / total) * 100),
        barWidth: Math.round((b10_15 / maxCount) * 100),
        color: '#38bdf8',
      },
      {
        label: '15 - 20 LPA',
        min: 15,
        max: 20,
        count: b15_20,
        percent: Math.round((b15_20 / total) * 100),
        barWidth: Math.round((b15_20 / maxCount) * 100),
        color: '#818cf8',
      },
      {
        label: '20 - 25 LPA',
        min: 20,
        max: 25,
        count: b20_25,
        percent: Math.round((b20_25 / total) * 100),
        barWidth: Math.round((b20_25 / maxCount) * 100),
        color: '#fbbf24',
      },
      {
        label: '25+ LPA',
        min: 25,
        max: 999,
        count: b25Plus,
        percent: Math.round((b25Plus / total) * 100),
        barWidth: Math.round((b25Plus / maxCount) * 100),
        color: '#ef4444',
      },
    ];

    const otherRanges = [
      { label: '< 5 LPA', count: under5, percent: Math.round((under5 / total) * 100), color: '#64748b' },
      { label: 'STIPEND / TBA', count: notSpec, percent: Math.round((notSpec / total) * 100), color: '#334155' },
    ];

    return { primaryRanges, otherRanges, total10Plus: b10_15 + b15_20 + b20_25 + b25Plus };
  }, [drives]);

  // 2. Bracket Slices for Pie Chart
  const bracketData = useMemo(() => {
    const ctcs = drives.map((p) => parseCtcMax(p.ctc));
    const total = drives.length || 1;

    const b5_10 = ctcs.filter((v) => v >= 5 && v < 10).length;
    const b10_15 = ctcs.filter((v) => v >= 10 && v < 15).length;
    const b15_20 = ctcs.filter((v) => v >= 15 && v < 20).length;
    const b20_25 = ctcs.filter((v) => v >= 20 && v < 25).length;
    const b25Plus = ctcs.filter((v) => v >= 25).length;
    const under5 = ctcs.filter((v) => v > 0 && v < 5).length;
    const notSpec = ctcs.filter((v) => v === 0).length;

    return [
      { label: '5 - 10 LPA', count: b5_10, color: '#00ff66' },
      { label: '10 - 15 LPA', count: b10_15, color: '#38bdf8' },
      { label: '15 - 20 LPA', count: b15_20, color: '#818cf8' },
      { label: '20 - 25 LPA', count: b20_25, color: '#fbbf24' },
      { label: '25+ LPA', count: b25Plus, color: '#ef4444' },
      { label: '< 5 LPA', count: under5, color: '#64748b' },
      { label: 'Stipend / TBA', count: notSpec, color: '#334155' },
    ].map((item) => ({
      ...item,
      fraction: item.count / total,
      percent: Math.round((item.count / total) * 100),
    }));
  }, [drives]);

  // Top KPIs
  const stats = useMemo(() => {
    const numericCtcs = drives.map((p) => parseCtcMax(p.ctc)).filter((v) => v > 0);
    const maxCtc = numericCtcs.length > 0 ? Math.max(...numericCtcs) : 0;
    const avgCtc =
      numericCtcs.length > 0
        ? (numericCtcs.reduce((a, b) => a + b, 0) / numericCtcs.length).toFixed(1)
        : '0';

    return {
      total: drives.length,
      maxCtc: `${maxCtc} LPA`,
      avgCtc: `${avgCtc} LPA`,
    };
  }, [drives]);

  // SVG Donut Chart Calculation
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;

  return (
    <div className="bg-[#0a1219] border border-[#142330] rounded-xl p-4 sm:p-5 space-y-4 font-mono transition-colors">
      {/* Top Header Row with Chart View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#142330]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00ff66]" />
            <h2 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider">
              Package &amp; Placement Analytics
            </h2>
          </div>
          <p className="text-xs text-[#546b80] mt-0.5">
            CTC package distribution across all recruitment drives
          </p>
        </div>

        {/* View Toggle: Bar Chart vs Pie Chart */}
        <div className="flex items-center rounded-md bg-[#070c12] border border-[#142330] p-0.5 text-xs self-start sm:self-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
              chartType === 'bar'
                ? 'bg-[#142330] text-[#00ff66] font-bold shadow-xs'
                : 'text-[#546b80] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>BAR CHART</span>
          </button>

          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
              chartType === 'pie'
                ? 'bg-[#142330] text-[#00ff66] font-bold shadow-xs'
                : 'text-[#546b80] hover:text-white'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>PIE CHART</span>
          </button>
        </div>
      </div>

      {/* Top Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-[#070c12] border border-[#142330]">
          <span className="text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
            TOTAL PIPELINE
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#00ff66] block mt-0.5">
            {stats.total}
          </span>
          <span className="text-[10px] text-[#546b80] block mt-0.5">Companies Registered</span>
        </div>

        <div className="p-3 rounded-lg bg-[#070c12] border border-[#142330]">
          <span className="text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
            HIGHEST CTC
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-400 block mt-0.5">
            {stats.maxCtc}
          </span>
          <span className="text-[10px] text-[#546b80] block mt-0.5">Top Annual Package</span>
        </div>

        <div className="p-3 rounded-lg bg-[#070c12] border border-[#142330]">
          <span className="text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
            AVERAGE CTC
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-sky-400 block mt-0.5">
            {stats.avgCtc}
          </span>
          <span className="text-[10px] text-[#546b80] block mt-0.5">Average Package</span>
        </div>

        <div className="p-3 rounded-lg bg-[#070c12] border border-[#142330]">
          <span className="text-[10px] text-[#546b80] uppercase tracking-wider block font-semibold">
            &gt;= 10 LPA DRIVES
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-indigo-400 block mt-0.5">
            {rangeData.total10Plus}
          </span>
          <span className="text-[10px] text-[#546b80] block mt-0.5">Tier 1 &amp; Super Dream</span>
        </div>
      </div>

      {/* Main Chart Section: BAR CHART vs PIE CHART */}
      {chartType === 'bar' ? (
        /* 1. CTC RANGE BAR CHART (5-10, 10-15, 15-20, 20-25, 25+) */
        <div className="p-4 rounded-xl bg-[#070c12] border border-[#142330] space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#142330]/60">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              COMPANIES BY CTC RANGE (5-10, 10-15, 15-20, 20-25, 25+)
            </span>
            <span className="text-[11px] text-[#546b80]">
              TOTAL: {drives.length} DRIVES
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {rangeData.primaryRanges.map((item) => (
              <div
                key={item.label}
                onClick={() => onSelectCtcFilter?.(item.min)}
                className="group cursor-pointer hover:bg-[#0b141d] p-1.5 rounded transition-colors"
                title={`Click to view companies with ${item.label}`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white font-bold group-hover:text-[#00ff66] transition-colors">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white font-extrabold">{item.count}</span>
                    <span className="text-[#748ba0]">({item.percent}%)</span>
                    <span className="text-[10px] text-[#546b80] group-hover:text-white">&gt;</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-3 rounded bg-[#0a1219] border border-[#142330] overflow-hidden relative">
                  <div
                    className="h-full rounded-xs transition-all duration-500 ease-out"
                    style={{
                      width: `${item.barWidth}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}33`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Range Summary Strip (< 5 LPA & STIPEND / TBA) */}
          <div className="pt-2.5 flex items-center justify-between text-xs text-[#546b80] border-t border-[#142330]/60 flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              {rangeData.otherRanges.map((other) => (
                <div key={other.label} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: other.color }} />
                  <span className="text-slate-400">{other.label}:</span>
                  <span className="text-white font-semibold">{other.count}</span>
                  <span className="text-[#546b80]">({other.percent}%)</span>
                </div>
              ))}
            </div>
            <span className="text-[10px] text-[#546b80]">Click any bar to filter</span>
          </div>
        </div>
      ) : (
        /* 2. PIE / DONUT CHART */
        <div className="p-4 rounded-xl bg-[#070c12] border border-[#142330] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#142330]/60">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              CTC RANGE DISTRIBUTION (5-10, 10-15, 15-20, 20-25, 25+)
            </span>
            <span className="text-[11px] text-[#546b80]">
              TOTAL: {drives.length} COMPANIES
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
            {/* SVG Donut Circle */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#142330"
                  strokeWidth="24"
                />

                {/* Segment Rings */}
                {bracketData.map((slice, index) => {
                  const strokeDasharray = `${circumference * slice.fraction} ${circumference}`;
                  const strokeDashoffset = -circumference * cumulativeFraction;
                  cumulativeFraction += slice.fraction;

                  return (
                    <circle
                      key={slice.label}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={hoveredIndex === index ? 28 : 24}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {hoveredIndex !== null ? (
                  <>
                    <span className="text-[10px] text-[#546b80] uppercase truncate px-2">
                      {bracketData[hoveredIndex].label}
                    </span>
                    <span className="text-lg font-extrabold text-white">
                      {bracketData[hoveredIndex].count}
                    </span>
                    <span className="text-[10px] text-[#00ff66]">
                      {bracketData[hoveredIndex].percent}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-[#546b80] uppercase">TOTAL</span>
                    <span className="text-xl font-extrabold text-white">{drives.length}</span>
                    <span className="text-[10px] text-[#546b80]">DRIVES</span>
                  </>
                )}
              </div>
            </div>

            {/* Legend & Breakdown Table */}
            <div className="flex-1 w-full max-w-sm space-y-1.5 text-xs">
              {bracketData.map((slice, index) => (
                <div
                  key={slice.label}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-1.5 rounded transition-colors cursor-pointer ${
                    hoveredIndex === index ? 'bg-[#142330]' : 'hover:bg-[#0c151e]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-slate-300 font-medium">{slice.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{slice.count}</span>
                    <span className="text-[#546b80] w-10 text-right">({slice.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
