import type {
  KineticMarqueeSeparator,
  KineticMarqueeTextStyle,
} from "../../../../../../types/studio.types";

export const KINETIC_MARQUEE_PRESETS = [
  {
    id: "artisanat_algerie",
    label: "Édition Studio & Design",
    textFr: "ÉDITION STUDIO • DESIGN CONTEMPORAIN • QUALITÉ CERTIFIÉE",
    textAr: "إصدار الاستوديو • تصميم معاصر • جودة معتمدة",
    textStyle: "alternating" as KineticMarqueeTextStyle,
    separator: "dot" as KineticMarqueeSeparator,
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
    label: "Drop Flagship Hollow",
    textFr: "NOUVELLE COLLECTION • SÉRIE NUMÉROTÉE • DROP EXCLUSIF",
    textAr: "مجموعة جديدة • تصميم حصري • إصدار محدود",
    textStyle: "hollow-stroke" as KineticMarqueeTextStyle,
    separator: "dot" as KineticMarqueeSeparator,
  },
];
