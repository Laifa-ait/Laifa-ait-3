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
import { useEphemeralAutoStudio } from "../../hooks/useEphemeralAutoStudio";

export const AutoPartDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ephemeralParts } = useEphemeralAutoStudio();
  const [part, setPart] = useState<AutoPartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [contactRevealed, setContactRevealed] = useState<{ phone: string; whatsapp: string } | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (id.startsWith("ephemeral-")) {
      const found = ephemeralParts.find((p) => p.id === id) || ephemeralParts[0] || null;
      setPart(found);
      if (found?.images?.[0]) setActiveImage(found.images[0]);
      setLoading(false);
      return;
    }

    setLoading(true);
    autoClient
      .getPartById(id)
      .then((data) => {
        setPart(data);
        if (data.images?.[0]) setActiveImage(data.images[0]);
      })
      .catch(() => setPart(null))
      .finally(() => setLoading(false));
  }, [id, ephemeralParts]);

  const handleRevealContact = useCallback(async () => {
    if (!id || contactRevealed) return;
    if (id.startsWith("ephemeral-")) {
      setContactRevealed({
        phone: "0550 12 34 56",
        whatsapp: "https://wa.me/213550123456",
      });
      return;
    }
    setRevealing(true);
    try {
      const res = await autoClient.revealPartContact(id);
      setContactRevealed(res);
    } catch {
      setContactRevealed({ phone: "0550 12 34 56", whatsapp: "https://wa.me/213550123456" });
    } finally {
      setRevealing(false);
    }
  }, [id, contactRevealed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500">Chargement de la pièce détachée...</p>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 p-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-lg font-extrabold">Pièce détachée introuvable</h2>
        <Link
          to="/auto/pieces"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-xs font-extrabold text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux pièces détachées</span>
        </Link>
      </div>
    );
  }

  const wilayaName = getWilayaNameById(part.wilayaId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="mb-6">
          <Link
            to="/auto/pieces"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Retour aux pièces détachées</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-16/10 bg-slate-900 rounded-3xl overflow-hidden border border-slate-200">
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
                      activeImage === img ? "border-blue-600 scale-102" : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Véhicules Compatibles</h3>
              </div>

              {part.compatibilities.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {part.compatibilities.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50/70 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-900">{c.brand} {c.model}</span>
                        {c.engineType && <span className="text-slate-500">({c.engineType})</span>}
                      </div>
                      <span className="text-slate-600 font-medium tabular-nums">
                        {c.yearStart ? `${c.yearStart} - ${c.yearEnd || "Aujourd'hui"}` : "Toutes années"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Compatibilité à vérifier directement avec le vendeur.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xs">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1.5">
                  {part.category.toUpperCase()} · {part.condition.replace(/_/g, " ").toUpperCase()}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {part.title}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{part.commune}, {wilayaName}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Prix demandé</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                    {formatPriceDZD(part.priceDZD)}
                  </p>
                </div>
                {part.isPriceNegotiable && (
                  <span className="text-xs font-bold text-blue-600">
                    Négociable
                  </span>
                )}
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Vendeur :</span>
                  <span className="font-extrabold text-slate-900">{part.sellerName}</span>
                </div>

                {contactRevealed ? (
                  <div className="space-y-2 pt-2">
                    <a
                      href={`tel:${contactRevealed.phone}`}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors tabular-nums"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Appeler : {contactRevealed.phone}</span>
                    </a>
                    <a
                      href={contactRevealed.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
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
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
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

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  Description
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
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
