import React from "react";
import { PagesInspectorPanel } from "../context/PagesInspectorPanel";

export const PagesWorkspace: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      <PagesInspectorPanel />
    </div>
  );
};
