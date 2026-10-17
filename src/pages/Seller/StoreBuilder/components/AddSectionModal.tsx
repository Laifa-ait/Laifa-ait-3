import React from "react";
import { CustomPageSectionType } from "../../../../domains/seller/customPage.types";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string) => void;
}

interface SectionOption {
  type: CustomPageSectionType;
  title: string;
  category: "Bannières & Carrousels" | "Catalogue & Produits" | "Histoire & Marque" | "Réassurance & Contact";
  description: string;
  defaultSettings: Record<string, unknown>;
}

const SECTION_CATALOG: SectionOption[] = [
  {
    type: "hero_banner",
    title: "Bannière Principale",
    category: "Bannières & Carrousels",
    description: "Grande image avec titre, sous-titre et bouton d'action principal.",
    defaultSettings: {
      title: "Nouvelle Collection",
      subtitle: "Découvrez nos dernières nouveautés",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Acheter maintenant",
      ctaLink: "#catalog",
      textAlignment: "center",
      overlayOpacity: 30,
    },
  },
  {
    type: "promo_carousel",
    title: "Carrousel Promotionnel",
    category: "Bannières & Carrousels",
    description: "Défilement automatique de diapositives promotionnelles.",
    defaultSettings: {
      slides: [
        { id: "s1", imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da", title: "Offres Spéciales" },
      ],
      autoplay: true,
      intervalSec: 5,
    },
  },
  {
    type: "featured_products",
    title: "Produits Vedettes",
    category: "Catalogue & Produits",
    description: "Sélectionnez manuellement les articles clés à mettre en avant.",
    defaultSettings: {
      title: "Sélection Vedette",
      productIds: [],
      layout: "grid",
    },
  },
  {
    type: "product_grid",
    title: "Grille de Produits",
    category: "Catalogue & Produits",
    description: "Affichage complet de votre assortiment d'articles.",
    defaultSettings: {
      title: "Tous nos articles",
      subtitle: "Explorez notre catalogue",
      maxItems: 8,
      layout: "grid",
    },
  },
  {
    type: "brand_story",
    title: "Histoire de la Marque",
    category: "Histoire & Marque",
    description: "Présentez l'histoire, la vision et les valeurs de votre maison.",
    defaultSettings: {
      heading: "À Propos de Notre Maison",
      bodyText: "Artisans passionnés, nous sélectionnons les meilleurs produits pour nos clients en Algérie.",
    },
  },
  {
    type: "delivery_info",
    title: "Infos de Livraison",
    category: "Réassurance & Contact",
    description: "Affichez vos délais et tarifs de livraison sur les 69 Wilayas.",
    defaultSettings: {
      title: "Livraison 69 Wilayas",
      defaultTimeframe: "24h à 48h",
      freeShippingAbove: 10000,
    },
  },
  {
    type: "faq_accordion",
    title: "Faq & Questions",
    category: "Réassurance & Contact",
    description: "Accordéon de questions/réponses pour rassurer vos clients.",
    defaultSettings: {
      title: "Questions Fréquentes",
      items: [
        { question: "Quels sont les modes de paiement ?", answer: "Paiement à la livraison par cash." },
      ],
    },
  },
  {
    type: "contact_footer",
    title: "Coordonnées de Contact",
    category: "Réassurance & Contact",
    description: "Pied de page avec téléphone, email, wilaya et horaire d'ouverture.",
    defaultSettings: {
      workingHours: "Samedi - Jeudi : 09h - 18h",
    },
  },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ isOpen, onClose, onAddSection }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ajouter une section au layout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
          {["Bannières & Carrousels", "Catalogue & Produits", "Histoire & Marque", "Réassurance & Contact"].map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-bold uppercase text-purple-700 dark:text-purple-400 mb-2">{cat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SECTION_CATALOG.filter((s) => s.category === cat).map((sec) => (
                  <button
                    key={sec.type}
                    onClick={() => {
                      onAddSection(sec.type, sec.defaultSettings, sec.title);
                      onClose();
                    }}
                    className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200 dark:border-gray-700 hover:border-purple-300 rounded-xl text-left transition-all"
                  >
                    <span className="font-bold text-sm block text-gray-900 dark:text-gray-100">{sec.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{sec.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
