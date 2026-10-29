import React from "react";

interface SectionAdvancedTabProps {
  sectionId: string;
  settings: Record<string, unknown>;
  onSettingsChange: (field: string, value: unknown) => void;
}

export const SectionAdvancedTab: React.FC<SectionAdvancedTabProps> = ({
  sectionId,
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-[#667085] block font-mono">
          Identifiant Unique Section (Read-Only)
        </label>
        <input
          type="text"
          readOnly
          value={sectionId}
          className="w-full h-10 px-3 bg-[#F5F6F8] border border-[#E4E7EC] rounded-lg text-[#667085] text-[12px] font-mono select-all cursor-not-allowed"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#011C40] block">
          Ancre de navigation (#ID)
        </label>
        <input
          type="text"
          value={(settings.anchorId as string) || ""}
          onChange={(e) => onSettingsChange("anchorId", e.target.value || undefined)}
          placeholder="ex: catalogue"
          className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[13px] font-mono focus:outline-none focus:border-[#023859]"
        />
      </div>
    </div>
  );
};
