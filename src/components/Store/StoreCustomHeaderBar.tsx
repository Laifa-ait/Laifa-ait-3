import React from "react";
import {
  Search,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
  Store,
} from "lucide-react";
import {
  CustomPageTheme,
  SellerStoreConfig,
} from "../../domains/seller/customPage.types";

interface StoreCustomHeaderBarProps {
  storeConfig?: SellerStoreConfig | null;
  theme: CustomPageTheme;
  shopName?: string;
  onNavigateView?: (mode: "home" | "collection") => void;
}

export const StoreCustomHeaderBar: React.FC<StoreCustomHeaderBarProps> = ({
  storeConfig,
  theme,
  shopName = "Ma Boutique",
  onNavigateView,
}) => {
  const announcement = storeConfig?.announcementBar;
  const headerCfg = storeConfig?.headerConfig;
  const commerce = storeConfig?.commerceConfig;
  const storeStatus = storeConfig?.storeStatus;
  const displayShopName = storeConfig?.shopName || shopName;
  const layout = headerCfg?.layout || "left";
  const showSearch = headerCfg?.showSearch ?? true;
  const showTrustBar = headerCfg?.showTrustBar ?? true;
  const navLinks =
    headerCfg?.navLinks && headerCfg.navLinks.length > 0
      ? headerCfg.navLinks
      : [
          { id: "nav-home", label: "Accueil", target: "home" as const },
          { id: "nav-cat", label: "Catalogue", target: "collection" as const },
        ];

  return (
    <div className="w-full border-b border-slate-200/80 bg-white select-none">
      {/* 1. Store Status Alert (Vacation / Password Mode) */}
      {storeStatus && storeStatus.mode !== "open" && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-[12px] font-semibold flex items-center justify-center gap-2 text-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {storeStatus.mode === "vacation" ? "Mode Vacances actif : " : "Mode Pré-lancement : "}
            {storeStatus.vacationMessage || "Les commandes sont temporairement suspendues."}
          </span>
        </div>
      )}

      {/* 2. Top Announcement Bar */}
      {(announcement?.enabled ?? true) && (
        <div
          className="px-4 py-2 text-[11.5px] font-bold text-center tracking-wide flex items-center justify-center gap-2"
          style={{
            backgroundColor: announcement?.bgColor || theme.primaryColor || "#011C40",
            color: announcement?.textColor || "#FFFFFF",
          }}
        >
          <span>
            {announcement?.text ||
              "Livraison rapide 69 Wilayas • Paiement à la livraison (COD) disponible"}
          </span>
        </div>
      )}

      {/* 3. Main Storefront Header */}
      <div className="px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div
          className={`flex items-center gap-2.5 ${
            layout === "center" ? "mx-auto sm:mx-0 order-1" : ""
          }`}
        >
          {storeConfig?.logoUrl ? (
            <img
              src={storeConfig.logoUrl}
              alt={displayShopName}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-2xs"
              style={{ backgroundColor: theme.primaryColor || "#023859" }}
            >
              <Store className="w-4 h-4" />
            </div>
          )}
          <div>
            <span className="block text-[15px] font-extrabold text-slate-900 tracking-tight leading-tight">
              {displayShopName}
            </span>
            {storeConfig?.wilaya && (
              <span className="block text-[10.5px] text-slate-500 font-medium">
                Expédié depuis {storeConfig.wilaya}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        {layout !== "minimal" && (
          <nav className="flex items-center gap-4 text-[12.5px] font-bold text-slate-700">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() =>
                  onNavigateView?.(link.target === "home" ? "home" : "collection")
                }
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right Actions: Search + WhatsApp + Cart */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="hidden sm:flex items-center h-8 px-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11.5px] gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Rechercher...</span>
            </div>
          )}
          {commerce?.whatsappOrderEnabled && (
            <span className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Direct</span>
            </span>
          )}
          <div
            className="h-8 px-2.5 rounded-lg text-white text-[11.5px] font-bold flex items-center gap-1.5"
            style={{ backgroundColor: theme.primaryColor || "#023859" }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Panier</span>
          </div>
        </div>
      </div>

      {/* 4. Commerce & Trust Sub-bar */}
      {showTrustBar && (
        <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-200/70 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-slate-600">
          {(commerce?.codEnabled ?? true) && (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Paiement à la livraison (COD)
            </span>
          )}
          {(commerce?.freeShippingThresholdDZD ?? 8000) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#023859]" />
              Livraison offerte dès{" "}
              {(commerce?.freeShippingThresholdDZD ?? 8000).toLocaleString("fr-DZ")} DA
            </span>
          )}
        </div>
      )}
    </div>
  );
};
