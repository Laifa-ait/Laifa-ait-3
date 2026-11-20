import React from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Layers, FileText, Palette, Image as ImageIcon, Settings,
  Store, Sparkles, ShoppingBag, ClipboardList, ArrowLeft,
  ListChecks, PanelTop, Check, Lock, Compass, ArrowRight, Loader2, AlertCircle,
} from "lucide-react";
import { StudioNavMode } from "./studio.types";
import { STUDIO_JOURNEY_STEPS } from "./studioSidebarSteps";
import { useStudioGuidedNavigation } from "../../hooks/useStudioGuidedNavigation";

interface StudioMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
  lastSaveError?: string | null;
  shopName?: string;
}

export const StudioMobileMenu: React.FC<StudioMobileMenuProps> = ({
  isOpen,
  onClose,
  navMode,
  onSelectNavMode,
  onSaveDraft,
  lastSaveError,
  shopName = "Ma Boutique",
}) => {
  const navigate = useNavigate();
  const {
    mode,
    setMode,
    activeStep,
    unlockedStep,
    completedSteps,
    isSavingStep,
    saveStepError,
    selectStep,
    handleSaveAndAdvance,
  } = useStudioGuidedNavigation({ onSelectNavMode, onSaveDraft, externalSaveError: lastSaveError });

  if (!isOpen) return null;

  const handleSelect = (targetMode: StudioNavMode) => {
    onSelectNavMode(targetMode);
    onClose();
  };

  const navClass = (targetMode: StudioNavMode) =>
    `w-full h-10 px-3 rounded-lg text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
      navMode === targetMode
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-xs md:hidden">
      <div className="w-[290px] max-w-[84vw] bg-white h-full flex flex-col border-r border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-[14px] font-semibold text-slate-900 truncate">
              {shopName}
            </span>
            <span className="block text-[11px] text-slate-500">
              {mode === "guided" ? `Parcours Guidé · ${activeStep}/4` : "Accès Libre"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="mobile-experience-mode-toggle"
              onClick={() => setMode(mode === "guided" ? "expert" : "guided")}
              className="px-2 py-1 rounded-md border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3 h-3" />
              <span>{mode === "guided" ? "Libre" : "Guidé"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {mode === "guided" ? (
            <div className="space-y-2" data-testid="mobile-guided-menu-steps">
              {STUDIO_JOURNEY_STEPS.map((st) => {
                const isCurrent = activeStep === st.step;
                const isDone = completedSteps.includes(st.step);
                const isLocked = st.step > unlockedStep && !isDone;
                return (
                  <div
                    key={st.step}
                    className={`rounded-lg border ${
                      isCurrent ? "border-slate-900 bg-slate-50/60" : "border-slate-200 bg-white"
                    } ${isLocked ? "opacity-60" : ""}`}
                  >
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        selectStep(st.step);
                        onClose();
                      }}
                      className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left ${
                        isLocked ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold ${
                          isCurrent
                            ? "bg-slate-900 text-white"
                            : isDone
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isDone && !isCurrent ? <Check className="w-3 h-3" /> : isLocked ? <Lock className="w-2.5 h-2.5" /> : st.step}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold text-slate-900 truncate">{st.title}</span>
                        <span className="block text-[11px] text-slate-500 truncate">{st.subtitle}</span>
                      </div>
                    </button>

                    {isCurrent && (
                      <div className="px-3 pb-3 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {st.subLinks.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleSelect(sub.id)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                                navMode === sub.id
                                  ? "bg-slate-900 text-white"
                                  : "bg-white border border-slate-200 text-slate-700"
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                        {saveStepError && (
                          <div role="alert" className="p-2 rounded bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{saveStepError}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={isSavingStep}
                          onClick={() => void handleSaveAndAdvance()}
                          className="w-full h-9 px-3 rounded-lg bg-slate-900 text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                        >
                          {isSavingStep ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Enregistrement...</span>
                            </>
                          ) : activeStep < 4 ? (
                            <>
                              <span>Enregistrer &amp; Étape {activeStep + 1}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Enregistrer cette étape</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <button type="button" onClick={() => handleSelect("launchpad")} className={navClass("launchpad")}>
                <ListChecks className="w-4 h-4 shrink-0" />
                <span>Check-list de lancement</span>
              </button>
              <div className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-400 px-3 pb-1">Apparence &amp; Structure</span>
                <button type="button" onClick={() => handleSelect("sections")} className={navClass("sections")}><Layers className="w-4 h-4 shrink-0" /><span>Sections de la page</span></button>
                <button type="button" onClick={() => handleSelect("theme")} className={navClass("theme")}><Palette className="w-4 h-4 shrink-0" /><span>Thème &amp; Couleurs</span></button>
                <button type="button" onClick={() => handleSelect("atelier")} className={navClass("atelier")}><Sparkles className="w-4 h-4 shrink-0" /><span>Studio &amp; Finitions</span></button>
                <button type="button" onClick={() => handleSelect("header")} className={navClass("header")}><PanelTop className="w-4 h-4 shrink-0" /><span>En-tête &amp; Menu</span></button>
                <button type="button" onClick={() => handleSelect("identity")} className={navClass("identity")}><Store className="w-4 h-4 shrink-0" /><span>Identité boutique</span></button>
                <button type="button" onClick={() => handleSelect("pages")} className={navClass("pages")}><FileText className="w-4 h-4 shrink-0" /><span>Pages &amp; Navigation</span></button>
              </div>
              <div className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-400 px-3 pb-1">Commerce &amp; Fichiers</span>
                <button type="button" onClick={() => handleSelect("catalog")} className={navClass("catalog")}><ShoppingBag className="w-4 h-4 shrink-0" /><span>Catalogue produits</span></button>
                <button type="button" onClick={() => handleSelect("orders")} className={navClass("orders")}><ClipboardList className="w-4 h-4 shrink-0" /><span>Commandes &amp; Suivi</span></button>
                <button type="button" onClick={() => handleSelect("media")} className={navClass("media")}><ImageIcon className="w-4 h-4 shrink-0" /><span>Médiathèque</span></button>
                <button type="button" onClick={() => handleSelect("settings")} className={navClass("settings")}><Settings className="w-4 h-4 shrink-0" /><span>Livraison, Pixels &amp; SEO</span></button>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/dashboard/seller");
            }}
            className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Tableau de Bord</span>
          </button>
        </div>
      </div>

      <div className="flex-1 h-full cursor-pointer" onClick={onClose} />
    </div>
  );
};

