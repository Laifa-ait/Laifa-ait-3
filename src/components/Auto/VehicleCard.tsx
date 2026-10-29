import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, Camera, Phone, Scale, ShieldCheck } from "lucide-react";
import { VehicleCatalogItemDto } from "../../domains/auto/auto.types";
import {
  formatPriceDZD,
  formatPriceMillions,
  formatMileage,
  getWilayaNameById,
} from "../../domains/auto/auto.utils";
import { useVehicleComparison } from "../../hooks/useVehicleComparison";
import { buildVehicleStudioSvgDataUri } from "../../domains/auto/ephemeralAutoPresets";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

interface VehicleCardProps {
  vehicle: VehicleCatalogItemDto;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const { isComparing, toggleCompare } = useVehicleComparison();

  const rawImage =
    vehicle.primaryImageUrl ||
    (Array.isArray((vehicle as unknown as Record<string, unknown>).images)
      ? ((vehicle as unknown as Record<string, unknown>).images as string[])[0]
      : null);

  const fallbackSvgUri = buildVehicleStudioSvgDataUri(
    vehicle.brand,
    vehicle.model,
    vehicle.year,
    "#2563EB"
  );
  const primaryImage = !imgError && rawImage ? rawImage : fallbackSvgUri;

  const isSafia = vehicle.paperStatus === "safia";
  const wilayaDisplay = vehicle.wilayaName || getWilayaNameById(vehicle.wilayaId);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !favorite;
    setFavorite(nextState);
    if (onToggleFavorite) {
      onToggleFavorite(vehicle.id);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(vehicle);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/auto/vehicules/${vehicle.id}`);
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-blue-500/80 hover:shadow-[0_14px_32px_-8px_rgba(15,23,42,0.12)] transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Immersive App Media Viewport (Turo / AutoScout24 App Pattern) */}
      <Link
        to={`/auto/vehicules/${vehicle.id}`}
        className="block relative aspect-[16/10] bg-slate-900 overflow-hidden"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
            <Camera className="w-8 h-8 text-sky-400 mb-1.5" />
            <span className="text-xs font-extrabold">{vehicle.brand} {vehicle.model}</span>
          </div>
        )}

        {/* Scrim dégradé bas pour lisibilité parfaite du prix en superposition */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none" />

        {/* Prix principal superposé (Style Turo / Dubizzle App) */}
        <div className="absolute bottom-3 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
          <div className="tabular-nums text-white">
            <div className="text-lg font-black tracking-tight leading-none drop-shadow-2xs">
              {formatPriceMillions(vehicle.price)}
            </div>
            <div className="text-[11px] font-semibold text-slate-200/95 mt-0.5">
              {formatPriceDZD(vehicle.price)}
            </div>
          </div>

          {isSafia && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 drop-shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Safia</span>
            </div>
          )}
        </div>

        {/* Actions Tactiles Flottantes (Comparer & Favoris) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCompareClick}
            aria-label="Comparer ce véhicule"
            className={`w-9 h-9 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer border-none ${
              isComparing(vehicle.id)
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-900/50 hover:bg-slate-900/75 text-white"
            }`}
            title={isComparing(vehicle.id) ? "Retirer du comparateur" : "Comparer"}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label="Ajouter aux favoris"
            className="w-9 h-9 rounded-2xl bg-slate-900/50 hover:bg-slate-900/75 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer border-none"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Corps de la Carte Application */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-md bg-slate-50 border border-slate-200/70 flex items-center justify-center p-0.5 shrink-0">
                <BrandImageLogo brandName={vehicle.brand} className="w-3.5 h-3.5 object-contain" />
              </div>
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider truncate">
                {vehicle.brand}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate max-w-[115px]">{wilayaDisplay}</span>
            </span>
          </div>

          <Link to={`/auto/vehicules/${vehicle.id}`} className="block mt-1.5">
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
              {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
            </h3>
          </Link>

          {/* Zero-Pill Metadata Discipline : Texte épuré séparé par · */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 truncate tabular-nums">
            <span className="font-bold text-slate-800">{vehicle.year}</span>
            <span aria-hidden="true">·</span>
            <span>{formatMileage(vehicle.mileage)}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{vehicle.fuel}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
        </div>

        {/* Barre d'action rapide d'application */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Contact direct vendeur
          </span>

          <button
            type="button"
            onClick={handleContactClick}
            aria-label="Voir le véhicule et contacter"
            className="h-9 px-3.5 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-none"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Voir l'annonce</span>
          </button>
        </div>
      </div>
    </div>
  );
};
