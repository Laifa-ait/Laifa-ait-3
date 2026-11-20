import React, { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { ArtisanTrade } from "../../../types/artisan";
import { ArtisanAdBillingModel } from "../../../types/artisanAds";
import { adminCreateArtisanSponsorAd } from "../../../services/artisanAds.api";
import { ALGERIA_WILAYAS } from "../../../constants/wilayas";

interface AdminSponsorAdFormProps {
  trades: ArtisanTrade[];
  onCreated: () => Promise<void>;
}

export const AdminSponsorAdForm: React.FC<AdminSponsorAdFormProps> = ({
  trades,
  onCreated,
}) => {
  const [creating, setCreating] = useState(false);
  const [advertiserName, setAdvertiserName] = useState("");
  const [format, setFormat] = useState<"contextual_material_ad" | "in_feed_native_banner">(
    "contextual_material_ad"
  );
  const [billingModel, setBillingModel] = useState<ArtisanAdBillingModel>("flat_pack");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Découvrir l'offre");
  const [targetUrl, setTargetUrl] = useState("/shop");
  const [imageUrl, setImageUrl] = useState("");
  const [targetTrade, setTargetTrade] = useState("all");
  const [targetWilaya, setTargetWilaya] = useState("all");
  const [budgetDzd, setBudgetDzd] = useState(5000);
  const [unitPriceDzd, setUnitPriceDzd] = useState(25);
  const [durationDays, setDurationDays] = useState(30);

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiserName.trim() || !title.trim() || !targetUrl.trim()) {
      toast.error("Veuillez remplir l'annonceur, le titre et le lien");
      return;
    }

    setCreating(true);
    try {
      const res = await adminCreateArtisanSponsorAd({
        ownerType: targetUrl.startsWith("/") ? "olmart_store" : "external_brand",
        advertiserName: advertiserName.trim(),
        format,
        billingModel,
        title: title.trim(),
        description: description.trim(),
        ctaLabel: ctaLabel.trim() || "Découvrir",
        targetUrl: targetUrl.trim(),
        imageUrl: imageUrl.trim() || undefined,
        targetTrades: [targetTrade],
        targetWilayas: [targetWilaya],
        budgetDzd: Number(budgetDzd) || 0,
        unitPriceDzd: billingModel === "flat_pack" ? undefined : Number(unitPriceDzd) || 20,
        durationDays: Number(durationDays) || 30,
      });

      if (res.success) {
        toast.success("Annonce sponsorisée publiée immédiatement !");
        setAdvertiserName("");
        setTitle("");
        setDescription("");
        setImageUrl("");
        await onCreated();
      } else {
        toast.error(res.error || "Erreur lors de la publication");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateSponsor}
      className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Megaphone className="w-4 h-4 text-amber-600" />
        <h2 className="text-sm font-black text-slate-900">
          Publier une Annonce Sponsorisée (Fournisseurs, Quincailleries, Marques BTP ou Olmart)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          required
          placeholder="Annonceur (ex: Peintures Atlas, Quincaillerie...)"
          value={advertiserName}
          onChange={(e) => setAdvertiserName(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
        <select
          value={format}
          onChange={(e) =>
            setFormat(e.target.value as "contextual_material_ad" | "in_feed_native_banner")
          }
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
        >
          <option value="contextual_material_ad">Matériel Contextuel (Shopping)</option>
          <option value="in_feed_native_banner">Bannière Native In-Feed</option>
        </select>
        <select
          value={targetTrade}
          onChange={(e) => setTargetTrade(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
        >
          <option value="all">Tous les métiers</option>
          {trades.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={targetWilaya}
          onChange={(e) => setTargetWilaya(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
        >
          <option value="all">Toutes les wilayas</option>
          {ALGERIA_WILAYAS.map((w) => (
            <option key={w.code} value={w.name}>
              {w.code} - {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          placeholder="Titre court de l'annonce (ex: Chauffe-bains & outillage -15%)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
        <input
          type="text"
          required
          placeholder="Lien de destination (ex: /shop ou https://...)"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Description courte (1 phrase)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="sm:col-span-2 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
        <input
          type="text"
          placeholder="URL image (facultatif)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
        <select
          value={billingModel}
          onChange={(e) => setBillingModel(e.target.value as ArtisanAdBillingModel)}
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
        >
          <option value="flat_pack">Forfait fixe (DA)</option>
          <option value="cpc">Coût par Clic (CPC)</option>
          <option value="cpm">Coût / 1000 Vues (CPM)</option>
        </select>
        <input
          type="number"
          min={0}
          value={budgetDzd}
          onChange={(e) => setBudgetDzd(Number(e.target.value))}
          placeholder="Budget (DA)"
          className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <label className="flex items-center gap-1.5">
            <span>Bouton :</span>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="h-8 w-36 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
            />
          </label>
          {billingModel !== "flat_pack" && (
            <label className="flex items-center gap-1.5">
              <span>Prix unitaire (DA) :</span>
              <input
                type="number"
                min={1}
                value={unitPriceDzd}
                onChange={(e) => setUnitPriceDzd(Number(e.target.value))}
                className="h-8 w-20 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
              />
            </label>
          )}
          <label className="flex items-center gap-1.5">
            <span>Durée (j) :</span>
            <input
              type="number"
              min={1}
              max={365}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="h-8 w-16 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="h-10 px-5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{creating ? "Publication..." : "Publier la publicité"}</span>
        </button>
      </div>
    </form>
  );
};
