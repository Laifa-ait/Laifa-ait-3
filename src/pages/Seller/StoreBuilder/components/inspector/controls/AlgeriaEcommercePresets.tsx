import React from "react";
import { Sparkles, Truck, HelpCircle, RotateCcw, BookOpen } from "lucide-react";
import { DeliveryInfoItem, FaqItem } from "../../../../../../domains/seller/customPage.types";

export interface AlgeriaDeliveryPreset {
  id: "standard_58_wilayas" | "express_nord_grandes_villes" | "forfait_unique_national";
  label: string;
  subtitle: string;
  patch: {
    title: string;
    defaultTimeframe: string;
    stopDeskPrice: number;
    homeDeliveryPrice: number;
    freeShippingAbove: number;
    customTariffs: DeliveryInfoItem[];
  };
}

export const ALGERIA_DELIVERY_PRESETS: AlgeriaDeliveryPreset[] = [
  {
    id: "standard_58_wilayas",
    label: "Tarifs Standard 58 Wilayas (Stop-Desk & Domicile)",
    subtitle: "Grille équilibrée Nord / Hauts-Plateaux / Sud en DZD",
    patch: {
      title: "Livraison Rapide 58 Wilayas (Domicile & Stop-Desk)",
      defaultTimeframe: "24h à 72h selon la Wilaya",
      stopDeskPrice: 400,
      homeDeliveryPrice: 600,
      freeShippingAbove: 8000,
      customTariffs: [
        { wilayaName: "16 - Alger", estimatedDays: "24h", priceDZD: 400, homeDeliveryAvailable: true },
        { wilayaName: "31 - Oran", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "25 - Constantine", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "19 - Sétif", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "09 - Blida", estimatedDays: "24h", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "30 - Ouargla", estimatedDays: "48h - 72h", priceDZD: 800, homeDeliveryAvailable: true },
      ],
    },
  },
  {
    id: "express_nord_grandes_villes",
    label: "Livraison Express 24h/48h Nord & Grandes Villes",
    subtitle: "Priorité grandes agglomérations & retrait bureau rapide",
    patch: {
      title: "Expédition Express 24h/48h — Grandes Villes & Nord",
      defaultTimeframe: "Express 24h - 48h",
      stopDeskPrice: 350,
      homeDeliveryPrice: 500,
      freeShippingAbove: 6000,
      customTariffs: [
        { wilayaName: "16 - Alger", estimatedDays: "24h Express", priceDZD: 350, homeDeliveryAvailable: true },
        { wilayaName: "31 - Oran", estimatedDays: "24h Express", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "06 - Béjaïa", estimatedDays: "24h - 48h", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "15 - Tizi Ouzou", estimatedDays: "24h - 48h", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "23 - Annaba", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
      ],
    },
  },
  {
    id: "forfait_unique_national",
    label: "Forfait Unique National",
    subtitle: "Tarif simplifié unique vers toutes les Wilayas d'Algérie",
    patch: {
      title: "Forfait Unique National — Livraison 58 Wilayas",
      defaultTimeframe: "48h - 96h partout en Algérie",
      stopDeskPrice: 400,
      homeDeliveryPrice: 600,
      freeShippingAbove: 7500,
      customTariffs: [
        { wilayaName: "Nord & Centre (Alger, Blida, Tipaza...)", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "Est & Ouest (Oran, Constantine, Sétif...)", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "Sud & Grand Sud (Ghardaïa, Béchar, Adrar...)", estimatedDays: "48h - 96h", priceDZD: 600, homeDeliveryAvailable: true },
      ],
    },
  },
];

export const ALGERIA_FAQ_PRESET_ITEMS: FaqItem[] = [
  {
    question: "Comment fonctionne le paiement à la livraison (Cash on Delivery) ?",
    answer:
      "Vous réglez votre commande en espèces (DZD) directement auprès du livreur ou au bureau Stop-Desk au moment de la réception de votre colis.",
  },
  {
    question: "Puis-je vérifier mon colis avant de payer le livreur ?",
    answer:
      "Oui, nous autorisons l'ouverture et la vérification de la conformité de votre article en présence du livreur avant le règlement.",
  },
  {
    question: "Quels sont les délais de livraison selon ma Wilaya ?",
    answer:
      "Les expéditions vers Alger et les grandes villes prennent 24h à 48h, et 48h à 72h pour les Wilayas de l'intérieur et du Sud.",
  },
  {
    question: "Comment effectuer un échange de taille ou un retour ?",
    answer:
      "Contactez notre service client sous 7 jours après réception. Nous expédions la nouvelle taille et récupérons l'article initial lors de l'échange.",
  },
  {
    question: "Quelle est la différence entre la livraison à Domicile et en Stop-Desk ?",
    answer:
      "En Stop-Desk, vous récupérez votre colis au bureau de la société de livraison de votre Wilaya à tarif réduit et selon vos horaires.",
  },
];

export const ALGERIA_RETURN_POLICY_PRESETS = {
  days7: {
    title: "Échanges & Retours Garantis sous 7 Jours",
    delayDays: 7,
    returnShippingFeeBy: "buyer" as const,
    conditions:
      "Échange de taille ou retour accepté sous 7 jours suivant la réception dans les 58 Wilayas. L'article doit être neuf, non porté et dans son emballage d'origine avec étiquette. Vérification du colis autorisée à la livraison.",
  },
  days14: {
    title: "Garantie Satisfait ou Échangé — 14 Jours",
    delayDays: 14,
    returnShippingFeeBy: "free" as const,
    conditions:
      "Vous disposez de 14 jours après réception pour demander un échange gratuit ou un avoir. En cas de défaut ou d'erreur de préparation, les frais de retour sont 100% pris en charge par notre boutique.",
  },
};

export const ALGERIA_BRAND_STORY_PRESET = {
  heading: "Un Savoir-Faire Algérien d'Excellence",
  bodyText:
    "Fondée avec passion en Algérie, notre maison sélectionne des matières nobles et réalise un contrôle qualité rigoureux sur chaque pièce avant expédition. Notre engagement : offrir une expérience d'achat fiable sur les 58 Wilayas avec paiement à la réception et service client réactif.",
  signature: "L'Équipe Fondatrice",
  yearsOfExperience: 5,
};

interface AlgeriaEcommercePresetsProps {
  sectionType: "delivery_info" | "faq_accordion" | "return_policy" | "brand_story";
  onApplyPreset: (patch: Record<string, unknown>) => void;
}

export const AlgeriaEcommercePresets: React.FC<AlgeriaEcommercePresetsProps> = ({
  sectionType,
  onApplyPreset,
}) => {
  if (sectionType === "delivery_info") {
    return (
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F0F7FA] to-[#F8FBFC] border border-[#54ACBF]/40 space-y-2">
        <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#023859]" />
          <span>Modèles E-commerce Algérie (58 Wilayas)</span>
        </span>
        <div className="space-y-1.5">
          {ALGERIA_DELIVERY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset({ ...preset.patch })}
              className="w-full p-2 rounded-lg bg-white hover:bg-[#F0F7FA] border border-[#E4E7EC] hover:border-[#023859] text-left transition-all cursor-pointer"
            >
              <span className="text-[11px] font-bold text-[#011C40] block">{preset.label}</span>
              <span className="text-[10px] text-[#26658C] block">{preset.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (sectionType === "faq_accordion") {
    return (
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F0F7FA] to-[#F8FBFC] border border-[#54ACBF]/40 space-y-2">
        <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#023859]" />
          <span>FAQ E-commerce Algérie</span>
        </span>
        <button
          type="button"
          onClick={() =>
            onApplyPreset({
              title: "Questions Fréquentes (Livraison 58 Wilayas & Paiement)",
              items: ALGERIA_FAQ_PRESET_ITEMS,
            })
          }
          className="w-full h-9 px-3 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insérer les 5 questions e-commerce Algérie</span>
        </button>
      </div>
    );
  }

  if (sectionType === "return_policy") {
    return (
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F0F7FA] to-[#F8FBFC] border border-[#54ACBF]/40 space-y-2">
        <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-[#023859]" />
          <span>Modèles Politique de Retours</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onApplyPreset({ ...ALGERIA_RETURN_POLICY_PRESETS.days7 })}
            className="h-8 px-2 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[10px] font-bold cursor-pointer transition-colors"
          >
            Insérer un modèle professionnel (7j)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset({ ...ALGERIA_RETURN_POLICY_PRESETS.days14 })}
            className="h-8 px-2 rounded-lg bg-white hover:bg-[#F0F7FA] border border-[#023859]/30 text-[#023859] text-[10px] font-bold cursor-pointer transition-colors"
          >
            Modèle Garantie 14 jours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F0F7FA] to-[#F8FBFC] border border-[#54ACBF]/40 space-y-2">
      <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5 text-[#023859]" />
        <span>Modèle Récit de Marque</span>
      </span>
      <button
        type="button"
        onClick={() => onApplyPreset({ ...ALGERIA_BRAND_STORY_PRESET })}
        className="w-full h-8 px-3 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Insérer un modèle professionnel</span>
      </button>
    </div>
  );
};
