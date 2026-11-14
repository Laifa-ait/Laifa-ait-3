import React from "react";
import { Calendar, Clock, Palette, RefreshCw } from "lucide-react";
import { CountdownBannerStyle } from "../../../../../../components/Store/sections/ProductFeedEcommerceWidgets";
import { CountdownPreviewStylesGrid } from "./CountdownPreviewStylesGrid";

interface CountdownCardEditorProps {
  settings: Record<string, unknown>;
  onSettingsChange: (
    fieldOrPatch: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  inputClass: string;
  labelClass: string;
}

const QUICK_DURATIONS = [
  { label: "+24h", hours: 24 },
  { label: "+48h", hours: 48 },
  { label: "+3 Jours", hours: 72 },
  { label: "+7 Jours", hours: 168 },
];

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const CountdownCardEditor: React.FC<CountdownCardEditorProps> = ({
  settings,
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  const showCountdown = Boolean(settings.showCountdown);
  const activeStyle = (settings.countdownStyle as CountdownBannerStyle) || "dark-pro";
  const showStockProgress = Boolean(settings.showStockProgress);
  const hasCustomColor = Boolean(
    settings.countdownBgColor || settings.countdownAccentColor || settings.countdownTextColor
  );
  const endDateIso = typeof settings.countdownEndDate === "string" ? settings.countdownEndDate : "";

  const applyQuickDuration = (hours: number) => {
    const target = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    onSettingsChange({ showCountdown: true, countdownEndDate: target });
  };

  return (
    <div className="space-y-4 select-none">
      <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              showCountdown ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            <Clock className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-[12px] font-semibold text-slate-900 truncate">
              Bannière Compte à Rebours
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              {showCountdown ? "Visible en haut de cette section" : "Masquée sur cette section"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSettingsChange("showCountdown", !showCountdown)}
          className={`h-7.5 px-3 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
            showCountdown
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {showCountdown ? "Activée" : "Activer"}
        </button>
      </div>

      <CountdownPreviewStylesGrid
        activeStyle={activeStyle}
        onSelectStyle={(styleId) =>
          onSettingsChange({
            showCountdown: true,
            countdownStyle: styleId,
            countdownBgColor: undefined,
            countdownAccentColor: undefined,
            countdownTextColor: undefined,
          })
        }
      />

      <div className="pt-3 border-t border-slate-200 space-y-2.5">
        <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Échéance &amp; Textes de l&apos;offre</span>
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_DURATIONS.map((dur) => (
            <button
              key={dur.label}
              type="button"
              onClick={() => applyQuickDuration(dur.hours)}
              className="h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[10.5px] font-medium text-slate-700 transition-colors cursor-pointer"
            >
              {dur.label}
            </button>
          ))}
        </div>
        <label className={labelClass}>
          <span>Date et heure de fin exacte</span>
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(endDateIso)}
            onChange={(e) => {
              const val = e.target.value;
              onSettingsChange("countdownEndDate", val ? new Date(val).toISOString() : undefined);
            }}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span>Titre de l&apos;offre</span>
          <input
            type="text"
            value={
              typeof settings.countdownLabel === "string"
                ? settings.countdownLabel
                : "OFFRE PRIVILÈGE À DURÉE LIMITÉE"
            }
            onChange={(e) => onSettingsChange("countdownLabel", e.target.value)}
            placeholder="Ex: VENTE PRIVÉE EXCLUSIVE"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span>Sous-titre descriptif</span>
          <input
            type="text"
            value={
              typeof settings.countdownSubtitle === "string"
                ? settings.countdownSubtitle
                : "Profitez des tarifs préférentiels avant la fin du compte à rebours"
            }
            onChange={(e) => onSettingsChange("countdownSubtitle", e.target.value)}
            placeholder="Ex: Quantités limitées sur cette sélection"
            className={inputClass}
          />
        </label>
      </div>

      <div className="pt-3 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <span>Couleurs &amp; Jauge de stock</span>
          </span>
          {hasCustomColor && (
            <button
              type="button"
              onClick={() =>
                onSettingsChange({
                  countdownBgColor: undefined,
                  countdownAccentColor: undefined,
                  countdownTextColor: undefined,
                })
              }
              className="text-[10.5px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Réinitialiser
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-200 space-y-1">
            <span className="text-[10.5px] font-medium text-slate-600 block">Fond bannière</span>
            <input
              type="color"
              value={(settings.countdownBgColor as string) || "#0F172A"}
              onChange={(e) => onSettingsChange("countdownBgColor", e.target.value)}
              className="h-7 w-full rounded cursor-pointer bg-transparent"
            />
          </div>
          <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-200 space-y-1">
            <span className="text-[10.5px] font-medium text-slate-600 block">Couleur d&apos;accent</span>
            <input
              type="color"
              value={(settings.countdownAccentColor as string) || "#B45309"}
              onChange={(e) => onSettingsChange("countdownAccentColor", e.target.value)}
              className="h-7 w-full rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11.5px] font-medium text-slate-800">Jauge de stock réel</span>
          <button
            type="button"
            onClick={() => onSettingsChange("showStockProgress", !showStockProgress)}
            className={`h-7 px-3 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
              showStockProgress ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {showStockProgress ? "Activée" : "Désactivée"}
          </button>
        </div>
      </div>
    </div>
  );
};
