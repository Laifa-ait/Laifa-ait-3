import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShieldCheck, MapPin, Camera, MessageCircle, User, Scale } from "lucide-react";
import { VehicleCatalogItemDto } from "../../domains/auto/auto.types";
import {
  formatPriceDZD,
  formatPriceMillions,
  formatMileage,
  getWilayaNameById,
} from "../../domains/auto/auto.utils";
import { useVehicleComparison } from "../../hooks/useVehicleComparison";

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

  const primaryImage =
    !imgError
      ? vehicle.primaryImageUrl ||
        (Array.isArray((vehicle as unknown as Record<string, unknown>).images)
          ? ((vehicle as unknown as Record<string, unknown>).images as string[])[0]
          : null)
      : null;

  const isSafia = vehicle.paperStatus === "safia";
  const isPro = (vehicle as unknown as Record<string, unknown>).sellerType === "pro";
  const wilayaDisplay = getWilayaNameById(vehicle.wilayaId);

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
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#172B4D] hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
      <Link to={`/auto/vehicules/${vehicle.id}`} className="block relative aspect-[16/10] bg-slate-900 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1730] to-[#172B4D] text-slate-300 p-4 text-center">
            <Camera className="w-8 h-8 text-[#D9F66F] mb-1.5 opacity-80" />
            <span className="text-[11px] font-bold text-white tracking-wide">
              {vehicle.brand} {vehicle.model}
            </span>
            <span className="text-[10px] text-slate-400">Photo du véhicule</span>
          </div>
        )}

        {/* Badges Gauche (Particulier / Professionnel & Safia) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isPro ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#D9F66F] text-[#0B1730] text-[10px] font-black shadow-xs">
              <ShieldCheck className="w-3 h-3 text-[#0B1730]" />
              <span>Professionnel</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-xs">
              <User className="w-3 h-3 text-white" />
              <span>Particulier</span>
            </span>
          )}

          {isSafia && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0B1730]/90 text-[#D9F66F] border border-[#D9F66F]/40 text-[9px] font-bold shadow-xs backdrop-blur-xs">
              <span>100% Safia</span>
            </span>
          )}
        </div>

        {/* Actions Droite : Comparer & Favoris */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCompareClick}
            aria-label="Comparer ce véhicule"
            className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs ${
              isComparing(vehicle.id)
                ? "bg-[#D9F66F] text-[#0B1730] ring-2 ring-[#0B1730]"
                : "bg-white/90 hover:bg-white text-slate-700"
            }`}
            title={isComparing(vehicle.id) ? "Retirer du comparateur" : "Ajouter au comparateur"}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label="Ajouter aux favoris"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? "fill-rose-500 text-rose-500" : "text-slate-600"
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Corps de la Carte Automobile */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/auto/vehicules/${vehicle.id}`} className="block">
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#172B4D] truncate transition-colors">
              {vehicle.brand} {vehicle.model}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 font-medium mt-1 truncate">
            {vehicle.year} · {formatMileage(vehicle.mileage)} · {vehicle.fuel} · {vehicle.transmission}
          </p>
        </div>

        {/* Ligne Tarif & Mise en relation (DZD + Millions + Wilaya + Contact) */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">
              {formatPriceDZD(vehicle.price)}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">
              {formatPriceMillions(vehicle.price)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[80px]">{wilayaDisplay}</span>
            </span>

            {/* Bouton Contact / WhatsApp */}
            <button
              type="button"
              onClick={handleContactClick}
              aria-label="Contacter le vendeur"
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.45)] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
              title="Contacter le vendeur"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
