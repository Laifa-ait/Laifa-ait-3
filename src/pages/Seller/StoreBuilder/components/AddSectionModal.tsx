import React, { useState, useMemo, useEffect } from "react";
import { X, Search, Plus } from "lucide-react";
import { CustomPageSectionType, StoreThemeSector } from "../../../../domains/seller/customPage.types";
import { SECTION_CATALOG, SectionOption } from "../constants/sectionCatalog";
import { buildSectorAwareSectionDefaults, getSectorCategoryPreset } from "../constants/sectorCoherenceDefaults";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSector?: StoreThemeSector;
  onAddSection: (
    type: CustomPageSectionType,
    defaultSettings: Record<string, unknown>,
    defaultTitle?: string
  ) => void;
}

const SECTOR_OPTIONS: Array<{ id: StoreThemeSector; label: string }> = [
  { id: "mode", label: "Mode & Chic" },
  { id: "tech", label: "High-Tech" },
  { id: "beaute", label: "Beauté & Soins" },
  { id: "artisanat", label: "Artisanat" },
  { id: "maison", label: "Maison & Déco" },
  { id: "alimentation", label: "Alimentation" },
  { id: "sport", label: "Sport & Fitness" },
  { id: "accessoires", label: "Accessoires" },
  { id: "enfants", label: "Enfants & Bébés" },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen, onClose, activeSector = "mode", onAddSection,
}) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<StoreThemeSector>(activeSector);

  useEffect(() => {
    if (activeSector) setSelectedSector(activeSector);
  }, [activeSector]);

  const categories: Array<SectionOption["category"]> = [
    "Bannières & Vitrine",
    "Catalogue Produits",
    "Marque & Histoire",
    "Confiance & Contact",
  ];

  const sectorPreset = useMemo(() => getSectorCategoryPreset(selectedSector), [selectedSector]);

  const dynamicBlueprints = useMemo(
    () => [
      {
        id: `blueprint-${selectedSector}-flagship`,
        title: `Pack Complet ${sectorPreset.name}`,
        tag: sectorPreset.tag,
        description: `Bannière + Rayons (${sectorPreset.settings.categories.length} catégories) + Produits Vedettes + Livraison 69 Wilayas + Avis.`,
        sections: [
          { type: "hero_banner" as const, title: `Vitrine ${sectorPreset.name}` },
          { type: "featured_categories" as const, title: sectorPreset.settings.title },
          { type: "featured_products" as const, title: "Articles Phares en Stock" },
          { type: "delivery_info" as const, title: "Livraison Rapide 69 Wilayas" },
          { type: "verified_reviews" as const, title: "Avis Clients Vérifiés" },
        ],
      },
      {
        id: `blueprint-${selectedSector}-promo`,
        title: `Pack Campagne & Conversion (${sectorPreset.tag})`,
        tag: "Conversion",
        description: `Carrousel Promo + Rayons ${sectorPreset.tag} + Meilleures Ventes + FAQ + Contact.`,
        sections: [
          { type: "promo_carousel" as const, title: "Offres Flash de la Semaine" },
          { type: "featured_categories" as const, title: sectorPreset.settings.title },
          { type: "best_sellers" as const, title: "Nos Meilleures Ventes" },
          { type: "faq_accordion" as const, title: "Questions Fréquentes" },
          { type: "contact_footer" as const, title: "Support & Coordonnées" },
        ],
      },
    ],
    [selectedSector, sectorPreset]
  );

  const filteredSections = useMemo(() => {
    return SECTION_CATALOG.filter((s) => {
      const matchesCat = activeCategory === "all" || s.category === activeCategory;
      const q = search.trim().toLowerCase();
      return matchesCat && (!q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    });
  }, [search, activeCategory]);

  if (!isOpen) return null;

  const handleCreateCoherentSection = (type: CustomPageSectionType, baseSettings: Record<string, unknown>, customTitle?: string) => {
    const coherent = buildSectorAwareSectionDefaults(type, baseSettings, selectedSector);
    onAddSection(type, coherent, customTitle);
  };

  const handleApplyBlueprint = (bpSections: Array<{ type: CustomPageSectionType; title: string }>) => {
    bpSections.forEach((item) => {
      const found = SECTION_CATALOG.find((s) => s.type === item.type);
      if (found) handleCreateCoherentSection(found.type, found.defaultSettings, item.title);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none" onClick={onClose}>
      <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[88vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()} data-testid="add-section-modal">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Bibliothèque de sections</h2>
            <p className="text-[12px] text-slate-500">Les contenus créés s&apos;adaptent automatiquement au secteur sélectionné</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11.5px] font-medium text-slate-600">Secteur d&apos;activité cible</span>
            <div className="flex flex-wrap gap-1" data-testid="modal-sector-selector">
              {SECTOR_OPTIONS.map((secOpt) => (
                <button
                  key={secOpt.id}
                  type="button"
                  data-testid={`modal-sector-${secOpt.id}`}
                  onClick={() => setSelectedSector(secOpt.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedSector === secOpt.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
                  }`}
                >
                  {secOpt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher (bannière, rayons, livraison, avis)..." className="w-full h-8.5 pl-8 pr-3 rounded-lg bg-white border border-slate-200 text-[12px] text-slate-900 focus:border-slate-900 focus:outline-none" />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button type="button" onClick={() => setActiveCategory("all")} className={`h-8 px-2.5 rounded-md text-[11.5px] font-medium shrink-0 cursor-pointer whitespace-nowrap ${activeCategory === "all" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>Toutes ({SECTION_CATALOG.length})</button>
              {categories.map((cat) => (
                <button key={cat} type="button" onClick={() => setActiveCategory(cat)} className={`h-8 px-2.5 rounded-md text-[11.5px] font-medium shrink-0 cursor-pointer whitespace-nowrap ${activeCategory === cat ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>{cat}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {activeCategory === "all" && !search.trim() && (
            <div className="space-y-2">
              <span className="text-[11.5px] font-medium text-slate-500 block">Packs pré-assemblés · {sectorPreset.name}</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {dynamicBlueprints.map((bp) => (
                  <button key={bp.id} type="button" data-testid={`apply-blueprint-${bp.id}`} onClick={() => handleApplyBlueprint(bp.sections)} className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-900 bg-white transition-colors cursor-pointer flex flex-col justify-between gap-2 text-left">
                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="font-semibold text-[12.5px] text-slate-900">{bp.title}</span>
                        <span className="text-[11px] text-slate-500 shrink-0">{bp.tag}</span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed">{bp.description}</p>
                    </div>
                    <span className="text-[11.5px] font-medium text-slate-900 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /><span>Ajouter les {bp.sections.length} sections</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[11.5px] font-medium text-slate-500 block">Sections individuelles</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button key={sec.type} type="button" data-testid={`add-section-option-${sec.type}`} onClick={() => { handleCreateCoherentSection(sec.type, sec.defaultSettings, sec.title); onClose(); }} className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-lg text-left transition-colors group cursor-pointer flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-50 group-hover:bg-slate-900 text-slate-700 group-hover:text-white shrink-0 border border-slate-200 flex items-center justify-center transition-colors"><Icon className="w-4 h-4" /></div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-[12.5px] text-slate-900 truncate">{sec.title}</span>
                        <span className="text-[11px] text-slate-400 shrink-0">{sec.category.split(" ")[0]}</span>
                      </div>
                      <span className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed block">{sec.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
