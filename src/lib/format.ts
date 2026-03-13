export function money(v: number | null | undefined): string {
  if (v == null) return "—";
  return "$" + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function shares(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function signedMoney(v: number): string {
  const prefix = v >= 0 ? "+" : "-";
  return prefix + money(v);
}

export function pct(v: number): string {
  const prefix = v >= 0 ? "+" : "";
  return prefix + v.toFixed(1) + "%";
}

export function txLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ADDITION_TYPES = ["allocation", "dividend_reinvest", "forfeiture_in"];
