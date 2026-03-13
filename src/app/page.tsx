"use client";

import { useState } from "react";
import Link from "next/link";
import { buildReport, getAvailableYears } from "@/lib/data";
import { money, shares, signedMoney, pct, txLabel, ADDITION_TYPES } from "@/lib/format";
import { StatCard } from "@/components/stat-card";

export default function ReportPage() {
  const years = getAvailableYears();
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const report = buildReport(selectedYear);

  return (
    <div className="fade-in">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold text-white">Balance Report</h2>
        <div className="flex gap-2 flex-wrap">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                selectedYear === y
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Opening Price" value={report.open_price ? `$${report.open_price.toFixed(2)}` : "N/A"} />
        <StatCard label="Closing Price" value={report.close_price ? `$${report.close_price.toFixed(2)}` : "N/A"} />
        <StatCard label="Total Plan Value" value={money(report.totals.close_value)} />
        <StatCard
          label="Value Change"
          value={signedMoney(report.totals.value_change)}
          sub={pct(report.totals.value_change_pct)}
          color={report.totals.value_change >= 0 ? "green" : "red"}
        />
      </div>

      {/* Participant table */}
      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Participant", "Opening Shares", "Opening Value", "Activity", "Closing Shares", "Closing Value", "Change", "Vested", "Unvested"].map(
                (h) => (
                  <th key={h} className={`px-5 py-3 text-xs text-slate-500 uppercase tracking-wide font-medium ${h === "Participant" ? "text-left" : "text-right"}`}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {report.participants.map((p) => (
              <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <Link href={`/statements?id=${p.id}`} className="hover:text-emerald-400 transition-colors">
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hired {p.hire_date}</p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-right font-mono text-slate-300">{shares(p.opening_shares)}</td>
                <td className="px-5 py-4 text-right font-mono text-slate-300">{money(p.opening_value)}</td>
                <td className="px-5 py-4 text-right">
                  {p.activity.length > 0 ? (
                    p.activity.map((a) => (
                      <div key={a.type} className="text-xs">
                        <span className={ADDITION_TYPES.includes(a.type) ? "text-emerald-400" : "text-red-400"}>
                          {ADDITION_TYPES.includes(a.type) ? "+" : "−"}
                          {shares(a.shares)}
                        </span>
                        <span className="text-slate-600 ml-1">{txLabel(a.type)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right font-mono text-white font-medium">{shares(p.closing_shares)}</td>
                <td className="px-5 py-4 text-right font-mono text-white font-medium">{money(p.closing_value)}</td>
                <td className={`px-5 py-4 text-right font-mono ${p.value_change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  <span>{signedMoney(p.value_change)}</span>
                  <span className="text-xs opacity-60 block">{pct(p.value_change_pct)}</span>
                </td>
                <td className="px-5 py-4 text-right font-mono text-slate-300">{shares(p.vested)}</td>
                <td className="px-5 py-4 text-right font-mono text-slate-400">{shares(p.unvested)}</td>
              </tr>
            ))}
          </tbody>
          {report.participants.length > 1 && (
            <tfoot>
              <tr className="bg-slate-900/50">
                <td className="px-5 py-3 font-semibold text-white">Plan Totals</td>
                <td className="px-5 py-3 text-right font-mono text-slate-300">{shares(report.totals.open_shares)}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-300">{money(report.totals.open_value)}</td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-right font-mono text-white font-semibold">{shares(report.totals.close_shares)}</td>
                <td className="px-5 py-3 text-right font-mono text-white font-semibold">{money(report.totals.close_value)}</td>
                <td className={`px-5 py-3 text-right font-mono font-semibold ${report.totals.value_change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {signedMoney(report.totals.value_change)}
                </td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
