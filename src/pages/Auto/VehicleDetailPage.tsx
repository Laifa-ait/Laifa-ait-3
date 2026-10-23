import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Car,
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
import { formatPriceDZD, PRICE_TYPE_LABELS } from "../../domains/auto/auto.utils";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";
import { VehiclePhotoGallery } from "../../components/Auto/VehiclePhotoGallery";
import { VehicleSpecsTable } from "../../components/Auto/VehicleSpecsTable";
import { ContactRevealModal } from "../../components/Auto/ContactRevealModal";
import { ReportListingModal } from "../../components/Auto/ReportListingModal";
import { StickyContactBar } from "../../components/Auto/StickyContactBar";

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<VehiclePublicDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useVehicleFavorites();

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    autoClient
      .getPublicListingById(id)
      .then((data) => {
        if (active) setVehicle(data);
      })
      .catch(() => {
        if (active) setVehicle(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#172B4D]" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-16 px-4 text-center">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Véhicule non trouvé ou retiré</h2>
        <p className="text-xs text-slate-500 mb-6">Cette annonce n'est plus accessible ou a expiré.</p>
        <Link
          to="/auto/vehicules"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#172B4D] text-white rounded-lg text-xs font-semibold hover:bg-[#0B1730] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue</span>
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(vehicle.id);
  const priceTypeLabel = PRICE_TYPE_LABELS[vehicle.priceType] || vehicle.priceType;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-5">
          <Link to="/auto" className="hover:text-[#172B4D] transition-colors">Showroom</Link>
          <span aria-hidden="true">/</span>
          <Link to="/auto/vehicules" className="hover:text-[#172B4D] transition-colors">Véhicules</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium truncate">{vehicle.brand} {vehicle.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Gallery + Specs */}
          <div className="lg:col-span-8 space-y-6">
            <VehiclePhotoGallery images={vehicle.images} title={`${vehicle.brand} ${vehicle.model}`} />
            <VehicleSpecsTable vehicle={vehicle} />
          </div>

          {/* Right Column (4 cols): Pricing & Seller Info */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <button
                  type="button"
                  onClick={() => toggleFavorite(vehicle.id)}
                  aria-label="Favoris"
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${favorite ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
                  {formatPriceDZD(vehicle.price)}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {priceTypeLabel}
                  {vehicle.currentOfferPrice ? ` · Dernière offre: ${formatPriceDZD(vehicle.currentOfferPrice)}` : ""}
                </div>
              </div>

              {/* Location & Meta info */}
              <div className="flex items-center gap-4 text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vehicle.wilayaName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vehicle.viewCount} vues</span>
                </div>
              </div>

              {/* Seller Block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Vendeur</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{vehicle.sellerDisplayName}</div>
                <div className="text-xs text-slate-500 capitalize">{vehicle.sellerType}</div>
                {vehicle.isSellerVerified && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Identité vérifiée par Olmart</span>
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="w-full py-3 px-4 bg-[#D9F66F] hover:bg-[#C5E94F] text-[#0B1730] font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-[#0B1730]" />
                  <span>Contacter le vendeur</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="w-full py-3 px-4 bg-[#172B4D] hover:bg-[#23416A] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4 text-[#D9F66F]" />
                  <span>Discuter sur WhatsApp</span>
                </button>
              </div>

              {/* Report button */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Signaler un problème sur l'annonce</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bar */}
        <StickyContactBar
          price={vehicle.price}
          priceTypeLabel={priceTypeLabel}
          onOpenContact={() => setContactOpen(true)}
        />

        {/* Modals */}
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
