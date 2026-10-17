import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export interface TransactionMetric {
  name: string;
  durationMs: number;
  success: boolean;
  timestamp: string;
  requestId: string;
}

interface TelemetryTableProps {
  transactions: TransactionMetric[];
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h4 className="text-base font-bold text-slate-900">
          Dernières Transactions ACID ({transactions.length})
        </h4>
        <p className="text-xs text-slate-500">
          Historique en direct du Ring Buffer in-memory (20 derniers échantillons)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5">Transaction</th>
              <th className="px-6 py-3.5">Durée (ms)</th>
              <th className="px-6 py-3.5">Statut</th>
              <th className="px-6 py-3.5">Horodatage</th>
              <th className="px-6 py-3.5">Request ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic font-medium">
                  Aucune transaction enregistrée pour le moment.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                const isHighMs = tx.durationMs > 800;
                const isWarmMs = tx.durationMs > 500;
                return (
                  <tr key={`${tx.requestId}-${idx}`} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      {tx.name}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          isHighMs
                            ? "bg-red-100 text-red-800"
                            : isWarmMs
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {tx.durationMs} ms
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {tx.success ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Succès
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3" />
                          Échec
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">
                      {tx.requestId ? tx.requestId.slice(0, 8) : "N/A"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
