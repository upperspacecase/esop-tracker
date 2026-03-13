"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { participants, buildStatement } from "@/lib/data";
import { money, shares, txLabel, ADDITION_TYPES } from "@/lib/format";
import { StatCard } from "@/components/stat-card";

function StatementsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") ? parseInt(searchParams.get("id")!) : participants[0]?.id;
  const [selectedId, setSelectedId] = useState(initialId);
  const statement = buildStatement(selectedId);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) setSelectedId(parseInt(idParam));
  }, [searchParams]);

  if (!statement) return <p className="text-slate-400">Participant not found.</p>;

  const vestPct = statement.balance > 0 ? Math.min((statement.vested / statement.balance) * 100, 100) : 0;

  return (
    <div className="fade-in">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <h2 className="text-2xl font-bold text-white">Participant Statement</h2>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(parseInt(e.target.value))}
          className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.termination_date ? " (Terminated)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Hire Date" value={statement.hire_date} />
        <StatCard label="Share Price" value={statement.share_price ? `$${statement.share_price.toFixed(2)}` : "N/A"} />
        <StatCard label="Total Shares" value={shares(statement.balance)} />
        <StatCard label="Account Value" value={money(statement.value)} color="green" />
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Vested / Unvested</p>
          <p className="text-xl font-bold text-white">
            {shares(statement.vested)}
            <span className="text-slate-600 mx-1.5">/</span>
            <span className="text-slate-400">{shares(statement.unvested)}</span>
          </p>
        </div>
      </div>

      {/* Termination banner */}
      {statement.termination_date && (
        <div className="glass rounded-xl p-4 mb-8 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400 font-medium">
            Terminated on {statement.termination_date} — account distributed and unvested shares forfeited.
          </p>
        </div>
      )}

      {/* Vesting progress */}
      {statement.balance > 0 && (
        <div className="glass rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-400">Vesting Progress</p>
            <p className="text-sm font-mono text-white">{vestPct.toFixed(1)}% vested</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${vestPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {["Date", "Type", "Shares", "Running Balance", "Notes"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-2.5 text-xs text-slate-500 uppercase tracking-wide font-medium ${
                      h === "Date" || h === "Type" || h === "Notes" ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statement.history.map((h, i) => (
                <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-mono text-slate-300">{h.date}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        h.is_addition ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {txLabel(h.type)}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-mono ${h.is_addition ? "text-emerald-400" : "text-red-400"}`}>
                    {h.is_addition ? "+" : "−"}
                    {shares(h.shares)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-white">{shares(h.balance)}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{h.notes || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StatementsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
      <StatementsContent />
    </Suspense>
  );
}
