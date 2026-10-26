import React, { useState, useMemo } from "react";
import { X, Search, Sparkles, Wand2, Plus } from "lucide-react";
import { CustomPageSectionType } from "../../../../domains/seller/customPage.types";
import { SECTION_CATALOG, SectionOption } from "../constants/sectionCatalog";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
}

const STORE_BLUEPRINTS: Array<{
  id: string;
  title: string;
  tag: string;
  description: string;
  sections: Array<{ type: CustomPageSectionType; title: string }>;
}> = [
  {
    id: "blueprint-fashion",
    title: "Pack Boutique Mode & Luxe 2.0",
    tag: "Haute Conversion",
    description:
      "Bannière Hero + Rayons Populaires Bento + Produits Vedettes + Livraison 58 Wilayas + Avis.",
    sections: [
      { type: "hero_banner", title: "Nouvelle Collection 2026" },
      { type: "featured_categories", title: "Nos Rayons Mode" },
      { type: "featured_products", title: "Pièces Phares de la Saison" },
      { type: "delivery_info", title: "Livraison Rapide 58 Wilayas" },
      { type: "verified_reviews", title: "Avis de nos Clientes" },
    ],
  },
  {
    id: "blueprint-tech",
    title: "Pack Boutique High-Tech & Électro",
    tag: "Performance",
    description:
      "Carrousel Promo + Rayons Tech + Meilleures Ventes + FAQ Garantie + Pied de page Contact.",
    sections: [
      { type: "promo_carousel", title: "Offres Flash de la Semaine" },
      { type: "featured_categories", title: "Catégories High-Tech" },
      { type: "best_sellers", title: "Nos Meilleures Ventes" },
      { type: "faq_accordion", title: "Garantie & Questions Fréquentes" },
      { type: "contact_footer", title: "Support & Point de Vente" },
    ],
  },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
}) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories: Array<SectionOption["category"]> = [
    "Bannières & Vitrine",
    "Catalogue Produits",
    "Marque & Histoire",
    "Confiance & Contact",
  ];

  const filteredSections = useMemo(() => {
    return SECTION_CATALOG.filter((s) => {
      const matchesCat = activeCategory === "all" || s.category === activeCategory;
      const q = search.trim().toLowerCase();
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [search, activeCategory]);

  if (!isOpen) return null;

  const handleApplyBlueprint = (
    bpSections: Array<{ type: CustomPageSectionType; title: string }>
  ) => {
    bpSections.forEach((item) => {
      const found = SECTION_CATALOG.find((s) => s.type === item.type);
      if (found) {
        onAddSection(found.type, found.defaultSettings, item.title);
      }
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[88vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Bibliothèque de Sections Studio 2.0
              </h2>
              <p className="text-xs text-slate-500">
                Injectez un composant individuel ou un pack d'architecture complet en 1 clic
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search + Category Filter Pills */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une section (ex: bannière, rayons, livraison, vidéo, avis)..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                activeCategory === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Toutes ({SECTION_CATALOG.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          {/* 1-Click Complete Store Blueprints */}
          {activeCategory === "all" && !search.trim() && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-600">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Packs d'Architecture Complets (5 Sections en 1 Clic)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {STORE_BLUEPRINTS.map((bp) => (
                  <div
                    key={bp.id}
                    onClick={() => handleApplyBlueprint(bp.sections)}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-200 hover:border-orange-500 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-extrabold text-xs text-slate-900 group-hover:text-orange-600">
                          {bp.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                          {bp.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {bp.description}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Injecter les {bp.sections.length} sections automatiquement</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.type}
                  type="button"
                  onClick={() => {
                    onAddSection(sec.type, sec.defaultSettings, sec.title);
                    onClose();
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-orange-50/60 border border-slate-200 hover:border-orange-400 rounded-2xl text-left transition-all group cursor-pointer flex items-start gap-3 shadow-2xs"
                >
                  <div className="p-2.5 rounded-xl bg-white group-hover:bg-orange-500 text-orange-600 group-hover:text-white shrink-0 transition-colors border border-slate-200 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate group-hover:text-orange-700">
                        {sec.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {sec.category.split(" ")[0]}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed block">
                      {sec.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
