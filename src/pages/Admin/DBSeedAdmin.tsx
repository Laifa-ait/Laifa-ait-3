import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Database,
  Trash2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiGet, apiPost } from "../../lib/api";
import {
  CleanupAuditReport,
  CleanupCategoryId,
  CleanupPurgeResult,
} from "../../types/firebaseCleanup";
import { FirebaseCleanupCategoryCard } from "../../components/Admin/FirebaseCleanupCategoryCard";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const DBSeedAdmin: React.FC = () => {
  const [report, setReport] = useState<CleanupAuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [selected, setSelected] = useState<Set<CleanupCategoryId>>(new Set());
  const [confirmStep, setConfirmStep] = useState(false);
  const [lastPurge, setLastPurge] = useState<CleanupPurgeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    setConfirmStep(false);
    try {
      const res = await apiGet<ApiEnvelope<CleanupAuditReport>>("/api/v1/admin/firebase-cleanup/audit");
      if (res?.success && res.data) {
        setReport(res.data);
        const autoSelect = new Set<CleanupCategoryId>(
          res.data.categories
            .filter((cat) => cat.count > 0 && cat.riskLevel === "safe")
            .map((cat) => cat.id)
        );
        setSelected(autoSelect);
      } else {
        setErrorMessage(res?.error || "Impossible d'analyser Firestore.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion au serveur";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runAudit();
  }, [runAudit]);

  const toggleCategory = (id: CleanupCategoryId) => {
    setConfirmStep(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const nonEmptyCategories = useMemo(
    () => (report ? report.categories.filter((c) => c.count > 0) : []),
    [report]
  );

  const selectedCount = useMemo(() => {
    if (!report) return 0;
    return report.categories
      .filter((c) => selected.has(c.id))
      .reduce((acc, c) => acc + c.count, 0);
  }, [report, selected]);

  const handleSelectAll = () => {
    setConfirmStep(false);
    if (selected.size === nonEmptyCategories.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(nonEmptyCategories.map((c) => c.id)));
    }
  };

  const executePurge = async () => {
    if (selected.size === 0) return;
    setConfirmStep(false);
    setPurging(true);
    const toastId = toast.loading("Suppression des données inutiles sur Firebase...");
    try {
      const res = await apiPost<ApiEnvelope<CleanupPurgeResult>>("/api/v1/admin/firebase-cleanup/purge", {
        categories: Array.from(selected),
      });
      if (res?.success && res.data) {
        setLastPurge(res.data);
        toast.success(`${res.data.totalDeleted} document(s) supprimé(s) définitivement.`, { id: toastId });
        await runAudit();
      } else {
        toast.error(res?.error || "Échec de la purge.", { id: toastId });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression";
      toast.error(msg, { id: toastId });
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6" id="db-seed-admin-page">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold text-zinc-900 tracking-tighter uppercase">Nettoyage Firebase</h1>
          <p className="text-zinc-500 font-medium mt-1 text-sm">
            Détectez et supprimez les données de démonstration, corrompues et journaux inutiles sur Firestore.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runAudit()}
          disabled={loading || purging}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Rescanner Firebase
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-emerald-900">
          <strong className="block mb-0.5">Protection stricte des vraies données activée</strong>
          Les vrais utilisateurs, vendeurs, commandes, paiements, paramètres du site, bannières et produits réels ne sont{" "}
          <strong>jamais touchés</strong>. L&apos;injection automatique de faux produits au démarrage est désactivée.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-red-700 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {lastPurge && (
        <div className="bg-zinc-900 text-white rounded-3xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Dernière purge réussie : {lastPurge.totalDeleted} document(s) supprimé(s)</p>
              <p className="text-zinc-400">Caches serveur vidés automatiquement.</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">{new Date(lastPurge.purgedAt).toLocaleTimeString()}</span>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-zinc-200/80 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Documents inutiles détectés</p>
              <p className="text-2xl font-black text-zinc-900">
                {loading ? "Analyse en cours..." : report ? report.totalJunkCount : 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {nonEmptyCategories.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={loading || purging}
                className="px-4 py-2.5 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                {selected.size === nonEmptyCategories.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            )}
            {!confirmStep ? (
              <button
                type="button"
                onClick={() => setConfirmStep(true)}
                disabled={loading || purging || selectedCount === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {purging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Purger la sélection ({selectedCount})
              </button>
            ) : (
              <div className="flex items-center gap-2 p-1 bg-red-50 border-2 border-red-300 rounded-2xl">
                <button
                  type="button"
                  onClick={() => void executePurge()}
                  disabled={purging}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmer ({selectedCount} docs)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmStep(false)}
                  disabled={purging}
                  className="px-3 py-2 rounded-xl bg-white text-zinc-600 text-xs font-bold border border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && !report ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin text-zinc-600" />
            <p className="text-sm font-medium">Inspection sécurisée des collections Firestore...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {report?.categories.map((category) => (
              <FirebaseCleanupCategoryCard
                key={category.id}
                category={category}
                selected={selected.has(category.id)}
                disabled={purging}
                onToggle={() => toggleCategory(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
