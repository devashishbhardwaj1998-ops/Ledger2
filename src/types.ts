export const SUPPORTED_REGIONS = [
  'The US/UK',
  'France',
  'DACH',
  'Benelux',
  'Southern Europe',
  'NORCEE'
] as const;

export type RegionType = (typeof SUPPORTED_REGIONS)[number] | 'The UK/US' | 'All Regions';

export const DEFAULT_REGION_COUNTRY_CODES: Record<string, string[]> = {
  'The US/UK': ['US', 'GB'],
  'The UK/US': ['US', 'GB'],
  'France': ['FR'],
  'DACH': ['DE', 'AT', 'CH'],
  'Benelux': ['BE', 'NL', 'LU'],
  'Southern Europe': ['ES', 'IT', 'PT', 'GR', 'CY', 'MT'],
  'NORCEE': ['PL', 'CZ', 'SE', 'NO', 'DK', 'FI', 'EE', 'LV', 'LT', 'SK', 'HU', 'RO', 'BG']
};

export const REGION_COUNTRY_CODES = DEFAULT_REGION_COUNTRY_CODES;

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
  country?: string; // Column C: titled "Country"
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
  countryCodes: string[];
  analystCount: number;
  taskCount: number;
  pullCount?: number;
}

export type NoteTagType = 'mismatch' | 'missing-employer' | 'missing-employee' | 'unmapped' | 'status-not-done';

export interface FlaggedTask {
  id: string;
  analyst: string;
  region?: string;
  country?: string;
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
  country?: string;
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
  targetCountryCodes: string[];
  excludedCountDueToCountry: number;
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
