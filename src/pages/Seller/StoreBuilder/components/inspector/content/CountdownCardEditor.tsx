import React from "react";
import { Calendar, Check, Clock, Flame, Palette, RefreshCw, Sparkles } from "lucide-react";
import { CountdownBannerStyle } from "../../../../../../components/Store/sections/ProductFeedEcommerceWidgets";
import { COUNTDOWN_STYLES } from "./countdownStyles";

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

const PREVIEW_UNITS = [
  { v: "02", u: "J", accent: false },
  { v: "14", u: "H", accent: false },
  { v: "36", u: "M", accent: false },
  { v: "48", u: "S", accent: true },
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
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs transition-colors ${
              showCountdown ? "bg-[#023859]" : "bg-slate-300"
            }`}
          >
            <Clock className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#011C40] truncate">
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
          className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            showCountdown
              ? "bg-[#023859] text-white shadow-2xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {showCountdown ? "Activée" : "Activer"}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#011C40] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#023859]" />
            <span>Direction Artistique du Chrono</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400">6 Modèles</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {COUNTDOWN_STYLES.map((st) => {
            const isSelected = activeStyle === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  onSettingsChange({
                    showCountdown: true,
                    countdownStyle: st.id,
                    countdownBgColor: undefined,
                    countdownAccentColor: undefined,
                    countdownTextColor: undefined,
                  })
                }
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#023859] ring-2 ring-[#023859]/15 bg-[#F8FBFC]"
                    : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-extrabold text-[#011C40] truncate">{st.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
                      {st.tag}
                    </span>
                  </div>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-[#023859] bg-[#023859] text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </span>
                </div>

                <div
                  className="w-full rounded-xl px-3 py-2 flex items-center justify-between gap-2 border shadow-2xs"
                  style={{
                    background: st.previewBg,
                    borderColor: st.previewBorder,
                    color: st.previewText,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs"
                      style={{ backgroundColor: st.previewAccent }}
                    >
                      <Flame className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider truncate">
                        Offre Limitée
                      </span>
                      <span className="block text-[8px] opacity-75 truncate">Tarif privilège</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 font-mono tabular-nums">
                    {PREVIEW_UNITS.map((item) => (
                      <span
                        key={item.u}
                        className="px-1.5 py-1 rounded-md text-[9px] font-black leading-none border flex items-baseline gap-0.5"
                        style={{
                          backgroundColor: st.previewSurface,
                          borderColor: item.accent ? st.previewAccent : st.previewBorder,
                          color: item.accent ? st.previewAccent : st.previewText,
                        }}
                      >
                        <span>{item.v}</span>
                        <span className="text-[7px] opacity-75">{item.u}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">{st.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 shadow-2xs">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#011C40] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#023859]" />
          <span>Échéance & Textes de l&apos;Offre</span>
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_DURATIONS.map((dur) => (
            <button
              key={dur.label}
              type="button"
              onClick={() => applyQuickDuration(dur.hours)}
              className="h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-[#F0F7FA] hover:border-[#26658C] text-[10px] font-bold text-[#011C40] transition-colors cursor-pointer"
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

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#011C40] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#023859]" />
            <span>Couleurs & Jauge de Stock</span>
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
              className="text-[10px] font-semibold text-[#023859] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Réinitialiser
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-600 block">Fond Bannière</span>
            <input
              type="color"
              value={(settings.countdownBgColor as string) || "#011C40"}
              onChange={(e) => onSettingsChange("countdownBgColor", e.target.value)}
              className="h-7 w-full rounded cursor-pointer"
            />
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-600 block">Couleur d&apos;Accent</span>
            <input
              type="color"
              value={(settings.countdownAccentColor as string) || "#023859"}
              onChange={(e) => onSettingsChange("countdownAccentColor", e.target.value)}
              className="h-7 w-full rounded cursor-pointer"
            />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#011C40]">Jauge de Stock Réel</span>
          <button
            type="button"
            onClick={() => onSettingsChange("showStockProgress", !showStockProgress)}
            className={`h-7 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
              showStockProgress ? "bg-[#023859] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {showStockProgress ? "Activée" : "Désactivée"}
          </button>
        </div>
      </div>
    </div>
  );
};
