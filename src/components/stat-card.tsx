export function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "green" | "red" | "default";
}) {
  const colorClass =
    color === "green" ? "text-emerald-400" : color === "red" ? "text-red-400" : "text-white";

  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>
        {value}
        {sub && <span className="text-sm font-normal ml-1.5 opacity-70">{sub}</span>}
      </p>
    </div>
  );
}
