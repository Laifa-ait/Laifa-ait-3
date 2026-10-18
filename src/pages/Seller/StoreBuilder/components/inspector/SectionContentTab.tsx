import React from "react";
import { Image as ImageIcon, Link as LinkIcon, ShoppingBag } from "lucide-react";
import { Product } from "../../../../../domains/product/product.types";

interface SectionContentTabProps {
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
}

export const SectionContentTab: React.FC<SectionContentTabProps> = ({
  settings,
  products,
  onSettingsChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Titre principal */}
      {"title" in settings && (
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] block">
            Titre principal
          </label>
          <input
            type="text"
            value={(settings.title as string) || ""}
            onChange={(e) => onSettingsChange("title", e.target.value)}
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
          />
        </div>
      )}

      {/* Sous-titre */}
      {"subtitle" in settings && (
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] block">
            Sous-titre / Accroche
          </label>
          <input
            type="text"
            value={(settings.subtitle as string) || ""}
            onChange={(e) => onSettingsChange("subtitle", e.target.value)}
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
          />
        </div>
      )}

      {/* Image URL */}
      {"imageUrl" in settings && (
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#F97316]" />
            <span>URL de l'image</span>
          </label>
          <input
            type="url"
            value={(settings.imageUrl as string) || ""}
            onChange={(e) => onSettingsChange("imageUrl", e.target.value)}
            placeholder="https://..."
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[13px] font-mono focus:outline-none focus:border-[#F97316]"
          />
        </div>
      )}

      {/* Content Text (Story / Paragraphs) */}
      {"content" in settings && (
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] block">
            Texte descriptif
          </label>
          <textarea
            value={(settings.content as string) || ""}
            onChange={(e) => onSettingsChange("content", e.target.value)}
            rows={4}
            className="w-full p-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[13px] focus:outline-none focus:border-[#F97316]"
          />
        </div>
      )}

      {/* Sélecteur de produits */}
      {"productIds" in settings && Array.isArray(settings.productIds) && (
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#17191C] flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Articles sélectionnés</span>
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto p-2 bg-[#F5F6F8] border border-[#E4E7EC] rounded-lg">
            {products.length === 0 ? (
              <span className="text-[#667085] text-[13px] block p-2">
                Aucun produit actif disponible.
              </span>
            ) : (
              products.map((p) => {
                const isChecked = (settings.productIds as string[]).includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#FFFFFF] text-[#17191C] cursor-pointer transition-colors text-[13px]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const current = (settings.productIds as string[]) || [];
                        const updated = e.target.checked
                          ? [...current, p.id]
                          : current.filter((id) => id !== p.id);
                        onSettingsChange("productIds", updated);
                      }}
                      className="rounded border-[#E4E7EC] text-[#F97316] focus:ring-[#F97316]"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      {"ctaText" in settings && (
        <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
          <label className="text-[13px] font-medium text-[#17191C] flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Bouton d'Action (CTA)</span>
          </label>
          <input
            type="text"
            value={(settings.ctaText as string) || ""}
            onChange={(e) => onSettingsChange("ctaText", e.target.value)}
            placeholder="Texte du bouton"
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[14px] focus:outline-none focus:border-[#F97316]"
          />
          <input
            type="text"
            value={(settings.ctaLink as string) || ""}
            onChange={(e) => onSettingsChange("ctaLink", e.target.value)}
            placeholder="Lien cible (ex: #catalog)"
            className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg text-[#17191C] text-[13px] font-mono focus:outline-none focus:border-[#F97316]"
          />
        </div>
      )}
    </div>
  );
};
