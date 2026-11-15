import React, { createContext, useContext } from "react";
import { MediaFolderCategory, MediaGalleryItem } from "../../../../domains/seller/customPage.types";

export interface StudioMediaContextValue {
  mediaGallery: MediaGalleryItem[];
  onUploadMedia?: (file: File, options?: { folder?: MediaFolderCategory; allowVideo?: boolean }) => Promise<MediaGalleryItem>;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadError?: string | null;
}

const StudioMediaContext = createContext<StudioMediaContextValue>({
  mediaGallery: [],
});

export const StudioMediaProvider: React.FC<{
  value: StudioMediaContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <StudioMediaContext.Provider value={value}>{children}</StudioMediaContext.Provider>
);

export function useStudioMediaContext(): StudioMediaContextValue {
  return useContext(StudioMediaContext);
}
