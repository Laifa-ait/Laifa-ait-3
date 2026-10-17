import React, { useState } from "react";
import { X, Phone, MessageSquare, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { autoClient } from "../../domains/auto/auto.client";
import { VehicleContactRevealDto } from "../../domains/auto/auto.types";

export interface ContactRevealModalProps {
  listingId: string;
  vehicleTitle: string;
  sellerDisplayName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactRevealModal: React.FC<ContactRevealModalProps> = ({
  listingId,
  vehicleTitle,
  sellerDisplayName,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<VehicleContactRevealDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReveal = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await autoClient.revealContact(listingId);
      setRevealed(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de contact";
      if (msg.includes("429") || msg.toLowerCase().includes("limite")) {
        setError(
          "Limite de sécurité atteinte. Afin de protéger nos vendeurs contre le scraping et le démarchage, veuillez patienter avant de solliciter un nouveau contact."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Contacter le vendeur</h3>
            <p className="text-xs text-slate-500 mt-0.5">{vehicleTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {!revealed ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protection Anti-Démarchage Olmart</span>
              </div>
              <p>
                Vendeur : <strong className="text-slate-800">{sellerDisplayName}</strong>
              </p>
              <p className="text-[11px] text-slate-500 leading-normal">
                Les coordonnées sont vérifiées par serveur sécurisé avec limitation de requêtes pour empêcher le scraping non sollicité.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReveal}
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification sécurisée...</span>
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  <span>Afficher le numéro de téléphone</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center space-y-1">
              <span className="text-xs text-emerald-800 font-medium">Coordonnées directes</span>
              <div className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                {revealed.phoneNumber}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${revealed.phoneNumber}`}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler</span>
              </a>

              <a
                href={revealed.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Session de contact active pendant {Math.round(revealed.expiresInSeconds / 60)} minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
