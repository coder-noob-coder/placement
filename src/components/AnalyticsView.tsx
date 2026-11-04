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

function parsePlacedCount(str?: string): number {
  if (!str) return 0;
  let s = String(str).trim();
  if (/out\s+of/i.test(s)) {
    s = s.split(/out\s+of/i)[0];
  }
  const nums = s.match(/\d+/g);
  if (!nums) return 0;
  return nums.map(Number).reduce((a, b) => a + b, 0);
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ drives, onSelectCtcFilter }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [distributionMode, setDistributionMode] = useState<'students' | 'drives'>('students');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Total placed students
  const totalPlaced = useMemo(() => {
    return drives.reduce((sum, d) => sum + parsePlacedCount(d.studentsPlaced), 0);
  }, [drives]);

  // 1. Range Brackets for Drives (5-10, 10-15, 15-20, 20-25, 25+)
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
        color: '#22c55e',
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
      { label: 'Stipend / TBA', count: notSpec, percent: Math.round((notSpec / total) * 100), color: '#334155' },
    ];

    return { primaryRanges, otherRanges };
  }, [drives]);

  // 2. Range Brackets for Placed Students (5-10, 10-15, 15-20, 20-25, 25+, < 5)
  const studentRangeData = useMemo(() => {
    const studentList = drives.map((d) => ({
      placed: parsePlacedCount(d.studentsPlaced),
      ctc: parseCtcMax(d.ctc),
    }));

    const safeTotal = totalPlaced || 1;

    const s5_10 = studentList.filter((x) => x.ctc >= 5 && x.ctc < 10).reduce((sum, x) => sum + x.placed, 0);
    const s10_15 = studentList.filter((x) => x.ctc >= 10 && x.ctc < 15).reduce((sum, x) => sum + x.placed, 0);
    const s15_20 = studentList.filter((x) => x.ctc >= 15 && x.ctc < 20).reduce((sum, x) => sum + x.placed, 0);
    const s20_25 = studentList.filter((x) => x.ctc >= 20 && x.ctc < 25).reduce((sum, x) => sum + x.placed, 0);
    const s25Plus = studentList.filter((x) => x.ctc >= 25).reduce((sum, x) => sum + x.placed, 0);
    const sUnder5 = studentList.filter((x) => x.ctc > 0 && x.ctc < 5).reduce((sum, x) => sum + x.placed, 0);

    const maxCount = Math.max(s5_10, s10_15, s15_20, s20_25, s25Plus, sUnder5, 1);

    const ranges = [
      {
        label: '5 - 10 LPA',
        min: 5,
        max: 10,
        count: s5_10,
        percent: Math.round((s5_10 / safeTotal) * 100),
        barWidth: Math.round((s5_10 / maxCount) * 100),
        color: '#22c55e',
      },
      {
        label: '10 - 15 LPA',
        min: 10,
        max: 15,
        count: s10_15,
        percent: Math.round((s10_15 / safeTotal) * 100),
        barWidth: Math.round((s10_15 / maxCount) * 100),
        color: '#38bdf8',
      },
      {
        label: '15 - 20 LPA',
        min: 15,
        max: 20,
        count: s15_20,
        percent: Math.round((s15_20 / safeTotal) * 100),
        barWidth: Math.round((s15_20 / maxCount) * 100),
        color: '#818cf8',
      },
      {
        label: '20 - 25 LPA',
        min: 20,
        max: 25,
        count: s20_25,
        percent: Math.round((s20_25 / safeTotal) * 100),
        barWidth: Math.round((s20_25 / maxCount) * 100),
        color: '#fbbf24',
      },
      {
        label: '25+ LPA',
        min: 25,
        max: 999,
        count: s25Plus,
        percent: Math.round((s25Plus / safeTotal) * 100),
        barWidth: Math.round((s25Plus / maxCount) * 100),
        color: '#ef4444',
      },
      {
        label: '< 5 LPA',
        min: 0,
        max: 5,
        count: sUnder5,
        percent: Math.round((sUnder5 / safeTotal) * 100),
        barWidth: Math.round((sUnder5 / maxCount) * 100),
        color: '#64748b',
      },
    ];

    return ranges;
  }, [drives, totalPlaced]);

  // 3. Bracket Slices for Pie Chart
  const bracketData = useMemo(() => {
    const ctcs = drives.map((p) => parseCtcMax(p.ctc));
    const total = drives.length || 1;

    const b5_10 = ctcs.filter((v) => v >= 5 && v < 10).length;
    const b10_15 = ctcs.filter((v) => v >= 10 && v < 15).length;
    const b15_20 = ctcs.filter((v) => v >= 15 && v < 20).length;
    const b20_25 = ctcs.filter((v) => v >= 20 && v < 25).length;
    const b25Plus = ctcs.filter((v) => v >= 25).length;
    const other = ctcs.filter((v) => v < 5).length;

    return [
      { label: '5-10 LPA', count: b5_10, percent: (b5_10 / total) * 100, color: '#22c55e' },
      { label: '10-15 LPA', count: b10_15, percent: (b10_15 / total) * 100, color: '#38bdf8' },
      { label: '15-20 LPA', count: b15_20, percent: (b15_20 / total) * 100, color: '#818cf8' },
      { label: '20-25 LPA', count: b20_25, percent: (b20_25 / total) * 100, color: '#fbbf24' },
      { label: '25+ LPA', count: b25Plus, percent: (b25Plus / total) * 100, color: '#ef4444' },
      { label: '< 5 / TBA', count: other, percent: (other / total) * 100, color: '#475569' },
    ].filter((s) => s.count > 0);
  }, [drives]);

  // 4. Summary Stats
  const stats = useMemo(() => {
    const ctcs = drives.map((d) => parseCtcMax(d.ctc)).filter((v) => v > 0);
    const maxCtc = ctcs.length > 0 ? Math.max(...ctcs) : 0;
    const avgCtc = ctcs.length > 0 ? ctcs.reduce((a, b) => a + b, 0) / ctcs.length : 0;
    return {
      total: drives.length,
      maxCtc: maxCtc > 0 ? `₹${maxCtc} LPA` : 'TBA',
      avgCtc: avgCtc > 0 ? `₹${avgCtc.toFixed(1)} LPA` : 'TBA',
    };
  }, [drives]);

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;

  return (
    <div className="bg-[#0c141f] border border-[#1b2737] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm shadow-black/20 select-none">
      {/* Top Header Row with Chart View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172332]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            <h2 className="font-bold text-white text-base sm:text-lg tracking-tight">
              Package &amp; Placement Analytics
            </h2>
          </div>
          <p className="text-xs text-[#70879d] mt-0.5">
            CTC package distribution across all recruitment drives
          </p>
        </div>

        {/* View Toggle: Bar Chart vs Pie Chart */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              chartType === 'bar'
                ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                : 'bg-[#131d2a] text-[#8fa0b2] border border-[#1e2c3c] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              chartType === 'pie'
                ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                : 'bg-[#131d2a] text-[#8fa0b2] border border-[#1e2c3c] hover:text-white'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Pie Chart</span>
          </button>
        </div>
      </div>

      {/* Top Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#131d2a] border border-[#1e2c3c]">
          <span className="text-[11px] text-[#70879d] font-medium block">
            Total Pipeline
          </span>
          <span className="text-xl sm:text-2xl font-bold text-[#22c55e] block mt-0.5 font-mono">
            {stats.total}
          </span>
          <span className="text-[10px] text-[#70879d] block mt-0.5">Companies Registered</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#131d2a] border border-[#1e2c3c]">
          <span className="text-[11px] text-[#70879d] font-medium block">
            Highest CTC
          </span>
          <span className="text-xl sm:text-2xl font-bold text-amber-400 block mt-0.5 font-mono">
            {stats.maxCtc}
          </span>
          <span className="text-[10px] text-[#70879d] block mt-0.5">Top Annual Package</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#131d2a] border border-[#1e2c3c]">
          <span className="text-[11px] text-[#70879d] font-medium block">
            Average CTC
          </span>
          <span className="text-xl sm:text-2xl font-bold text-sky-400 block mt-0.5 font-mono">
            {stats.avgCtc}
          </span>
          <span className="text-[10px] text-[#70879d] block mt-0.5">Average Package</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#131d2a] border border-[#1e2c3c]">
          <span className="text-[11px] text-[#70879d] font-medium block">
            Total Placed
          </span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400 block mt-0.5 font-mono">
            {totalPlaced > 0 ? `${totalPlaced}+` : '0'}
          </span>
          <span className="text-[10px] text-[#70879d] block mt-0.5">Students with Offers</span>
        </div>
      </div>

      {/* Main Chart Section: BAR CHART vs PIE CHART */}
      {chartType === 'bar' ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#131d2a] border border-[#1e2c3c] space-y-4">
          {/* Card Header with Segmented Pill Toggle: [Students] | [Drives] */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#172332]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {distributionMode === 'students'
                  ? 'Students Placed by CTC Range'
                  : 'Companies by CTC Range'}
              </span>

              {/* Segmented Pill Toggle */}
              <div className="flex items-center p-0.5 rounded-xl bg-[#0c141f] border border-[#1b2737] text-xs">
                <button
                  type="button"
                  onClick={() => setDistributionMode('students')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    distributionMode === 'students'
                      ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                      : 'text-[#8fa0b2] hover:text-white'
                  }`}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionMode('drives')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    distributionMode === 'drives'
                      ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                      : 'text-[#8fa0b2] hover:text-white'
                  }`}
                >
                  Drives
                </button>
              </div>
            </div>

            <span className="text-xs text-[#70879d] font-mono">
              {distributionMode === 'students'
                ? `Total: ${totalPlaced} placed`
                : `Total: ${drives.length} drives`}
            </span>
          </div>

          {/* Progress Bars for Selected Distribution Mode */}
          <div className="space-y-3 pt-1">
            {(distributionMode === 'students' ? studentRangeData : rangeData.primaryRanges).map((item) => (
              <div
                key={item.label}
                onClick={() => onSelectCtcFilter?.(item.min)}
                className="group cursor-pointer p-2 rounded-xl hover:bg-[#0c141f] transition-colors"
                title={`Click to filter drives >= ${item.min} LPA`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white group-hover:text-[#22c55e] transition-colors">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">{item.count}</span>
                    <span className="text-[#70879d] text-[11px]">({item.percent}%)</span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-[#0c141f] rounded-full overflow-hidden p-0.5 border border-[#1b2737]">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${item.barWidth}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom chips: visible only in Drives mode */}
          {distributionMode === 'drives' && (
            <div className="pt-3 border-t border-[#172332] grid grid-cols-2 gap-2 text-xs">
              {rangeData.otherRanges.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0c141f] border border-[#1b2737] flex items-center justify-between font-mono">
                  <span className="text-[#8fa0b2] font-sans">{item.label}</span>
                  <span className="font-bold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#131d2a] border border-[#1e2c3c] flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {bracketData.map((slice, index) => {
                const fraction = slice.percent / 100;
                const strokeDasharray = `${fraction * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativeFraction * circumference;
                cumulativeFraction += fraction;
                const isHovered = hoveredIndex === index;

                return (
                  <circle
                    key={index}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? '24' : '18'}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                {hoveredIndex !== null ? bracketData[hoveredIndex].count : stats.total}
              </span>
              <span className="text-[10px] text-[#70879d]">
                {hoveredIndex !== null ? bracketData[hoveredIndex].label : 'Drives'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
            {bracketData.map((slice, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  hoveredIndex === idx
                    ? 'bg-[#0c141f] border-slate-500 scale-102'
                    : 'bg-[#0c141f] border-[#1b2737]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-xs text-white font-medium truncate">
                    {slice.label}
                  </span>
                </div>
                <div className="text-xs text-[#70879d] font-mono">
                  <strong className="text-white">{slice.count}</strong> ({slice.percent.toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
