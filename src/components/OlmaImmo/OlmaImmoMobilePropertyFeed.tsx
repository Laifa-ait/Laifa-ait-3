import React from "react";
import { PublicPropertyDTO } from "../../types/realEstate";
import { PropertyCard } from "./PropertyCard";

const PROPERTY_LABELS: Record<string, string> = {
  apartment: "Appartements",
  villa: "Villas",
  house: "Maisons",
  studio: "Studios",
  land: "Terrains",
  commercial: "Locaux commerciaux",
  building: "Immeubles",
  office: "Bureaux",
  room: "Chambres",
};

export const OlmaImmoMobilePropertyFeed: React.FC<{ properties: PublicPropertyDTO[] }> = ({ properties }) => {
  const groups = properties.reduce<Record<string, PublicPropertyDTO[]>>((result, property) => {
    const label = PROPERTY_LABELS[property.propertyType] || "Logements";
    const wilaya = property.location?.wilaya || property.wilaya || "Algérie";
    (result[`${label} · ${wilaya}`] ||= []).push(property);
    return result;
  }, {});

  return (
    <div className="md:hidden space-y-7 pt-2 pb-4">
      {Object.entries(groups)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 4)
        .map(([title, items]) => (
          <section key={title} aria-label={title} className="-mx-4">
            <header className="flex items-center justify-between gap-3 px-4 mb-3">
              <h2 className="text-lg font-bold tracking-tight text-[var(--olma-text-primary)]">{title}</h2>
              <span
                className="w-9 h-9 rounded-full bg-[var(--olma-bg-subtle)] text-[var(--olma-brand-primary)] flex items-center justify-center text-xl leading-none"
                aria-hidden="true"
              >
                →
              </span>
            </header>
            <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none">
              {items.map((property) => (
                <div key={property.id} className="w-[46vw] min-w-[180px] max-w-[280px] shrink-0 snap-start">
                  <PropertyCard property={property} isCompact />
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
};
