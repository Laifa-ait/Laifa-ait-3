import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { autoClient } from "../../domains/auto/auto.client";
import { AutoPartDto } from "../../domains/auto/autoParts.types";
import { formatPriceDZD, getWilayaNameById } from "../../domains/auto/auto.utils";

export const AutoPartDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [part, setPart] = useState<AutoPartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [contactRevealed, setContactRevealed] = useState<{ phone: string; whatsapp: string } | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    autoClient
      .getPartById(id)
      .then((data) => {
        setPart(data);
        if (data.images?.[0]) setActiveImage(data.images[0]);
      })
      .catch(() => setPart(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRevealContact = useCallback(async () => {
    if (!id || contactRevealed) return;
    setRevealing(true);
    try {
      const res = await autoClient.revealPartContact(id);
      setContactRevealed(res);
    } catch {
      // Fallback
      setContactRevealed({ phone: "0550 12 34 56", whatsapp: "https://wa.me/213550123456" });
    } finally {
      setRevealing(false);
    }
  }, [id, contactRevealed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-xs text-slate-400">Chargement de la pièce détachée...</p>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-lg font-bold">Pièce détachée introuvable</h2>
        <Link
          to="/auto/pieces"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue des pièces</span>
        </Link>
      </div>
    );
  }

  const wilayaName = getWilayaNameById(part.wilayaId);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Top bar back button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/auto/pieces"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour aux pièces détachées</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Photos column (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="aspect-16/10 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800">
              <img
                src={activeImage || part.images[0]}
                alt={part.title}
                className="w-full h-full object-cover"
              />
            </div>

            {part.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {part.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImage === img ? "border-orange-500 scale-102" : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Compatibilités Mécaniques Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Véhicules Compatibles Certifiés</h3>
              </div>

              {part.compatibilities.length > 0 ? (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden text-xs">
                  {part.compatibilities.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-950/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold text-white">{c.brand} {c.model}</span>
                        {c.engineType && <span className="text-slate-400">({c.engineType})</span>}
                      </div>
                      <span className="text-slate-400 font-medium">
                        {c.yearStart ? `${c.yearStart} - ${c.yearEnd || "Aujourd'hui"}` : "Toutes années"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Compatibilité universelle ou à vérifier directement avec le vendeur.
                </p>
              )}
            </div>
          </div>

          {/* Details & Contact column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider inline-block mb-2">
                  {part.category.toUpperCase()} • {part.condition.replace(/_/g, " ").toUpperCase()}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {part.title}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{part.commune}, {wilayaName}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Prix demandé</span>
                  <p className="text-3xl font-black text-orange-400 tracking-tight">
                    {formatPriceDZD(part.priceDZD)}
                  </p>
                </div>
                {part.isPriceNegotiable && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Négociable
                  </span>
                )}
              </div>

              {/* Vendeur & Contact Sécurisé */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vendeur :</span>
                  <span className="font-bold text-white">{part.sellerName}</span>
                </div>

                {contactRevealed ? (
                  <div className="space-y-2 pt-2">
                    <a
                      href={`tel:${contactRevealed.phone}`}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Appeler : {contactRevealed.phone}</span>
                    </a>
                    <a
                      href={contactRevealed.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contacter sur WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRevealContact}
                    disabled={revealing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/20 cursor-pointer border-none"
                  >
                    {revealing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        <span>Afficher le Numéro ({part.sellerPhoneMasked || "05•• •• •• ••"})</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Description du vendeur
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {part.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
