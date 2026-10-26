import React, { useState, useEffect, useCallback } from "react";
import { Clock, Flame, Sparkles } from "lucide-react";

export type CountdownBannerStyle =
  | "dark-pro"
  | "minimal-pill"
  | "warm-sunset"
  | "nordic-fresh"
  | "y2k-pink"
  | "theme-match";

interface LiveCountdownBannerProps {
  label?: string;
  subtitle?: string;
  endDate?: string;
  countdownStyle?: CountdownBannerStyle;
  bannerBgColor?: string;
  bannerTextColor?: string;
  accentColor?: string;
  themePrimaryColor?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeRemaining(endDate?: string, fallbackTargetMs?: number): TimeRemaining {
  const now = Date.now();
  let targetMs = fallbackTargetMs || now + (2 * 86400 + 14 * 3600 + 36 * 60 + 48) * 1000;

  if (endDate) {
    const parsed = new Date(endDate).getTime();
    if (!Number.isNaN(parsed) && parsed > now) {
      targetMs = parsed;
    }
  }

  const diffSec = Math.max(0, Math.floor((targetMs - now) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  return { days, hours, minutes, seconds };
}

interface StylePresetVisuals {
  containerClass: string;
  defaultBg?: string;
  defaultText: string;
  defaultSubtitle: string;
  defaultAccent: string;
  badgeClass: string;
  digitBoxClass: string;
  secondsBoxClass: string;
  separatorClass: string;
}

function resolveStylePreset(
  style: CountdownBannerStyle,
  themePrimaryColor: string
): StylePresetVisuals {
  switch (style) {
    case "minimal-pill":
      return {
        containerClass:
          "bg-white border border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.05)]",
        defaultText: "#0F172A",
        defaultSubtitle: "#64748B",
        defaultAccent: "#E11D48",
        badgeClass: "bg-rose-50 text-rose-600 border border-rose-200/80",
        digitBoxClass:
          "bg-slate-50 text-slate-900 border border-slate-200/90 rounded-xl shadow-2xs",
        secondsBoxClass:
          "bg-rose-50 text-rose-600 border border-rose-200 rounded-xl shadow-2xs",
        separatorClass: "text-slate-300",
      };
    case "warm-sunset":
      return {
        containerClass:
          "bg-gradient-to-r from-[#261005] via-[#3E1805] to-[#1E110A] border border-amber-500/30 shadow-[0_12px_30px_rgba(69,26,3,0.28)]",
        defaultText: "#FFFBEB",
        defaultSubtitle: "#FDE68A",
        defaultAccent: "#F59E0B",
        badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
        digitBoxClass:
          "bg-black/40 text-[#FFFBEB] border border-amber-500/25 rounded-xl backdrop-blur-xs",
        secondsBoxClass:
          "bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl backdrop-blur-xs",
        separatorClass: "text-amber-500/60",
      };
    case "nordic-fresh":
      return {
        containerClass:
          "bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#043927] border border-emerald-400/30 shadow-[0_12px_30px_rgba(2,44,34,0.25)]",
        defaultText: "#ECFDF5",
        defaultSubtitle: "#A7F3D0",
        defaultAccent: "#10B981",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
        digitBoxClass:
          "bg-black/35 text-[#ECFDF5] border border-emerald-400/25 rounded-xl backdrop-blur-xs",
        secondsBoxClass:
          "bg-emerald-500/25 text-emerald-200 border border-emerald-400/45 rounded-xl backdrop-blur-xs",
        separatorClass: "text-emerald-400/60",
      };
    case "y2k-pink":
      return {
        containerClass:
          "bg-gradient-to-r from-[#4C0519] via-[#701A46] to-[#3B0726] border border-rose-400/30 shadow-[0_12px_30px_rgba(76,5,25,0.28)]",
        defaultText: "#FFF1F2",
        defaultSubtitle: "#FECDD3",
        defaultAccent: "#FB7185",
        badgeClass: "bg-rose-500/25 text-rose-200 border border-rose-400/35",
        digitBoxClass:
          "bg-black/35 text-[#FFF1F2] border border-rose-300/20 rounded-xl backdrop-blur-xs",
        secondsBoxClass:
          "bg-rose-500/25 text-rose-200 border border-rose-400/45 rounded-xl backdrop-blur-xs",
        separatorClass: "text-rose-400/60",
      };
    case "theme-match":
      return {
        containerClass:
          "border border-white/20 shadow-[0_12px_30px_rgba(1,28,64,0.18)]",
        defaultBg: themePrimaryColor || "#023859",
        defaultText: "#FFFFFF",
        defaultSubtitle: "rgba(255,255,255,0.82)",
        defaultAccent: "#A7EBF2",
        badgeClass: "bg-white/15 text-white border border-white/25 backdrop-blur-xs",
        digitBoxClass:
          "bg-black/25 text-white border border-white/20 rounded-xl backdrop-blur-xs",
        secondsBoxClass:
          "bg-white/20 text-white border border-white/40 rounded-xl backdrop-blur-xs",
        separatorClass: "text-white/60",
      };
    case "dark-pro":
    default:
      return {
        containerClass:
          "bg-gradient-to-r from-[#011C40] via-[#022B59] to-[#0F172A] border border-[#54ACBF]/30 shadow-[0_12px_30px_rgba(1,28,64,0.24)]",
        defaultText: "#F8FAFC",
        defaultSubtitle: "#CBD5E1",
        defaultAccent: "#38BDF8",
        badgeClass: "bg-[#54ACBF]/20 text-[#A7EBF2] border border-[#54ACBF]/35",
        digitBoxClass:
          "bg-white/[0.07] text-white border border-white/15 rounded-xl backdrop-blur-xs",
        secondsBoxClass:
          "bg-[#54ACBF]/20 text-[#A7EBF2] border border-[#54ACBF]/45 rounded-xl backdrop-blur-xs",
        separatorClass: "text-[#54ACBF]/70",
      };
  }
}

export const LiveCountdownBanner: React.FC<LiveCountdownBannerProps> = ({
  label = "OFFRE PRIVILÈGE À DURÉE LIMITÉE",
  subtitle = "Profitez des tarifs préférentiels avant la fin du compte à rebours",
  endDate,
  countdownStyle = "dark-pro",
  bannerBgColor,
  bannerTextColor,
  accentColor,
  themePrimaryColor = "#023859",
}) => {
  const [fallbackTargetMs] = useState<number>(
    () => Date.now() + (2 * 86400 + 14 * 3600 + 36 * 60 + 48) * 1000
  );

  const calc = useCallback(
    () => computeTimeRemaining(endDate, fallbackTargetMs),
    [endDate, fallbackTargetMs]
  );

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calc);

  useEffect(() => {
    setTimeLeft(calc());
    const timer = setInterval(() => {
      setTimeLeft(calc());
    }, 1000);
    return () => clearInterval(timer);
  }, [calc]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const preset = resolveStylePreset(countdownStyle, themePrimaryColor);
  const resolvedAccent = accentColor || preset.defaultAccent;
  const resolvedBg = bannerBgColor || preset.defaultBg;
  const resolvedText = bannerTextColor || preset.defaultText;

  const units = [
    { value: pad(timeLeft.days), unitLabel: "Jours", isSeconds: false },
    { value: pad(timeLeft.hours), unitLabel: "Heures", isSeconds: false },
    { value: pad(timeLeft.minutes), unitLabel: "Min", isSeconds: false },
    { value: pad(timeLeft.seconds), unitLabel: "Sec", isSeconds: true },
  ];

  return (
    <div
      style={{
        backgroundColor: resolvedBg,
        color: resolvedText,
      }}
      className={`mb-6 flex flex-col @md:flex-row @md:items-center justify-between gap-3.5 rounded-2xl px-4 py-3.5 @sm:px-5 @sm:py-4 transition-all select-none ${preset.containerClass}`}
    >
      {/* Left Column: Editorial Badge + Headline + Subtitle */}
      <div className="flex items-start @sm:items-center gap-3 min-w-0">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm shrink-0"
          style={{ backgroundColor: resolvedAccent }}
        >
          {countdownStyle === "minimal-pill" ? (
            <Clock className="h-4 w-4 text-white" />
          ) : (
            <Flame className="h-4 w-4 text-white" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${preset.badgeClass}`}
            >
              <Sparkles className="h-2.5 w-2.5 shrink-0" />
              <span>Édition Limitée</span>
            </span>
            <h4
              className="text-xs @sm:text-sm font-extrabold uppercase tracking-wider truncate"
              style={{ color: resolvedText }}
            >
              {label}
            </h4>
          </div>

          {subtitle && (
            <p
              className="text-[11px] @sm:text-xs mt-0.5 line-clamp-1 font-medium"
              style={{ color: bannerTextColor || preset.defaultSubtitle }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Segmented Tabular Countdown Blocks */}
      <div className="flex items-center justify-start @md:justify-end gap-1.5 shrink-0 font-mono tabular-nums">
        {units.map((u, idx) => (
          <React.Fragment key={u.unitLabel}>
            <div
              className={`flex flex-col items-center justify-center px-2.5 py-1.5 min-w-[44px] @sm:min-w-[48px] transition-colors ${
                u.isSeconds ? preset.secondsBoxClass : preset.digitBoxClass
              }`}
              style={
                u.isSeconds && accentColor
                  ? {
                      borderColor: `${accentColor}66`,
                      color: bannerTextColor || accentColor,
                    }
                  : undefined
              }
            >
              <span className="text-sm @sm:text-base font-black leading-none tracking-tight">
                {u.value}
              </span>
              <span className="text-[8px] font-sans font-bold uppercase tracking-widest opacity-75 mt-1">
                {u.unitLabel}
              </span>
            </div>
            {idx < units.length - 1 && (
              <span className={`text-xs font-black ${preset.separatorClass}`}>:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
