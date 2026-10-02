export const SUPPORTED_REGIONS = [
  'The UK/US',
  'France',
  'DACH',
  'Benelux',
  'Southern Europe',
  'NORCEE'
] as const;

export type RegionType = (typeof SUPPORTED_REGIONS)[number] | 'All Regions';

export interface RawEmployeeRow {
  name: string;
  nameKey: string;
  firstName: string;
  lastName: string;
  userId: string | null;
  assetName: string;
  assetKey: string;
  date: string | null;
  minutes: number;
  type: string;
}

export interface RawEmployerRow {
  assetName: string;
  assetKey: string;
  date: string | null;
  production: string;
  review: string;
  status: string;
  employee?: string;
  week?: string;
  day?: string;
  geography?: string;
  region?: string;
  inTheNews?: string;
}

export interface EmployeeInfo {
  firstName: string;
  lastName: string;
  display: string;
}

export interface WeekInfo {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  analystCount: number;
  taskCount: number;
}

export interface RegionInfo {
  name: RegionType;
  analystCount: number;
  taskCount: number;
}

export type NoteTagType = 'mismatch' | 'missing-employer' | 'missing-employee' | 'unmapped' | 'status-not-done';

export interface FlaggedTask {
  id: string;
  analyst: string;
  region?: string;
  asset: string;
  date: string | null;
  empSide: string;
  erSide: string;
  minutes: number;
  note: string;
  tag: NoteTagType;
}

export interface CleanTask {
  id: string;
  analyst: string;
  region?: string;
  asset: string;
  date: string | null;
  category: string;
  minutes: number;
}

export interface AnalystSummary {
  analystName: string;
  nameKey: string;
  region?: string;
  cleanCount: number;
  flaggedCount: number;
  flaggedMinutes: number;
  totalMinutes: number;
  totalTasks: number;
  discrepanciesByType: Record<NoteTagType, number>;
  status: 'clean' | 'has-discrepancies';
}

export interface AuditReportData {
  selectedWeek: string;
  selectedRegion: string;
  windowStart: string;
  windowEnd: string;
  analysts: AnalystSummary[];
  flagged: FlaggedTask[];
  clean: CleanTask[];
  flaggedMinutes: number;
  totalMinutes: number;
  totalLines: number;
  employeeName?: string;
  empFile: string;
  erFile: string;
  trackedRowCount: number;
  totalRowCount: number;
  runAt: string;
}

export interface NoteTagMeta {
  tag: NoteTagType;
  label: string;
  description: string;
}
