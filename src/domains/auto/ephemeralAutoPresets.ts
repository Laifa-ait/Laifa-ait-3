import { EphemeralVehicleConfig } from "../../types/ephemeralAuto.types";
import { VehiclePublicDetailDto } from "./auto.types";

export function buildVehicleStudioSvgDataUri(
  brand: string,
  model: string,
  year: number,
  accentHex = "#2563EB"
): string {
  const safeTitle = `${brand} ${model} · ${year}`.replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="55%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="body" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentHex}"/>
        <stop offset="100%" stop-color="#38BDF8"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <ellipse cx="400" cy="390" rx="290" ry="28" fill="#020617" opacity="0.65"/>
    <path d="M155 340 L195 265 C220 225 270 205 345 202 L485 202 C545 205 595 232 630 275 L665 340 Z" fill="url(#body)" opacity="0.95"/>
    <path d="M235 265 L275 218 L470 218 L535 265 Z" fill="#0F172A" opacity="0.82"/>
    <rect x="140" y="320" width="535" height="42" rx="18" fill="#0F172A"/>
    <circle cx="250" cy="365" r="44" fill="#020617" stroke="#38BDF8" stroke-width="6"/>
    <circle cx="250" cy="365" r="18" fill="#E2E8F0"/>
    <circle cx="565" cy="365" r="44" fill="#020617" stroke="#38BDF8" stroke-width="6"/>
    <circle cx="565" cy="365" r="18" fill="#E2E8F0"/>
    <path d="M635 295 L672 305 L665 322 L628 315 Z" fill="#38BDF8"/>
    <text x="48" y="64" fill="#38BDF8" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="2">OLMA AUTO · ANNONCE VÉRIFIÉE</text>
    <text x="48" y="102" fill="#FFFFFF" font-family="sans-serif" font-size="28" font-weight="800">${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const EPHEMERAL_PRESETS: EphemeralVehicleConfig[] = [
  {
    id: "ephemeral-custom",
    title: "Renault Clio 5 RS Line 1.3 TCe",
    brand: "Renault",
    model: "Clio 5",
    version: "RS Line 1.3 TCe 130ch EDC",
    year: 2023,
    mileage: 34000,
    fuel: "essence",
    transmission: "automatique",
    paperStatus: "safia",
    bodyCondition: "origine",
    price: 3650000,
    priceType: "negociable",
    wilayaId: 16,
    wilayaName: "Alger",
    commune: "Hydra",
    options: ["Caméra 360°", "Cockpit Digital", "Jantes RS 17\"", "Feux Full LED Pure Vision", "Apple CarPlay"],
    description:
      "Première main, carnet d'entretien complet, peinture 100% d'origine vérifiée, carte grise Safia prête pour vente immédiate.",
    accentColor: "#2563EB",
  },
  {
    id: "ephemeral-tucson-2023",
    title: "Hyundai Tucson N-Line 2.0 CRDi HTRAC",
    brand: "Hyundai",
    model: "Tucson",
    version: "N-Line 2.0 CRDi 4WD BVA",
    year: 2023,
    mileage: 28500,
    fuel: "diesel",
    transmission: "automatique",
    paperStatus: "safia",
    bodyCondition: "origine",
    price: 5850000,
    priceType: "fixe",
    wilayaId: 31,
    wilayaName: "Oran",
    commune: "Bir El Djir",
    options: ["Toit Panoramique Ouvrant", "Sièges Alcantara N-Line", "Son Bose", "Transmission HTRAC 4x4"],
    description:
      "SUV familial finition N-Line toutes options, révision effectuée, aucun frais à prévoir, disponible à Oran.",
    accentColor: "#0284C7",
  },
  {
    id: "ephemeral-golf8-2022",
    title: "Volkswagen Golf 8 R-Line 2.0 TDI DSG7",
    brand: "Volkswagen",
    model: "Golf 8",
    version: "R-Line 2.0 TDI 150ch DSG7",
    year: 2022,
    mileage: 52000,
    fuel: "diesel",
    transmission: "automatique",
    paperStatus: "safia",
    bodyCondition: "origine",
    price: 5250000,
    priceType: "negociable",
    wilayaId: 25,
    wilayaName: "Constantine",
    commune: "El Khroub",
    options: ["IQ.Light Matrix LED", "Digital Cockpit Pro", "Toit Ouvrant", "Pack R-Line"],
    description:
      "Golf 8 R-Line boîte automatique DSG7 en état irréprochable. Papiers 100% Safia.",
    accentColor: "#0EA5E9",
  },
  {
    id: "ephemeral-peugeot208-2023",
    title: "Peugeot 208 GT Line 1.2 PureTech",
    brand: "Peugeot",
    model: "208",
    version: "GT Line 100ch EAT8",
    year: 2023,
    mileage: 21000,
    fuel: "essence",
    transmission: "automatique",
    paperStatus: "safia",
    bodyCondition: "origine",
    price: 3900000,
    priceType: "negociable",
    wilayaId: 9,
    wilayaName: "Blida",
    commune: "Blida",
    options: ["i-Cockpit 3D", "Toit Panoramique", "Feux Full LED", "Caméra de recul"],
    description: "Peugeot 208 GT Line boîte automatique EAT8, état neuf, stationnée au garage.",
    accentColor: "#1D4ED8",
  },
  {
    id: "ephemeral-fiat500x-2024",
    title: "Fiat 500X Cult 1.4 MultiAir",
    brand: "Fiat",
    model: "500X",
    version: "1.4 MultiAir 140ch DDCT",
    year: 2024,
    mileage: 9500,
    fuel: "essence",
    transmission: "automatique",
    paperStatus: "safia",
    bodyCondition: "origine",
    price: 3450000,
    priceType: "fixe",
    wilayaId: 19,
    wilayaName: "Sétif",
    commune: "El Eulma",
    options: ["Écran Uconnect 7\"", "Régulateur de vitesse", "Jantes Alliage 17\"", "Radar de recul"],
    description: "Fiat 500X quasi neuve, garantie constructeur, kilométrage certifié.",
    accentColor: "#0369A1",
  },
  {
    id: "ephemeral-duster-2022",
    title: "Dacia Duster Extreme 1.5 dCi",
    brand: "Dacia",
    model: "Duster",
    version: "Extreme 1.5 dCi 115ch",
    year: 2022,
    mileage: 64000,
    fuel: "diesel",
    transmission: "manuelle",
    paperStatus: "safia",
    bodyCondition: "origine",
    price: 3350000,
    priceType: "offert",
    wilayaId: 6,
    wilayaName: "Béjaïa",
    commune: "Akbou",
    options: ["Caméra Multi-vues", "Climatisation Auto", "Carte Mains-libres", "Jantes Noires 17\""],
    description: "Dacia Duster série limitée Extreme 1.5 dCi très économique et robuste.",
    accentColor: "#059669",
  },
];

export function configToPublicDto(cfg: EphemeralVehicleConfig, idx: number): VehiclePublicDetailDto {
  const imgUri = buildVehicleStudioSvgDataUri(cfg.brand, cfg.model, cfg.year, cfg.accentColor);
  return {
    id: cfg.id,
    title: cfg.title || `${cfg.brand} ${cfg.model} ${cfg.year}`,
    brand: cfg.brand,
    model: cfg.model,
    year: cfg.year,
    mileage: cfg.mileage,
    fuel: cfg.fuel,
    transmission: cfg.transmission,
    price: cfg.price,
    priceType: cfg.priceType,
    currentOfferPrice: Math.round(cfg.price * 0.96),
    currency: "DZD",
    paperStatus: cfg.paperStatus,
    bodyCondition: cfg.bodyCondition,
    wilayaId: cfg.wilayaId,
    wilayaName: cfg.wilayaName,
    sellerType: idx === 1 ? "professionnel" : "particulier",
    primaryImageUrl: imgUri,
    images: [
      imgUri,
      buildVehicleStudioSvgDataUri(cfg.brand, `${cfg.model} Intérieur`, cfg.year, "#0284C7"),
      buildVehicleStudioSvgDataUri(cfg.brand, `${cfg.model} Profil`, cfg.year, "#1D4ED8"),
    ],
    options: cfg.options,
    description: cfg.description,
    commune: cfg.commune,
    sellerId: "ephemeral-studio-seller",
    sellerDisplayName: idx === 1 ? "Showroom Auto Agréé" : "Particulier Vérifié",
    isSellerVerified: true,
    isVehicleInspected: true,
    isListingModerated: true,
    status: "active",
    viewCount: 148 + idx * 64,
    favoriteCount: 19 + idx * 7,
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
}
