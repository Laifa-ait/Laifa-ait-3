import React from "react";
import { BrandLogoProps } from "./olmaAutoEmblem";
import {
  RenaultLogo,
  PeugeotLogo,
  VolkswagenLogo,
  DaciaLogo,
  SeatLogo,
  AudiLogo,
  BmwLogo,
  MercedesLogo,
  FiatLogo,
  SkodaLogo,
  CitroenLogo,
} from "./brandLogosEuropean";
import {
  HyundaiLogo,
  ToyotaLogo,
  KiaLogo,
  CheryLogo,
  GeelyLogo,
  SuzukiLogo,
  NissanLogo,
} from "./brandLogosAsian";

export * from "./olmaAutoEmblem";
export * from "./brandLogosEuropean";
export * from "./brandLogosAsian";
export * from "./brandLogosMap";

export interface PopularBrandMeta {
  id: string;
  name: string;
  origin: string;
  popularModels: string;
  badge?: string;
  logotekaFile: string;
  component: React.FC<BrandLogoProps>;
}

export const POPULAR_AUTO_BRANDS: PopularBrandMeta[] = [
  {
    id: "renault",
    name: "Renault",
    origin: "France",
    popularModels: "Clio 4, Symbol, Megane",
    badge: "N°1 en Algérie",
    logotekaFile: "/brands/renault.svg",
    component: RenaultLogo,
  },
  {
    id: "peugeot",
    name: "Peugeot",
    origin: "France",
    popularModels: "208, 308, 301, 2008",
    badge: "Très populaire",
    logotekaFile: "/brands/peugeot.svg",
    component: PeugeotLogo,
  },
  {
    id: "volkswagen",
    name: "Volkswagen",
    origin: "Allemagne",
    popularModels: "Golf 7/8, Polo, Caddy, Tiguan",
    badge: "Fiabilité",
    logotekaFile: "/brands/volkswagen.svg",
    component: VolkswagenLogo,
  },
  {
    id: "hyundai",
    name: "Hyundai",
    origin: "Corée du Sud",
    popularModels: "Tucson, Accent, i10, i20",
    badge: "Top Ventes",
    logotekaFile: "/brands/hyundai.svg",
    component: HyundaiLogo,
  },
  {
    id: "dacia",
    name: "Dacia",
    origin: "Roumanie",
    popularModels: "Sandero Stepway, Duster, Logan",
    badge: "Économique",
    logotekaFile: "/brands/dacia.svg",
    component: DaciaLogo,
  },
  {
    id: "toyota",
    name: "Toyota",
    origin: "Japon",
    popularModels: "Hilux, Yaris, Corolla, Land Cruiser",
    badge: "Robuste",
    logotekaFile: "/brands/toyota.svg",
    component: ToyotaLogo,
  },
  {
    id: "seat",
    name: "Seat",
    origin: "Espagne",
    popularModels: "Ibiza, Leon, Arona, Ateca",
    badge: "Sportif",
    logotekaFile: "/brands/seat.svg",
    component: SeatLogo,
  },
  {
    id: "kia",
    name: "Kia",
    origin: "Corée du Sud",
    popularModels: "Picanto, Sportage, Rio",
    badge: "Garantie",
    logotekaFile: "/brands/kia.svg",
    component: KiaLogo,
  },
  {
    id: "audi",
    name: "Audi",
    origin: "Allemagne",
    popularModels: "A3, A4, Q3, Q5",
    badge: "Premium",
    logotekaFile: "/brands/audi.svg",
    component: AudiLogo,
  },
  {
    id: "bmw",
    name: "BMW",
    origin: "Allemagne",
    popularModels: "Série 1, Série 3, X1, X5",
    badge: "Prestige",
    logotekaFile: "/brands/bmw.svg",
    component: BmwLogo,
  },
  {
    id: "mercedes-benz",
    name: "Mercedes-Benz",
    origin: "Allemagne",
    popularModels: "Classe A, Classe C, GLA, GLC",
    badge: "Luxe",
    logotekaFile: "/brands/mercedes-benz.svg",
    component: MercedesLogo,
  },
  {
    id: "fiat",
    name: "Fiat",
    origin: "Italie",
    popularModels: "Tipo, 500, Doblo, Titano",
    badge: "Nouveauté Usine",
    logotekaFile: "/brands/fiat.svg",
    component: FiatLogo,
  },
  {
    id: "chery",
    name: "Chery",
    origin: "Chine",
    popularModels: "Tiggo 2, Tiggo 4, Tiggo 8, Arrizo",
    badge: "En essor",
    logotekaFile: "/brands/chery.svg",
    component: CheryLogo,
  },
  {
    id: "geely",
    name: "Geely",
    origin: "Chine",
    popularModels: "Coolray, GX3 Pro, Emgrand",
    badge: "Moderne",
    logotekaFile: "/brands/geely.svg",
    component: GeelyLogo,
  },
  {
    id: "skoda",
    name: "Skoda",
    origin: "République Tchèque",
    popularModels: "Fabia, Octavia, Kamiq",
    logotekaFile: "/brands/skoda.svg",
    component: SkodaLogo,
  },
  {
    id: "suzuki",
    name: "Suzuki",
    origin: "Japon",
    popularModels: "Swift, Alto, Jimny, Vitara",
    logotekaFile: "/brands/suzuki.svg",
    component: SuzukiLogo,
  },
  {
    id: "citroen",
    name: "Citroën",
    origin: "France",
    popularModels: "C3, C4, C-Elysée, Berlingo",
    logotekaFile: "/brands/citroen.svg",
    component: CitroenLogo,
  },
  {
    id: "nissan",
    name: "Nissan",
    origin: "Japon",
    popularModels: "Micra, Qashqai, Navara, Sunny",
    logotekaFile: "/brands/nissan.svg",
    component: NissanLogo,
  },
];

export function getCarBrandLogoComponent(brandName: string): React.FC<BrandLogoProps> | null {
  if (!brandName) return null;
  const normalized = brandName.trim().toLowerCase();
  const match = POPULAR_AUTO_BRANDS.find(
    (b) => b.id === normalized || b.name.toLowerCase() === normalized
  );
  return match ? match.component : null;
}
