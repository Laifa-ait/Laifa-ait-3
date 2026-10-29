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

  const isEphemeral = listingId.startsWith("ephemeral-");

  const handleReveal = async () => {
    if (isEphemeral) {
      setRevealed({
        listingId,
        phoneNumber: "+213 550 12 34 56",
        whatsappUrl: "https://wa.me/213550123456",
        expiresInSeconds: 900,
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await autoClient.revealContact(listingId);
      setRevealed(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de contact";
      if (msg.includes("429") || msg.toLowerCase().includes("limite")) {
        setError(
          "Limite de sécurité atteinte. Veuillez patienter avant de solliciter un nouveau contact."
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
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Contacter le vendeur</h3>
            <p className="text-xs text-slate-500 mt-0.5">{vehicleTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer bg-transparent border-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {!revealed ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mise en relation directe sans commission</span>
              </div>
              <p>
                Annonceur : <strong className="text-slate-900">{sellerDisplayName}</strong>
              </p>
              <p className="text-[11px] text-slate-500 leading-normal">
                Appelez directement le vendeur ou discutez sur WhatsApp pour convenir d'un rendez-vous.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReveal}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Affichage du numéro...</span>
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
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-1">
              <span className="text-xs text-blue-700 font-bold">Numéro direct du vendeur</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 tracking-wider tabular-nums">
                {revealed.phoneNumber}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${revealed.phoneNumber}`}
                className="py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler</span>
              </a>

              <a
                href={revealed.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
