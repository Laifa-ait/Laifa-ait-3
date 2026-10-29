import React, { useState, useEffect, useCallback } from "react";
import { Bot, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../../lib/api";
import {
  AgentConfigModal,
  AgentKey,
  AgentModalConfig,
  GrowthReport,
  CartPreview,
  ModeratorResult,
  SentinelReport,
} from "../../components/Admin/AgentConfigModal";
import { AgentCardGrid } from "../../components/Admin/Agents/AgentCardGrid";

interface AgentConfig {
  isActive: boolean;
  [key: string]: unknown;
}

export const AgentsAdmin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const [configs, setConfigs] = useState<Record<AgentKey, AgentConfig>>({
    growth: { isActive: true, focusCategory: "Tout", marketContext: "", analysisFrequency: "daily" },
    cart: { isActive: true, discountCode: "OLMARECOVERY10", discountPercent: 10, followUpDelay: 4, tone: "luxury" },
    moderator: { isActive: false, strictness: "strict", languages: "FR, AR", customForbiddenWords: "" },
    support: { isActive: false, kbContext: "", personality: "warm" },
    sentinel: { isActive: true, autoScanInterval: "hourly", alertThreshold: "warning", autoFixEnabled: true },
  });

  const [loading, setLoading] = useState(true);
  const [loadingAgent, setLoadingAgent] = useState<AgentKey | null>(null);

  const [activeModal, setActiveModal] = useState<AgentKey | null>(null);
  const [modalConfig, setModalConfig] = useState<AgentModalConfig | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [growthReport, setGrowthReport] = useState<GrowthReport | null>(null);
  const [cartPreview, setCartPreview] = useState<CartPreview | null>(null);
  const [moderatorResult, setModeratorResult] = useState<ModeratorResult | null>(null);
  const [sentinelReport, setSentinelReport] = useState<SentinelReport | null>(null);

  const [testProduct, setTestProduct] = useState({
    title: "Robe Kabyle de Fête Authentique",
    description:
      "Sublime robe kabyle cousue main avec foutha assortie. Qualité premium d'artisanat d'art de Tizi Ouzou. Contactez-moi sur mon WhatsApp +213550123456 pour plus de détails !",
  });

  const loadConfigs = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await apiGet<{ success: boolean; configs?: Record<AgentKey, AgentConfig> }>("/api/v1/admin/ai-agents");
      if (data?.success && data.configs) {
        setConfigs(data.configs);
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(t("Erreur lors de la récupération de la configuration des agents IA"));
    } finally {
      setLoading(false);
    }
  }, [currentUser, t]);

  useEffect(() => {
    if (currentUser) {
      loadConfigs();
    }
  }, [currentUser, loadConfigs]);

  const toggleAgent = async (agentKey: AgentKey) => {
    if (!currentUser) return;
    try {
      setLoadingAgent(agentKey);
      const nextActiveState = !configs[agentKey].isActive;
      await apiPost(`/api/v1/admin/ai-agents/${agentKey}/toggle`, { isActive: nextActiveState });

      setConfigs((prev) => ({
        ...prev,
        [agentKey]: { ...prev[agentKey], isActive: nextActiveState },
      }));

      toast.success(nextActiveState ? t("Agent IA activé avec succès") : t("Agent IA désactivé avec succès"));
    } catch (error: unknown) {
      console.error(error);
      toast.error(t("Impossible de modifier l'état de l'agent IA"));
    } finally {
      setLoadingAgent(null);
    }
  };

  const openConfigure = (agentKey: AgentKey) => {
    setModalConfig({ ...configs[agentKey] });
    setGrowthReport(null);
    setCartPreview(null);
    setModeratorResult(null);
    setSentinelReport(null);
    setActiveModal(agentKey);
  };

  const runSentinelDiagnostic = async () => {
    if (!currentUser) return;
    try {
      setIsRunningAgent(true);
      setSentinelReport(null);
      const data = await apiPost<{ success: boolean; report: SentinelReport }>(
        "/api/v1/admin/ai-agents/sentinel/diagnose",
        {}
      );
      if (data?.success) {
        setSentinelReport(data.report);
        toast.success(t("Diagnostic système Sentinel exécuté avec succès !"));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur de diagnostic";
      toast.error(t("Erreur de l'agent Sentinel : ") + message);
    } finally {
      setIsRunningAgent(false);
    }
  };

  const saveConfig = async () => {
    if (!currentUser || !activeModal) return;
    try {
      setIsSavingConfig(true);
      await apiPost(`/api/v1/admin/ai-agents/${activeModal}/configure`, modalConfig);
      setConfigs((prev) => ({
        ...prev,
        [activeModal]: { ...modalConfig, isActive: prev[activeModal].isActive },
      }));
      toast.success(t("Configuration de l'agent IA enregistrée"));
      setActiveModal(null);
    } catch {
      toast.error(t("Impossible de sauvegarder la configuration"));
    } finally {
      setIsSavingConfig(false);
    }
  };

  const runGrowthAnalysis = async () => {
    if (!currentUser) return;
    try {
      setIsRunningAgent(true);
      setGrowthReport(null);
      const data = await apiPost<{ success: boolean; report: GrowthReport }>("/api/v1/admin/ai-agents/growth/run", {});
      if (data?.success) {
        setGrowthReport(data.report);
        toast.success(t("Analyse stratégique de croissance générée !"));
      }
    } catch (error: unknown) {
      toast.error(t("Échec du lancement de l'analyse : ") + (error instanceof Error ? error.message : ""));
    } finally {
      setIsRunningAgent(false);
    }
  };

  const runCartSimulation = async () => {
    if (!currentUser) return;
    try {
      setIsRunningAgent(true);
      setCartPreview(null);
      const data = await apiPost<{ success: boolean; preview: CartPreview }>(
        "/api/v1/admin/ai-agents/cart/run-simulation",
        {}
      );
      if (data?.success) {
        setCartPreview(data.preview);
        toast.success(t("Simulation de relance de panier effectuée !"));
      }
    } catch (error: unknown) {
      toast.error(t("Échec de la simulation : ") + (error instanceof Error ? error.message : ""));
    } finally {
      setIsRunningAgent(false);
    }
  };

  const runModeratorTest = async () => {
    if (!currentUser) return;
    try {
      setIsRunningAgent(true);
      setModeratorResult(null);
      const data = await apiPost<{ success: boolean; result: ModeratorResult }>(
        "/api/v1/admin/ai-agents/moderator/test",
        testProduct
      );
      if (data?.success) {
        setModeratorResult(data.result);
        toast.success(t("Fiche produit auditée par le modérateur !"));
      }
    } catch (error: unknown) {
      toast.error(t("Échec de l'audit : ") + (error instanceof Error ? error.message : ""));
    } finally {
      setIsRunningAgent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#A54055] animate-spin" />
        <p className="text-zinc-500 font-medium text-sm">{t("Chargement des configurations d'agents IA...")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#A54055]/10 rounded-2xl flex items-center justify-center shrink-0 border border-[#A54055]/20">
            <Bot className="w-6 h-6 text-[#A54055]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#1A1836] tracking-tight">
              {t("Orchestration des Agents IA")}
            </h1>
            <p className="text-zinc-500 font-medium text-sm mt-1">
              {t("Pilotez vos agents spécialisés pour l'analyse de croissance, la relance panier et la conformité.")}
            </p>
          </div>
        </div>
        <button
          onClick={loadConfigs}
          className="px-4 py-2.5 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-[#E99856]" />
          {t("Actualiser")}
        </button>
      </div>

      <AgentCardGrid
        configs={configs}
        loadingAgent={loadingAgent}
        onOpenConfigure={openConfigure}
        onToggleAgent={toggleAgent}
      />

      <AgentConfigModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        modalConfig={modalConfig}
        setModalConfig={setModalConfig}
        isSavingConfig={isSavingConfig}
        saveConfig={saveConfig}
        isRunningAgent={isRunningAgent}
        runGrowthAnalysis={runGrowthAnalysis}
        growthReport={growthReport}
        runCartSimulation={runCartSimulation}
        cartPreview={cartPreview}
        runModeratorTest={runModeratorTest}
        moderatorResult={moderatorResult}
        testProduct={testProduct}
        setTestProduct={setTestProduct}
        runSentinelDiagnostic={runSentinelDiagnostic}
        sentinelReport={sentinelReport}
        t={t}
      />
    </div>
  );
};
