import React, { useState } from "react";
import {
  CustomPageSection,
  CustomPageSectionType,
  StoreCustomPageItem,
  StorePageTemplateId,
  StorePageType,
} from "../../../../../domains/seller/customPage.types";
import { Check, Globe, LayoutTemplate, Search, Sparkles, X } from "lucide-react";

interface PageEditorDrawerProps {
  initialPage?: StoreCustomPageItem | null;
  shopSlug: string;
  sections: CustomPageSection[];
  isSaving: boolean;
  onSave: (page: StoreCustomPageItem) => Promise<void>;
  onCancel: () => void;
}

export function slugifyPagePath(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PAGE_TEMPLATES: Array<{ id: StorePageTemplateId; label: string }> = [
  { id: "default", label: "Standard modulable" },
  { id: "collection", label: "Collection & Produits" },
  { id: "editorial", label: "Histoire & Lookbook" },
  { id: "faq", label: "Centre d'aide / FAQ" },
  { id: "contact", label: "Contact & Localisation" },
  { id: "policy", label: "Livraison & Retours" },
];

const COHERENT_SECTIONS_BY_PAGE_CATEGORY: Record<string, CustomPageSectionType[]> = {
  collections: ["featured_categories", "curated_collections", "featured_products", "new_arrivals", "best_sellers", "product_grid"],
  collection: ["featured_categories", "curated_collections", "featured_products", "new_arrivals", "best_sellers", "product_grid"],
  about: ["brand_story", "showcase_video", "verified_reviews"],
  editorial: ["brand_story", "showcase_video", "hero_banner"],
  contact: ["contact_footer", "faq_accordion"],
  faq: ["faq_accordion", "contact_footer"],
  delivery: ["delivery_info", "faq_accordion", "contact_footer"],
  returns: ["return_policy", "faq_accordion", "contact_footer"],
  policy: ["delivery_info", "return_policy", "faq_accordion"],
};

export function resolveCoherentSectionIdsForPage(
  categoryKey: string,
  sections: CustomPageSection[]
): string[] {
  const targetTypes = COHERENT_SECTIONS_BY_PAGE_CATEGORY[categoryKey];
  if (!targetTypes || targetTypes.length === 0) return sections.map((s) => s.id);
  const matched = sections.filter((s) => targetTypes.includes(s.type)).map((s) => s.id);
  return matched.length > 0 ? matched : sections.map((s) => s.id);
}

export const PageEditorDrawer: React.FC<PageEditorDrawerProps> = ({
  initialPage,
  shopSlug,
  sections,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialPage?.title || "");
  const [slug, setSlug] = useState(initialPage?.slug || "");
  const [pageType, setPageType] = useState<StorePageType>(initialPage?.pageType || "custom");
  const [templateId, setTemplateId] = useState<StorePageTemplateId>(initialPage?.templateId || "default");
  const [isPublished, setIsPublished] = useState<boolean>(initialPage?.isPublished ?? true);
  const [sectionIds, setSectionIds] = useState<string[]>(initialPage?.sectionIds || sections.map((s) => s.id));
  const [seoTitle, setSeoTitle] = useState(initialPage?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialPage?.seoDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialPage?.canonicalUrl || "");
  const [ogImage, setOgImage] = useState(initialPage?.ogImage || "");

  const toggleSectionId = (id: string) =>
    setSectionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSelectPageType = (nextType: StorePageType) => {
    setPageType(nextType);
    const tplMap: Partial<Record<StorePageType, StorePageTemplateId>> = {
      collections: "collection",
      about: "editorial",
      contact: "contact",
      faq: "faq",
      delivery: "policy",
      returns: "policy",
    };
    if (tplMap[nextType]) setTemplateId(tplMap[nextType]!);
    setSectionIds(resolveCoherentSectionIdsForPage(nextType, sections));
  };

  const handleSelectTemplate = (nextTpl: StorePageTemplateId) => {
    setTemplateId(nextTpl);
    setSectionIds(resolveCoherentSectionIdsForPage(nextTpl, sections));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const finalSlug = slugifyPagePath(slug || title) || `page-${Date.now()}`;
    await onSave({
      id: initialPage?.id || `page_${Date.now()}`,
      title: title.trim(),
      slug: finalSlug,
      pageType,
      templateId,
      isPublished,
      sectionIds,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      canonicalUrl: canonicalUrl.trim() || undefined,
      ogTitle: (seoTitle || title).trim(),
      ogDescription: seoDescription.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  const effectiveSlug = slugifyPagePath(slug || title) || "nouvelle-page";
  const previewTitle = seoTitle.trim() || title.trim() || "Titre de la page";
  const previewDesc = seoDescription.trim() || "Découvrez cette page officielle sur notre boutique Olmart (69 Wilayas).";

  return (
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-2.5" data-testid="page-editor-drawer">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#0F172A]">
          {initialPage ? "Modifier la page & SEO" : "Créer une nouvelle page"}
        </span>
        <button type="button" onClick={onCancel} className="p-1 text-[#64748B] hover:text-[#0F172A]">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <label className="block text-[10px] font-bold text-[#475467]">
        Nom de la page
        <input
          type="text"
          data-testid="page-title-input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!initialPage) setSlug(slugifyPagePath(e.target.value));
          }}
          placeholder="Ex: Guide des Tailles..."
          className="mt-1 w-full px-2.5 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-lg"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[10px] font-bold text-[#475467]">
          Type de page
          <select value={pageType} onChange={(e) => handleSelectPageType(e.target.value as StorePageType)} data-testid="page-type-select" className="mt-1 w-full px-2 py-1.5 text-[11px] bg-white border border-[#D0D5DD] rounded-lg">
            <option value="custom">Personnalisée</option>
            <option value="collections">Collections</option>
            <option value="about">À propos</option>
            <option value="contact">Contact</option>
            <option value="faq">FAQ</option>
            <option value="delivery">Livraison</option>
            <option value="returns">Retours</option>
          </select>
        </label>
        <label className="block text-[10px] font-bold text-[#475467]">
          Template
          <select value={templateId} onChange={(e) => handleSelectTemplate(e.target.value as StorePageTemplateId)} data-testid="page-template-select" className="mt-1 w-full px-2 py-1.5 text-[11px] bg-white border border-[#D0D5DD] rounded-lg">
            {PAGE_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>{tpl.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-[10px] font-bold text-[#475467]">
        URL (Slug)
        <div className="mt-1 flex items-center bg-white border border-[#D0D5DD] rounded-lg overflow-hidden">
          <span className="px-2 py-1.5 text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] border-r border-[#D0D5DD]">
            /store/{shopSlug}/p/
          </span>
          <input type="text" data-testid="page-slug-input" value={slug} onChange={(e) => setSlug(slugifyPagePath(e.target.value))} className="w-full px-2 py-1.5 text-xs font-mono" />
        </div>
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-[11px] font-semibold text-[#344054]">Afficher / Publier cette page</span>
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} data-testid="page-published-checkbox" className="w-4 h-4 accent-[var(--studio-primary)] rounded" />
      </label>

      <div className="pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-[var(--studio-primary)]" />
            <span className="text-[10px] font-bold uppercase text-[#475467]">Sections cohérentes ({sectionIds.length})</span>
          </div>
          <button type="button" onClick={() => setSectionIds(resolveCoherentSectionIdsForPage(pageType !== "custom" ? pageType : templateId, sections))} className="text-[10px] font-bold text-[var(--studio-primary)] underline">
            Filtrer auto
          </button>
        </div>
        <div className="max-h-24 overflow-y-auto space-y-1">
          {sections.map((sec, idx) => (
            <label key={sec.id} className="flex items-center justify-between px-2 py-1 rounded bg-white border border-[#E2E8F0] text-[11px] cursor-pointer">
              <span className="truncate font-medium text-[#1E293B]">{idx + 1}. {sec.title || sec.type}</span>
              <input type="checkbox" checked={sectionIds.includes(sec.id)} onChange={() => toggleSectionId(sec.id)} className="w-3.5 h-3.5 accent-[var(--studio-primary)] rounded" />
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[var(--studio-primary)]" />
          <span className="text-[10px] font-bold uppercase text-[#475467]">SEO & Open Graph</span>
        </div>
        <input type="text" data-testid="page-seo-title-input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Meta Title SEO" className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-lg" />
        <textarea rows={2} data-testid="page-seo-desc-input" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta Description SEO" className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-lg resize-none" />
        <div className="grid grid-cols-2 gap-1.5">
          <input type="text" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="URL Canonique" className="w-full px-2 py-1 text-[11px] bg-white border border-[#D0D5DD] rounded-lg font-mono" />
          <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="Image OG (URL)" className="w-full px-2 py-1 text-[11px] bg-white border border-[#D0D5DD] rounded-lg font-mono" />
        </div>
        <div className="p-2 rounded-lg bg-white border border-[#E2E8F0]">
          <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
            <Globe className="w-3 h-3 text-[var(--studio-primary)]" />
            <span className="truncate">olmart.dz/store/{shopSlug}/p/{effectiveSlug}</span>
          </div>
          <p className="text-[11px] font-bold text-[#1A0DAB] truncate">{previewTitle}</p>
          <p className="text-[10px] text-[#4D5156] line-clamp-1">{previewDesc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button type="button" onClick={handleSubmit} disabled={isSaving || !title.trim()} data-testid="save-page-btn" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--studio-primary)] text-white text-xs font-bold rounded-lg disabled:opacity-50">
          {isSaving ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          <span>{initialPage ? "Enregistrer" : "Créer la page"}</span>
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 bg-white border border-[#D0D5DD] text-[#475467] text-xs font-semibold rounded-lg">
          Annuler
        </button>
      </div>
    </div>
  );
};
