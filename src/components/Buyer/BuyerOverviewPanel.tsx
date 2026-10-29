import React from "react";
import {
  Package,
  MapPin,
  Store,
  ShieldCheck,
  ChevronRight,
  ShoppingBag,
  RotateCcw,
  FolderLock,
  Headphones,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "../ui/UserAvatar";
import { UserProfile, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { BuyerOrder } from "./OrdersSection";
import { SettingTab } from "./BuyerNavigationMenu";
import { formatPrice } from "../../utils/format";
import { normalizeTimestamp, AppTimestamp } from "../../utils/date";

interface BuyerOverviewPanelProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  orders: BuyerOrder[];
  loadingOrders: boolean;
  onSelectTab: (tab: SettingTab) => void;
  compactMobile?: boolean;
}

export const BuyerOverviewPanel: React.FC<BuyerOverviewPanelProps> = ({
  currentUser,
  userProfile,
  orders,
  loadingOrders,
  onSelectTab,
  compactMobile = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const displayName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    t("Client Olmart");

  const addressesCount = userProfile?.shippingAddresses?.length || 0;
  const interestsCount =
    (userProfile?.preferences?.interests as string[] | undefined)?.length ||
    (userProfile?.interests as string[] | undefined)?.length ||
    0;
  const activeOrdersCount = orders.filter(
    (o) => !["delivered", "livré", "complete", "cancelled", "annulé"].includes(o.status?.toLowerCase() || "")
  ).length;

  const formatShortDate = (createdAt: AppTimestamp | null | undefined) => {
    if (!createdAt) return "";
    try {
      return normalizeTimestamp(createdAt).toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  if (compactMobile) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] p-5 text-white shadow-lg border border-[#A54055]/30 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar photoURL={userProfile?.photoURL || currentUser?.photoURL} displayName={displayName} email={currentUser?.email} providerData={currentUser?.providerData} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold truncate">{displayName}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E99856]/20 text-[#E99856] border border-[#E99856]/30 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> {t("Vérifié")}
                </span>
              </div>
              <p className="text-xs text-[#E0B4B2] truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button type="button" onClick={() => onSelectTab("profile")} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/15 cursor-pointer shrink-0">
            {t("Profil")}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { tab: "orders" as SettingTab, val: orders.length, label: t("Commandes"), accent: "text-[#E99856]" },
            { tab: "addresses" as SettingTab, val: addressesCount, label: t("Adresses"), accent: "text-white" },
            { tab: "preferences" as SettingTab, val: interestsCount, label: t("Rayons suivis"), accent: "text-white" },
          ].map((stat) => (
            <button key={stat.tab} type="button" onClick={() => onSelectTab(stat.tab)} className="bg-white/10 hover:bg-white/15 rounded-2xl p-2.5 text-left transition-colors border border-white/10 cursor-pointer">
              <p className={`text-lg font-extrabold tabular-nums ${stat.accent}`}>{stat.val}</p>
              <p className="text-[11px] text-[#E0B4B2] truncate">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] p-6 sm:p-8 text-white shadow-lg border border-[#A54055]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <UserAvatar photoURL={userProfile?.photoURL || currentUser?.photoURL} displayName={displayName} email={currentUser?.email} providerData={currentUser?.providerData} size="lg" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{displayName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E99856]/20 text-[#E99856] border border-[#E99856]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {userProfile?.role === "seller" ? t("Acheteur & Vendeur") : t("Acheteur Vérifié")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#E0B4B2]">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => navigate("/shop")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E99856] to-[#d8823e] text-[#1A1836] font-extrabold text-xs hover:brightness-105 transition-all cursor-pointer border-none shadow-sm">
              <ShoppingBag className="w-4 h-4" />
              <span>{t("Explorer le catalogue")}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  userProfile?.role === "seller" || userProfile?.role === "admin" || userProfile?.role === "superadmin"
                    ? "/dashboard/seller"
                    : "/seller-onboarding"
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#E99856]" />
              <span>
                {userProfile?.role === "seller"
                  ? t("Mon Espace Vendeur")
                  : userProfile?.sellerRequested
                  ? t("Dossier Vendeur (En revue KYC)")
                  : t("Ouvrir ma boutique")}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          {[
            { tab: "orders" as SettingTab, label: t("Total Commandes"), val: orders.length, icon: Package, color: "text-white", iconColor: "text-[#E99856]" },
            { tab: "orders" as SettingTab, label: t("Colis en cours"), val: activeOrdersCount, icon: Clock, color: "text-emerald-300", iconColor: "text-emerald-400" },
            { tab: "addresses" as SettingTab, label: t("Adresses (69 Wilayas)"), val: addressesCount, icon: MapPin, color: "text-white", iconColor: "text-[#E99856]" },
            { tab: "preferences" as SettingTab, label: t("Rayons favoris"), val: interestsCount, icon: Sparkles, color: "text-white", iconColor: "text-[#E99856]" },
          ].map((kpi, idx) => {
            const KpiIcon = kpi.icon;
            return (
              <button key={idx} type="button" onClick={() => onSelectTab(kpi.tab)} className="bg-white/10 hover:bg-white/15 rounded-2xl p-3.5 text-left transition-all border border-white/10 cursor-pointer">
                <div className="flex items-center justify-between text-[#E0B4B2] mb-1">
                  <span className="text-[11px] font-semibold">{kpi.label}</span>
                  <KpiIcon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
                <p className={`text-2xl font-extrabold tabular-nums ${kpi.color}`}>{kpi.val}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1A1836]">{t("Dernières commandes")}</h3>
            <p className="text-xs text-zinc-500">{t("Suivez l'expédition de vos achats directement auprès des vendeurs.")}</p>
          </div>
          <button type="button" onClick={() => onSelectTab("orders")} className="inline-flex items-center gap-1 text-xs font-bold text-[#A54055] hover:text-[#622347] cursor-pointer border-none bg-transparent">
            <span>{t("Tout voir")}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center text-xs text-zinc-500">{t("Chargement de vos commandes...")}</div>
        ) : orders.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#FAF7F8] border border-[#E0B4B2]/30 text-center space-y-2">
            <p className="text-sm font-semibold text-[#1A1836]">{t("Aucune commande récente")}</p>
            <p className="text-xs text-zinc-500">{t("Parcourez les boutiques certifiées sur les 69 Wilayas pour passer votre première commande.")}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#FAF7F8]">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} onClick={() => navigate(`/dashboard/buyer/order/${order.id}`)} className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAF7F8] px-3 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#A54055]/10 text-[#A54055] flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#1A1836] truncate">{t("Commande")} #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{formatShortDate(order.createdAt)} • {order.items?.length || 1} article(s) • {order.shippingAddress?.wilaya || "Algérie"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-extrabold text-[#1A1836] tabular-nums">{formatPrice(order.total)}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 rtl:rotate-180" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { tab: "returns" as SettingTab, title: t("Retours & Échanges"), desc: t("Suivez vos demandes de retour auprès des vendeurs."), icon: RotateCcw, bg: "bg-[#E99856]/15 text-[#E99856]" },
          { tab: "documents" as SettingTab, title: t("Coffre-fort Documents"), desc: t("Archivez vos factures et pièces justificatives."), icon: FolderLock, bg: "bg-[#1A1836]/10 text-[#1A1836]" },
          { tab: "support" as SettingTab, title: t("Support & Médiation"), desc: t("Contactez l'équipe Olmart en cas de besoin."), icon: Headphones, bg: "bg-[#A54055]/10 text-[#A54055]" },
        ].map((card) => {
          const CardIcon = card.icon;
          return (
            <button key={card.tab} type="button" onClick={() => onSelectTab(card.tab)} className="bg-white hover:bg-[#FAF7F8] rounded-2xl border border-[#E0B4B2]/40 p-4 text-left transition-all shadow-2xs flex items-start gap-3 cursor-pointer">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                <CardIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1A1836]">{card.title}</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">{card.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
