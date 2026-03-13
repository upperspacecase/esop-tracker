export interface Participant {
  id: number;
  name: string;
  hire_date: string;
  termination_date: string | null;
}

export interface Valuation {
  date: string;
  price: number;
  notes: string;
}

export interface Transaction {
  participant_id: number;
  date: string;
  type: "allocation" | "dividend_reinvest" | "forfeiture_in" | "distribution" | "forfeiture_out";
  shares: number;
  notes?: string;
}

export interface VestingEvent {
  participant_id: number;
  date: string;
  shares: number;
}

const ADDITION_TYPES = ["allocation", "dividend_reinvest", "forfeiture_in"];

// --- Demo Data ---

export const participants: Participant[] = [
  { id: 1, name: "Alice Chen", hire_date: "2020-03-15", termination_date: null },
  { id: 2, name: "Bob Martinez", hire_date: "2021-06-01", termination_date: null },
  { id: 3, name: "Carol Nguyen", hire_date: "2019-01-10", termination_date: null },
  { id: 4, name: "David Park", hire_date: "2018-05-20", termination_date: "2024-08-15" },
  { id: 5, name: "Elena Rossi", hire_date: "2022-02-01", termination_date: null },
];

export const valuations: Valuation[] = [
  { date: "2018-12-31", price: 8.50, notes: "Initial valuation" },
  { date: "2019-12-31", price: 10.00, notes: "Annual appraisal" },
  { date: "2020-12-31", price: 11.50, notes: "Annual appraisal" },
  { date: "2021-12-31", price: 13.00, notes: "Annual appraisal" },
  { date: "2022-12-31", price: 12.25, notes: "Annual appraisal — market correction" },
  { date: "2023-12-31", price: 15.00, notes: "Annual appraisal" },
  { date: "2024-12-31", price: 18.50, notes: "Annual appraisal" },
  { date: "2025-12-31", price: 22.00, notes: "Annual appraisal" },
];

function yearlyAllocations(pid: number, startYear: number, endYear: number, shares: number): Transaction[] {
  const txns: Transaction[] = [];
  for (let y = startYear; y <= endYear; y++) {
    txns.push({ participant_id: pid, date: `${y}-01-15`, type: "allocation", shares });
  }
  return txns;
}

export const transactions: Transaction[] = [
  // Carol (id 3) — since 2019
  ...yearlyAllocations(3, 2019, 2025, 500),
  { participant_id: 3, date: "2023-06-01", type: "dividend_reinvest", shares: 45.5, notes: "Annual dividend" },
  { participant_id: 3, date: "2025-06-01", type: "dividend_reinvest", shares: 62.0, notes: "Annual dividend" },

  // Alice (id 1) — since 2020
  ...yearlyAllocations(1, 2020, 2025, 400),
  { participant_id: 1, date: "2024-06-01", type: "dividend_reinvest", shares: 28.0, notes: "Annual dividend" },

  // Bob (id 2) — since 2021
  ...yearlyAllocations(2, 2021, 2025, 300),
  { participant_id: 2, date: "2024-09-01", type: "distribution", shares: 150, notes: "Partial distribution — hardship" },

  // David (id 4) — 2018-2024, terminated
  ...yearlyAllocations(4, 2018, 2024, 350),
  { participant_id: 4, date: "2024-08-15", type: "forfeiture_out", shares: 420, notes: "Unvested shares forfeited on termination" },
  { participant_id: 4, date: "2024-09-01", type: "distribution", shares: 1030, notes: "Termination distribution" },

  // Elena (id 5) — since 2022
  ...yearlyAllocations(5, 2022, 2025, 250),

  // Forfeitures reallocated from David to Carol & Alice
  { participant_id: 3, date: "2024-10-01", type: "forfeiture_in", shares: 252, notes: "Reallocated from D. Park forfeiture" },
  { participant_id: 1, date: "2024-10-01", type: "forfeiture_in", shares: 168, notes: "Reallocated from D. Park forfeiture" },
];

// Vesting: 6-year graded (0%, 20%, 20%, 20%, 20%, 20%) — starts vesting in year 2
function buildVesting(pid: number, allocStartYear: number, allocEndYear: number, sharesPerYear: number): VestingEvent[] {
  const events: VestingEvent[] = [];
  const vestPerTranche = sharesPerYear / 5;
  for (let allocYear = allocStartYear; allocYear <= allocEndYear; allocYear++) {
    for (let i = 0; i < 5; i++) {
      const vestYear = allocYear + 2 + i;
      if (vestYear <= 2026) {
        events.push({ participant_id: pid, date: `${vestYear}-01-01`, shares: vestPerTranche });
      }
    }
  }
  return events;
}

export const vestingEvents: VestingEvent[] = [
  ...buildVesting(3, 2019, 2025, 500),
  ...buildVesting(1, 2020, 2025, 400),
  ...buildVesting(2, 2021, 2025, 300),
  ...buildVesting(4, 2018, 2024, 350),
  ...buildVesting(5, 2022, 2025, 250),
];

// --- Computed helpers ---

export function getSharePriceAt(targetDate: string): number | null {
  const sorted = [...valuations].sort((a, b) => b.date.localeCompare(a.date));
  const match = sorted.find((v) => v.date <= targetDate);
  return match?.price ?? null;
}

export function getAvailableYears(): number[] {
  const years = [...new Set(valuations.map((v) => parseInt(v.date.substring(0, 4))))];
  return years.sort((a, b) => b - a);
}

export interface ParticipantReport {
  id: number;
  name: string;
  hire_date: string;
  opening_shares: number;
  opening_value: number;
  period_adds: number;
  period_subs: number;
  closing_shares: number;
  closing_value: number;
  value_change: number;
  value_change_pct: number;
  vested: number;
  unvested: number;
  activity: { type: string; shares: number }[];
}

export interface BalanceReport {
  year: number;
  period_start: string;
  period_end: string;
  open_price: number | null;
  close_price: number | null;
  participants: ParticipantReport[];
  totals: {
    open_shares: number;
    close_shares: number;
    open_value: number;
    close_value: number;
    value_change: number;
    value_change_pct: number;
  };
}

export function buildReport(year: number, participantId?: number): BalanceReport {
  const periodStart = `${year}-01-01`;
  const periodEnd = `${year}-12-31`;
  const prevYearEnd = `${year - 1}-12-31`;

  const openPrice = getSharePriceAt(prevYearEnd);
  const closePrice = getSharePriceAt(periodEnd);

  const filteredParticipants = participantId
    ? participants.filter((p) => p.id === participantId)
    : participants;

  let totalOpenShares = 0,
    totalCloseShares = 0,
    totalOpenValue = 0,
    totalCloseValue = 0;

  const results: ParticipantReport[] = filteredParticipants.map((p) => {
    const myTxns = transactions.filter((t) => t.participant_id === p.id);

    const openAdd = myTxns
      .filter((t) => t.date < periodStart && ADDITION_TYPES.includes(t.type))
      .reduce((s, t) => s + t.shares, 0);
    const openSub = myTxns
      .filter((t) => t.date < periodStart && !ADDITION_TYPES.includes(t.type))
      .reduce((s, t) => s + t.shares, 0);
    const openingShares = openAdd - openSub;

    const periodTxns = myTxns.filter((t) => t.date >= periodStart && t.date <= periodEnd);
    const periodAdds = periodTxns
      .filter((t) => ADDITION_TYPES.includes(t.type))
      .reduce((s, t) => s + t.shares, 0);
    const periodSubs = periodTxns
      .filter((t) => !ADDITION_TYPES.includes(t.type))
      .reduce((s, t) => s + t.shares, 0);

    const closingShares = openingShares + periodAdds - periodSubs;
    const openingValue = openPrice ? openingShares * openPrice : 0;
    const closingValue = closePrice ? closingShares * closePrice : 0;
    const valueChange = closingValue - openingValue;
    const pct = openingValue ? (valueChange / openingValue) * 100 : 0;

    const vested = vestingEvents
      .filter((v) => v.participant_id === p.id && v.date <= periodEnd)
      .reduce((s, v) => s + v.shares, 0);

    // Activity breakdown
    const activityMap = new Map<string, number>();
    for (const t of periodTxns) {
      activityMap.set(t.type, (activityMap.get(t.type) || 0) + t.shares);
    }
    const activity = Array.from(activityMap.entries()).map(([type, shares]) => ({ type, shares }));

    totalOpenShares += openingShares;
    totalCloseShares += closingShares;
    totalOpenValue += openingValue;
    totalCloseValue += closingValue;

    return {
      id: p.id,
      name: p.name,
      hire_date: p.hire_date,
      opening_shares: openingShares,
      opening_value: openingValue,
      period_adds: periodAdds,
      period_subs: periodSubs,
      closing_shares: closingShares,
      closing_value: closingValue,
      value_change: valueChange,
      value_change_pct: pct,
      vested,
      unvested: Math.max(closingShares - vested, 0),
      activity,
    };
  });

  const totalChange = totalCloseValue - totalOpenValue;

  return {
    year,
    period_start: periodStart,
    period_end: periodEnd,
    open_price: openPrice,
    close_price: closePrice,
    participants: results,
    totals: {
      open_shares: totalOpenShares,
      close_shares: totalCloseShares,
      open_value: totalOpenValue,
      close_value: totalCloseValue,
      value_change: totalChange,
      value_change_pct: totalOpenValue ? (totalChange / totalOpenValue) * 100 : 0,
    },
  };
}

export interface ParticipantStatement {
  name: string;
  hire_date: string;
  termination_date: string | null;
  share_price: number | null;
  balance: number;
  value: number;
  vested: number;
  unvested: number;
  history: {
    date: string;
    type: string;
    shares: number;
    balance: number;
    is_addition: boolean;
    notes?: string;
  }[];
}

export function buildStatement(participantId: number): ParticipantStatement | null {
  const p = participants.find((p) => p.id === participantId);
  if (!p) return null;

  const today = "2025-12-31";
  const price = getSharePriceAt(today);
  const myTxns = transactions
    .filter((t) => t.participant_id === participantId)
    .sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  const history = myTxns.map((t) => {
    const isAdd = ADDITION_TYPES.includes(t.type);
    running += isAdd ? t.shares : -t.shares;
    return {
      date: t.date,
      type: t.type,
      shares: t.shares,
      balance: running,
      is_addition: isAdd,
      notes: t.notes,
    };
  });

  const vested = vestingEvents
    .filter((v) => v.participant_id === participantId && v.date <= today)
    .reduce((s, v) => s + v.shares, 0);

  return {
    name: p.name,
    hire_date: p.hire_date,
    termination_date: p.termination_date,
    share_price: price,
    balance: running,
    value: price ? running * price : 0,
    vested,
    unvested: Math.max(running - vested, 0),
    history,
  };
}
