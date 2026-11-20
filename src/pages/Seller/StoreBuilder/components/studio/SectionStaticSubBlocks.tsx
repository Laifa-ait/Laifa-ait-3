import React from "react";
import {
  Type,
  AlignLeft,
  MousePointerClick,
  Image as ImageIcon,
  Sparkles,
  Grid,
  ShoppingBag,
  Clock,
  Star,
  Truck,
  RotateCcw,
  Phone,
  Play,
  Award,
} from "lucide-react";
import { CustomPageSection } from "../../../../../domains/seller/customPage.types";

interface SubBlockItemDef {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATIC_SUB_BLOCKS_BY_TYPE: Record<string, SubBlockItemDef[]> = {
  hero_banner: [
    { key: "title", label: "En-tête & Titre", icon: Type },
    { key: "subtitle", label: "Sous-titre", icon: AlignLeft },
    { key: "badge", label: "Badge d'annonce", icon: Sparkles },
    { key: "ctaPrimary", label: "Bouton Principal", icon: MousePointerClick },
    { key: "ctaSecondary", label: "Bouton Secondaire", icon: MousePointerClick },
    { key: "background", label: "Image de fond & Cadrage", icon: ImageIcon },
  ],
  featured_products: [
    { key: "title", label: "Titre de section", icon: Type },
    { key: "selection", label: "Grille & Sélection produits", icon: Grid },
    { key: "card-model", label: "Carte produit (Image, Nom, Prix, Achat)", icon: ShoppingBag },
    { key: "countdown", label: "Bandeau Chrono Offre", icon: Clock },
  ],
  new_arrivals: [
    { key: "title", label: "Titre de section", icon: Type },
    { key: "selection", label: "Grille & Sélection produits", icon: Grid },
    { key: "card-model", label: "Carte produit (Image, Nom, Prix, Achat)", icon: ShoppingBag },
    { key: "countdown", label: "Bandeau Chrono Offre", icon: Clock },
  ],
  best_sellers: [
    { key: "title", label: "Titre de section", icon: Type },
    { key: "selection", label: "Grille & Sélection produits", icon: Grid },
    { key: "card-model", label: "Carte produit (Image, Nom, Prix, Achat)", icon: ShoppingBag },
    { key: "countdown", label: "Bandeau Chrono Offre", icon: Clock },
  ],
  product_grid: [
    { key: "title", label: "Titre du catalogue", icon: Type },
    { key: "selection", label: "Grille & Filtres produits", icon: Grid },
    { key: "card-model", label: "Carte produit (Image, Nom, Prix, Achat)", icon: ShoppingBag },
  ],
  brand_story: [
    { key: "title", label: "Titre de l'histoire", icon: Type },
    { key: "subtitle", label: "Récit & Paragraphe", icon: AlignLeft },
    { key: "background", label: "Photo de marque", icon: ImageIcon },
    { key: "badge", label: "Années d'expérience & Signature", icon: Award },
  ],
  showcase_video: [
    { key: "title", label: "Titre de la vidéo", icon: Type },
    { key: "background", label: "Vidéo MP4 & Miniature Poster", icon: Play },
  ],
  verified_reviews: [
    { key: "title", label: "Titre des avis", icon: Type },
    { key: "review-0", label: "Avis client #1", icon: Star },
    { key: "review-1", label: "Avis client #2", icon: Star },
    { key: "review-2", label: "Avis client #3", icon: Star },
  ],
  delivery_info: [
    { key: "title", label: "Titre Livraison", icon: Type },
    { key: "tarifs", label: "Tarifs 69 Wilayas & Stop-Desk", icon: Truck },
  ],
  return_policy: [
    { key: "title", label: "Titre Retours & Échanges", icon: Type },
    { key: "conditions", label: "Délai & Conditions de retour", icon: RotateCcw },
  ],
  contact_footer: [
    { key: "title", label: "Titre Contact & Horaires", icon: Type },
    { key: "coordonnees", label: "Téléphone, Email & Wilaya", icon: Phone },
  ],
  kinetic_marquee: [
    { key: "title", label: "Texte défilant & Vitesse", icon: Sparkles },
  ],
};

interface SectionStaticSubBlocksProps {
  sec: CustomPageSection;
  selectedSectionId: string | null;
  selectedSubElement: string | null;
  onHoverSubBlock: (subKey: string | null) => void;
  onFocusSubBlock: (subKey: string, e: React.MouseEvent) => void;
}

export const SectionStaticSubBlocks: React.FC<SectionStaticSubBlocksProps> = ({
  sec,
  selectedSectionId,
  selectedSubElement,
  onHoverSubBlock,
  onFocusSubBlock,
}) => {
  const items = STATIC_SUB_BLOCKS_BY_TYPE[sec.type];
  if (!items || items.length === 0) return null;

  return (
    <div
      className="mt-1.5 ml-3 pl-2.5 border-l border-slate-200 space-y-0.5"
      onClick={(e) => e.stopPropagation()}
      data-testid={`subblocks-tree-${sec.type}`}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isAct =
          selectedSectionId === sec.id &&
          (selectedSubElement === item.key ||
            (item.key === "ctaPrimary" && selectedSubElement === "cta"));
        return (
          <button
            key={item.key}
            type="button"
            onMouseEnter={() => onHoverSubBlock(item.key)}
            onMouseLeave={() => onHoverSubBlock(null)}
            onClick={(e) => onFocusSubBlock(item.key, e)}
            className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left text-[11.5px] cursor-pointer transition-colors ${
              isAct
                ? "bg-slate-900 text-white font-medium"
                : "text-slate-600 hover:bg-slate-100 font-normal"
            }`}
          >
            <Icon className="w-3 h-3 shrink-0 opacity-75" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
