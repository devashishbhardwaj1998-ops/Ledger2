import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertOctagon,
  Clock,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Users,
  Search,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { AuditReportData, NoteTagType } from '../types';
import { NOTE_TAGS, exportReportAsCsv, exportReportAsXlsx } from '../utils/audit';
import { formatDateDDMMYYYY } from '../utils/parser';

interface DiscrepancyReportProps {
  report: AuditReportData;
}

export const DiscrepancyReport: React.FC<DiscrepancyReportProps> = ({ report }) => {
  const [activeFilters, setActiveFilters] = useState<Set<NoteTagType>>(
    () => new Set(NOTE_TAGS.map((t) => t.tag))
  );
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAllClean, setShowAllClean] = useState(false);
  const [showRosterSummary, setShowRosterSummary] = useState(true);

  // Dynamic counts for each note tag across all flagged items
  const tagCounts = useMemo(() => {
    const counts: Record<NoteTagType, number> = {
      mismatch: 0,
      'status-not-done': 0,
      'missing-employer': 0,
      'missing-employee': 0,
      unmapped: 0
    };
    report.flagged.forEach((f) => {
      counts[f.tag] = (counts[f.tag] || 0) + 1;
    });
    return counts;
  }, [report.flagged]);

  const toggleFilter = (tag: NoteTagType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const selectAllFilters = () => {
    setActiveFilters(new Set(NOTE_TAGS.map((t) => t.tag)));
  };

  const clearAllFilters = () => {
    setActiveFilters(new Set());
  };

  // Filter flagged items by analyst, note tag, and search term
  const filteredFlagged = useMemo(() => {
    return report.flagged.filter((f) => {
      if (!activeFilters.has(f.tag)) return false;
      if (selectedAnalyst !== 'all' && f.analyst.toLowerCase() !== selectedAnalyst.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesAsset = f.asset.toLowerCase().includes(q);
        const matchesAnalyst = f.analyst.toLowerCase().includes(q);
        const matchesNote = f.note.toLowerCase().includes(q);
        if (!matchesAsset && !matchesAnalyst && !matchesNote) return false;
      }
      return true;
    });
  }, [report.flagged, activeFilters, selectedAnalyst, searchTerm]);

  // Filter clean items by analyst and search term
  const filteredClean = useMemo(() => {
    return report.clean.filter((c) => {
      if (selectedAnalyst !== 'all' && c.analyst.toLowerCase() !== selectedAnalyst.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesAsset = c.asset.toLowerCase().includes(q);
        const matchesAnalyst = c.analyst.toLowerCase().includes(q);
        if (!matchesAsset && !matchesAnalyst) return false;
      }
      return true;
    });
  }, [report.clean, selectedAnalyst, searchTerm]);

  const filteredMinutes = useMemo(() => {
    const sum = filteredFlagged.reduce((acc, f) => acc + (f.minutes || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [filteredFlagged]);

  const displayedClean = showAllClean ? filteredClean : filteredClean.slice(0, 25);

  const cleanPercentage =
    report.totalLines > 0
      ? Math.round((report.clean.length / report.totalLines) * 1000) / 10
      : 0;

  return (
    <div id="report" className="mt-12 pt-8 border-t-[3px] border-double border-[var(--card-border)]">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <div className="font-mono text-[10.5px] tracking-[2px] uppercase text-[var(--brass)] font-bold mb-1">
            Audit Findings
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] mb-2">
            Discrepancy Report
          </h2>
          <div className="font-mono text-[11.5px] text-[var(--text-muted)] leading-relaxed space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Region:</span>
              <span className="font-bold text-[var(--brass)] bg-[var(--brass-light)] border border-[var(--brass-border)] px-2 py-0.5 text-[11px]">
                {report.selectedRegion || 'All Regions'}
              </span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span>
                Week: <strong className="text-[var(--ink)] font-bold">{report.selectedWeek ? `Week ${report.selectedWeek}` : 'Selected Week'}</strong>
              </span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span>{report.analysts.length} Analysts Cross-Checked</span>
            </div>
            <div>
              Data Pull Sheet: <span className="font-semibold text-[var(--ink)]">{report.empFile}</span> &mdash; Daily Planning Sheet: <span className="font-semibold text-[var(--ink)]">{report.erFile}</span>
            </div>
            <div>
              Date range: <strong className="text-[var(--ink)]">{formatDateDDMMYYYY(report.windowStart)}</strong> through <strong className="text-[var(--ink)]">{formatDateDDMMYYYY(report.windowEnd)}</strong>
            </div>
            <div className="text-[10.5px] text-[var(--text-subtle)] pt-0.5">
              Audit Executed: {report.runAt}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => exportReportAsCsv(report, filteredFlagged)}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--ink)] border border-[var(--card-border)] px-3.5 py-2 bg-[var(--paper-card)] hover:bg-[var(--rule-subtle)] cursor-pointer shadow-2xs font-semibold"
            title="Download CSV export with all analysts and discrepancies"
          >
            <Download className="w-3.5 h-3.5 text-[var(--brass)]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => exportReportAsXlsx(report, filteredFlagged)}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--btn-primary-text)] bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] px-3.5 py-2 cursor-pointer shadow-2xs font-semibold"
            title="Download Excel spreadsheet workbook"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Metric Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 border border-[var(--card-border)] my-6 bg-[var(--card-bg)] shadow-xs">
        <div className="p-4 sm:p-5 border-r border-b lg:border-b-0 border-[var(--card-border)]">
          <div className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] leading-none">
            {report.analysts.length}
          </div>
          <div className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wider text-[var(--text-muted)] mt-1.5 flex items-center gap-1 font-semibold">
            <Users className="w-3 h-3 text-[var(--brass)]" />
            <span>Analysts Audited</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-r border-b lg:border-b-0 border-[var(--card-border)]">
          <div className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] leading-none">
            {report.totalLines}
          </div>
          <div className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wider text-[var(--text-muted)] mt-1.5 flex items-center gap-1 font-semibold">
            <Layers className="w-3 h-3 text-[var(--brass)]" />
            <span>Tasks Compared</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-[var(--card-border)]">
          <div className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ok)] leading-none flex items-baseline gap-1.5">
            <span>{report.clean.length}</span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">({cleanPercentage}%)</span>
          </div>
          <div className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wider text-[var(--text-muted)] mt-1.5 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3 text-[var(--ok)]" />
            <span>Matched Clean</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-r border-[var(--card-border)] bg-[var(--flag-bg)]/40">
          <div className="font-serif font-bold text-3xl sm:text-4xl text-[var(--flag)] leading-none flex items-baseline gap-2">
            <span>{report.flagged.length}</span>
            {tagCounts.mismatch > 0 && (
              <span className="font-mono text-[11px] font-semibold text-[var(--flag)] bg-[var(--flag-bg)] px-1.5 py-0.5 border border-[var(--flag-border)]">
                {tagCounts.mismatch} Mismatch{tagCounts.mismatch > 1 ? 'es' : ''}
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wider text-[var(--text-muted)] mt-1.5 flex items-center gap-1 font-semibold">
            <AlertOctagon className="w-3 h-3 text-[var(--flag)]" />
            <span>Discrepancies</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] leading-none">
            {report.flaggedMinutes}
          </div>
          <div className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-wider text-[var(--text-muted)] mt-1.5 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3 text-[var(--brass)]" />
            <span>Mins on Flagged ({Math.round(report.flaggedMinutes / 60 * 10) / 10} hrs)</span>
          </div>
        </div>
      </div>

      {/* Analyst Scorecard Roster Accordion */}
      {report.analysts.length > 0 && (
        <div className="mb-8 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs">
          <div
            onClick={() => setShowRosterSummary((prev) => !prev)}
            className="p-4 flex items-center justify-between cursor-pointer select-none border-b border-[var(--rule)] hover:bg-[var(--card-subtle)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--brass)]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
                Analyst Roster Breakdown ({report.analysts.length})
              </span>
              <span className="font-sans text-[11px] text-[var(--text-muted)]">
                &mdash; Click an analyst card to filter results
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-[var(--brass)] font-semibold">
                {report.analysts.filter((a) => a.flaggedCount === 0).length} Clean •{' '}
                {report.analysts.filter((a) => a.flaggedCount > 0).length} With Discrepancies
              </span>
              {showRosterSummary ? (
                <ChevronUp className="w-4 h-4 text-[var(--text-dim)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />
              )}
            </div>
          </div>

          {showRosterSummary && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto custom-scrollbar">
              {/* "All Analysts" master card */}
              <div
                onClick={() => setSelectedAnalyst('all')}
                className={`p-3 border cursor-pointer transition-all ${
                  selectedAnalyst === 'all'
                    ? 'border-[var(--brass)] bg-[var(--brass-light)] shadow-xs font-bold'
                    : 'border-[var(--rule)] bg-[var(--paper-card)] hover:border-[var(--brass)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans font-bold text-[13px] text-[var(--ink)]">
                    All Analysts Combined
                  </span>
                  <span className="font-mono text-[10px] text-[var(--brass)] uppercase font-semibold">
                    {report.analysts.length} People
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[var(--text-muted)] flex justify-between">
                  <span>Clean: {report.clean.length}</span>
                  <span className={report.flagged.length > 0 ? 'text-[var(--flag)] font-bold' : 'text-[var(--ok)]'}>
                    Flagged: {report.flagged.length}
                  </span>
                </div>
              </div>

              {/* Individual analyst cards */}
              {report.analysts.map((a) => {
                const isSelected = selectedAnalyst.toLowerCase() === a.analystName.toLowerCase();
                const isClean = a.flaggedCount === 0;

                return (
                  <div
                    key={a.analystName}
                    onClick={() => setSelectedAnalyst(isSelected ? 'all' : a.analystName)}
                    className={`p-3 border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--brass)] bg-[var(--brass-light)] ring-1 ring-[var(--brass)] shadow-xs'
                        : isClean
                        ? 'border-[var(--rule)] bg-[var(--paper-card)] hover:border-[var(--ok)]'
                        : 'border-[var(--flag-border)] bg-[var(--flag-subtle)] hover:border-[var(--flag)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-sans font-bold text-[12.5px] text-[var(--ink)] truncate" title={a.analystName}>
                        {a.analystName}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 whitespace-nowrap ${
                          isClean
                            ? 'text-[var(--ok)] bg-[var(--ok-bg)] border border-[var(--ok-border)]'
                            : 'text-[var(--flag)] bg-[var(--flag-bg)] border border-[var(--flag-border)]'
                        }`}
                      >
                        {isClean ? 'Clean' : `${a.flaggedCount} Flagged`}
                      </span>
                    </div>

                    <div className="font-mono text-[10.5px] text-[var(--text-muted)] flex items-center justify-between">
                      <span>{a.cleanCount} Clean</span>
                      <span>{a.totalMinutes} Mins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Control Strip: Active Analyst Filter + Search + Discrepancy Note Type Filters */}
      <div className="mb-6 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4">
        {/* Row 1: Analyst selection dropdown & Search box */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase text-[var(--text-muted)] whitespace-nowrap">
              Viewing:
            </span>
            <div className="relative flex-1">
              <select
                value={selectedAnalyst}
                onChange={(e) => setSelectedAnalyst(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] font-mono text-[12px] px-3 py-1.5 pr-8 focus:outline-none focus:border-[var(--brass)] cursor-pointer"
              >
                <option value="all">All Analysts ({report.analysts.length})</option>
                {report.analysts.map((a) => (
                  <option key={a.analystName} value={a.analystName}>
                    {a.analystName} ({a.flaggedCount === 0 ? 'Clean' : `${a.flaggedCount} issues`})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)] absolute right-2.5 top-2 pointer-events-none" />
            </div>
            {selectedAnalyst !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedAnalyst('all')}
                className="font-mono text-[11px] text-[var(--brass)] hover:underline uppercase font-semibold whitespace-nowrap cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-dim)] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by asset, analyst, or finding..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] font-mono text-[12px] pl-9 pr-3 py-1.5 focus:outline-none focus:border-[var(--brass)]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="font-mono text-[10px] text-[var(--text-dim)] hover:text-[var(--ink)] absolute right-2.5 top-2 cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Note type checkboxes */}
        <div className="pt-3 border-t border-[var(--rule-subtle)]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="font-mono text-[10px] tracking-[2px] uppercase text-[var(--brass)] font-bold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter by Discrepancy Type</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10.5px]">
              <button
                type="button"
                onClick={selectAllFilters}
                className="text-[var(--brass)] hover:underline cursor-pointer font-semibold"
              >
                Select all
              </button>
              <span className="text-[var(--text-subtle)]">&bull;</span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[var(--brass)] hover:underline cursor-pointer font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {NOTE_TAGS.map((t) => {
              const count = tagCounts[t.tag];
              const isChecked = activeFilters.has(t.tag);
              return (
                <label
                  key={t.tag}
                  className={`inline-flex items-center gap-2 font-mono text-[11px] px-3 py-1 border cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'border-[var(--brass)] bg-[var(--paper-card)] text-[var(--ink)] font-semibold shadow-2xs'
                      : 'border-[var(--rule)] bg-transparent text-[var(--text-muted)] opacity-60 hover:opacity-100'
                  } ${count === 0 ? 'opacity-40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFilter(t.tag)}
                    className="accent-[var(--brass)] cursor-pointer"
                  />
                  <span>{t.label}</span>
                  <span className="text-[var(--text-subtle)] font-bold">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flagged Discrepancies Table */}
      <div className="mb-10">
        <div className="flex items-center gap-3 font-mono text-[11.5px] tracking-[1.5px] uppercase text-[var(--brass)] font-bold mb-2">
          <span>
            Flagged Discrepancies ({filteredFlagged.length} Tasks)
          </span>
          <div className="flex-1 h-[1px] bg-[var(--rule)]" />
        </div>

        <div className="font-mono text-[11px] text-[var(--text-muted)] mb-2.5">
          <span>
            Showing <strong>{filteredFlagged.length}</strong> flagged tasks ({filteredMinutes} minutes in active filter)
            {selectedAnalyst !== 'all' && <span> for <strong>{selectedAnalyst}</strong></span>}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-[var(--card-border)] bg-[var(--table-row-bg)] shadow-xs">
          <table className="w-full border-collapse text-left font-mono text-[12px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--table-header-bg)] text-[10.5px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="p-3 font-bold">Analyst</th>
                <th className="p-3 font-bold">Asset Name</th>
                <th className="p-3 font-bold">Date</th>
                <th className="p-3 font-bold">Daily Planning Sheet</th>
                <th className="p-3 font-bold">Data Pull Sheet</th>
                <th className="p-3 font-bold text-right">Mins</th>
                <th className="p-3 font-bold">Audit Finding / Discrepancy Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlagged.map((f) => {
                const isMismatch = f.tag === 'mismatch';
                return (
                  <tr
                    key={f.id}
                    className={`border-b border-[var(--rule)] transition-colors ${
                      isMismatch
                        ? 'bg-[var(--flag-bg)]/40 hover:bg-[var(--flag-bg)]/70'
                        : 'hover:bg-[var(--table-row-hover)]'
                    }`}
                  >
                    <td className="p-3 font-sans font-bold text-[12.5px] text-[var(--ink)] whitespace-nowrap">
                      <span
                        onClick={() => setSelectedAnalyst(f.analyst)}
                        className="cursor-pointer hover:text-[var(--brass)] hover:underline"
                        title="Click to filter to this analyst"
                      >
                        {f.analyst}
                      </span>
                    </td>
                    <td className="p-3 font-sans font-semibold text-[13px] text-[var(--ink)] max-w-xs">
                      {f.asset}
                    </td>
                    <td className="p-3 text-[var(--text-muted)] whitespace-nowrap font-medium">
                      {formatDateDDMMYYYY(f.date)}
                    </td>
                    <td className="p-3 font-mono">
                      {f.empSide !== '—' ? (
                        <span className={`inline-block font-semibold px-2 py-0.5 text-[11px] ${
                          isMismatch ? 'bg-[var(--flag-bg)] text-[var(--flag)] border border-[var(--flag-border)] font-bold' : 'text-[var(--ink)]'
                        }`}>
                          {f.empSide}
                        </span>
                      ) : (
                        <span className="text-[var(--text-dim)]">—</span>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      {f.erSide !== '—' ? (
                        <span className={`inline-block font-semibold px-2 py-0.5 text-[11px] ${
                          isMismatch ? 'bg-[var(--flag-bg)] text-[var(--flag)] border border-[var(--flag-border)] font-bold' : 'text-[var(--ink)]'
                        }`}>
                          {f.erSide}
                        </span>
                      ) : (
                        <span className="text-[var(--text-dim)]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold tabular-nums text-[var(--ink)]">
                      {f.minutes || 0}
                    </td>
                    <td className="p-3">
                      <span className={`tagpill ${f.tag} shadow-2xs font-semibold`}>
                        {f.note}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredFlagged.length === 0 && (
            <div className="p-8 text-center font-serif italic text-[var(--text-muted)]">
              {report.flagged.length === 0
                ? 'No discrepancies found — all analyst entries match cleanly!'
                : 'No flagged tasks match the selected analyst and note filters.'}
            </div>
          )}
        </div>
      </div>

      {/* Matched Clean Table */}
      <div className="mb-8">
        <div className="flex items-center gap-3 font-mono text-[11.5px] tracking-[1.5px] uppercase text-[var(--brass)] font-bold mb-2">
          <span>
            Matched Clean ({filteredClean.length} of {report.clean.length} Total)
          </span>
          <div className="flex-1 h-[1px] bg-[var(--rule)]" />
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-[var(--card-border)] bg-[var(--table-row-bg)] shadow-xs">
          <table className="w-full border-collapse text-left font-mono text-[12px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--table-header-bg)] text-[10.5px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="p-3 font-bold">Analyst</th>
                <th className="p-3 font-bold">Asset Name</th>
                <th className="p-3 font-bold">Date</th>
                <th className="p-3 font-bold">Reconciled Category</th>
                <th className="p-3 font-bold text-right">Mins</th>
                <th className="p-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedClean.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--rule)] hover:bg-[var(--ok-bg)]/40 transition-colors"
                >
                  <td className="p-3 font-sans font-bold text-[12.5px] text-[var(--ink)] whitespace-nowrap">
                    <span
                      onClick={() => setSelectedAnalyst(c.analyst)}
                      className="cursor-pointer hover:text-[var(--brass)] hover:underline"
                    >
                      {c.analyst}
                    </span>
                  </td>
                  <td className="p-3 font-sans font-semibold text-[13px] text-[var(--ink)]">
                    {c.asset}
                  </td>
                  <td className="p-3 text-[var(--text-muted)] whitespace-nowrap font-medium">
                    {formatDateDDMMYYYY(c.date)}
                  </td>
                  <td className="p-3 text-[var(--ok)] font-semibold">
                    {c.category}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums text-[var(--ink)] font-semibold">
                    {c.minutes || 0}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-[var(--ok)] bg-[var(--ok-bg)] border border-[var(--ok-border)] px-2 py-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>Matched (Done)</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredClean.length === 0 && (
            <div className="p-6 text-center font-serif italic text-[var(--text-muted)]">
              No clean matches found for the active filter.
            </div>
          )}

          {filteredClean.length > 25 && (
            <div className="p-3 border-t border-[var(--rule)] bg-[var(--table-header-bg)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>
                {showAllClean
                  ? `Showing all ${filteredClean.length} cleanly matched tasks`
                  : `Showing first 25 of ${filteredClean.length} cleanly matched tasks`}
              </span>
              <button
                type="button"
                onClick={() => setShowAllClean((prev) => !prev)}
                className="text-[var(--brass)] hover:underline font-semibold cursor-pointer"
              >
                {showAllClean ? 'Show less' : `Show all ${filteredClean.length} tasks`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
