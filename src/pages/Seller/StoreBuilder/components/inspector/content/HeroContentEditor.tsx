import React from "react";
import { Image as ImageIcon, Link as LinkIcon } from "lucide-react";

interface HeroContentEditorProps {
  sectionType?: string;
  settings: Record<string, unknown>;
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
  labelClass: string;
}

export const HeroContentEditor: React.FC<HeroContentEditorProps> = ({
  sectionType,
  settings,
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  const renderText = (field: string, label: string, placeholder = "") => (
    <label key={field} className={labelClass}>
      <span>{label}</span>
      <input
        type="text"
        value={typeof settings[field] === "string" ? (settings[field] as string) : ""}
        placeholder={placeholder}
        onChange={(event) => onSettingsChange(field, event.target.value)}
        className={inputClass}
      />
    </label>
  );

  const renderUrl = (field: string, label: string, optional = true) => (
    <label key={field} className={labelClass}>
      <span>{label}</span>
      <input
        type="url"
        value={typeof settings[field] === "string" ? (settings[field] as string) : ""}
        onChange={(event) => onSettingsChange(field, optional && !event.target.value ? undefined : event.target.value)}
        placeholder="https://..."
        className={`${inputClass} font-mono text-[12px]`}
      />
    </label>
  );

  return (
    <div className="space-y-4">
      {"title" in settings && renderText("title", "Titre de la section")}
      {"subtitle" in settings && renderText("subtitle", "Sous-titre")}
      {"badgeText" in settings && renderText("badgeText", "Petit badge au-dessus du titre", "Ex. Fabrication locale")}

      {"imageUrl" in settings && (
        <div className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#475467]">
            <ImageIcon className="h-3.5 w-3.5 text-[#F97316]" />
            Image principale
          </span>
          {renderUrl("imageUrl", "Adresse de l'image", sectionType !== "hero_banner")}
        </div>
      )}
      {"mobileImageUrl" in settings && renderUrl("mobileImageUrl", "Image optimisée pour mobile (facultatif)")}
      {"overlayOpacity" in settings && (
        <label className="block space-y-2">
          <span className="flex items-center justify-between text-[12px] font-medium text-[#475467]">
            <span>Voile sombre sur l'image</span>
            <span className="font-mono text-[#F97316]">{Number(settings.overlayOpacity || 0)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : 30}
            onChange={(event) => onSettingsChange("overlayOpacity", Number(event.target.value))}
            className="w-full accent-[#F97316]"
          />
        </label>
      )}

      {sectionType === "showcase_video" && renderUrl("videoUrl", "Adresse de la vidéo")}
      {sectionType === "showcase_video" && renderUrl("posterUrl", "Image de couverture de la vidéo")}
      {"autoplay" in settings && (
        <label className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] p-3 text-[12px] text-[#475467]">
          <input
            type="checkbox"
            checked={Boolean(settings.autoplay)}
            onChange={(event) => onSettingsChange("autoplay", event.target.checked)}
            className="accent-[#F97316]"
          />
          Lecture automatique
        </label>
      )}

      {"ctaText" in settings && (
        <div className="space-y-3 border-t border-[#E4E7EC] pt-4">
          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#17191C]">
            <LinkIcon className="h-3.5 w-3.5 text-[#F97316]" />
            Bouton d'action
          </h3>
          {renderText("ctaText", "Texte du bouton", "Découvrir")}
          {renderText("ctaLink", "Lien du bouton", "#catalog")}
        </div>
      )}
    </div>
  );
};
