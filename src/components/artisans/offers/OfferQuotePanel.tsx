import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { ArtisanOffer, formatOfferPriceLabel } from "../../../types/artisanOffers";
import { submitOfferQuoteAndOpenChat } from "../../../services/artisanOffers.api";
import { useAuth } from "../../../context/AuthContext";
import { WilayaCommuneSelector } from "../WilayaCommuneSelector";

interface OfferQuotePanelProps {
  offer: ArtisanOffer;
}

export const OfferQuotePanel: React.FC<OfferQuotePanelProps> = ({ offer }) => {
  const navigate = useNavigate();
  const { currentUser, user } = useAuth();

  const [description, setDescription] = useState("");
  const [wilaya, setWilaya] = useState(offer.wilaya || "Alger");
  const [commune, setCommune] = useState(offer.communes[0] || "");
  const [urgency, setUrgency] = useState<"urgent" | "standard" | "flexible">("standard");
  const [preferredDate, setPreferredDate] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdConversationId, setCreatedConversationId] = useState<string | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);

  const isOwnOffer = Boolean(currentUser && currentUser.uid === offer.ownerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      navigate(`/auth?redirect=/artisans/offres/${offer.id}`);
      return;
    }

    if (!description.trim() || !wilaya || !commune) {
      setErrorMsg("Veuillez décrire votre besoin et préciser votre wilaya et commune.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitOfferQuoteAndOpenChat({
        offerId: offer.id,
        artisanId: offer.artisanId,
        tradeId: offer.tradeId,
        offerTitle: offer.title,
        offerImageUrl: offer.coverImageUrl || offer.images[0],
        clientName: user?.displayName || currentUser.displayName || "Demandeur Olmart",
        description: description.trim(),
        wilaya,
        commune,
        urgency,
        preferredDate: preferredDate || undefined,
        estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Impossible d'envoyer la demande pour le moment.");
        return;
      }

      setQuoteSent(true);
      if (res.conversationId) {
        setCreatedConversationId(res.conversationId);
      }
    } catch {
      setErrorMsg("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.04)] p-5 space-y-4 lg:sticky lg:top-20">
      <div className="border-b border-slate-100 pb-3.5 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Tarification indicative
        </p>
        <p className="text-xl font-bold text-[#0F172A] tabular-nums">
          {formatOfferPriceLabel(offer)}
        </p>
        <p className="text-xs text-slate-500">
          Devis gratuit et échange sécurisé via la messagerie Olma Artisans.
        </p>
      </div>

      {quoteSent ? (
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <p className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Demande de devis envoyée</span>
            </p>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {offer.artisanName} a reçu votre demande. Vous pouvez poursuivre la discussion directement dans la messagerie intégrée.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                createdConversationId
                  ? `/artisans/messages?conversationId=${encodeURIComponent(createdConversationId)}`
                  : "/artisans/messages"
              )
            }
            className="w-full h-11 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ouvrir la messagerie avec l&apos;artisan</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/artisans/mes-demandes")}
            className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            Voir mes demandes de devis
          </button>
        </div>
      ) : isOwnOffer ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <p className="text-xs font-semibold text-slate-700">
            Ceci est votre propre offre de travaux.
          </p>
          <button
            type="button"
            onClick={() => navigate("/artisans/dashboard")}
            className="w-full h-10 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold cursor-pointer"
          >
            Gérer depuis mon Espace Artisan
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Décrivez vos travaux *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Surface approximative, état actuel, détails importants..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1E3A8A] focus:bg-white text-xs text-slate-900 outline-none transition-colors"
            />
          </div>

          <WilayaCommuneSelector
            selectedWilaya={wilaya}
            selectedCommune={commune}
            onWilayaChange={(w) => setWilaya(w)}
            onCommuneChange={(c) => setCommune(c)}
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Délai souhaité</label>
              <select
                value={urgency}
                onChange={(e) =>
                  setUrgency(e.target.value as "urgent" | "standard" | "flexible")
                }
                className="w-full h-10 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              >
                <option value="urgent">Urgent (24-48h)</option>
                <option value="standard">Cette semaine</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Date souhaitée</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full h-10 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Budget estimatif (DA, facultatif)
            </label>
            <input
              type="number"
              min={0}
              placeholder="Ex: 15000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 tabular-nums"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {!currentUser ? <Lock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            <span>
              {submitting
                ? "Envoi et ouverture de la discussion..."
                : currentUser
                ? "Demander un devis & discuter"
                : "Se connecter pour demander un devis"}
            </span>
          </button>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Tous les échanges passent par la messagerie intégrée Olmart pour protéger vos coordonnées et sécuriser votre devis.
            </span>
          </div>
        </form>
      )}
    </aside>
  );
};
