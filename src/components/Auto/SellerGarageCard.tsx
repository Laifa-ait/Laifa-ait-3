import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  VehicleSellerPrivateDto,
  VehicleListingStatus,
} from "../../domains/auto/auto.types";
import {
  formatPriceDZD,
  formatMileage,
  PAPER_STATUS_LABELS,
} from "../../domains/auto/auto.utils";
import {
  Eye,
  CheckCircle2,
  AlertCircle,
  Archive,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";

interface SellerGarageCardProps {
  listing: VehicleSellerPrivateDto;
  onStatusChange: (id: string, newStatus: VehicleListingStatus) => Promise<void>;
}

export const SellerGarageCard: React.FC<SellerGarageCardProps> = ({
  listing,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);
  const { id, status, rejectionReason, publicData } = listing;

  const handleAction = async (targetStatus: VehicleListingStatus) => {
    try {
      setLoading(true);
      await onStatusChange(id, targetStatus);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">En Ligne</span>;
      case "pending_review":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">En Modération</span>;
      case "draft":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Brouillon</span>;
      case "rejected":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Refusée</span>;
      case "sold":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Vendu</span>;
      case "archived":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-600">Archivée</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-44 h-32 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
          {publicData.primaryImageUrl ? (
            <img
              src={publicData.primaryImageUrl}
              alt={publicData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Aucune image
            </div>
          )}
          <div className="absolute top-2 left-2">{getStatusBadge()}</div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {publicData.title}
              </h3>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-slate-900">
                  {formatPriceDZD(publicData.price)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              <span>{publicData.year}</span>
              <span>•</span>
              <span>{formatMileage(publicData.mileage)}</span>
              <span>•</span>
              <span>{publicData.wilayaName}</span>
              <span>•</span>
              <span>{PAPER_STATUS_LABELS[publicData.paperStatus]?.label || publicData.paperStatus}</span>
            </div>

            {status === "rejected" && rejectionReason && (
              <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Motif de refus : </span>
                  <span>{rejectionReason}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {publicData.viewCount} vues
              </span>
            </div>

            <div className="flex items-center gap-2">
              {status === "active" && (
                <>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction("sold")}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Marquer Vendu
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction("archived")}
                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {(status === "draft" || status === "rejected") && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction("pending_review")}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Soumettre à validation
                </button>
              )}

              {status === "active" && (
                <Link
                  to={`/auto/vehicules/${id}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir Showroom
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
