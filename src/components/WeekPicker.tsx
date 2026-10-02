import React, { useState, useMemo } from 'react';
import { Calendar, Users, CheckCircle2, ChevronDown, Clock, Search, Globe, MapPin } from 'lucide-react';
import { WeekInfo, RawEmployeeRow, RawEmployerRow, SUPPORTED_REGIONS, RegionType } from '../types';
import { formatDateDDMMYYYY, matchAnalyst, mapGeographyToRegion, getAvailableRegions } from '../utils/parser';

interface WeekPickerProps {
  availableWeeks: WeekInfo[];
  selectedWeekId: string;
  onSelectWeek: (weekId: string, startDate: string, endDate: string) => void;
  selectedRegion: string;
  onSelectRegion: (reg: string) => void;
  rangeStart: string;
  rangeEnd: string;
  onRangeStartChange: (val: string) => void;
  onRangeEndChange: (val: string) => void;
  employeeRows: RawEmployeeRow[] | null;
  employerRows: RawEmployerRow[] | null;
}

export const WeekPicker: React.FC<WeekPickerProps> = ({
  availableWeeks,
  selectedWeekId,
  onSelectWeek,
  selectedRegion,
  onSelectRegion,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  employeeRows,
  employerRows
}) => {
  const [analystSearch, setAnalystSearch] = useState('');
  const [showRosterPreview, setShowRosterPreview] = useState(false);

  // Calculate counts per region
  const regionStats = useMemo(() => {
    return getAvailableRegions(employerRows, selectedWeekId);
  }, [employerRows, selectedWeekId]);

  const totalAnalystsAcrossAll = useMemo(() => {
    const s = new Set<string>();
    if (employerRows) {
      employerRows.forEach((r) => {
        if (r.employee && r.employee.trim()) {
          if (!selectedWeekId || selectedWeekId === 'all' || r.week === selectedWeekId) {
            s.add(r.employee.trim());
          }
        }
      });
    }
    return s.size;
  }, [employerRows, selectedWeekId]);

  // Determine analysts belonging to the active selected region
  const analystRoster = useMemo(() => {
    const list = new Map<
      string,
      { name: string; region?: string; inTimesheet: boolean; inPlanning: boolean; taskCount: number }
    >();

    const isAllRegions = !selectedRegion || selectedRegion === 'all' || selectedRegion === 'All Regions';

    // From Daily Planning Sheet
    if (employerRows) {
      employerRows.forEach((r) => {
        if (!r.employee || !r.employee.trim()) return;
        const name = r.employee.trim();
        const key = name.toLowerCase();

        // Week filter
        if (selectedWeekId && selectedWeekId !== 'all') {
          if (r.week && r.week !== selectedWeekId) return;
        }

        const itemReg = r.region || mapGeographyToRegion(r.geography);

        // Region filter
        if (!isAllRegions) {
          if (itemReg !== selectedRegion) return;
        }

        if (!list.has(key)) {
          list.set(key, {
            name,
            region: itemReg || undefined,
            inTimesheet: false,
            inPlanning: true,
            taskCount: 0
          });
        }
        const item = list.get(key)!;
        item.inPlanning = true;
        if (r.assetName) item.taskCount++;
      });
    }

    // From Data Pull Sheet (only cross-check if present in planning roster for that region)
    if (employeeRows) {
      employeeRows.forEach((r) => {
        if (!r.name || !r.name.trim()) return;
        const name = r.name.trim();
        const key = r.nameKey || name.toLowerCase();

        // Check if matches an existing planning analyst in this region
        let matchedKey: string | null = null;
        for (const [k, val] of list.entries()) {
          if (matchAnalyst(val.name, name)) {
            matchedKey = k;
            break;
          }
        }

        if (matchedKey && list.has(matchedKey)) {
          list.get(matchedKey)!.inTimesheet = true;
        } else if (isAllRegions) {
          // If All Regions, also list standalone timesheet analysts
          if (!list.has(key)) {
            list.set(key, {
              name,
              inTimesheet: true,
              inPlanning: false,
              taskCount: 0
            });
          } else {
            list.get(key)!.inTimesheet = true;
          }
        }
      });
    }

    return Array.from(list.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [employerRows, employeeRows, selectedWeekId, selectedRegion]);

  const filteredAnalysts = useMemo(() => {
    if (!analystSearch.trim()) return analystRoster;
    const q = analystSearch.toLowerCase().trim();
    return analystRoster.filter((a) => a.name.toLowerCase().includes(q));
  }, [analystRoster, analystSearch]);

  const currentWeek = availableWeeks.find((w) => w.weekId === selectedWeekId) || availableWeeks[0];

  return (
    <div className="bg-[var(--paper-card)] border-2 border-[var(--card-border)] p-5 sm:p-7 shadow-[4px_4px_0px_0px_var(--card-border)] mb-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-[var(--rule)]">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--brass)] flex items-center gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Audit Scope & Regional Filter</span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-[var(--ink)] tracking-tight">
            Region & Week Selection
          </h2>
        </div>

        {/* Selected Scope Indicator Pill */}
        <div className="inline-flex items-center gap-2 bg-[var(--brass-light)] border border-[var(--brass-border)] px-3.5 py-1.5 font-mono text-[12px] text-[var(--ink)]">
          <MapPin className="w-3.5 h-3.5 text-[var(--brass)]" />
          <span className="font-bold text-[var(--brass)]">{selectedRegion}</span>
          <span className="text-[var(--text-muted)]">•</span>
          <span>{analystRoster.length} Analysts to Audit</span>
        </div>
      </div>

      {/* Region Selection Section */}
      <div className="mt-5 pb-5 border-b border-[var(--rule)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[var(--brass)]" />
            <span>Select Region to Audit:</span>
          </label>
          <span className="font-sans text-[11.5px] text-[var(--text-dim)]">
            Only analysts and tasks in this region will be cross-checked against the Data Pull Sheet
          </span>
        </div>

        {/* Region Pill Tabs */}
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_REGIONS.map((regionName) => {
            const isSelected = selectedRegion === regionName;
            const stat = regionStats.find((s) => s.name === regionName);
            const analystCount = stat ? stat.analystCount : 0;
            const hasData = analystCount > 0;

            return (
              <button
                key={regionName}
                type="button"
                onClick={() => onSelectRegion(regionName)}
                className={`inline-flex items-center gap-2 font-mono text-[12px] px-3.5 py-2 border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[var(--card-border)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold shadow-[2px_2px_0px_0px_var(--card-border)]'
                    : 'border-[var(--rule)] bg-[var(--card-subtle)] text-[var(--ink)] hover:border-[var(--brass)] hover:bg-[var(--paper-card)]'
                }`}
              >
                <span>{regionName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-xs font-bold ${
                    isSelected
                      ? 'bg-[var(--paper-card)] text-[var(--ink)]'
                      : hasData
                      ? 'bg-[var(--brass-light)] text-[var(--brass)] border border-[var(--brass-border)]'
                      : 'bg-transparent text-[var(--text-dim)] opacity-60'
                  }`}
                >
                  {analystCount}
                </span>
              </button>
            );
          })}

          {/* All Regions combined option */}
          <button
            type="button"
            onClick={() => onSelectRegion('All Regions')}
            className={`inline-flex items-center gap-2 font-mono text-[12px] px-3.5 py-2 border transition-all cursor-pointer select-none ${
              selectedRegion === 'All Regions'
                ? 'border-[var(--card-border)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold shadow-[2px_2px_0px_0px_var(--card-border)]'
                : 'border-[var(--rule)] bg-[var(--card-subtle)] text-[var(--ink)] hover:border-[var(--brass)]'
            }`}
          >
            <span>All Regions</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-xs font-bold ${
                selectedRegion === 'All Regions'
                  ? 'bg-[var(--paper-card)] text-[var(--ink)]'
                  : 'bg-[var(--rule-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {totalAnalystsAcrossAll}
            </span>
          </button>
        </div>
      </div>

      {/* Week Selector and Date Window Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
        {/* Week Selector Dropdown */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
              Select Week from Planning Sheet
            </label>
            <div className="relative">
              <select
                value={selectedWeekId}
                onChange={(e) => {
                  const id = e.target.value;
                  const wk = availableWeeks.find((w) => w.weekId === id);
                  if (wk) {
                    onSelectWeek(wk.weekId, wk.startDate, wk.endDate);
                  } else {
                    onSelectWeek(id, rangeStart, rangeEnd);
                  }
                }}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] font-mono text-[13px] px-3.5 py-2.5 pr-9 rounded-none focus:outline-none focus:border-[var(--brass)] cursor-pointer"
              >
                {availableWeeks.length > 0 ? (
                  availableWeeks.map((wk) => (
                    <option key={wk.weekId} value={wk.weekId}>
                      {wk.label} ({wk.analystCount} analysts, {wk.taskCount} tasks)
                    </option>
                  ))
                ) : (
                  <option value="">No weeks detected in uploaded files</option>
                )}
                {availableWeeks.length > 1 && (
                  <option value="all">Audit All Detected Weeks Combined</option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-dim)] absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="font-sans text-[12px] text-[var(--text-muted)] mt-2 leading-relaxed">
              Auditing <strong className="text-[var(--ink)]">{selectedRegion}</strong> for the chosen week.
            </p>
          </div>

          {/* Quick Date Range display */}
          <div className="mt-4 pt-3 border-t border-[var(--rule-subtle)] flex items-center gap-3">
            <Clock className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              Date window: <strong className="text-[var(--ink)]">{formatDateDDMMYYYY(rangeStart)}</strong> to <strong className="text-[var(--ink)]">{formatDateDDMMYYYY(rangeEnd)}</strong>
            </span>
          </div>
        </div>

        {/* Date Range Inputs */}
        <div className="md:col-span-6 bg-[var(--card-subtle)] border border-[var(--card-border)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Audit Date Bounds
              </label>
              {currentWeek && currentWeek.startDate && (
                <button
                  type="button"
                  onClick={() => {
                    onRangeStartChange(currentWeek.startDate);
                    onRangeEndChange(currentWeek.endDate);
                  }}
                  className="font-mono text-[10px] text-[var(--brass)] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Reset to Week Bounds
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block font-mono text-[10px] text-[var(--text-dim)] uppercase mb-1">From (Sunday)</span>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => onRangeStartChange(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] font-mono text-[12px] px-2.5 py-1.5 focus:outline-none focus:border-[var(--brass)]"
                />
              </div>
              <div>
                <span className="block font-mono text-[10px] text-[var(--text-dim)] uppercase mb-1">To (Saturday/Sunday)</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => onRangeEndChange(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] font-mono text-[12px] px-2.5 py-1.5 focus:outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-[var(--text-muted)]">
            <span>Includes: Sunday through Saturday payroll window</span>
          </div>
        </div>
      </div>

      {/* Analyst Roster Preview for Selected Region */}
      {analystRoster.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[var(--rule)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[var(--brass)]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]">
                {selectedRegion} Analysts ({analystRoster.length})
              </span>
              <span className="font-sans text-[11px] text-[var(--text-dim)] hidden sm:inline">
                &mdash; verified in planning sheet for this region
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowRosterPreview((prev) => !prev)}
              className="font-mono text-[11px] text-[var(--brass)] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
            >
              {showRosterPreview ? 'Hide Analyst Roster ▲' : 'Show Analyst Roster ▼'}
            </button>
          </div>

          {/* Collapsible Roster Grid */}
          {showRosterPreview && (
            <div className="bg-[var(--card-subtle)] border border-[var(--card-border)] p-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                <input
                  type="text"
                  placeholder={`Filter ${selectedRegion} analysts...`}
                  value={analystSearch}
                  onChange={(e) => setAnalystSearch(e.target.value)}
                  className="w-full bg-transparent border-b border-[var(--input-border)] text-[var(--input-text)] font-mono text-[12px] py-1 px-1 focus:outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {filteredAnalysts.map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between gap-1.5 bg-[var(--paper-card)] border border-[var(--rule)] px-2.5 py-1.5 text-[11px] font-mono"
                  >
                    <span className="truncate font-semibold text-[var(--ink)]" title={a.name}>
                      {a.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1 py-0.5 font-bold ${
                        a.inTimesheet && a.inPlanning
                          ? 'bg-[var(--ok-bg)] text-[var(--ok)] border border-[var(--ok-border)]'
                          : 'bg-[var(--warn-bg)] text-[var(--warn)] border border-[var(--warn-border)]'
                      }`}
                      title={
                        a.inTimesheet && a.inPlanning
                          ? 'Present in both sheets'
                          : a.inPlanning
                          ? 'Only in Daily Planning'
                          : 'Only in Data Pull'
                      }
                    >
                      {a.inTimesheet && a.inPlanning ? 'Matched' : a.inPlanning ? 'Plan only' : 'Pull only'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
