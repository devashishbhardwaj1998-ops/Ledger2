import { RawEmployeeRow, RawEmployerRow } from '../types';
import { normAsset, normDate, mapGeographyToRegion } from './parser';

export function getSampleDataPullSheet(): RawEmployeeRow[] {
  const rawList = [
    // --- THE UK/US: Jaynam Gandhi (Week 202638) ---
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Slamcore', date: '14-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Deucalion Aviation', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Synchrony Group', date: '15-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Distyl AI', date: '15-Sep-26', mins: 40, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'PIB Group', date: '15-Sep-26', mins: 60, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Aegis Sciences Corporation', date: '15-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Puzzle', date: '15-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Denali Universal Services', date: '15-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'La Chiquita Tortilla', date: '16-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Interstate Electrical Services Corporation', date: '16-Sep-26', mins: 65, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Cloud9 Esports', date: '16-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Norbev', date: '16-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Aquaspersions', date: '16-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Scoreline', date: '16-Sep-26', mins: 60, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Connectd', date: '17-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'All Things Dairy', date: '17-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Firefish Software', date: '17-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Alpine Health', date: '17-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Shared Tower', date: '17-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Tonic Health', date: '18-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Optalysys', date: '18-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'TFI Marine', date: '18-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Greywolf Therapeutics', date: '18-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'CHARM Therapeutics', date: '18-Sep-26', mins: 60, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'SEO', date: '18-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Second Nature Brands', date: '19-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'SeqCenter', date: '19-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'US Eye', date: '19-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Coast', date: '19-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'SugaROx', date: '19-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Phagenesis', date: '19-Sep-26', mins: 55, type: 'updatedReviewFull' },
    // Discrepancy test: Kingswood Mobility Group logged as updatedFull instead of review
    { first: 'Jaynam', last: 'Gandhi', uid: 'EMP-301', asset: 'Kingswood Mobility Group', date: '14-Sep-26', mins: 45, type: 'updatedFull' },

    // --- THE UK/US: Sanjana Khiani (Week 202638) ---
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Seen Health', date: '14-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Fullscript', date: '14-Sep-26', mins: 90, type: 'updatedFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Fullscript', date: '14-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Xapien', date: '15-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Roma Finance', date: '15-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Extrastaff', date: '15-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Crew Clothing Company', date: '15-Sep-26', mins: 60, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Stream', date: '15-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'CCTV Camera Pros', date: '15-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Tekskills', date: '16-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'OPEX Corporation', date: '16-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Semgrep', date: '16-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Outbuild', date: '16-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Archy', date: '16-Sep-26', mins: 45, type: 'updatedLimited' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'Archy', date: '16-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'MBF Inspection Services', date: '16-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Sanjana', last: 'Khiani', uid: 'EMP-302', asset: 'RapidRatings', date: '17-Sep-26', mins: 50, type: 'updatedReviewFull' },

    // --- THE UK/US: Dhruv Garg (Week 202638) ---
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Scott Bader', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Bionical Emas', date: '14-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Shire Leasing', date: '14-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Sanctuary & Seven Group', date: '14-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Welbeck', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Valent', date: '14-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Red Sift', date: '14-Sep-26', mins: 30, type: 'updatedReviewLimited' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'AvalonBay Communities', date: '14-Sep-26', mins: 75, type: 'updatedFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'AvalonBay Communities', date: '14-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Vivmark Residential', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Shippo', date: '14-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Ontic', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Dhruv', last: 'Garg', uid: 'EMP-303', asset: 'Startline Motor Finance', date: '15-Sep-26', mins: 35, type: 'updatedReviewLimited' },

    // --- SOUTHERN EUROPE: Aditi Manikandan (Week 202638) ---
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Afesa / Mendiola', date: '14-Sep-26', mins: 120, type: 'full' },
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Aquanaria', date: '14-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Plastigaur', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Cosmelux Group', date: '14-Sep-26', mins: 60, type: 'updatedReviewFull' },
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Motocard Group', date: '15-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Lantania Group', date: '15-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Bracco Group', date: '15-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Aditi', last: 'Manikandan', uid: 'EMP-401', asset: 'Latteria Soresina', date: '15-Sep-26', mins: 50, type: 'updatedReviewFull' },

    // --- SOUTHERN EUROPE: Kriti K (Week 202638) ---
    { first: 'Kriti', last: 'K', uid: 'EMP-402', asset: 'Alimerka Group', date: '15-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Kriti', last: 'K', uid: 'EMP-402', asset: 'Vithas Group', date: '15-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Kriti', last: 'K', uid: 'EMP-402', asset: 'Dcycle Group', date: '15-Sep-26', mins: 45, type: 'updatedReviewFull' },
    { first: 'Kriti', last: 'K', uid: 'EMP-402', asset: 'Korus Group', date: '15-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Kriti', last: 'K', uid: 'EMP-402', asset: 'Veneta Cucine', date: '16-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Kriti', last: 'K', uid: 'EMP-402', asset: 'Scrigno Group', date: '16-Sep-26', mins: 55, type: 'updatedReviewFull' },

    // --- FRANCE: Lucas Mercier (Week 202638) ---
    { first: 'Lucas', last: 'Mercier', uid: 'EMP-501', asset: 'Babilou Group', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Lucas', last: 'Mercier', uid: 'EMP-501', asset: 'Kardham', date: '15-Sep-26', mins: 35, type: 'updatedReviewLimited' },
    { first: 'Lucas', last: 'Mercier', uid: 'EMP-501', asset: 'ManoMano France', date: '16-Sep-26', mins: 55, type: 'updatedReviewFull' },

    // --- DACH: Stefan Meier (Week 202638) ---
    { first: 'Stefan', last: 'Meier', uid: 'EMP-601', asset: 'Brose Group', date: '14-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Stefan', last: 'Meier', uid: 'EMP-601', asset: 'TeamViewer DE', date: '15-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Stefan', last: 'Meier', uid: 'EMP-601', asset: 'Sennheiser Electronic', date: '16-Sep-26', mins: 35, type: 'updatedReviewLimited' },

    // --- BENELUX: Lars Van Dijk (Week 202638) ---
    { first: 'Lars', last: 'Van Dijk', uid: 'EMP-701', asset: 'Adyen N.V.', date: '15-Sep-26', mins: 55, type: 'updatedReviewFull' },
    { first: 'Lars', last: 'Van Dijk', uid: 'EMP-701', asset: 'Coolblue Logistics', date: '16-Sep-26', mins: 35, type: 'updatedReviewLimited' },

    // --- NORCEE: Astrid Lindqvist (Week 202638) ---
    { first: 'Astrid', last: 'Lindqvist', uid: 'EMP-801', asset: 'Klarna Nordic', date: '14-Sep-26', mins: 50, type: 'updatedReviewFull' },
    { first: 'Astrid', last: 'Lindqvist', uid: 'EMP-801', asset: 'InPost Poland', date: '16-Sep-26', mins: 40, type: 'updatedReviewLimited' }
  ];

  return rawList.map((r) => {
    const name = `${r.first} ${r.last}`.trim();
    return {
      name,
      nameKey: name.toLowerCase(),
      firstName: r.first,
      lastName: r.last,
      userId: r.uid,
      assetName: r.asset,
      assetKey: normAsset(r.asset),
      date: normDate(r.date),
      minutes: r.mins,
      type: r.type
    };
  });
}

export function getSampleEmployerPlanningSheet(): RawEmployerRow[] {
  const rawList = [
    // --- THE UK/US: Jaynam Gandhi (Week 202638) ---
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Slamcore', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Deucalion Aviation', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Kingswood Mobility Group', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Synchrony Group', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Distyl AI', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'PIB Group', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Aegis Sciences Corporation', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Puzzle', geo: 'US', news: 'Yes', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Denali Universal Services', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'La Chiquita Tortilla', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Interstate Electrical Services Corporation', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Cloud9 Esports', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Norbev', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Aquaspersions', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Scoreline', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Thursday', date: '17-Sep-26', asset: 'Connectd', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Thursday', date: '17-Sep-26', asset: 'All Things Dairy', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Thursday', date: '17-Sep-26', asset: 'Firefish Software', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Thursday', date: '17-Sep-26', asset: 'Alpine Health', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Thursday', date: '17-Sep-26', asset: 'Shared Tower', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Friday', date: '18-Sep-26', asset: 'Tonic Health', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Friday', date: '18-Sep-26', asset: 'Optalysys', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Friday', date: '18-Sep-26', asset: 'TFI Marine', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Friday', date: '18-Sep-26', asset: 'Greywolf Therapeutics', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Friday', date: '18-Sep-26', asset: 'CHARM Therapeutics', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Friday', date: '18-Sep-26', asset: 'SEO', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Saturday', date: '19-Sep-26', asset: 'Second Nature Brands', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Saturday', date: '19-Sep-26', asset: 'SeqCenter', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Saturday', date: '19-Sep-26', asset: 'US Eye', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Saturday', date: '19-Sep-26', asset: 'Coast', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Saturday', date: '19-Sep-26', asset: 'SugaROx', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },
    { week: '202638', day: 'Saturday', date: '19-Sep-26', asset: 'Phagenesis', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Jaynam Gandhi' },

    // --- THE UK/US: Sanjana Khiani (Week 202638) ---
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Seen Health', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Fullscript', geo: 'US', news: 'Yes', prod: 'Update (full)', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Xapien', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Roma Finance', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Extrastaff', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Crew Clothing Company', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Stream', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'CCTV Camera Pros', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Tekskills', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'OPEX Corporation', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Semgrep', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Outbuild', geo: 'US', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Archy', geo: 'US', news: 'Yes', prod: 'Update (limited)', rev: 'Update R (limited)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'MBF Inspection Services', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },
    { week: '202638', day: 'Thursday', date: '17-Sep-26', asset: 'RapidRatings', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Sanjana Khiani' },

    // --- THE UK/US: Dhruv Garg (Week 202638) ---
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Scott Bader', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Bionical Emas', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Shire Leasing', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Sanctuary & Seven Group', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Welbeck', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Valent', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Red Sift', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'AvalonBay Communities', geo: 'US', news: 'Yes', prod: 'Update (full)', rev: 'Update R (full)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Vivmark Residential', geo: 'US', news: 'Yes', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Shippo', geo: 'US', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Ontic', geo: 'UK NICE', news: 'Yes', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Dhruv Garg' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Startline Motor Finance', geo: 'UK NICE', news: '', prod: '', rev: 'Update R (limited)', status: 'Pending', analyst: 'Dhruv Garg' },

    // --- SOUTHERN EUROPE: Aditi Manikandan (Week 202638) ---
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Afesa / Mendiola', geo: 'SE', news: '', prod: 'Full', rev: '', status: 'Done', analyst: 'Aditi Manikandan' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Aquanaria', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Aditi Manikandan' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Plastigaur', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Aditi Manikandan' },
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Cosmelux Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Aditi Manikandan' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Motocard Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Aditi Manikandan' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Lantania Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Aditi Manikandan' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Bracco Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Aditi Manikandan' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Latteria Soresina', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Aditi Manikandan' },

    // --- SOUTHERN EUROPE: Kriti K (Week 202638) ---
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Alimerka Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Kriti K' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Vithas Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Kriti K' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Dcycle Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Kriti K' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Korus Group', geo: 'SE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Kriti K' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Veneta Cucine', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Kriti K' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Scrigno Group', geo: 'SE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Kriti K' },

    // --- FRANCE: Lucas Mercier (Week 202638) ---
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Babilou Group', geo: 'France', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Lucas Mercier' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Kardham', geo: 'France', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Lucas Mercier' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'ManoMano France', geo: 'France', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Lucas Mercier' },

    // --- DACH: Stefan Meier (Week 202638) ---
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Brose Group', geo: 'DACH', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Stefan Meier' },
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'TeamViewer DE', geo: 'DACH', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Stefan Meier' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Sennheiser Electronic', geo: 'DACH', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Stefan Meier' },

    // --- BENELUX: Lars Van Dijk (Week 202638) ---
    { week: '202638', day: 'Tuesday', date: '15-Sep-26', asset: 'Adyen N.V.', geo: 'Benelux', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Lars Van Dijk' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'Coolblue Logistics', geo: 'Benelux', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Lars Van Dijk' },

    // --- NORCEE: Astrid Lindqvist (Week 202638) ---
    { week: '202638', day: 'Monday', date: '14-Sep-26', asset: 'Klarna Nordic', geo: 'NORCEE', news: '', prod: '', rev: 'Update R (full)', status: 'Done', analyst: 'Astrid Lindqvist' },
    { week: '202638', day: 'Wednesday', date: '16-Sep-26', asset: 'InPost Poland', geo: 'NORCEE', news: '', prod: '', rev: 'Update R (limited)', status: 'Done', analyst: 'Astrid Lindqvist' }
  ];

  return rawList.map((r) => ({
    week: r.week,
    day: r.day,
    assetName: r.asset,
    assetKey: normAsset(r.asset),
    date: normDate(r.date),
    geography: r.geo,
    region: mapGeographyToRegion(r.geo) || undefined,
    inTheNews: r.news,
    production: r.prod,
    review: r.rev,
    status: r.status,
    employee: r.analyst
  }));
}
