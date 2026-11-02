'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlacementDrive } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { GreetingCard } from '@/components/GreetingCard';
import { DashboardMetrics } from '@/components/DashboardMetrics';
import { UpcomingActivities } from '@/components/UpcomingActivities';
import { AnalyticsView } from '@/components/AnalyticsView';
import { NotesSection } from '@/components/NotesSection';
import {
  FilterBar,
  DateSortOption,
  CtcFilterOption,
  StatusFilterOption,
} from '@/components/FilterBar';
import { CompanyCard } from '@/components/CompanyCard';
import { CompanyTable } from '@/components/CompanyTable';
import { CompanyDetailModal } from '@/components/CompanyDetailModal';
import { MobileBottomNav, NavTab } from '@/components/MobileBottomNav';
import { Inbox, Sparkles, Calendar, History, Info } from 'lucide-react';

function isTodayDate(str?: string): boolean {
  if (!str) return false;
  const clean = str.trim();
  let d: Date | null = null;
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    d = parsed;
  } else {
    const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  if (!d) return false;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function isTomorrowDate(str?: string): boolean {
  if (!str) return false;
  const clean = str.trim();
  let d: Date | null = null;
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    d = parsed;
  } else {
    const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  if (!d) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
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
  if (!isNaN(parsed.getTime())) return parsed;
  const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  const m2 = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m2) return new Date(parseInt(m2[3]), parseInt(m2[2]) - 1, parseInt(m2[1]));
  return null;
}

function isInterviewOver(drive: PlacementDrive): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (drive.interviewDate) {
    const intDate = parseActivityDate(drive.interviewDate);
    if (intDate && intDate < today) return true;
  }
  if (drive.studentsPlaced && Number(drive.studentsPlaced) > 0) return true;
  return false;
}

function parseCtcMax(str?: string): number {
  if (!str) return 0;
  const clean = str.replace(/,/g, '');
  const matches = clean.match(/(\d+(?:\.\d+)?)/g);
  if (!matches || matches.length === 0) return 0;
  return Math.max(...matches.map(Number));
}

function parseSortDate(str?: string): number {
  if (!str) return 0;
  const clean = str.trim();
  if (
    !clean ||
    clean.toLowerCase().includes('closed') ||
    clean.toLowerCase().includes('check') ||
    clean.toLowerCase().includes('not') ||
    clean.toLowerCase().includes('tba') ||
    clean.toLowerCase().includes('tbd')
  ) {
    return 0;
  }
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    return parsed.getTime();
  }
  const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])).getTime();
  }
  const m2 = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m2) {
    return new Date(parseInt(m2[3]), parseInt(m2[2]) - 1, parseInt(m2[1])).getTime();
  }
  return 0;
}

export default function PlacementTrackerPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Filters & State: Default to 'deadline-asc' (Soonest/urgent deadline first: 30 Oct before 31 Oct)
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [ctcFilter, setCtcFilter] = useState<CtcFilterOption>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [sortByDate, setSortByDate] = useState<DateSortOption>('deadline-asc');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected company modal for detailed inspection
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  const fetchPlacements = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);

      const res = await fetch(`/api/placements?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setDrives(data.placements);
      }
    } catch (err) {
      console.error('Failed to load placements:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  // Polling updates every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPlacements(true);
    }, 15000);

    const handleFocus = () => fetchPlacements(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPlacements]);

  // Tiers and counts: Strictly Tier 1 and Tier 2 only
  const availableTiers = useMemo(() => {
    return ['All', 'Tier 1', 'Tier 2'];
  }, []);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: drives.length,
      'Tier 1': drives.filter((d) => d.tier === 'Tier 1').length,
      'Tier 2': drives.filter((d) => d.tier === 'Tier 2').length,
    };
    return counts;
  }, [drives]);

  // Telemetry metrics
  const metrics = useMemo(() => {
    let todayEvents = 0;
    let tomorrowEvents = 0;
    let todayDeadlines = 0;

    drives.forEach((d) => {
      if (isTodayDate(d.oaDate) || isTodayDate(d.interviewDate)) todayEvents++;
      if (isTomorrowDate(d.oaDate) || isTomorrowDate(d.interviewDate)) tomorrowEvents++;
      if (isTodayDate(d.deadline)) todayDeadlines++;
    });

    return {
      total: drives.length,
      todayEvents,
      tomorrowEvents,
      todayDeadlines,
    };
  }, [drives]);

  // Filtered and sorted drives
  const filteredDrives = useMemo(() => {
    const list = drives.filter((drive) => {
      const isPast = isInterviewOver(drive);

      // Sidebar Tab Filters
      if (activeTab === 'past') {
        if (!isPast) return false;
      } else if (activeTab === 'applications') {
        if (!drive.deadline || drive.deadline.toLowerCase().includes('closed')) return false;
      } else if (activeTab === 'interviews') {
        if (!drive.interviewDate && !drive.oaDate) return false;
      }

      // FilterBar Status filter: all vs active vs past
      if (statusFilter === 'active' && isPast) return false;
      if (statusFilter === 'past' && !isPast) return false;

      // CTC Package Filter: > 5, 10+, 15+, 20+, 25+
      if (ctcFilter !== 'all') {
        const threshold = Number(ctcFilter);
        const driveCtc = parseCtcMax(drive.ctc);
        if (driveCtc < threshold) return false;
      }

      // Today Only Toggle
      if (showTodayOnly) {
        const isDeadlineToday = isTodayDate(drive.deadline);
        const isOaToday = isTodayDate(drive.oaDate);
        const isInterviewToday = isTodayDate(drive.interviewDate);
        if (!isDeadlineToday && !isOaToday && !isInterviewToday) return false;
      }

      // Search Query Filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchCompany = drive.company.toLowerCase().includes(query);
        const matchRole = drive.role.toLowerCase().includes(query);
        const matchTier = drive.tier.toLowerCase().includes(query);
        const matchBranch = drive.eligibleBranches.some((b) =>
          b.toLowerCase().includes(query)
        );
        if (!matchCompany && !matchRole && !matchTier && !matchBranch) return false;
      }

      // Tier Filter
      if (selectedTier !== 'All') {
        if (drive.tier.toLowerCase() !== selectedTier.toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    list.sort((a, b) => {
      // 1. DEADLINE (SOONEST / URGENT FIRST: 30 Oct appears before 31 Oct, 31 Oct before 2 Nov)
      if (sortByDate === 'deadline-asc') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        const tA = parseSortDate(a.deadline);
        const tB = parseSortDate(b.deadline);

        const isUpcomingA = tA >= todayMs;
        const isUpcomingB = tB >= todayMs;

        // Both are upcoming: soonest deadline first (30 Oct before 31 Oct)
        if (isUpcomingA && isUpcomingB) {
          return tA - tB;
        }
        // Active/upcoming deadline comes before past/no deadline
        if (isUpcomingA && !isUpcomingB) return -1;
        if (!isUpcomingA && isUpcomingB) return 1;

        // Both past: show most recent past first
        if (tA && tB) return tB - tA;
        if (!tA && !tB) return 0;
        if (!tA) return 1;
        return -1;
      }

      if (sortByDate === 'deadline-desc') {
        const tA = parseSortDate(a.deadline);
        const tB = parseSortDate(b.deadline);
        if (!tA && !tB) return 0;
        if (!tA) return 1;
        if (!tB) return -1;
        return tB - tA;
      }

      if (sortByDate === 'listed-desc') {
        return parseSortDate(b.dateListed) - parseSortDate(a.dateListed);
      }
      if (sortByDate === 'listed-asc') {
        return parseSortDate(a.dateListed) - parseSortDate(b.dateListed);
      }

      return 0;
    });

    return list;
  }, [drives, search, selectedTier, ctcFilter, statusFilter, showTodayOnly, sortByDate, activeTab]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTier('All');
    setCtcFilter('all');
    setStatusFilter('all');
    setSortByDate('deadline-asc');
    setShowTodayOnly(false);
  };

  const handleSelectMetric = (metric: 'all' | 'todayEvents' | 'tomorrow' | 'closing') => {
    if (metric === 'all') {
      setActiveTab('pipeline');
      setShowTodayOnly(false);
      setStatusFilter('all');
    } else if (metric === 'todayEvents') {
      setActiveTab('dashboard');
      setShowTodayOnly(false);
    } else if (metric === 'tomorrow') {
      setActiveTab('dashboard');
    } else if (metric === 'closing') {
      setShowTodayOnly(true);
      setActiveTab('pipeline');
    }
  };

  // When clicking company from daily action, open details WITHOUT scrolling to card
  const handleSelectCompanyFromAgenda = (companyName: string) => {
    const matched = drives.find(
      (d) =>
        d.company.toLowerCase().includes(companyName.toLowerCase()) ||
        companyName.toLowerCase().includes(d.company.toLowerCase())
    );
    if (matched) {
      setSelectedDrive(matched);
      // No scroll performed
    }
  };

  // From analytics CTC threshold bar click: filter to that threshold and view pipeline
  const handleSelectCtcFromAnalytics = (minLpa: number) => {
    setCtcFilter(String(minLpa) as CtcFilterOption);
    setActiveTab('pipeline');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060b10] text-slate-100 font-mono transition-colors relative selection:bg-[#00ff66]/20 selection:text-[#00ff66]">
      {/* Top Header Navbar */}
      <Navbar
        onRefresh={() => fetchPlacements(true)}
        isRefreshing={isRefreshing}
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Body: Desktop Sidebar + Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex gap-3 lg:gap-5">
        {/* Desktop Left Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-3 sm:space-y-3.5 pb-20 md:pb-6">
          {/* 1. DASHBOARD & PIPELINE VIEW */}
          {(activeTab === 'dashboard' || activeTab === 'pipeline') && (
            <>
              {/* Minimal Single-line Greeting Bar */}
              <GreetingCard />

              {/* Minimal Single-line Low-Height 4 Telemetry Metric Cards */}
              <DashboardMetrics
                total={metrics.total}
                todayEvents={metrics.todayEvents}
                tomorrowEvents={metrics.tomorrowEvents}
                closingToday={metrics.todayDeadlines}
                onSelectMetric={handleSelectMetric}
              />

              {/* Minimal Terminal Notice Banner */}
              <div className="bg-[#0c1520] border border-[#1b2d3e] hover:border-[#28425b] shadow-sm shadow-black/20 rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-mono transition-colors select-none">
                <Info className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
                <span className="text-[#fbbf24] font-bold text-[10px] tracking-wider uppercase shrink-0">
                  [ NOTE ]
                </span>
                <span className="text-slate-300 text-xs tracking-wide">
                  Data before mid-Sept is not complete.
                </span>
              </div>

              {/* Daily Action Agenda */}
              <UpcomingActivities
                drives={drives}
                onSelectCompany={handleSelectCompanyFromAgenda}
              />
            </>
          )}

          {/* 2. CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            <div className="bg-[#0a1219] border border-[#142330] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#142330]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00ff66]" />
                  <h2 className="font-bold text-white text-sm uppercase tracking-wider">
                    Schedule Calendar
                  </h2>
                </div>
                <span className="text-xs text-[#546b80]">
                  [ {drives.filter((d) => d.oaDate || d.interviewDate).length} EVENTS ]
                </span>
              </div>

              <div className="divide-y divide-[#142330]">
                {drives
                  .filter((d) => d.oaDate || d.interviewDate)
                  .map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDrive(d)}
                      className="py-2.5 flex items-center justify-between hover:bg-[#0c151e] px-2 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{d.company}</div>
                        <div className="text-[11px] text-[#70879d]">{d.role}</div>
                      </div>
                      <div className="text-right text-[11px] font-mono space-y-0.5">
                        {d.oaDate && (
                          <div className="text-sky-400">[ OA: {d.oaDate} ]</div>
                        )}
                        {d.interviewDate && (
                          <div className="text-purple-400">[ INT: {d.interviewDate} ]</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 3. ANALYTICS / STATS VIEW (Bar & Pie Charts with 5+, 10+, 15+, 20+, 25+) */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              drives={drives}
              onSelectCtcFilter={handleSelectCtcFromAnalytics}
            />
          )}

{/* 5. LIVE NOTES VIEW (Shared real-time notes board) */}
          {activeTab === 'notes' && <NotesSection />}

          {/* PIPELINE / CARDS SECTION */}
          {(activeTab === 'dashboard' ||
            activeTab === 'pipeline' ||
            activeTab === 'applications' ||
            activeTab === 'interviews' ||
            activeTab === 'past') && (
            <section id="placements-content" className="pt-1">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#00ff66] font-bold text-xs">[&gt;]</span>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    {activeTab === 'past'
                      ? 'Concluded Companies'
                      : activeTab === 'interviews'
                      ? 'Scheduled Assessments & Interviews'
                      : activeTab === 'applications'
                      ? 'Open Application Drives'
                      : 'Company Pipeline Directory'}
                  </h2>
                </div>
                <span className="text-xs text-[#546b80]">
                  {filteredDrives.length} of {drives.length} drives
                </span>
              </div>

              {/* Minimal Filter Bar */}
              <FilterBar
                search={search}
                onSearchChange={setSearch}
                selectedTier={selectedTier}
                onTierChange={setSelectedTier}
                availableTiers={availableTiers}
                tierCounts={tierCounts}
                ctcFilter={ctcFilter}
                onCtcFilterChange={setCtcFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortByDate={sortByDate}
                onSortByDateChange={setSortByDate}
                showTodayOnly={showTodayOnly}
                onToggleTodayOnly={() => setShowTodayOnly((prev) => !prev)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalFiltered={filteredDrives.length}
                onReset={handleResetFilters}
              />

              {/* Placements Cards Grid or Table View */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div
                      key={idx}
                      className="bg-[#0a1219] rounded-xl p-3 border border-[#142330] animate-pulse space-y-2.5"
                    >
                      <div className="h-3.5 bg-[#142330] rounded w-1/3" />
                      <div className="h-4 bg-[#142330] rounded w-3/4" />
                      <div className="h-8 bg-[#142330] rounded" />
                      <div className="h-3 bg-[#142330] rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredDrives.length === 0 ? (
                <div className="bg-[#0a1219] rounded-xl p-8 border border-[#142330] text-center space-y-2.5 font-mono">
                  <Inbox className="w-8 h-8 text-[#546b80] mx-auto" />
                  <div className="font-bold text-white text-xs sm:text-sm">
                    [ NO MATCHING DRIVES FOUND ]
                  </div>
                  <p className="text-xs text-[#546b80] max-w-md mx-auto">
                    Try adjusting your search criteria or clearing filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#00ff66]/50 bg-[#00ff66]/10 text-[#00ff66] text-xs font-bold hover:bg-[#00ff66]/20 transition-colors uppercase cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>RESET ALL FILTERS</span>
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredDrives.map((drive) => (
                    <CompanyCard
                      key={drive.id}
                      drive={drive}
                      isPast={isInterviewOver(drive)}
                      onSelect={(d) => setSelectedDrive(d)}
                    />
                  ))}
                </div>
              ) : (
                <CompanyTable
                  drives={filteredDrives}
                  isPastDrive={isInterviewOver}
                  onSelect={(d) => setSelectedDrive(d)}
                />
              )}
            </section>
          )}
        </main>
      </div>

      {/* Company Dossier / Details Modal */}
      <CompanyDetailModal
        drive={selectedDrive}
        onClose={() => setSelectedDrive(null)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
