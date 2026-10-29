import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CarFront,
  Heart,
  Flag,
  ShieldCheck,
  Phone,
  MessageSquare,
  ArrowLeft,
  MapPin,
  Eye,
} from "lucide-react";
import { autoClient } from "../../domains/auto/auto.client";
import { VehiclePublicDetailDto } from "../../domains/auto/auto.types";
import { formatPriceDZD, formatPriceMillions, PRICE_TYPE_LABELS } from "../../domains/auto/auto.utils";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";
import { useEphemeralAutoStudio } from "../../hooks/useEphemeralAutoStudio";
import { VehiclePhotoGallery } from "../../components/Auto/VehiclePhotoGallery";
import { VehicleSpecsTable } from "../../components/Auto/VehicleSpecsTable";
import { ContactRevealModal } from "../../components/Auto/ContactRevealModal";
import { ReportListingModal } from "../../components/Auto/ReportListingModal";
import { StickyContactBar } from "../../components/Auto/StickyContactBar";
import { BrandImageLogo } from "../../domains/auto/data/brandLogosMap";

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [remoteVehicle, setRemoteVehicle] = useState<VehiclePublicDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useVehicleFavorites();
  const { getEphemeralVehicleById, activeEphemeralVehicle } = useEphemeralAutoStudio();

  const ephemeralMatch = useMemo(() => {
    if (!id) return null;
    if (id.startsWith("ephemeral-")) {
      return getEphemeralVehicleById(id) || activeEphemeralVehicle;
    }
    return null;
  }, [id, getEphemeralVehicleById, activeEphemeralVehicle]);

  useEffect(() => {
    if (!id) return;
    if (id.startsWith("ephemeral-")) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    autoClient
      .getPublicListingById(id)
      .then((data) => {
        if (active) setRemoteVehicle(data);
      })
      .catch(() => {
        if (active) setRemoteVehicle(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const vehicle = ephemeralMatch || remoteVehicle;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center space-y-4">
        <CarFront className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-extrabold text-slate-900">Véhicule introuvable ou retiré</h2>
        <div className="flex justify-center gap-3">
          <Link
            to="/auto"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-extrabold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux annonces</span>
          </Link>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(vehicle.id);
  const priceTypeLabel = PRICE_TYPE_LABELS[vehicle.priceType] || vehicle.priceType;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        {/* Retour & Fil d'Ariane simple */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/auto"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Retour aux véhicules</span>
          </Link>

          <Link
            to={`/auto?brand=${encodeURIComponent(vehicle.brand)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <BrandImageLogo brandName={vehicle.brand} className="w-4 h-4 object-contain" />
            <span>Voir tous les {vehicle.brand}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Colonne Gauche : Photos & Fiche Technique */}
          <div className="lg:col-span-8 space-y-6">
            <VehiclePhotoGallery images={vehicle.images} title={`${vehicle.brand} ${vehicle.model}`} />
            <VehicleSpecsTable vehicle={vehicle} />
          </div>

          {/* Colonne Droite : Prix & Contact Direct Annonceur (Sans Argus) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs sticky top-20 space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  <BrandImageLogo brandName={vehicle.brand} className="w-4 h-4 object-contain" />
                  <span>{vehicle.brand} · {vehicle.year}</span>
                </div>
                <div className="flex items-start justify-between gap-3 mt-1.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                  </h1>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(vehicle.id)}
                    aria-label="Ajouter aux favoris"
                    className="p-2.5 rounded-full border border-slate-200 text-slate-700 hover:text-rose-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white shrink-0"
                  >
                    <Heart className={`w-5 h-5 ${favorite ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Prix mis en avant */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 tabular-nums">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {formatPriceMillions(vehicle.price)}
                </div>
                <div className="text-xs font-bold text-blue-600 mt-1">
                  {formatPriceDZD(vehicle.price)} · {priceTypeLabel}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 pb-4 border-b border-slate-100 tabular-nums">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{vehicle.wilayaName} ({vehicle.commune})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{vehicle.viewCount} vues</span>
                </div>
              </div>

              {/* Infos Annonceur */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  Annonceur Direct
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {vehicle.sellerDisplayName}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Annonce vérifiée · Contact direct sans commission</span>
                </div>
              </div>

              {/* Boutons d'appel et WhatsApp */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Afficher le numéro & Appeler</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contacter sur WhatsApp</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Signaler cette annonce</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <StickyContactBar
          price={vehicle.price}
          priceTypeLabel={priceTypeLabel}
          onOpenContact={() => setContactOpen(true)}
        />

        <ContactRevealModal
          listingId={vehicle.id}
          vehicleTitle={`${vehicle.brand} ${vehicle.model}`}
          sellerDisplayName={vehicle.sellerDisplayName}
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
        />

        <ReportListingModal
          listingId={vehicle.id}
          vehicleTitle={`${vehicle.brand} ${vehicle.model}`}
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      </div>
    </div>
  );
};
