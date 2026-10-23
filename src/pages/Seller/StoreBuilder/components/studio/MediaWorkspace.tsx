import React from "react";
import { MediaInspectorPanel } from "../context/MediaInspectorPanel";
import { MediaGalleryItem } from "../../../../../domains/seller/customPage.types";

interface MediaWorkspaceProps {
  mediaGallery?: MediaGalleryItem[];
}

export const MediaWorkspace: React.FC<MediaWorkspaceProps> = ({ mediaGallery = [] }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      <MediaInspectorPanel mediaGallery={mediaGallery} />
    </div>
  );
};

