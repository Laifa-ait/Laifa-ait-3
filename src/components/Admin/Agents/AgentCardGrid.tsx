import React from "react";
import { LineChart, Mail, ShieldCheck, HeadphonesIcon, Settings, CheckCircle2, Award, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { AgentKey } from "../AgentConfigModal";

interface AgentConfig {
  isActive: boolean;
  [key: string]: unknown;
}

interface AgentCardGridProps {
  configs: Record<AgentKey, AgentConfig>;
  loadingAgent: AgentKey | null;
  onOpenConfigure: (key: AgentKey) => void;
  onToggleAgent: (key: AgentKey) => void;
}

export const AgentCardGrid: React.FC<AgentCardGridProps> = ({
  configs,
  loadingAgent,
  onOpenConfigure,
  onToggleAgent,
}) => {
  const { t } = useTranslation();

  const renderAgentStatus = (isActive: boolean) => (
    <span
      className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1 transition-colors ${
        isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"
      }`}
    >
      {isActive ? (
        <>
          <CheckCircle2 className="w-3 h-3" /> {t("Actif")}
        </>
      ) : (
        t("Désactivé")
      )}
    </span>
  );

  const cards: Array<{
    key: AgentKey;
    title: string;
    subtitle: string;
    desc: string;
    impactLabel: string;
    impactValue: string;
    icon: React.FC<{ className?: string }>;
    accentBg: string;
    accentText: string;
    btnColor: string;
  }> = [
    {
      key: "growth",
      title: t("Growth Analyst"),
      subtitle: t("Analyste Stratégique"),
      desc: t(
        "Analyse en continu les tendances du marché, les mots-clés les plus recherchés et les comportements clients pour cibler les campagnes."
      ),
      impactLabel: t("Impact"),
      impactValue: t("+14% Conversion"),
      icon: LineChart,
      accentBg: "bg-blue-50 border-blue-100",
      accentText: "text-blue-600",
      btnColor: "bg-[#1A1836] hover:bg-[#42164B]",
    },
    {
      key: "cart",
      title: t("Récupérateur de Paniers"),
      subtitle: t("Relances & Offres Ciblées"),
      desc: t(
        "Traque les paniers abandonnés et prépare des relances ciblées par email avec des offres personnalisées pour convertir les hésitations."
      ),
      impactLabel: t("Impact"),
      impactValue: t("+22% Récupération"),
      icon: Mail,
      accentBg: "bg-[#E99856]/15 border-[#E99856]/30",
      accentText: "text-[#A54055]",
      btnColor: "bg-[#A54055] hover:bg-[#622347]",
    },
    {
      key: "moderator",
      title: t("Modérateur de Contenu"),
      subtitle: t("Conformité Automatique"),
      desc: t(
        "Examine les fiches produits créées par les vendeurs et les avis clients pour détecter les numéros externes, fraudes ou contenus interdits."
      ),
      impactLabel: t("Objectif"),
      impactValue: t("Conformité Catalogue"),
      icon: ShieldCheck,
      accentBg: "bg-emerald-50 border-emerald-100",
      accentText: "text-emerald-600",
      btnColor: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      key: "support",
      title: t("Assistant Support Client"),
      subtitle: t("Support Niveau 1"),
      desc: t(
        "Prend en charge les demandes fréquentes des clients (suivi de commande, politiques de retour) et escalade les litiges complexes."
      ),
      impactLabel: t("Objectif"),
      impactValue: t("Assistance 24/7"),
      icon: HeadphonesIcon,
      accentBg: "bg-[#42164B]/10 border-[#42164B]/20",
      accentText: "text-[#42164B]",
      btnColor: "bg-[#42164B] hover:bg-[#1A1836]",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const isActive = Boolean(configs[c.key]?.isActive);
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="bg-white rounded-3xl border border-zinc-200/80 p-7 shadow-sm relative overflow-hidden group hover:border-[#A54055]/40 transition-colors"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${c.accentBg} ${c.accentText}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {renderAgentStatus(isActive)}
              </div>

              <h2 className="text-xl font-sans font-bold text-[#1A1836] mb-1">{c.title}</h2>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${c.accentText}`}>{c.subtitle}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6 min-h-[3.5rem]">{c.desc}</p>

              <div className="pt-5 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">{c.impactLabel}</span>
                  <span className="text-sm font-sans font-bold text-zinc-800 tabular-nums">{c.impactValue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenConfigure(c.key)}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
                    title={t("Configurer")}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleAgent(c.key)}
                    disabled={loadingAgent === c.key}
                    className={`w-28 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center cursor-pointer ${
                      isActive ? "bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200" : `${c.btnColor} text-white`
                    }`}
                  >
                    {loadingAgent === c.key ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    ) : isActive ? (
                      t("Désactiver")
                    ) : (
                      t("Activer")
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Sentinel AI Error Detector & Diagnostic Agent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-3xl border border-amber-200/80 p-7 shadow-sm relative overflow-hidden col-span-1 lg:col-span-2 bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-2xl flex items-center justify-center border border-amber-200">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-sans font-bold text-[#1A1836]">{t("Agent Sentinel & Inspecteur Système")}</h2>
                <h3 className="text-xs font-bold text-amber-600 tracking-wider uppercase flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {t("Détection d'Erreurs & Télémétrie Système en Temps Réel")}
                </h3>
              </div>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              {t(
                "Audite les journaux d'erreurs clientes, contrôle l'intégrité des règles Firestore et génère des diagnostics techniques avec recommandations."
              )}
            </p>
          </div>

          <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100">
            {renderAgentStatus(Boolean(configs.sentinel?.isActive))}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenConfigure("sentinel")}
                className="px-4 py-2.5 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Settings className="w-4 h-4 text-[#E99856]" />
                {t("Lancer le Diagnostic")}
              </button>
              <button
                onClick={() => onToggleAgent("sentinel")}
                disabled={loadingAgent === "sentinel"}
                className={`w-28 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center cursor-pointer ${
                  configs.sentinel?.isActive
                    ? "bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {loadingAgent === "sentinel" ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                ) : configs.sentinel?.isActive ? (
                  t("Désactiver")
                ) : (
                  t("Activer")
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
