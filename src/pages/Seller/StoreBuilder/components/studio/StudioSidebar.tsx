import React from "react";
import {
  AlertCircle, ArrowRight, Check, Layers, FileText, Palette, Image as ImageIcon,
  Settings, Store, ShoppingBag, ClipboardList, PanelTop, Sparkles, Lock, Compass, ListChecks, Loader2,
} from "lucide-react";
import { StudioNavMode } from "./studio.types";
import { STUDIO_JOURNEY_STEPS, EXPERT_NAV_GROUPS } from "./studioSidebarSteps";
import { useStudioGuidedNavigation } from "../../hooks/useStudioGuidedNavigation";

interface StudioSidebarProps {
  navMode: StudioNavMode;
  onSelectNavMode: (mode: StudioNavMode) => void;
  onSaveDraft?: () => unknown | Promise<unknown>;
}

const EXPERT_ICONS: Record<StudioNavMode, React.ElementType> = {
  sections: Layers,
  theme: Palette,
  identity: Store,
  header: PanelTop,
  atelier: Sparkles,
  media: ImageIcon,
  pages: FileText,
  catalog: ShoppingBag,
  settings: Settings,
  orders: ClipboardList,
  launchpad: ListChecks,
};

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  navMode,
  onSelectNavMode,
  onSaveDraft,
}) => {
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
  } = useStudioGuidedNavigation({ onSelectNavMode, onSaveDraft });

  if (mode === "expert") {
    return (
      <aside className="w-full bg-white p-3 space-y-3 select-none">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-900">
            Accès Libre
          </span>
          <button
            type="button"
            data-testid="studio-experience-mode-toggle"
            onClick={() => setMode("guided")}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Compass className="w-3 h-3" />
            <span>Mode Guidé</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {EXPERT_NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="block text-[10.5px] font-medium text-slate-400 px-1">
                {group.title}
              </span>
              <div className="grid grid-cols-2 gap-1">
                {group.items.map((item) => {
                  const Icon = EXPERT_ICONS[item.id];
                  const isAct = navMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectNavMode(item.id)}
                      className={`h-8 px-2 rounded-md text-[11.5px] font-medium flex items-center gap-1.5 cursor-pointer truncate transition-colors ${
                        isAct
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full bg-white p-3 space-y-3 select-none" data-testid="studio-guided-sidebar">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[12px] font-semibold text-slate-900 block tabular-nums">
            Parcours · {activeStep}/4
          </span>
          <span className="text-[11px] text-slate-500 block">
            Progression étape par étape
          </span>
        </div>
        <button
          type="button"
          data-testid="studio-experience-mode-toggle"
          onClick={() => setMode("expert")}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-900 cursor-pointer shrink-0 whitespace-nowrap"
        >
          Accès Libre
        </button>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
        {STUDIO_JOURNEY_STEPS.map((st) => {
          const isCurrent = activeStep === st.step;
          const isDone = completedSteps.includes(st.step);
          const isLocked = st.step > unlockedStep && !isDone;

          return (
            <div
              key={st.step}
              className={isCurrent ? "bg-slate-50/70" : isLocked ? "bg-white opacity-55" : "bg-white"}
            >
              <button
                type="button"
                disabled={isLocked}
                data-testid={`studio-journey-step-${st.step}`}
                onClick={() => selectStep(st.step)}
                className={`w-full px-2.5 py-2 flex items-center gap-2.5 text-left transition-colors ${
                  isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10.5px] font-semibold tabular-nums ${
                    isCurrent
                      ? "bg-slate-900 text-white"
                      : isDone
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isDone && !isCurrent ? (
                    <Check className="w-3 h-3" />
                  ) : isLocked ? (
                    <Lock className="w-2.5 h-2.5" />
                  ) : (
                    st.step
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-slate-900 truncate">
                    {st.title}
                  </span>
                  {isCurrent && (
                    <span className="block text-[10.5px] text-slate-500 truncate">
                      {st.subtitle}
                    </span>
                  )}
                </div>
              </button>

              {isCurrent && (
                <div className="px-2.5 pb-2.5 pt-0.5 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {st.subLinks.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => onSelectNavMode(sub.id)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                          navMode === sub.id
                            ? "bg-slate-900 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  {saveStepError && (
                    <div
                      role="alert"
                      data-testid="studio-step-save-error"
                      className="p-2 rounded-md bg-rose-50 border border-rose-200 text-[11px] font-medium text-rose-700 flex items-start gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{saveStepError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSavingStep}
                    data-testid="studio-save-and-advance-btn"
                    onClick={() => void handleSaveAndAdvance()}
                    className="w-full h-8 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-[11.5px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {isSavingStep ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Enregistrement...</span>
                      </>
                    ) : activeStep < 4 ? (
                      <>
                        <span>Enregistrer &amp; Étape {activeStep + 1}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 shrink-0" />
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
    </aside>
  );
};

