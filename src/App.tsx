import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { RawEmployeeRow, RawEmployerRow, AuditReportData } from './types';
import { lastWeekWindow, getAvailableWeeks } from './utils/parser';
import { runInvestigation } from './utils/audit';
import { Masthead } from './components/Masthead';
import { IntakeSlots } from './components/IntakeSlots';
import { WeekPicker } from './components/WeekPicker';
import { DiscrepancyReport } from './components/DiscrepancyReport';
import { MappingLegendModal } from './components/MappingLegendModal';

export default function App() {
  const [employeeFile, setEmployeeFile] = useState<{ name: string; sizeText?: string } | null>(null);
  const [employerFile, setEmployerFile] = useState<{ name: string; sizeText?: string } | null>(null);
  const [employeeRows, setEmployeeRows] = useState<RawEmployeeRow[] | null>(null);
  const [employerRows, setEmployerRows] = useState<RawEmployerRow[] | null>(null);

  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('The UK/US');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');

  const [report, setReport] = useState<AuditReportData | null>(null);
  const [errorNote, setErrorNote] = useState<string | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ledger_theme');
      if (saved) return saved === 'dark';
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('ledger_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('ledger_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  const handleToggleDark = () => {
    setIsDark((prev) => !prev);
  };

  // Initialize date range with sensible default (last week)
  useEffect(() => {
    const w = lastWeekWindow();
    setRangeStart(w.start);
    setRangeEnd(w.end);
  }, []);

  // Compute available weeks across both uploaded files
  const availableWeeks = useMemo(() => {
    return getAvailableWeeks(employerRows, employeeRows);
  }, [employerRows, employeeRows]);

  // When new available weeks are found, automatically select the primary week
  useEffect(() => {
    if (availableWeeks.length > 0) {
      const currentExists = availableWeeks.some((w) => w.weekId === selectedWeekId);
      if (!currentExists) {
        const primary = availableWeeks[0];
        setSelectedWeekId(primary.weekId);
        if (primary.startDate && primary.endDate) {
          setRangeStart(primary.startDate);
          setRangeEnd(primary.endDate);
        }
      }
    }
  }, [availableWeeks, selectedWeekId]);

  const handleSelectWeek = (weekId: string, startDate: string, endDate: string) => {
    setSelectedWeekId(weekId);
    if (startDate && endDate) {
      setRangeStart(startDate);
      setRangeEnd(endDate);
    }
    setErrorNote(null);
  };

  // Readiness calculations
  const filesReady = Boolean(employeeFile && employerFile && employeeRows && employerRows);
  const rangeValid = Boolean(!rangeStart || !rangeEnd || rangeStart <= rangeEnd);
  const isReadyToInvestigate = filesReady && rangeValid;

  let statusMessage = 'Awaiting both files';
  if (!employeeFile && !employerFile) {
    statusMessage = 'Awaiting the Data Pull Sheet (Exhibit A) and the Daily Planning Sheet (Exhibit B).';
  } else if (!employeeFile) {
    statusMessage = 'Waiting on Exhibit A (Data Pull Sheet).';
  } else if (!employerFile) {
    statusMessage = 'Waiting on Exhibit B (Daily Planning Sheet or Google Sheet).';
  } else if (!rangeValid) {
    statusMessage = 'The "From" date must be on or before the "To" date.';
  } else {
    statusMessage = `Ready to audit ${selectedRegion} analysts for ${
      selectedWeekId && selectedWeekId !== 'all' ? `Week ${selectedWeekId}` : 'the selected week'
    }.`;
  }

  const handleInvestigate = () => {
    setErrorNote(null);
    if (!employeeRows || !employerRows) return;

    try {
      const auditResult = runInvestigation(
        employeeRows,
        employerRows,
        selectedWeekId,
        selectedRegion,
        rangeStart,
        rangeEnd,
        employeeFile?.name || 'Exhibit A (Data Pull Sheet)',
        employerFile?.name || 'Exhibit B (Daily Planning Sheet)'
      );
      setReport(auditResult);

      setTimeout(() => {
        const el = document.getElementById('report');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setErrorNote(err.message || 'Audit investigation failed.');
    }
  };

  return (
    <div className="min-h-screen text-[var(--ink)]">
      <div className="max-w-[1060px] mx-auto px-4 sm:px-7 py-8 sm:py-12 pb-28">
        {/* Masthead */}
        <Masthead
          onOpenLegend={() => setIsLegendOpen(true)}
          isDark={isDark}
          onToggleDark={handleToggleDark}
        />

        {/* Lede Explainer */}
        <div className="font-serif text-[15px] sm:text-[16.5px] leading-relaxed text-[var(--text-muted)] max-w-3xl mb-8 border-l-2 border-[var(--brass)] pl-4 sm:pl-5">
          Upload the Data Pull Sheet (Exhibit A) and the Daily Planning Sheet (Exhibit B). Ledger automatically cross-checks the names of all analysts between both sheets for the selected week and audits their logged tasks so that your Sundays are actually Sundays.
        </div>

        {/* Intake File Zones */}
        <IntakeSlots
          employeeFile={employeeFile}
          employerFile={employerFile}
          onEmployeeLoaded={(info, rows) => {
            setEmployeeFile(info);
            setEmployeeRows(rows);
            setErrorNote(null);

            // Auto-detect date window from rows if available
            const validDates = rows.map((r) => r.date).filter(Boolean).sort() as string[];
            if (validDates.length > 0) {
              setRangeStart(validDates[0]);
              setRangeEnd(validDates[validDates.length - 1]);
            }
          }}
          onEmployerLoaded={(info, rows) => {
            setEmployerFile(info);
            setEmployerRows(rows);
            setErrorNote(null);

            // Check if employer rows have week identifiers or dates
            const weeks = getAvailableWeeks(rows, employeeRows);
            if (weeks.length > 0) {
              setSelectedWeekId(weeks[0].weekId);
              if (weeks[0].startDate && weeks[0].endDate) {
                setRangeStart(weeks[0].startDate);
                setRangeEnd(weeks[0].endDate);
              }
            }
          }}
          onClearEmployee={() => {
            setEmployeeFile(null);
            setEmployeeRows(null);
            setReport(null);
          }}
          onClearEmployer={() => {
            setEmployerFile(null);
            setEmployerRows(null);
            setReport(null);
          }}
          onError={(msg) => setErrorNote(msg)}
        />

        {/* Week Scope and Analyst Cross-Check Roster */}
        {(employeeRows || employerRows) && (
          <WeekPicker
            availableWeeks={availableWeeks}
            selectedWeekId={selectedWeekId}
            onSelectWeek={handleSelectWeek}
            selectedRegion={selectedRegion}
            onSelectRegion={(reg) => {
              setSelectedRegion(reg);
              setErrorNote(null);
            }}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeStartChange={(val) => {
              setRangeStart(val);
              setErrorNote(null);
            }}
            onRangeEndChange={(val) => {
              setRangeEnd(val);
              setErrorNote(null);
            }}
            employeeRows={employeeRows}
            employerRows={employerRows}
          />
        )}

        {/* Action Trigger Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 border-2 border-[var(--card-border)] bg-[var(--card-bg)] shadow-[4px_4px_0px_0px_var(--card-border)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--brass)] shrink-0 animate-pulse" />
            <span className="font-mono text-[12.5px] text-[var(--text-muted)] font-medium">
              {statusMessage}
            </span>
          </div>

          <button
            type="button"
            disabled={!isReadyToInvestigate}
            onClick={handleInvestigate}
            className="font-mono text-[13px] font-bold tracking-[1.5px] uppercase bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-8 py-3.5 hover:bg-[var(--btn-primary-hover)] active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {selectedWeekId && selectedWeekId !== 'all'
                ? `Audit ${selectedRegion} (Week ${selectedWeekId})`
                : `Audit ${selectedRegion}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Error Note Banner */}
        {errorNote && (
          <div className="mt-4 p-4 bg-[var(--flag-bg)] border border-[var(--flag-border)] text-[var(--flag)] font-mono text-[12.5px] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="whitespace-pre-wrap leading-relaxed">{errorNote}</div>
          </div>
        )}

        {/* Discrepancy Findings Report */}
        {report && (
          <div ref={reportRef}>
            <DiscrepancyReport report={report} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-5 border-t border-[var(--rule)] font-mono text-[11px] text-[var(--text-subtle)] text-center leading-relaxed">
          Ledger runs entirely in this browser tab. Uploaded files are processed client-side; a linked Google Sheet is fetched directly from your browser to Google.
        </footer>
      </div>

      {/* Translation Table Specification Modal */}
      <MappingLegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />
    </div>
  );
}
