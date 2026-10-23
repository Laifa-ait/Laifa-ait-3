import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, BarChart3, Tag, Zap, Share2, Plus, Sparkles } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Product } from "../../domains/product/product.types";
import { Coupon } from "../../domains/marketing/coupon.types";
import { toast } from "react-hot-toast";
import { AdSpotConfig, SellerPromoCampaign } from "../../domains/seller/services/sellerMarketing.service";
import { SponsorshipRequest, SponsorshipTier } from "../../domains/seller/sponsorship.types";
import { SellerCouponModal } from "./components/coupons/SellerCouponModal";
import { MarketingOverviewTab } from "./components/marketing/MarketingOverviewTab";
import { MarketingPromosTab } from "./components/marketing/MarketingPromosTab";
import { MarketingSponsorshipsTab } from "./components/marketing/MarketingSponsorshipsTab";
import { MarketingCouponsTab } from "./components/marketing/MarketingCouponsTab";
import { MarketingPromoModal } from "./components/marketing/MarketingPromoModal";
import { MarketingSponsoModal } from "./components/marketing/MarketingSponsoModal";

export const MarketingCenter: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "promos" | "sponsorships" | "coupons">("overview");

  const [overview, setOverview] = useState<{
    kpis: { activeCampaignsCount: number; totalSpentDZD: number; totalImpressions: number; totalClicks: number; ctrPct: number; conversionsCount: number };
    eventsLog: Array<{ timestamp: string; campaignTitle: string; status: string; actor: string; details: string }>;
    adSpots: AdSpotConfig[];
  } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<SellerPromoCampaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sponsorshipRequests, setSponsorshipRequests] = useState<SponsorshipRequest[]>([]);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showSponsoModal, setShowSponsoModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<AdSpotConfig | null>(null);

  const [promoForm, setPromoForm] = useState({
    title: "", description: "", discountType: "percentage" as "percentage" | "fixed_dzd", discountValue: 10, selectedProductIds: [] as string[],
    startDate: new Date().toISOString().split("T")[0], endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });

  const [sponsoForm, setSponsoForm] = useState({ productId: "", tier: "bronze" as SponsorshipTier, durationDays: 7, paymentProofReference: "" });

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [oRes, pRes, cRes, sRes, prRes] = await Promise.all([
        apiGet<{ success: boolean; data: typeof overview }>("/api/v1/seller/marketing/overview"),
        apiGet<{ success: boolean; promos: SellerPromoCampaign[] }>("/api/v1/seller/marketing/promos"),
        apiGet<{ coupons?: Coupon[] }>("/api/v1/seller/coupons"),
        apiGet<{ sponsorshipRequests?: SponsorshipRequest[] }>("/api/v1/seller/sponsorships"),
        apiGet<{ products?: Product[] }>("/api/v1/seller/products"),
      ]);
      if (oRes?.data) setOverview(oRes.data);
      if (pRes?.promos) setPromos(pRes.promos);
      if (cRes?.coupons) setCoupons(cRes.coupons);
      if (sRes?.sponsorshipRequests) setSponsorshipRequests(sRes.sponsorshipRequests);
      if (prRes?.products) setProducts(prRes.products);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.title.trim() || promoForm.selectedProductIds.length === 0) return toast.error("Titre et produits obligatoires.");
    try {
      await apiPost("/api/v1/seller/marketing/promos", { ...promoForm, startDate: new Date(promoForm.startDate).toISOString(), endDate: new Date(promoForm.endDate).toISOString() });
      toast.success("Promo créée !");
      setShowPromoModal(false);
      fetchData();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erreur."); }
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm("Supprimer la promo ?")) return;
    try { await apiDelete(`/api/v1/seller/marketing/promos/${id}`); toast.success("Supprimée."); fetchData(); } catch { toast.error("Erreur."); }
  };

  const handleCreateSponso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsoForm.productId) return toast.error("Choix produit requis.");
    try {
      const res = await apiPost<{ success: boolean }>("/api/v1/seller/sponsorships", sponsoForm);
      if (res?.success) { toast.success("Sponsoring soumis !"); setShowSponsoModal(false); setSelectedSpot(null); fetchData(); }
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erreur."); }
  };

  const shopSlug = userProfile?.shopSlug || userProfile?.shopName || currentUser?.uid || "";

  return (
    <div className="space-y-8 pb-12 text-start">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 flex items-center gap-3 font-sans">
            <Megaphone className="w-8 h-8 text-orange-500" />
            {t("Centre Marketing & Publicité Olmart")}
          </h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">{t("Promotions, publicité sponsorisée et partage rapide.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPromoModal(true)} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer">
            <Plus className="w-4 h-4" /><span>{t("Nouvelle Promo")}</span>
          </button>
          <button onClick={() => setShowSponsoModal(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer">
            <Sparkles className="w-4 h-4 text-amber-400" /><span>{t("Booster avec Publicité")}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-200 pb-1 overflow-x-auto scrollbar-hide">
        {[
          { id: "overview", label: "Vue d'ensemble & KPIs", icon: BarChart3 },
          { id: "promos", label: "Campagnes Promotionnelles", icon: Tag },
          { id: "sponsorships", label: "Publicité Sponsorisée", icon: Zap },
          { id: "coupons", label: "Coupons & Partage Rapide", icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap ${isActive ? "bg-zinc-950 text-white shadow-md" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
              <Icon className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-zinc-500"}`} /><span>{t(tab.label)}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && <MarketingOverviewTab overview={overview} />}
      {activeTab === "promos" && <MarketingPromosTab promos={promos} onOpenPromoModal={() => setShowPromoModal(true)} onDeletePromo={handleDeletePromo} />}
      {activeTab === "sponsorships" && <MarketingSponsorshipsTab adSpots={overview?.adSpots} sponsorshipRequests={sponsorshipRequests} onSelectSpot={(s) => { setSelectedSpot(s); setShowSponsoModal(true); }} />}
      {activeTab === "coupons" && <MarketingCouponsTab coupons={coupons} shopSlug={shopSlug} onOpenCouponModal={() => setShowCouponModal(true)} />}

      <MarketingPromoModal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} products={products} promoForm={promoForm} setPromoForm={setPromoForm} onSubmit={handleCreatePromo} />
      <MarketingSponsoModal isOpen={showSponsoModal} onClose={() => { setShowSponsoModal(false); setSelectedSpot(null); }} selectedSpot={selectedSpot} products={products} sponsoForm={sponsoForm} setSponsoForm={setSponsoForm} onSubmit={handleCreateSponso} />
      {showCouponModal && <SellerCouponModal isOpen={showCouponModal} onClose={() => { setShowCouponModal(false); fetchData(); }} onSuccess={fetchData} />}
    </div>
  );
};
