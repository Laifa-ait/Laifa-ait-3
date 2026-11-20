import React, { useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { ArtisanProfile, ArtisanTrade } from "../../../types/artisan";
import { ArtisanOffer, ArtisanOfferPricingType } from "../../../types/artisanOffers";
import { createArtisanOffer, updateArtisanOffer } from "../../../services/artisanOffers.api";
import { uploadFile } from "../../../services/storage.service";
import { WilayaCommuneSelector } from "../WilayaCommuneSelector";
import { ArtisanOfferMediaAndPricing } from "./ArtisanOfferMediaAndPricing";

interface ArtisanOfferFormProps {
  profile: ArtisanProfile;
  trades: ArtisanTrade[];
  editingOffer: ArtisanOffer | null;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}

export const ArtisanOfferForm: React.FC<ArtisanOfferFormProps> = ({
  profile,
  trades,
  editingOffer,
  onSaved,
  onCancel,
}) => {
  const [title, setTitle] = useState(editingOffer?.title || "");
  const [tradeId, setTradeId] = useState(editingOffer?.tradeId || profile.tradeId || "");
  const [description, setDescription] = useState(editingOffer?.description || "");
  const [pricingType, setPricingType] = useState<ArtisanOfferPricingType>(
    editingOffer?.pricingType || "a_partir_de"
  );
  const [priceDzd, setPriceDzd] = useState<string>(
    editingOffer?.priceDzd ? String(editingOffer.priceDzd) : ""
  );
  const [wilaya, setWilaya] = useState(editingOffer?.wilaya || profile.wilaya || "Alger");
  const [wilayaCode, setWilayaCode] = useState(editingOffer?.wilayaCode || profile.wilayaCode || "16");
  const [commune, setCommune] = useState(editingOffer?.communes?.[0] || profile.commune || "");
  const [extraCommunes, setExtraCommunes] = useState(editingOffer?.communes?.slice(1).join(", ") || "");
  const [interventionDelay, setInterventionDelay] = useState(
    editingOffer?.interventionDelay || "Sous 24 à 48h"
  );
  const [includedItems, setIncludedItems] = useState<string[]>(
    editingOffer?.includedItems?.length
      ? editingOffer.includedItems
      : ["Déplacement et diagnostic sur place", "Travail soigné avec finitions propres"]
  );
  const [images, setImages] = useState<string[]>(editingOffer?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedTrade = trades.find((t) => t.id === tradeId);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const uploadedUrls: string[] = [];
      const maxRemaining = Math.max(0, 6 - images.length);
      for (const file of Array.from(files).slice(0, maxRemaining)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const url = await uploadFile(`artisan_offers/${profile.userId}/${Date.now()}_${safeName}`, file);
        uploadedUrls.push(url);
      }
      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 6));
    } catch {
      setErrorMsg("Erreur lors de l'import des photos. Réessayez avec une image JPG ou PNG.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (targetStatus: "active" | "draft") => {
    setErrorMsg(null);
    if (!title.trim() || !tradeId || !description.trim() || !wilaya) {
      setErrorMsg("Veuillez renseigner le titre, le métier, la description et la wilaya.");
      return;
    }
    if (pricingType !== "sur_devis" && (!priceDzd || Number(priceDzd) <= 0)) {
      setErrorMsg("Indiquez un tarif en DA ou choisissez l'option « Sur devis ».");
      return;
    }

    const communesList = [
      commune,
      ...extraCommunes.split(",").map((c) => c.trim()).filter(Boolean),
    ].filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        tradeId,
        tradeName: selectedTrade?.name || profile.tradeName || "Artisan",
        description: description.trim(),
        includedItems,
        images,
        coverImageUrl: images[0] || "",
        pricingType,
        priceDzd: pricingType === "sur_devis" ? undefined : Number(priceDzd),
        wilaya,
        wilayaCode,
        communes: Array.from(new Set(communesList)),
        interventionDelay,
        isAvailable: profile.isAvailable,
        status: targetStatus,
      };
      const res = editingOffer
        ? await updateArtisanOffer(editingOffer.id, payload)
        : await createArtisanOffer(payload);
      if (!res.success) {
        setErrorMsg(res.error || "Impossible d'enregistrer l'offre.");
        return;
      }
      await onSaved();
    } catch {
      setErrorMsg("Erreur réseau lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            {editingOffer ? "Modifier mon offre de travaux" : "Publier une nouvelle offre de travaux"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Présentez clairement votre prestation pour recevoir des demandes de devis qualifiées.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
        >
          Annuler
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-slate-700">Titre de l&apos;offre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Installation & recharge climatiseur Split 12000 BTU"
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1E3A8A] focus:bg-white text-xs text-slate-900 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Catégorie métier *</label>
          <select
            value={tradeId}
            onChange={(e) => setTradeId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
          >
            <option value="">Sélectionner un métier</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Délai moyen d&apos;intervention</label>
          <select
            value={interventionDelay}
            onChange={(e) => setInterventionDelay(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
          >
            <option value="Sous 24h (Urgence)">Sous 24h (Urgence)</option>
            <option value="Sous 24 à 48h">Sous 24 à 48h</option>
            <option value="Sous 3 à 5 jours">Sous 3 à 5 jours</option>
            <option value="Sur rendez-vous">Sur rendez-vous</option>
          </select>
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-slate-700">Description détaillée *</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Expliquez comment vous réalisez la prestation, votre matériel et vos garanties..."
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1E3A8A] focus:bg-white text-xs text-slate-900 outline-none"
          />
        </div>
      </div>

      <ArtisanOfferMediaAndPricing
        images={images}
        uploading={uploading}
        onUploadFiles={handlePhotoUpload}
        onRemoveImage={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
        pricingType={pricingType}
        onPricingTypeChange={setPricingType}
        priceDzd={priceDzd}
        onPriceDzdChange={setPriceDzd}
        includedItems={includedItems}
        onAddIncludedItem={(item) => setIncludedItems((prev) => [...prev, item].slice(0, 12))}
        onRemoveIncludedItem={(idx) => setIncludedItems((prev) => prev.filter((_, i) => i !== idx))}
      />

      <div className="space-y-3 border-t border-slate-100 pt-5">
        <label className="text-xs font-bold text-[#0F172A]">Zone d&apos;intervention *</label>
        <WilayaCommuneSelector
          selectedWilaya={wilaya}
          selectedCommune={commune}
          onWilayaChange={(w, code) => { setWilaya(w); setWilayaCode(code); }}
          onCommuneChange={setCommune}
        />
        <input
          type="text"
          value={extraCommunes}
          onChange={(e) => setExtraCommunes(e.target.value)}
          placeholder="Autres communes couvertes séparées par des virgules (facultatif)"
          className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={saving || uploading}
          onClick={() => handleSubmit("draft")}
          className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
        >
          Enregistrer en brouillon
        </button>
        <button
          type="button"
          disabled={saving || uploading}
          onClick={() => handleSubmit("active")}
          className="h-10 px-5 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? "Enregistrement..." : editingOffer ? "Enregistrer" : "Publier l'offre"}</span>
        </button>
      </div>
    </div>
  );
};
