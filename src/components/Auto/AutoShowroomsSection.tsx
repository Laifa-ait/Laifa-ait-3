import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Car, ArrowRight, ShieldCheck } from "lucide-react";

interface ShowroomItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewsCount: number;
  vehiclesCount: number;
  imageUrl: string;
}

const VERIFIED_SHOWROOMS: ShowroomItem[] = [
  {
    id: "oran-expert",
    name: "Auto Expert Oran",
    city: "Oran",
    rating: 4.8,
    reviewsCount: 36,
    vehiclesCount: 1245,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "garage-prestige",
    name: "Garage Prestige",
    city: "Alger",
    rating: 4.6,
    reviewsCount: 52,
    vehiclesCount: 892,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sahara-motors",
    name: "Sahara Motors",
    city: "Constantine",
    rating: 4.7,
    reviewsCount: 28,
    vehiclesCount: 670,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  },
];

export const AutoShowroomsSection: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Showrooms vérifiés</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Concessionnaires agréés</span>
            </span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Découvrez les concessionnaires et garages de confiance en Algérie.
          </p>
        </div>

        <Link
          to="/auto/catalog?sellerType=pro"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#0B1730] transition-colors"
        >
          <span>Voir tous</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {VERIFIED_SHOWROOMS.map((showroom) => (
          <Link
            key={showroom.id}
            to={`/auto/catalog?dealer=${showroom.id}`}
            className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#172B4D] hover:shadow-lg transition-all overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
              <img
                src={showroom.imageUrl}
                alt={showroom.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                <span className="text-xs font-black drop-shadow-sm">{showroom.name}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vérifié</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{showroom.city}</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{showroom.rating}</span>
                  <span className="text-slate-400 font-normal text-[11px]">({showroom.reviewsCount} avis)</span>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                  <Car className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showroom.vehiclesCount.toLocaleString("fr-FR")} véhicules</span>
                </span>
                <span className="text-[11px] font-bold text-[#172B4D] group-hover:underline">
                  Visiter le parc
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
