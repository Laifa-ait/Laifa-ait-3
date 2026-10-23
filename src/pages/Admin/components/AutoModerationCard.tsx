import React from "react";
import { CheckCircle2, XCircle, ShieldCheck, MapPin } from "lucide-react";
import { AdminModerationListingItemDto } from "../../../domains/auto/autoAdmin.types";
import { formatPriceDZD, getWilayaNameById } from "../../../domains/auto/auto.utils";

interface AutoModerationCardProps {
  item: AdminModerationListingItemDto;
  isActionLoading: boolean;
  onApprove: (id: string) => void;
  onReject: (item: AdminModerationListingItemDto) => void;
  onToggleBadge: (id: string, current: boolean) => void;
}

export const AutoModerationCard: React.FC<AutoModerationCardProps> = ({
  item,
  isActionLoading,
  onApprove,
  onReject,
  onToggleBadge,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex gap-3">
        <img
          src={
            item.primaryImageUrl ||
            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80"
          }
          alt={item.title}
          className="w-28 h-20 object-cover rounded-xl bg-slate-100 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
            Papiers : {item.paperStatus}
          </span>
          <h3 className="text-sm font-bold text-slate-900 truncate mt-1">{item.title}</h3>
          <p className="text-xs text-orange-600 font-black">{formatPriceDZD(item.priceDZD)}</p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>
              {item.commune}, {getWilayaNameById(item.wilayaId)}
            </span>
          </p>
        </div>
      </div>

      <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
        <div className="flex justify-between">
          <span>
            Vendeur : <strong>{item.sellerDisplayName}</strong>
          </span>
          <span>
            Tél : <strong>{item.sellerPhoneNumber || "Non renseigné"}</strong>
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>
            Année : {item.year} • {item.mileage.toLocaleString()} km
          </span>
          <span>Déposée le {new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
        <button
          type="button"
          onClick={() => onToggleBadge(item.id, Boolean(item.isVerifiedDealer))}
          disabled={isActionLoading}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
            item.isVerifiedDealer
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{item.isVerifiedDealer ? "Certifié" : "Non certifié"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReject(item)}
            disabled={isActionLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejeter</span>
          </button>
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            disabled={isActionLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1 transition-colors cursor-pointer border-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approuver</span>
          </button>
        </div>
      </div>
    </div>
  );
};
