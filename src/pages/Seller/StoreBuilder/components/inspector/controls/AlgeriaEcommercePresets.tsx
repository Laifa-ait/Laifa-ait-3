import React from "react";
import { Sparkles, Truck, HelpCircle, RotateCcw, BookOpen, AlertTriangle } from "lucide-react";
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
    label: "Tarifs indicatifs 69 Wilayas (Stop-Desk & Domicile)",
    subtitle: "Grille tarifaire de départ à personnaliser selon votre transporteur (DZD)",
    patch: {
      title: "Livraison 69 Wilayas (Domicile & Stop-Desk — Tarifs de la boutique)",
      defaultTimeframe: "Délai indicatif : 24h à 72h selon la Wilaya",
      stopDeskPrice: 400,
      homeDeliveryPrice: 600,
      freeShippingAbove: 8000,
      customTariffs: [
        { wilayaName: "16 - Alger", estimatedDays: "24h - 48h", priceDZD: 400, homeDeliveryAvailable: true },
        { wilayaName: "31 - Oran", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "25 - Constantine", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "19 - Sétif", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "09 - Blida", estimatedDays: "24h - 48h", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "30 - Ouargla", estimatedDays: "48h - 96h", priceDZD: 800, homeDeliveryAvailable: true },
      ],
    },
  },
  {
    id: "express_nord_grandes_villes",
    label: "Grille Nord & Grandes Villes (Indicatif)",
    subtitle: "Exemple de tarification pour les grandes agglomérations & retrait bureau",
    patch: {
      title: "Expédition Nord & Grandes Villes (Modalités de la boutique)",
      defaultTimeframe: "Délai indicatif : 24h - 48h",
      stopDeskPrice: 350,
      homeDeliveryPrice: 500,
      freeShippingAbove: 6000,
      customTariffs: [
        { wilayaName: "16 - Alger", estimatedDays: "24h - 48h", priceDZD: 350, homeDeliveryAvailable: true },
        { wilayaName: "31 - Oran", estimatedDays: "24h - 48h", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "06 - Béjaïa", estimatedDays: "24h - 48h", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "15 - Tizi Ouzou", estimatedDays: "24h - 48h", priceDZD: 450, homeDeliveryAvailable: true },
        { wilayaName: "23 - Annaba", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
      ],
    },
  },
  {
    id: "forfait_unique_national",
    label: "Forfait National Unifié (69 Wilayas)",
    subtitle: "Exemple de tarif simplifié vers les 69 Wilayas d'Algérie",
    patch: {
      title: "Expédition Nationale — Couverture 69 Wilayas",
      defaultTimeframe: "Délai indicatif : 48h - 96h selon la Wilaya",
      stopDeskPrice: 400,
      homeDeliveryPrice: 600,
      freeShippingAbove: 7500,
      customTariffs: [
        { wilayaName: "Nord & Centre (Alger, Blida, Tipaza...)", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "Est & Ouest (Oran, Constantine, Sétif...)", estimatedDays: "24h - 48h", priceDZD: 500, homeDeliveryAvailable: true },
        { wilayaName: "Sud & Nouvelles Wilayas (Ghardaïa, Béchar, Messaad, El Aricha...)", estimatedDays: "48h - 96h", priceDZD: 650, homeDeliveryAvailable: true },
      ],
    },
  },
];

export const ALGERIA_FAQ_PRESET_ITEMS: FaqItem[] = [
  {
    question: "Comment fonctionne le paiement à la livraison (Cash on Delivery) ?",
    answer:
      "Le règlement de votre commande s'effectue en espèces (DZD) auprès du transporteur ou au bureau Stop-Desk lors de la remise de votre colis, selon les modalités de notre boutique.",
  },
  {
    question: "Puis-je vérifier mon colis avant de payer le livreur ?",
    answer:
      "Selon le transporteur sélectionné et les conditions de vente de notre boutique, merci de vérifier l'état de votre colis lors de la réception et de nous contacter en cas d'anomalie.",
  },
  {
    question: "Quels sont les délais indicatifs de livraison sur les 69 Wilayas ?",
    answer:
      "Les délais indicatifs varient généralement de 24h à 48h pour les grandes villes du Nord et de 48h à 96h pour les Wilayas de l'intérieur et du Sud.",
  },
  {
    question: "Quelle est la procédure de demande d'échange ou de retour ?",
    answer:
      "Toute demande d'échange ou de retour doit être adressée à notre service client dans le délai indiqué par notre politique boutique, avec l'article intact dans son emballage d'origine.",
  },
  {
    question: "Quelle est la différence entre la livraison à Domicile et en Stop-Desk ?",
    answer:
      "En Stop-Desk, vous retirez votre colis directement au guichet de la société de transport de votre Wilaya selon ses horaires d'ouverture.",
  },
];

export const ALGERIA_RETURN_POLICY_PRESETS = {
  days7: {
    title: "Conditions d'Échange & de Retour (Modèle 7 Jours — À adapter)",
    delayDays: 7,
    returnShippingFeeBy: "buyer" as const,
    conditions:
      "[À vérifier et adapter par le vendeur] Les demandes d'échange de taille ou de retour sont étudiées sous 7 jours après réception sur les 69 Wilayas, sous réserve que l'article soit neuf, non utilisé et dans son emballage d'origine. Précisez ici vos conditions exactes de prise en charge.",
  },
  days14: {
    title: "Modalités d'Échange & de Retour (Modèle 14 Jours — À personnaliser)",
    delayDays: 14,
    returnShippingFeeBy: "free" as const,
    conditions:
      "[À vérifier et adapter par le vendeur] Vous disposez d'un délai de 14 jours après réception pour soumettre une demande d'échange ou de retour selon les conditions propres à notre boutique. En cas d'erreur de préparation avérée, indiquez ici vos modalités de prise en charge des frais de transport.",
  },
};

export const ALGERIA_BRAND_STORY_PRESET = {
  heading: "Présentation de Notre Boutique",
  bodyText:
    "Bienvenue dans notre espace officiel. Nous sélectionnons nos articles avec soin et assurons l'expédition de vos commandes vers les 69 Wilayas d'Algérie, avec un suivi attentif et un service client à votre écoute.",
  signature: "L'Équipe de la Boutique",
  yearsOfExperience: 3,
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
          <span>Exemples de Grilles Algérie (69 Wilayas)</span>
        </span>
        <p className="text-[10px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-lg px-2 py-1 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>Modèles indicatifs : vérifiez et adaptez les tarifs et délais selon vos contrats transporteurs.</span>
        </p>
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
          <span>Modèles FAQ E-commerce (69 Wilayas)</span>
        </span>
        <button
          type="button"
          onClick={() =>
            onApplyPreset({
              title: "Questions Fréquentes (Livraison 69 Wilayas & Paiement)",
              items: ALGERIA_FAQ_PRESET_ITEMS,
            })
          }
          className="w-full h-9 px-3 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insérer 5 questions types (à personnaliser)</span>
        </button>
      </div>
    );
  }

  if (sectionType === "return_policy") {
    return (
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F0F7FA] to-[#F8FBFC] border border-[#54ACBF]/40 space-y-2">
        <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-[#023859]" />
          <span>Trames Indicatives de Retours (À adapter)</span>
        </span>
        <p className="text-[10px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-lg px-2 py-1 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>Ces textes sont des exemples : personnalisez-les selon la politique réelle de votre boutique.</span>
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onApplyPreset({ ...ALGERIA_RETURN_POLICY_PRESETS.days7 })}
            className="h-8 px-2 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-[10px] font-bold cursor-pointer transition-colors"
          >
            Trame indicative (7j)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset({ ...ALGERIA_RETURN_POLICY_PRESETS.days14 })}
            className="h-8 px-2 rounded-lg bg-white hover:bg-[#F0F7FA] border border-[#023859]/30 text-[#023859] text-[10px] font-bold cursor-pointer transition-colors"
          >
            Trame indicative (14j)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F0F7FA] to-[#F8FBFC] border border-[#54ACBF]/40 space-y-2">
      <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5 text-[#023859]" />
        <span>Trame Récit de Marque (69 Wilayas)</span>
      </span>
      <button
        type="button"
        onClick={() => onApplyPreset({ ...ALGERIA_BRAND_STORY_PRESET })}
        className="w-full h-8 px-3 rounded-lg bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Insérer une trame de présentation</span>
      </button>
    </div>
  );
};
