import React from "react";

interface SectionResponsiveTabProps {
  settings: Record<string, unknown>;
  onSettingsChange: (field: string, value: unknown) => void;
}

export const SectionResponsiveTab: React.FC<SectionResponsiveTabProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EC]">
        <p className="text-[13px] font-semibold text-[#17191C]">Comportement Mobile & Tablette</p>
        <p className="text-[12px] text-[#667085] mt-0.5">
          Ajustez le comportement d'affichage de cette section sur les appareils mobiles.
        </p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#17191C] p-2 hover:bg-[#F7F8FA] rounded-lg border border-[#E4E7EC]">
          <input
            type="checkbox"
            checked={Boolean(settings.hideOnMobile)}
            onChange={(e) => onSettingsChange("hideOnMobile", e.target.checked)}
            className="rounded border-[#E4E7EC] text-[#F97316] focus:ring-[#F97316]"
          />
          <span>Masquer cette section sur smartphone</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#17191C] p-2 hover:bg-[#F7F8FA] rounded-lg border border-[#E4E7EC]">
          <input
            type="checkbox"
            checked={Boolean(settings.hideOnDesktop)}
            onChange={(e) => onSettingsChange("hideOnDesktop", e.target.checked)}
            className="rounded border-[#E4E7EC] text-[#F97316] focus:ring-[#F97316]"
          />
          <span>Masquer cette section sur ordinateur</span>
        </label>
      </div>
    </div>
  );
};
