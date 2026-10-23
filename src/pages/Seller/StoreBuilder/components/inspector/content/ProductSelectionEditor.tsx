import React from "react";
import { ShoppingBag } from "lucide-react";
import { Product } from "../../../../../../domains/product/product.types";

interface ProductSelectionEditorProps {
  settings: Record<string, unknown>;
  products: Product[];
  onSettingsChange: (field: string, value: unknown) => void;
  inputClass: string;
  labelClass: string;
}

export const ProductSelectionEditor: React.FC<ProductSelectionEditorProps> = ({
  settings,
  products,
  onSettingsChange,
  inputClass,
  labelClass,
}) => {
  const productIds = Array.isArray(settings.productIds) ? (settings.productIds as string[]) : [];

  const renderNumber = (field: string, label: string, min: number, max: number, step = 1) => (
    <label key={field} className={labelClass}>
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={typeof settings[field] === "number" ? (settings[field] as number) : ""}
        onChange={(event) =>
          onSettingsChange(field, event.target.value === "" ? undefined : Number(event.target.value))
        }
        className={inputClass}
      />
    </label>
  );

  return (
    <div className="space-y-4">
      {"productIds" in settings && (
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#475467]">
            <ShoppingBag className="h-3.5 w-3.5 text-[#F97316]" />
            Articles mis en avant
          </label>
          <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-[#E4E7EC] bg-[#F9FAFB] p-2">
            {products.length === 0 ? (
              <p className="p-2 text-[12px] text-[#667085]">Ajoutez d'abord des produits à votre boutique.</p>
            ) : (
              products.map((product) => (
                <label
                  key={product.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-[12px] text-[#344054] hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={productIds.includes(product.id)}
                    onChange={(event) =>
                      onSettingsChange(
                        "productIds",
                        event.target.checked
                          ? [...productIds, product.id]
                          : productIds.filter((id) => id !== product.id)
                      )
                    }
                    className="accent-[#F97316]"
                  />
                  <span className="truncate">{product.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {"maxItems" in settings && renderNumber("maxItems", "Nombre maximum d'articles", 2, 24)}

      {"filterCategoryId" in settings && (
        <label className={labelClass}>
          <span>Filtrer par catégorie</span>
          <select
            value={typeof settings.filterCategoryId === "string" ? settings.filterCategoryId : ""}
            onChange={(event) => onSettingsChange("filterCategoryId", event.target.value || undefined)}
            className={inputClass}
          >
            <option value="">Toutes les catégories</option>
            {Array.from(new Set(products.map((product) => product.category).filter(Boolean))).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      )}

      {"layout" in settings && (
        <label className={labelClass}>
          <span>Présentation</span>
          <select
            value={typeof settings.layout === "string" ? settings.layout : "grid"}
            onChange={(event) => onSettingsChange("layout", event.target.value)}
            className={inputClass}
          >
            <option value="grid">Grille</option>
            <option value="carousel">Défilement horizontal</option>
          </select>
        </label>
      )}
    </div>
  );
};
