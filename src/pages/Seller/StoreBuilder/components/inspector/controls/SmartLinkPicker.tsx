import React, { useState, useMemo } from "react";
import { Link2, FolderOpen, ShoppingBag, Layers, Globe, CheckCircle2, AlertTriangle } from "lucide-react";
import { CategoryItem, CustomPageSection } from "../../../../../../domains/seller/customPage.types";
import { Product } from "../../../../../../domains/product/product.types";
import { safeNavigationHref } from "../../../../../../components/Store/sections/safeNavigationHref";

interface SmartLinkPickerProps {
  label?: string;
  value: string;
  onChange: (newHref: string) => void;
  products?: Product[];
  categories?: CategoryItem[];
  sections?: CustomPageSection[];
}

type LinkTabMode = "category" | "product" | "section" | "custom";

const DEFAULT_SECTION_ANCHORS = [
  { id: "#catalog", label: "Catalogue Complet (Tous les produits)" },
  { id: "#new-arrivals", label: "Section Nouveautés" },
  { id: "#livraison", label: "Tarifs de Livraison 69 Wilayas" },
  { id: "#faq", label: "Questions Fréquentes (FAQ)" },
  { id: "#contact", label: "Pied de Boutique & Contact" },
];

export const SmartLinkPicker: React.FC<SmartLinkPickerProps> = ({
  label = "Destination du bouton (Lien intelligent)",
  value,
  onChange,
  products = [],
  categories = [],
  sections = [],
}) => {
  const initialTab: LinkTabMode = useMemo(() => {
    if (value.startsWith("#rayon:")) return "category";
    if (value.startsWith("/product/") || value.startsWith("#product:")) return "product";
    if (value.startsWith("#")) return "section";
    return "custom";
  }, [value]);

  const [activeTab, setActiveTab] = useState<LinkTabMode>(initialTab);

  const resolvedCategories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string }>();
    for (const c of categories) {
      if (c.slug && c.name) map.set(c.slug, { slug: c.slug, name: c.name });
    }
    for (const sec of sections) {
      if (sec.type === "featured_categories") {
        const cats = (sec.settings as { categories?: CategoryItem[] })?.categories;
        if (Array.isArray(cats)) {
          for (const c of cats) {
            if (c.slug && c.name) map.set(c.slug, { slug: c.slug, name: c.name });
          }
        }
      }
    }
    for (const p of products) {
      if (p.category) {
        const slug = p.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
        if (!map.has(slug)) map.set(slug, { slug, name: p.category });
      }
    }
    return Array.from(map.values());
  }, [categories, sections, products]);

  const resolvedSections = useMemo(() => {
    if (sections.length === 0) return DEFAULT_SECTION_ANCHORS;
    return [
      { id: "#catalog", label: "Catalogue Complet de la boutique" },
      ...sections.map((s, idx) => ({
        id: `#studio-section-${s.id}`,
        label: `${idx + 1}. ${s.title || s.type.replace(/_/g, " ")}`,
      })),
    ];
  }, [sections]);

  const isCustomValid = !value || Boolean(safeNavigationHref(value));

  return (
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 select-none">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-[#F97316]" />
          <span>{label}</span>
        </span>
        {value && (
          <span className="text-[10px] font-mono text-[#EA580C] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 max-w-[130px] truncate">
            {value}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold">
        {[
          { id: "category" as const, label: "Rayon", icon: FolderOpen },
          { id: "product" as const, label: "Produit", icon: ShoppingBag },
          { id: "section" as const, label: "Section", icon: Layers },
          { id: "custom" as const, label: "Lien libre", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 px-1 rounded-md flex items-center justify-center gap-1 cursor-pointer ${
                isAct ? "bg-[#F97316] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "category" && (
        <div className="max-h-32 overflow-y-auto space-y-1 pr-0.5">
          {resolvedCategories.length === 0 ? (
            <p className="text-[11px] text-slate-500 p-2 bg-white rounded-lg border border-slate-200">
              Aucun rayon détecté. Créez des rayons ou choisissez l'onglet Section.
            </p>
          ) : (
            resolvedCategories.map((cat) => {
              const targetHref = `#rayon:${cat.slug}`;
              const isSel = value === targetHref;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onChange(targetHref)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-semibold cursor-pointer ${
                    isSel ? "border-[#F97316] bg-[#FFF7ED] text-[#EA580C] font-bold" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <span className="truncate">Rayon : {cat.name}</span>
                  {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#F97316] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}

      {activeTab === "product" && (
        <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
          {products.length === 0 ? (
            <p className="text-[11px] text-slate-500 p-2 bg-white rounded-lg border border-slate-200">
              Aucun produit actif dans votre catalogue vendeur.
            </p>
          ) : (
            products.slice(0, 25).map((prod) => {
              const targetHref = `/product/${prod.id}`;
              const isSel = value === targetHref;
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => onChange(targetHref)}
                  className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border text-left text-[11px] cursor-pointer ${
                    isSel ? "border-[#F97316] bg-[#FFF7ED] text-[#EA580C] font-bold" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <span className="truncate font-semibold">{prod.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{prod.price} DA</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {activeTab === "section" && (
        <div className="max-h-32 overflow-y-auto space-y-1 pr-0.5">
          {resolvedSections.map((sec) => {
            const isSel = value === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onChange(sec.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-semibold cursor-pointer ${
                  isSel ? "border-[#F97316] bg-[#FFF7ED] text-[#EA580C] font-bold" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span className="truncate">{sec.label}</span>
                {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#F97316] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "custom" && (
        <div className="space-y-1">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(safeNavigationHref(e.target.value) ?? e.target.value)}
              placeholder="Ex: #catalog, /shop/promo ou https://..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-[11px] font-mono text-slate-900 focus:border-[#F97316] focus:outline-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {isCustomValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
            </span>
          </div>
          {!isCustomValid && (
            <p className="text-[10px] text-amber-700">Seuls les ancres (#), chemins relatifs (/...) ou liens HTTPS sont autorisés.</p>
          )}
        </div>
      )}
    </div>
  );
};
