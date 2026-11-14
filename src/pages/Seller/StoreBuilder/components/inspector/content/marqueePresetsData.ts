import type {
  KineticMarqueeSeparator,
  KineticMarqueeTextStyle,
} from "../../../../../../types/studio.types";

export const KINETIC_MARQUEE_PRESETS = [
  {
    id: "artisanat_algerie",
    label: "Haute Couture & Artisanat",
    textFr: "FAIT MAIN EN ALGÉRIE • ÉDITION LIMITÉE • SAVOIR-FAIRE AUTHENTIQUE",
    textAr: "صنع بحب في الجزائر • إصدار محدود • حرفية أصيلة",
    textStyle: "alternating" as KineticMarqueeTextStyle,
    separator: "star" as KineticMarqueeSeparator,
  },
  {
    id: "livraison_cod",
    label: "Livraison 69 Wilayas COD",
    textFr: "LIVRAISON EXPRESS 69 WILAYAS • PAIEMENT À LA RÉCEPTION • RETOURS GARANTIS",
    textAr: "توصيل سريع 69 ولاية • الدفع عند الاستلام • ضمان الجودة",
    textStyle: "solid" as KineticMarqueeTextStyle,
    separator: "diamond" as KineticMarqueeSeparator,
  },
  {
    id: "lookbook_drop",
    label: "Drop Avant-Garde Hollow",
    textFr: "NOUVELLE COLLECTION • SÉRIE NUMÉROTÉE • ATELIER EXCLUSIF",
    textAr: "مجموعة جديدة • تصميم حصري • أتيليه الفخامة",
    textStyle: "hollow-stroke" as KineticMarqueeTextStyle,
    separator: "crescent" as KineticMarqueeSeparator,
  },
];
