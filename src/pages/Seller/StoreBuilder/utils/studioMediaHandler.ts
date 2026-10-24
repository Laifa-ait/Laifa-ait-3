import { toast } from "react-hot-toast";
import { CustomPageSection } from "../../../../domains/seller/customPage.types";

export const applyMediaToSection = (
  selectedSection: CustomPageSection | null,
  url: string,
  updateSection: (id: string, updatedData: Partial<CustomPageSection>) => void,
  onSuccess: () => void
) => {
  if (!selectedSection) {
    toast.error("Sélectionnez d'abord une section avec un visuel.");
    return;
  }
  const settings = selectedSection.settings as unknown as Record<string, unknown>;
  const field =
    typeof settings.imageUrl === "string"
      ? "imageUrl"
      : typeof settings.posterUrl === "string"
        ? "posterUrl"
        : typeof settings.videoUrl === "string"
          ? "videoUrl"
          : selectedSection.type === "showcase_video"
            ? "posterUrl"
            : null;

  if (field) {
    updateSection(selectedSection.id, {
      settings: { ...settings, [field]: url } as unknown as CustomPageSection["settings"],
    });
  } else {
    const listField =
      selectedSection.type === "promo_carousel"
        ? "slides"
        : selectedSection.type === "featured_categories"
          ? "categories"
          : selectedSection.type === "curated_collections"
            ? "collections"
            : null;
    const list =
      listField && Array.isArray(settings[listField]) ? (settings[listField] as Array<Record<string, unknown>>) : [];
    if (!listField || list.length === 0) {
      toast.error("Ajoutez d'abord un élément dans cette section pour y placer un visuel.");
      return;
    }
    const firstItem = { ...list[0], imageUrl: url };
    updateSection(selectedSection.id, {
      settings: {
        ...settings,
        [listField]: [firstItem, ...list.slice(1)],
      } as unknown as CustomPageSection["settings"],
    });
  }
  onSuccess();
  toast.success("Visuel appliqué à la section sélectionnée.");
};
