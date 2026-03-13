"use client";

import { valuations } from "@/lib/data";

export default function ValuationsPage() {
  const sorted = [...valuations].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold text-white mb-8">Share Valuations</h2>

      {/* Price chart (simple visual) */}
      <div className="glass rounded-xl p-6 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Share Price History</p>
        <div className="flex items-end gap-3 h-40">
          {valuations.map((v, i) => {
            const max = Math.max(...valuations.map((v) => v.price));
            const height = (v.price / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-mono text-slate-400">${v.price.toFixed(0)}</span>
                <div
                  className="w-full bg-gradient-to-t from-emerald-500/60 to-emerald-400/80 rounded-t-md transition-all duration-500 min-h-[4px]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-slate-600">{v.date.substring(0, 4)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wide font-medium">Date</th>
              <th className="text-right px-5 py-3 text-xs text-slate-500 uppercase tracking-wide font-medium">Share Price</th>
              <th className="text-right px-5 py-3 text-xs text-slate-500 uppercase tracking-wide font-medium">YoY Change</th>
              <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wide font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, i) => {
              const prev = sorted[i + 1];
              const change = prev ? ((v.price - prev.price) / prev.price) * 100 : null;
              return (
                <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-mono text-slate-300">{v.date}</td>
                  <td className="px-5 py-3 text-right font-mono text-white font-medium">${v.price.toFixed(2)}</td>
                  <td className={`px-5 py-3 text-right font-mono ${change !== null ? (change >= 0 ? "text-emerald-400" : "text-red-400") : "text-slate-600"}`}>
                    {change !== null ? `${change >= 0 ? "+" : ""}${change.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{v.notes || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
