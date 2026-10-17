import React from "react";

export interface LogotekaBrandMeta {
  id: string;
  name: string;
  file: string;
  badge?: string;
  models: string;
}

/**
 * 🌟 LOGOS IMPORTÉS OFFICIELLEMENT DEPUIS LOGO-TEKA.COM & VECTEURS OFFICIELS
 * Base complète de 39 marques automobiles en Algérie
 */
export const LOGOTEKA_BRAND_LOGOS: LogotekaBrandMeta[] = [
  // Groupe 1 : Top Ventes & Usines Récentes en Algérie
  { id: "fiat", name: "Fiat", file: "/brands/fiat.svg", badge: "Usine Algérie", models: "Tipo, 500, Doblo, Titano" },
  { id: "chery", name: "Chery", file: "/brands/chery.svg", badge: "En essor", models: "Tiggo 2 Pro, Tiggo 4 Pro, Tiggo 8 Pro, Arrizo 5" },
  { id: "opel", name: "Opel", file: "/brands/opel.svg", badge: "Allemand", models: "Corsa, Astra, Mokka, Grandland" },
  { id: "geely", name: "Geely", file: "/brands/geely.svg", badge: "Moderne", models: "Coolray, GX3 Pro, Emgrand, Monjaro" },
  { id: "dfsk", name: "DFSK", file: "/brands/dfsk.svg", badge: "Utilitaire & SUV", models: "K01S, K02S, Fengon 500, Glory 580" },

  // Groupe 2 : Marques Historiques & Majeures
  { id: "renault", name: "Renault", file: "/brands/renault.svg", badge: "N°1 en Algérie", models: "Clio 4, Symbol, Megane, Duster" },
  { id: "peugeot", name: "Peugeot", file: "/brands/peugeot.svg", badge: "Très populaire", models: "208, 301, 308, 2008, 3008" },
  { id: "volkswagen", name: "Volkswagen", file: "/brands/volkswagen.svg", badge: "Fiabilité", models: "Golf 7/8, Polo, Caddy, Tiguan" },
  { id: "dacia", name: "Dacia", file: "/brands/dacia.svg", badge: "Économique", models: "Sandero Stepway, Duster, Logan" },
  { id: "hyundai", name: "Hyundai", file: "/brands/hyundai.svg", badge: "Top Ventes", models: "Tucson, Accent, i10, i20, Santa Fe" },
  { id: "kia", name: "Kia", file: "/brands/kia.svg", badge: "Garantie", models: "Picanto, Sportage, Rio, Cerato" },
  { id: "toyota", name: "Toyota", file: "/brands/toyota.svg", badge: "Robuste", models: "Hilux, Yaris, Corolla, Land Cruiser" },
  { id: "seat", name: "SEAT", file: "/brands/seat.svg", badge: "Sportif", models: "Ibiza, Leon, Arona, Ateca" },
  { id: "citroen", name: "Citroën", file: "/brands/citroen.svg", badge: "Confort", models: "C3, C4, C-Elysée, Berlingo" },
  { id: "ford", name: "Ford", file: "/brands/ford.svg", badge: "Dynamique", models: "Ranger, Fiesta, Focus, Kuga" },
  { id: "mercedes-benz", name: "Mercedes-Benz", file: "/brands/mercedes-benz.svg", badge: "Luxe", models: "Classe A, Classe C, GLA, GLC, Classe G" },
  { id: "bmw", name: "BMW", file: "/brands/bmw.svg", badge: "Prestige", models: "Série 1, Série 3, X1, X3, X5" },
  { id: "audi", name: "Audi", file: "/brands/audi.svg", badge: "Premium", models: "A3, A4, Q3, Q5, Q8" },

  // Groupe 3 : Constructeurs Émergents, Pick-up & Utilitaires Spécifiques
  { id: "jac", name: "JAC", file: "/brands/jac.svg", badge: "Pick-up & Pro", models: "J7, JS4, T8, T6, Bosseur" },
  { id: "jmc", name: "JMC", file: "/brands/jmc.svg", badge: "Pick-up & Camion", models: "Vigus, Carrying, Grand Avenue" },
  { id: "sokon", name: "Sokon", file: "/brands/sokon.svg", badge: "Mini-Camion", models: "C31, C32, K01, K02" },
  { id: "jetour", name: "Jetour", file: "/brands/jetour.svg", badge: "SUV Moderne", models: "Dashing, X70, X70 Plus, T2" },
  { id: "baic", name: "BAIC", file: "/brands/baic.svg", badge: "4x4 & SUV", models: "BJ40, X35, X55, U5 Plus" },
  { id: "great-wall", name: "Great Wall", file: "/brands/great-wall.svg", badge: "Pick-up Robuste", models: "Poer, Wingle 5, Wingle 7" },
  { id: "haval", name: "Haval", file: "/brands/haval.svg", badge: "Spécialiste SUV", models: "Jolion, H6, H9, Dargo" },
  { id: "dongfeng", name: "Dongfeng", file: "/brands/dongfeng.svg", badge: "Pro & Tourisme", models: "Shine, AX7, Rich 6, Captain" },
  { id: "joyear", name: "Joyear", file: "/brands/joyear.svg", badge: "Familial & Monospace", models: "X5, S50, T5 EVO, Lingzhi M5" },
  { id: "mg", name: "MG", file: "/brands/mg.svg", badge: "Design Britannique", models: "MG 4, MG ZS, MG GT, MG HS" },
  { id: "bestune", name: "Bestune", file: "/brands/bestune.svg", badge: "Berline & SUV", models: "B70, T77, T99, T55" },
  { id: "exeed", name: "Exeed", file: "/brands/exeed.svg", badge: "Haut de Gamme", models: "RX, TXL, VX, LX" },

  // Complémentaires
  { id: "skoda", name: "Skoda", file: "/brands/skoda.svg", badge: "Polyvalent", models: "Fabia, Octavia, Kamiq, Karoq" },
  { id: "suzuki", name: "Suzuki", file: "/brands/suzuki.svg", badge: "Citadine", models: "Swift, Alto, Jimny, Vitara" },
  { id: "nissan", name: "Nissan", file: "/brands/nissan.svg", badge: "Robuste", models: "Micra, Qashqai, Navara, Patrol" },
  { id: "chevrolet", name: "Chevrolet", file: "/brands/chevrolet.svg", badge: "Classique", models: "Sail, Spark, Captiva, Aveo" },
  { id: "honda", name: "Honda", file: "/brands/honda.svg", badge: "Technologie", models: "Civic, CR-V, City, HR-V" },
  { id: "byd", name: "BYD", file: "/brands/byd.svg", badge: "Électrique / Hybride", models: "Song Plus, Han, Tang, Seagull" },
  { id: "porsche", name: "Porsche", file: "/brands/porsche.svg", badge: "Supercar", models: "Macan, Cayenne, 911, Panamera" },
  { id: "land-rover", name: "Land Rover", file: "/brands/land-rover.svg", badge: "4x4 Luxe", models: "Range Rover, Defender, Evoque" },
  { id: "jeep", name: "Jeep", file: "/brands/jeep.svg", badge: "Aventure", models: "Renegade, Compass, Wrangler" },
];

export const POPULAR_AUTO_BRAND_NAMES: readonly string[] = Object.freeze(
  LOGOTEKA_BRAND_LOGOS.slice(0, 30).map((b) => b.name)
);

export function getLogotekaBrandLogo(brandName: string): string | null {
  if (!brandName) return null;
  const normalized = brandName.trim().toLowerCase().replace(/[\s_]+/g, "-");
  const found = LOGOTEKA_BRAND_LOGOS.find(
    (b) =>
      b.id === normalized ||
      b.name.toLowerCase() === brandName.trim().toLowerCase() ||
      b.name.toLowerCase().replace(/[\s_]+/g, "-") === normalized
  );
  return found ? found.file : null;
}

export interface BrandImageLogoProps {
  brandName: string;
  className?: string;
  alt?: string;
}

export const BrandImageLogo: React.FC<BrandImageLogoProps> = ({
  brandName,
  className = "w-6 h-6 object-contain",
  alt,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const src = getLogotekaBrandLogo(brandName);

  if (!src || hasError) {
    return (
      <span className="font-black text-xs text-slate-800 tracking-wider">
        {brandName.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || `Logo ${brandName}`}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};
