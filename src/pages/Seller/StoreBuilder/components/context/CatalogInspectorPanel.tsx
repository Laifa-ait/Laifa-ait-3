import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Star,
  ExternalLink,
  Plus,
  Megaphone,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import { Product } from "../../../../../domains/product/product.types";
import { CustomPageSection, CustomPageSectionType } from "../../../../../domains/seller/customPage.types";

interface CatalogInspectorPanelProps {
  products: Product[];
  sections: CustomPageSection[];
  onUpdateSection: (id: string, updatedData: Partial<CustomPageSection>) => void;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
}

export const CatalogInspectorPanel: React.FC<CatalogInspectorPanelProps> = ({
  products,
  sections,
  onUpdateSection,
  onAddSection,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredSection = useMemo(
    () => sections.find((s) => s.type === "featured_products") || null,
    [sections]
  );

  const featuredProductIds = useMemo(() => {
    if (!featuredSection) return new Set<string>();
    const raw = (featuredSection.settings as { productIds?: string[] }).productIds;
    return new Set(Array.isArray(raw) ? raw : []);
  }, [featuredSection]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const inStockCount = useMemo(
    () => products.filter((p) => (p.stock ?? 0) > 0).length,
    [products]
  );

  const handleToggleFeatured = (productId: string) => {
    if (!featuredSection) {
      onAddSection(
        "featured_products",
        {
          title: "Nos Articles en Vedette",
          productIds: [productId],
          layout: "grid",
        },
        "Articles en Vedette"
      );
      return;
    }

    const currentIds = Array.from(featuredProductIds);
    const nextIds = featuredProductIds.has(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];

    onUpdateSection(featuredSection.id, {
      settings: {
        ...featuredSection.settings,
        productIds: nextIds,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#E4E7EC] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[#17191C]">
              Catalogue Boutique ({products.length})
            </h2>
            <p className="text-[12px] text-[#667085]">
              Sélectionnez les articles à mettre en vitrine
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/seller/products")}
            className="h-8 px-2.5 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C] border border-[#FDBA74] rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gérer</span>
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <div>
              <span className="block text-[13px] font-bold text-[#17191C]">
                {inStockCount} / {products.length}
              </span>
              <span className="block text-[10px] text-[#667085]">En stock actif</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FDBA74]/60 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F97316] shrink-0" />
            <div>
              <span className="block text-[13px] font-bold text-[#9A3412]">
                {featuredProductIds.size}
              </span>
              <span className="block text-[10px] text-[#C2410C]">En vedette vitrine</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit ou rayon..."
            className="w-full h-9 pl-8 pr-3 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg text-[12px] text-[#17191C] focus:bg-white focus:border-[#F97316] focus:outline-none"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="p-6 text-center bg-[#F9FAFB] rounded-xl border border-[#E4E7EC] space-y-2.5 my-2">
            <ShoppingBag className="w-7 h-7 text-[#F97316] mx-auto" />
            <p className="text-[13px] font-semibold text-[#17191C]">
              {products.length === 0 ? "Aucun produit au catalogue" : "Aucun produit trouvé"}
            </p>
            <p className="text-[11px] text-[#667085]">
              Ajoutez vos marchandises dans votre espace produits pour les afficher dans votre boutique.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard/seller/products")}
              className="w-full h-9 bg-[#F97316] hover:bg-[#EA580C] text-white text-[12px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Ajouter un produit
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isFeatured = featuredProductIds.has(product.id);
            const stock = product.stock ?? 0;
            return (
              <div
                key={product.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                  isFeatured
                    ? "bg-[#FFF7ED]/70 border-[#FDBA74]"
                    : "bg-white border-[#E4E7EC] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="w-11 h-11 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#17191C] truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-[#EA580C] font-mono">
                      {Number(product.price || 0).toLocaleString("fr-DZ")} DZD
                    </span>
                    {stock > 0 ? (
                      <span className="text-[10px] text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.2 rounded">
                        Stock: {stock}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#B42318] bg-[#FEF2F2] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Rupture
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFeatured(product.id)}
                  className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                    isFeatured
                      ? "bg-[#F97316] text-white"
                      : "bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#475467] hover:text-[#EA580C] border border-[#E4E7EC]"
                  }`}
                  title={isFeatured ? "Retirer de la sélection vedette" : "Mettre en vedette sur la vitrine"}
                >
                  <Star className={`w-3 h-3 ${isFeatured ? "fill-white" : ""}`} />
                  <span>{isFeatured ? "Vedette" : "Exposer"}</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions: Catalog & Advertising */}
      <div className="p-3 border-t border-[#E4E7EC] bg-[#F8FAFC] space-y-2">
        <button
          type="button"
          onClick={() => navigate("/dashboard/seller/sponsorships")}
          className="w-full h-9 px-3 rounded-lg bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74] text-[12px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Sponsoriser mes produits (Pub Olmart)</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
