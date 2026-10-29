import React, { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { ReviewDocument } from "../../domains/review/review.types";
import { BuyerOrder } from "./OrdersSection";
import { getRetroAvatar } from "../../utils/avatar";

interface PendingReviewItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  orderId: string;
  orderDate?: string;
  price?: number;
}

export const MyReviews: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchReviewsAndOrders = async () => {
      setLoading(true);
      try {
        const [reviewRes, orderRes] = await Promise.all([
          apiGet<{ reviews: ReviewDocument[] }>("/api/v1/reviews/my-reviews"),
          apiGet<{ orders: BuyerOrder[] }>("/api/v1/buyer/orders?limit=30"),
        ]);
        const userReviews = reviewRes?.reviews || [];
        const userOrders = orderRes?.orders || [];
        if (!cancelled) setReviews(userReviews);

        const reviewedProductIds = new Set(userReviews.map((r) => r.productId));
        const pending: PendingReviewItem[] = [];

        userOrders.forEach((ord) => {
          if (["delivered", "completed", "shipped"].includes(ord.status)) {
            ord.items?.forEach((it, idx) => {
              const pId = it.productId || it.id;
              if (pId && !reviewedProductIds.has(pId)) {
                pending.push({
                  id: `${ord.id}_${pId}_${idx}`,
                  productId: pId,
                  productName: it.title || it.name || t("Produit commandé"),
                  image: it.image || it.imageUrl || getRetroAvatar(it.title || pId),
                  orderId: ord.orderNumber || ord.id,
                  orderDate: ord.createdAt ? new Date(ord.createdAt as string).toLocaleDateString() : undefined,
                  price: it.price,
                });
              }
            });
          }
        });

        if (!cancelled) setPendingReviews(pending);
      } catch (err) {
        if (!cancelled) console.error("Error fetching reviews:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviewsAndOrders();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="my-reviews-module">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1836] tracking-tight">
          {t("Avis et évaluations")}
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm mt-1">
          {t("Gérez vos avis sur vos achats et aidez la communauté d'acheteurs en Algérie.")}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-[#E0B4B2]/40">
          <RefreshCw className="w-6 h-6 animate-spin text-[#A54055]" />
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#E0B4B2]/40 rounded-3xl overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-[#FAF7F8] bg-[#FAF7F8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E99856]/20 text-[#E99856] flex items-center justify-center">
                <Star className="w-4.5 h-4.5 fill-current" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1A1836]">
                  {t("Avis en attente ({{count}})", { count: pendingReviews.length })}
                </h3>
                <p className="text-xs text-zinc-500">{t("Articles livrés que vous pouvez évaluer.")}</p>
              </div>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#1A1836]">{t("Aucun avis en attente")}</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {t("Tous vos achats livrés ont été évalués ou aucune nouvelle commande n'est en attente.")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#FAF7F8]">
                {pendingReviews.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F8] transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-2xl border border-[#E0B4B2]/40 bg-[#FAF7F8] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getRetroAvatar(item.productName);
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#1A1836] truncate">{item.productName}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          {item.orderDate && <span>{t("Commandé le {{date}}", { date: item.orderDate })}</span>}
                          {item.price && <span className="font-bold text-[#1A1836] tabular-nums">• {item.price.toLocaleString()} DA</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/product/${item.productId}?review=true`)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A54055] to-[#622347] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 border-none"
                    >
                      <Star className="w-4 h-4 fill-current text-[#E99856]" />
                      <span>{t("Donner mon avis")}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E0B4B2]/40 rounded-3xl overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-[#FAF7F8] bg-[#FAF7F8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1A1836]">
                  {t("Historique de vos avis ({{count}})", { count: reviews.length })}
                </h3>
                <p className="text-xs text-zinc-500">{t("Vos commentaires et notes publiés sur la marketplace.")}</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F8] border border-[#E0B4B2]/40 text-[#622347] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-sm font-bold text-[#1A1836]">{t("Aucun avis publié pour le moment")}</p>
                  <p className="text-xs text-zinc-500">{t("Vos évaluations sur les produits commandés s'afficheront ici après publication.")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/buyer?tab=orders")}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#FAF7F8] hover:bg-[#E0B4B2]/20 text-[#A54055] text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#E0B4B2]/50"
                >
                  <span>{t("Voir mes commandes")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#FAF7F8]">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#E99856]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (rev.rating || 5) ? "fill-[#E99856] text-[#E99856]" : "text-zinc-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {rev.createdAt
                          ? new Date(
                              typeof rev.createdAt === "object" && "toMillis" in rev.createdAt
                                ? (rev.createdAt as { toMillis: () => number }).toMillis()
                                : (rev.createdAt as string)
                            ).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    {rev.comment && <p className="text-sm text-[#1A1836] leading-relaxed">{rev.comment}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t("Achat vérifié sur Olmart")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
