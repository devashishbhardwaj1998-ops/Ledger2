import * as XLSX from 'xlsx';
import {
  RawEmployeeRow,
  RawEmployerRow,
  FlaggedTask,
  CleanTask,
  AuditReportData,
  NoteTagMeta,
  AnalystSummary,
  NoteTagType
} from '../types';
import {
  TYPE_MAP,
  TRACKED_TYPES,
  normalizeTrackedCategory,
  resolveProductionCategory,
  resolveReviewCategory,
  normAsset,
  formatDateDDMMYYYY,
  weekStartKey,
  matchAnalyst,
  mapGeographyToRegion
} from './parser';

export const NOTE_TAGS: NoteTagMeta[] = [
  {
    tag: 'mismatch',
    label: 'Category mismatch',
    description: 'Data Pull Sheet and Daily Planning Sheet disagree on production / review category'
  },
  {
    tag: 'status-not-done',
    label: 'Status not "Done"',
    description: 'Asset and type match, but status in Daily Planning Sheet is not marked "Done"'
  },
  {
    tag: 'missing-employer',
    label: 'Missing in Daily Planning Sheet',
    description: 'Logged in backend Data Pull Sheet, but missing in Daily Planning Sheet'
  },
  {
    tag: 'missing-employee',
    label: 'Missing in Data Pull Sheet',
    description: 'Logged in Daily Planning Sheet, but missing in backend Data Pull Sheet'
  },
  {
    tag: 'unmapped',
    label: 'Unrecognized type code',
    description: 'Data Pull Sheet contains an unrecognized or unmapped task type code'
  }
];

interface PreparedPullItem {
  id: string;
  analyst: string;
  region?: string;
  assetName: string;
  assetKey: string;
  date: string | null;
  minutes: number;
  rawType: string;
  category: string | null;
  axis: 'production' | 'review';
}

interface PreparedPlanItem {
  id: string;
  analyst: string;
  region?: string;
  assetName: string;
  assetKey: string;
  date: string | null;
  category: string;
  axis: 'production' | 'review';
  status: string;
  isDone: boolean;
}

export function runInvestigation(
  employeeRows: RawEmployeeRow[],
  employerRows: RawEmployerRow[],
  selectedWeekId: string = '',
  selectedRegion: string = 'All Regions',
  windowStart: string = '',
  windowEnd: string = '',
  empFileName: string = 'Data Pull Sheet',
  erFileName: string = 'Daily Planning Sheet',
  specificAnalystName?: string
): AuditReportData {
  if (!employeeRows || !employeeRows.length) {
    throw new Error('Data Pull Sheet contains no rows');
  }
  if (!employerRows || !employerRows.length) {
    throw new Error('Daily Planning Sheet contains no rows');
  }

  const isAllRegions =
    !selectedRegion || selectedRegion === 'all' || selectedRegion === 'All Regions';

  // 1. Determine Scope for Employer (Daily Planning) Rows by Week
  let planRowsInScope = employerRows.filter((r) => Boolean(r.assetName && r.assetName.trim()));

  if (selectedWeekId && selectedWeekId !== 'all') {
    planRowsInScope = planRowsInScope.filter((r) => {
      if (r.week && r.week === selectedWeekId) return true;
      if (r.date && (weekStartKey(r.date) === selectedWeekId || r.date === selectedWeekId)) return true;
      return false;
    });
  } else if (windowStart && windowEnd) {
    planRowsInScope = planRowsInScope.filter((r) => {
      if (!r.date) return true;
      return r.date >= windowStart && r.date <= windowEnd;
    });
  }

  // Determine date bounds if not explicitly supplied
  const planDates = planRowsInScope
    .map((r) => r.date)
    .filter(Boolean)
    .sort() as string[];
  const effectiveStart = windowStart || (planDates.length ? planDates[0] : '');
  const effectiveEnd = windowEnd || (planDates.length ? planDates[planDates.length - 1] : '');

  // 2. Region Mapping & Filtering
  // Build a map of each analyst's primary region based on planning tasks
  const analystRegionCounts = new Map<string, Map<string, number>>();
  planRowsInScope.forEach((r) => {
    if (!r.employee || !r.employee.trim()) return;
    const name = r.employee.trim();
    const reg = r.region || mapGeographyToRegion(r.geography);
    if (!reg) return;

    if (!analystRegionCounts.has(name)) {
      analystRegionCounts.set(name, new Map());
    }
    const counts = analystRegionCounts.get(name)!;
    counts.set(reg, (counts.get(reg) || 0) + 1);
  });

  const analystPrimaryRegion = new Map<string, string>();
  const regionAnalystsSet = new Set<string>();

  analystRegionCounts.forEach((counts, name) => {
    let topReg = '';
    let maxC = -1;
    counts.forEach((c, reg) => {
      if (c > maxC) {
        maxC = c;
        topReg = reg;
      }
      if (!isAllRegions && reg === selectedRegion) {
        regionAnalystsSet.add(name);
      }
    });
    analystPrimaryRegion.set(name, topReg);
  });

  // Filter planning rows by region if a specific region is selected
  if (!isAllRegions) {
    planRowsInScope = planRowsInScope.filter((r) => {
      const taskReg = r.region || mapGeographyToRegion(r.geography);
      if (taskReg === selectedRegion) return true;
      // If task has no geography specified, check if analyst belongs to this region
      if (!taskReg && r.employee && regionAnalystsSet.has(r.employee.trim())) {
        return true;
      }
      return false;
    });
  }

  // 3. Determine Scope for Employee (Data Pull / Timesheet) Rows
  const timesheetWeeks = new Set<string>();
  planRowsInScope.forEach((r) => {
    if (r.date) {
      const wk = weekStartKey(r.date);
      if (wk) timesheetWeeks.add(wk);
    }
  });

  let empRowsInScope = employeeRows.filter((r) => {
    // Category check
    const rawType = r.type.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const isTracked = normalizeTrackedCategory(r.type) !== null || TRACKED_TYPES.has(rawType);
    if (!isTracked) return false;

    // Date check
    if (effectiveStart && effectiveEnd && r.date) {
      if (r.date < effectiveStart || r.date > effectiveEnd) {
        const wk = weekStartKey(r.date);
        if (!wk || !timesheetWeeks.has(wk)) return false;
      }
    }

    // Region check on analyst: If a region is selected, only check analysts of this region
    if (!isAllRegions) {
      const empName = r.name || '';
      let matchesRegion = false;
      for (const targetName of regionAnalystsSet) {
        if (matchAnalyst(targetName, empName)) {
          matchesRegion = true;
          break;
        }
      }
      if (!matchesRegion) return false;
    }

    return true;
  });

  // 4. Collect Unique Analysts in the Active Regional Scope
  const analystMap = new Map<string, { canonicalName: string; nameKey: string; region?: string }>();

  // From Daily Planning Sheet
  planRowsInScope.forEach((r) => {
    if (r.employee && r.employee.trim()) {
      const clean = r.employee.trim();
      const key = clean.toLowerCase();
      const reg = analystPrimaryRegion.get(clean) || r.region || mapGeographyToRegion(r.geography) || undefined;
      if (!analystMap.has(key)) {
        analystMap.set(key, { canonicalName: clean, nameKey: key, region: reg });
      }
    }
  });

  // From Data Pull Sheet
  empRowsInScope.forEach((r) => {
    if (r.name && r.name.trim()) {
      const clean = r.name.trim();
      const key = r.nameKey || clean.toLowerCase();
      let existingKey: string | null = null;
      for (const [k, val] of analystMap.entries()) {
        if (matchAnalyst(val.canonicalName, clean)) {
          existingKey = k;
          break;
        }
      }
      if (!existingKey) {
        analystMap.set(key, { canonicalName: clean, nameKey: key, region: selectedRegion !== 'All Regions' ? selectedRegion : undefined });
      }
    }
  });

  // Filter for specific analyst if user explicitly requested one
  let targetAnalysts = Array.from(analystMap.values());
  if (specificAnalystName && specificAnalystName.trim()) {
    targetAnalysts = targetAnalysts.filter((a) =>
      matchAnalyst(a.canonicalName, specificAnalystName)
    );
  }

  // Sort analysts alphabetically
  targetAnalysts.sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));

  const allFlagged: FlaggedTask[] = [];
  const allClean: CleanTask[] = [];
  const analystSummaries: AnalystSummary[] = [];

  let overallFlaggedMinutes = 0;
  let overallTotalMinutes = 0;
  let globalTaskCounter = 1;

  // 5. Cross-check entries per analyst
  for (const analyst of targetAnalysts) {
    const { canonicalName, nameKey, region } = analyst;

    // Daily planning items for this analyst
    const analystPlanRows = planRowsInScope.filter((r) =>
      matchAnalyst(r.employee, canonicalName)
    );

    // Data pull rows for this analyst
    const analystPullRows = empRowsInScope.filter((r) =>
      matchAnalyst(r.name, canonicalName) || r.nameKey === nameKey
    );

    // Prepare Plan Items
    const planItems: PreparedPlanItem[] = [];
    analystPlanRows.forEach((r, idx) => {
      const statusRaw = String(r.status || '').trim();
      const isDone = statusRaw.toLowerCase() === 'done';
      const prodCat = resolveProductionCategory(r.production);
      const revCat = resolveReviewCategory(r.review);
      const itemRegion = r.region || mapGeographyToRegion(r.geography) || region;

      if (prodCat) {
        planItems.push({
          id: `plan-${nameKey}-prod-${idx + 1}`,
          analyst: canonicalName,
          region: itemRegion,
          assetName: r.assetName,
          assetKey: r.assetKey || normAsset(r.assetName),
          date: r.date,
          category: prodCat,
          axis: 'production',
          status: statusRaw,
          isDone
        });
      }

      if (revCat) {
        planItems.push({
          id: `plan-${nameKey}-rev-${idx + 1}`,
          analyst: canonicalName,
          region: itemRegion,
          assetName: r.assetName,
          assetKey: r.assetKey || normAsset(r.assetName),
          date: r.date,
          category: revCat,
          axis: 'review',
          status: statusRaw,
          isDone
        });
      }
    });

    // Prepare Pull Items
    const pullItems: PreparedPullItem[] = analystPullRows.map((r, idx) => {
      const rawTypeKey = r.type.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const typeInfo = TYPE_MAP[rawTypeKey];
      const category = normalizeTrackedCategory(rawTypeKey) || (typeInfo ? typeInfo.category : null);
      const axis = typeInfo?.axis || (category?.includes(' R ') ? 'review' : 'production');

      return {
        id: `pull-${nameKey}-${idx + 1}`,
        analyst: canonicalName,
        region,
        assetName: r.assetName,
        assetKey: r.assetKey || normAsset(r.assetName),
        date: r.date,
        minutes: r.minutes || 0,
        rawType: r.type,
        category,
        axis
      };
    });

    // Track matching for this analyst
    const matchedPlanIds = new Set<string>();
    const analystFlagged: FlaggedTask[] = [];
    const analystClean: CleanTask[] = [];
    let analystFlaggedMinutes = 0;
    let analystTotalMinutes = 0;

    const discrepanciesByType: Record<NoteTagType, number> = {
      mismatch: 0,
      'status-not-done': 0,
      'missing-employer': 0,
      'missing-employee': 0,
      unmapped: 0
    };

    // Reconcile timesheet entries
    for (const pull of pullItems) {
      analystTotalMinutes += pull.minutes;

      if (!pull.category) {
        const flagItem: FlaggedTask = {
          id: `flagged-${globalTaskCounter++}`,
          analyst: canonicalName,
          region: pull.region,
          asset: pull.assetName,
          date: pull.date,
          empSide: '—',
          erSide: pull.rawType,
          minutes: pull.minutes,
          note: `Unrecognized task type code: "${pull.rawType}"`,
          tag: 'unmapped'
        };
        analystFlagged.push(flagItem);
        discrepanciesByType.unmapped++;
        analystFlaggedMinutes += pull.minutes;
        continue;
      }

      // 1. Exact Clean Match
      const cleanPlanMatch = planItems.find(
        (p) =>
          !matchedPlanIds.has(p.id) &&
          p.assetKey === pull.assetKey &&
          p.category === pull.category
      );

      if (cleanPlanMatch) {
        matchedPlanIds.add(cleanPlanMatch.id);
        if (!cleanPlanMatch.isDone) {
          const flagItem: FlaggedTask = {
            id: `flagged-${globalTaskCounter++}`,
            analyst: canonicalName,
            region: cleanPlanMatch.region || pull.region,
            asset: pull.assetName,
            date: pull.date || cleanPlanMatch.date,
            empSide: cleanPlanMatch.category,
            erSide: pull.rawType,
            minutes: pull.minutes,
            note: `Category matches (${pull.category}), but status in Daily Planning Sheet is "${cleanPlanMatch.status || 'blank'}" (expected "Done")`,
            tag: 'status-not-done'
          };
          analystFlagged.push(flagItem);
          discrepanciesByType['status-not-done']++;
          analystFlaggedMinutes += pull.minutes;
        } else {
          analystClean.push({
            id: `clean-${globalTaskCounter++}`,
            analyst: canonicalName,
            region: cleanPlanMatch.region || pull.region,
            asset: pull.assetName,
            date: pull.date || cleanPlanMatch.date,
            category: pull.category,
            minutes: pull.minutes
          });
        }
        continue;
      }

      // 2. Same-Axis Category Mismatch
      const sameAxisMismatch = planItems.find(
        (p) => !matchedPlanIds.has(p.id) && p.assetKey === pull.assetKey && p.axis === pull.axis
      );

      if (sameAxisMismatch) {
        matchedPlanIds.add(sameAxisMismatch.id);
        const flagItem: FlaggedTask = {
          id: `flagged-${globalTaskCounter++}`,
          analyst: canonicalName,
          region: sameAxisMismatch.region || pull.region,
          asset: pull.assetName,
          date: pull.date || sameAxisMismatch.date,
          empSide: sameAxisMismatch.category,
          erSide: pull.rawType,
          minutes: pull.minutes,
          note: `Category mismatch: Daily Planning Sheet has "${sameAxisMismatch.category}" but Timesheet has "${pull.rawType}"`,
          tag: 'mismatch'
        };
        analystFlagged.push(flagItem);
        discrepanciesByType.mismatch++;
        analystFlaggedMinutes += pull.minutes;
        continue;
      }

      // 3. General Mismatch across any axis for this asset
      const generalMismatch = planItems.find(
        (p) => !matchedPlanIds.has(p.id) && p.assetKey === pull.assetKey
      );

      if (generalMismatch) {
        matchedPlanIds.add(generalMismatch.id);
        const flagItem: FlaggedTask = {
          id: `flagged-${globalTaskCounter++}`,
          analyst: canonicalName,
          region: generalMismatch.region || pull.region,
          asset: pull.assetName,
          date: pull.date || generalMismatch.date,
          empSide: generalMismatch.category,
          erSide: pull.rawType,
          minutes: pull.minutes,
          note: `Category mismatch: Daily Planning Sheet has "${generalMismatch.category}" but Timesheet has "${pull.rawType}"`,
          tag: 'mismatch'
        };
        analystFlagged.push(flagItem);
        discrepanciesByType.mismatch++;
        analystFlaggedMinutes += pull.minutes;
        continue;
      }

      // 4. Missing in Daily Planning Sheet
      const flagItem: FlaggedTask = {
        id: `flagged-${globalTaskCounter++}`,
        analyst: canonicalName,
        region: pull.region,
        asset: pull.assetName,
        date: pull.date,
        empSide: '—',
        erSide: pull.rawType,
        minutes: pull.minutes,
        note: `Logged in Data Pull Sheet; no matching entry found in Daily Planning Sheet for ${canonicalName}`,
        tag: 'missing-employer'
      };
      analystFlagged.push(flagItem);
      discrepanciesByType['missing-employer']++;
      analystFlaggedMinutes += pull.minutes;
    }

    // 5. Remaining plan items missing in Data Pull Sheet
    for (const plan of planItems) {
      if (!matchedPlanIds.has(plan.id)) {
        const flagItem: FlaggedTask = {
          id: `flagged-${globalTaskCounter++}`,
          analyst: canonicalName,
          region: plan.region,
          asset: plan.assetName,
          date: plan.date,
          empSide: plan.category,
          erSide: '—',
          minutes: 0,
          note: `Selected "${plan.category}" in Daily Planning Sheet; no matching entry in Data Pull Sheet for ${canonicalName}`,
          tag: 'missing-employee'
        };
        analystFlagged.push(flagItem);
        discrepanciesByType['missing-employee']++;
      }
    }

    // Record Analyst Summary
    analystSummaries.push({
      analystName: canonicalName,
      nameKey,
      region: region || analystPrimaryRegion.get(canonicalName) || selectedRegion,
      cleanCount: analystClean.length,
      flaggedCount: analystFlagged.length,
      flaggedMinutes: Math.round(analystFlaggedMinutes * 10) / 10,
      totalMinutes: Math.round(analystTotalMinutes * 10) / 10,
      totalTasks: analystClean.length + analystFlagged.length,
      discrepanciesByType,
      status: analystFlagged.length === 0 ? 'clean' : 'has-discrepancies'
    });

    allFlagged.push(...analystFlagged);
    allClean.push(...analystClean);
    overallFlaggedMinutes += analystFlaggedMinutes;
    overallTotalMinutes += analystTotalMinutes;
  }

  // Sort overall tasks by date and analyst
  allFlagged.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') ||
    a.analyst.localeCompare(b.analyst) ||
    a.asset.localeCompare(b.asset)
  );

  allClean.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') ||
    a.analyst.localeCompare(b.analyst) ||
    a.asset.localeCompare(b.asset)
  );

  // Sort summaries: analysts with discrepancies first, then by task count
  analystSummaries.sort((a, b) => {
    if (a.flaggedCount > 0 && b.flaggedCount === 0) return -1;
    if (a.flaggedCount === 0 && b.flaggedCount > 0) return 1;
    return b.flaggedCount - a.flaggedCount || a.analystName.localeCompare(b.analystName);
  });

  return {
    selectedWeek: selectedWeekId || 'All Weeks',
    selectedRegion: selectedRegion || 'All Regions',
    windowStart: effectiveStart,
    windowEnd: effectiveEnd,
    analysts: analystSummaries,
    flagged: allFlagged,
    clean: allClean,
    flaggedMinutes: Math.round(overallFlaggedMinutes * 10) / 10,
    totalMinutes: Math.round(overallTotalMinutes * 10) / 10,
    totalLines: allFlagged.length + allClean.length,
    employeeName: targetAnalysts.length === 1 ? targetAnalysts[0].canonicalName : `All Analysts (${targetAnalysts.length})`,
    empFile: empFileName,
    erFile: erFileName,
    trackedRowCount: empRowsInScope.length,
    totalRowCount: employeeRows.length,
    runAt: new Date().toLocaleString()
  };
}

export function buildReportMatrix(
  rep: AuditReportData,
  flaggedList: FlaggedTask[]
): (string | number)[][] {
  const rows: (string | number)[][] = [
    [
      'Section',
      'Region',
      'Analyst',
      'Asset Name',
      'Date (DD-MM-YYYY)',
      'Daily Planning Sheet (Category)',
      'Data Pull Sheet (Logged Type)',
      'Minutes',
      'Audit Finding / Note'
    ]
  ];

  flaggedList.forEach((f) => {
    rows.push([
      'Flagged',
      f.region || rep.selectedRegion,
      f.analyst,
      f.asset,
      formatDateDDMMYYYY(f.date),
      f.empSide,
      f.erSide,
      f.minutes,
      f.note
    ]);
  });

  rep.clean.forEach((c) => {
    rows.push([
      'Matched Clean',
      c.region || rep.selectedRegion,
      c.analyst,
      c.asset,
      formatDateDDMMYYYY(c.date),
      c.category,
      c.category,
      c.minutes,
      'Matches (Status: Done)'
    ]);
  });

  rows.push([]);
  rows.push(['Summary Information']);
  rows.push(['Audit Region', rep.selectedRegion]);
  rows.push(['Week Identifier', rep.selectedWeek]);
  rows.push(['Total Analysts Audited', rep.analysts.length]);
  rows.push(['Data Pull Sheet', rep.empFile]);
  rows.push(['Daily Planning Sheet', rep.erFile]);
  rows.push(['Audit Date Window', `${formatDateDDMMYYYY(rep.windowStart)} to ${formatDateDDMMYYYY(rep.windowEnd)}`]);
  rows.push(['Total Tasks Compared', rep.clean.length + flaggedList.length]);
  rows.push(['Clean Matched Tasks', rep.clean.length]);
  rows.push(['Flagged Tasks (Current View)', flaggedList.length]);
  rows.push(['Flagged Tasks (All)', rep.flagged.length]);
  rows.push(['Flagged Minutes (All)', rep.flaggedMinutes]);
  rows.push(['Total Logged Minutes', rep.totalMinutes]);
  rows.push(['Run Timestamp', rep.runAt]);

  rows.push([]);
  rows.push(['Analyst Roster Breakdown']);
  rows.push(['Region', 'Analyst Name', 'Clean Tasks', 'Flagged Tasks', 'Flagged Minutes', 'Total Minutes', 'Status']);
  rep.analysts.forEach((a) => {
    rows.push([
      a.region || rep.selectedRegion,
      a.analystName,
      a.cleanCount,
      a.flaggedCount,
      a.flaggedMinutes,
      a.totalMinutes,
      a.flaggedCount === 0 ? 'All Clean' : `${a.flaggedCount} Discrepancies`
    ]);
  });

  return rows;
}

export function exportReportAsCsv(rep: AuditReportData, flaggedList: FlaggedTask[]): void {
  const rows = buildReportMatrix(rep, flaggedList);
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? '');
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const cleanReg = (rep.selectedRegion || 'all').toLowerCase().replace(/[^a-z0-9]/g, '-');
  triggerFileDownload(
    blob,
    `ledger-audit-${cleanReg}-week-${rep.selectedWeek || 'all'}-${formatDateDDMMYYYY(rep.windowStart)}-to-${formatDateDDMMYYYY(rep.windowEnd)}.csv`
  );
}

export function exportReportAsXlsx(rep: AuditReportData, flaggedList: FlaggedTask[]): void {
  const rows = buildReportMatrix(rep, flaggedList);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Report');
  const cleanReg = (rep.selectedRegion || 'all').toLowerCase().replace(/[^a-z0-9]/g, '-');
  XLSX.writeFile(
    wb,
    `ledger-audit-${cleanReg}-week-${rep.selectedWeek || 'all'}-${formatDateDDMMYYYY(rep.windowStart)}-to-${formatDateDDMMYYYY(rep.windowEnd)}.xlsx`
  );
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
