import React from "react";
import { Category3DToys } from "./illustrations/Category3DToys";
import { Category3DSupermarket } from "./illustrations/Category3DSupermarket";
import { Category3DStationery } from "./illustrations/Category3DStationery";
import { Category3DFashion, Category3DHome } from "./illustrations/Category3DFashionHome";
import { Category3DTech, Category3DAppliances } from "./illustrations/Category3DTechAppliances";
import {
  Category3DBeauty,
  Category3DAuto,
  Category3DTools,
  Category3DSports,
  Category3DBaby,
  Category3DCraft,
} from "./illustrations/Category3DOthers";

interface Category3DIllustrationProps {
  categoryKey: string;
  className?: string;
}

const normalize = (val: string): string =>
  val
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export const Category3DIllustration: React.FC<Category3DIllustrationProps> = ({
  categoryKey,
  className = "w-36 h-28",
}) => {
  const norm = normalize(categoryKey);

  if (norm.includes("jouet") || norm.includes("toy") || norm.includes("jeu") || norm.includes("console")) {
    return <Category3DToys className={className} />;
  }
  if (norm.includes("supermarche") || norm.includes("epicerie") || norm.includes("market") || norm.includes("alimentaire")) {
    return <Category3DSupermarket className={className} />;
  }
  if (norm.includes("scolaire") || norm.includes("bureau") || norm.includes("fourniture") || norm.includes("livre")) {
    return <Category3DStationery className={className} />;
  }
  if (norm.includes("mode") || norm.includes("vetement") || norm.includes("chaussure") || norm.includes("fashion")) {
    return <Category3DFashion className={className} />;
  }
  if (norm.includes("maison") || norm.includes("deco") || norm.includes("meuble") || norm.includes("mobilier")) {
    return <Category3DHome className={className} />;
  }
  if (norm.includes("tech") || norm.includes("electronique") || norm.includes("phone") || norm.includes("smartphone")) {
    return <Category3DTech className={className} />;
  }
  if (norm.includes("electromenager") || norm.includes("appliances") || norm.includes("cuisine")) {
    return <Category3DAppliances className={className} />;
  }
  if (norm.includes("beaute") || norm.includes("sante") || norm.includes("parfum") || norm.includes("soin")) {
    return <Category3DBeauty className={className} />;
  }
  if (norm.includes("auto") || norm.includes("moto") || norm.includes("vehicule") || norm.includes("piece")) {
    return <Category3DAuto className={className} />;
  }
  if (norm.includes("bricolage") || norm.includes("outillage") || norm.includes("jardin") || norm.includes("travaux")) {
    return <Category3DTools className={className} />;
  }
  if (norm.includes("sport") || norm.includes("fitness") || norm.includes("gym")) {
    return <Category3DSports className={className} />;
  }
  if (norm.includes("bebe") || norm.includes("puericulture") || norm.includes("enfant")) {
    return <Category3DBaby className={className} />;
  }
  if (norm.includes("artisanat") || norm.includes("tradition") || norm.includes("poterie")) {
    return <Category3DCraft className={className} />;
  }

  // Fallback defaults to Toys / Fashion / Supermarket depending on modulo
  return <Category3DToys className={className} />;
};
