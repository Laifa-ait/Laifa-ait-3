import React from "react";
import { Flame, Sparkles, TrendingUp, Check } from "lucide-react";
import { motion } from "motion/react";

export interface AuditReport {
  id?: string;
  timestamp: Date;
  overallScore: number;
  scores: {
    uxResponsive: number;
    accessibility: number;
    algerianLogistics: number;
    securityValidation: number;
    performance: number;
  };
  checksPassed: number;
  checksFailed: number;
  authorEmail: string;
}

interface CheckoutDashboardTabProps {
  currentScore: AuditReport;
  logs: { type: "success" | "warning" | "info" | "error"; message: string }[];
}

export const CheckoutDashboardTab: React.FC<CheckoutDashboardTabProps> = ({ currentScore, logs }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-[#1A1836] text-white p-8 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Flame className="w-44 h-44 text-[#E99856]" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#E0B4B2]">
              Score global d'optimisation
            </span>
            <div className="flex items-baseline gap-2 mt-4 tabular-nums">
              <span className="text-7xl font-sans font-black text-[#E99856]">{currentScore.overallScore}</span>
              <span className="text-zinc-400 font-bold text-2xl">/100</span>
            </div>
            <div className="flex items-center gap-2 mt-4 text-emerald-400 font-sans font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Niveau d'accessibilité : Excellent (WCAG AAA)</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 mt-8 space-y-3 tabular-nums">
            <div className="flex justify-between text-xs font-semibold text-[#E0B4B2]">
              <span>Vérifications passées</span>
              <span className="text-emerald-400 font-bold">{currentScore.checksPassed}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-[#E0B4B2]">
              <span>Erreurs critiques</span>
              <span className="text-red-400 font-bold">{currentScore.checksFailed}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-sm space-y-6">
          <h3 className="text-sm font-sans font-bold text-[#1A1836] uppercase tracking-wider">
            Évaluation par pilier UX
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 tabular-nums">
            {[
              {
                label: "UX & Adaptabilité Mobile",
                score: currentScore.scores.uxResponsive,
                desc: "Boutons de taille minimum 44px, formulaires épurés.",
              },
              {
                label: "Accessibilité Clavier & A11y",
                score: currentScore.scores.accessibility,
                desc: "Attributs ARIA, contrastes validés, focus clavier.",
              },
              {
                label: "Logistique & 69 Wilayas d'Algérie",
                score: currentScore.scores.algerianLogistics,
                desc: "Options Domicile / StopDesk, communes personnalisables.",
              },
              {
                label: "Validation & Sécurité des données",
                score: currentScore.scores.securityValidation,
                desc: "Format d'identifiants sain, masquage des données sensibles.",
              },
            ].map((pillar) => (
              <div key={pillar.label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>{pillar.label}</span>
                  <span className="text-[#A54055]">{pillar.score}%</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#A54055] rounded-full" style={{ width: `${pillar.score}%` }} />
                </div>
                <p className="text-[10px] text-zinc-400">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-[#1A1836] rounded-3xl p-6 text-zinc-200 font-mono text-xs space-y-2.5 shadow-inner max-h-[320px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <span className="text-[#E0B4B2] font-bold uppercase tracking-wider">Terminal de Diagnostic Audit</span>
            <span className="bg-[#A54055] text-white px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest">
              Journal d'Exécution
            </span>
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2 items-start leading-relaxed">
              {log.type === "success" && <span className="text-emerald-400 font-bold">[✔ OK]</span>}
              {log.type === "warning" && <span className="text-amber-400 font-bold">[⚠ WARN]</span>}
              {log.type === "error" && <span className="text-red-400 font-bold">[❌ ERR]</span>}
              {log.type === "info" && <span className="text-sky-400 font-bold">[ℹ INFO]</span>}
              <span className={log.type === "success" ? "text-white" : ""}>{log.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-zinc-200/80 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-[#1A1836]">
              Recommandations actives pour le marché algérien
            </h3>
            <p className="text-xs text-zinc-500 font-medium">Bonnes pratiques UX appliquées au tunnel Olmart.</p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {[
            {
              title: "Paiement à la Livraison (Cash on Delivery) mis en évidence",
              desc: "Clarification visuelle immédiate du règlement en espèces à la réception pour rassurer l'acheteur.",
            },
            {
              title: "Saisie libre et fallbacks des Communes sur les 69 Wilayas",
              desc: "L'option 'Autre' avec saisie manuelle garantit qu'aucun client n'est bloqué par un sélecteur rigide.",
            },
            {
              title: "Points de repère textuels à la place des codes postaux",
              desc: "Privilégie un champ 'Point de repère' adapté à la livraison au dernier kilomètre en Algérie.",
            },
          ].map((rec) => (
            <div key={rec.title} className="py-4 flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900">{rec.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed mt-1">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
