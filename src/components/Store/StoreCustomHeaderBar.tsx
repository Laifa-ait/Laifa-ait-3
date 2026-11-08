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
  const primaryColor = theme.primaryColor || "var(--store-primary, #B45309)";
  const secondaryColor = theme.secondaryColor || "var(--store-secondary, #18181B)";
  const surfaceColor = theme.surfaceColor || "var(--store-surface, #FFFFFF)";
  const canvasColor = theme.canvasColor || "var(--store-canvas, #FAF6F0)";

  const navLinks =
    headerCfg?.navLinks && headerCfg.navLinks.length > 0
      ? headerCfg.navLinks
      : [
          { id: "nav-home", label: "Accueil", target: "home" as const },
          { id: "nav-cat", label: "Catalogue", target: "collection" as const },
        ];

  return (
    <div
      style={{
        backgroundColor: surfaceColor,
        color: secondaryColor,
        fontFamily: theme.bodyFontFamily || theme.fontFamily || "var(--store-font-body, inherit)",
      }}
      className="w-full border-b border-black/10 select-none"
    >
      {storeStatus && storeStatus.mode !== "open" && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-[12px] font-semibold flex items-center justify-center gap-2 text-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {storeStatus.mode === "vacation" ? "Mode Vacances actif : " : "Mode Pré-lancement : "}
            {storeStatus.vacationMessage || "Les commandes sont temporairement suspendues."}
          </span>
        </div>
      )}

      {(announcement?.enabled ?? true) && (
        <div
          className="px-4 py-2 text-[11.5px] font-bold text-center tracking-wide flex items-center justify-center gap-2"
          style={{
            backgroundColor: announcement?.bgColor || primaryColor,
            color: announcement?.textColor || "#FFFFFF",
          }}
        >
          <span>
            {announcement?.text ||
              "Livraison rapide 69 Wilayas • Paiement à la livraison (COD) disponible"}
          </span>
        </div>
      )}

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
              className="w-9 h-9 rounded-xl object-cover border border-black/10"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-2xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Store className="w-4 h-4" />
            </div>
          )}
          <div>
            <span
              style={{
                color: secondaryColor,
                fontFamily: theme.headingFontFamily || theme.fontFamily || "var(--store-font-heading, inherit)",
              }}
              className="block text-[15px] font-extrabold tracking-tight leading-tight"
            >
              {displayShopName}
            </span>
            {storeConfig?.wilaya && (
              <span className="block text-[10.5px] opacity-65 font-medium">
                Expédié depuis {storeConfig.wilaya}
              </span>
            )}
          </div>
        </div>

        {layout !== "minimal" && (
          <nav className="flex items-center gap-4 text-[12.5px] font-bold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() =>
                  onNavigateView?.(link.target === "home" ? "home" : "collection")
                }
                style={{ color: secondaryColor }}
                className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {showSearch && (
            <div
              style={{ backgroundColor: canvasColor, color: secondaryColor }}
              className="hidden sm:flex items-center h-8 px-2.5 rounded-lg border border-black/10 opacity-75 text-[11.5px] gap-1.5"
            >
              <Search className="w-3.5 h-3.5" style={{ color: primaryColor }} />
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
            style={{
              backgroundColor: primaryColor,
              borderRadius: theme.borderRadiusPx ? `${Math.min(14, theme.borderRadiusPx)}px` : "8px",
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Panier</span>
          </div>
        </div>
      </div>

      {showTrustBar && (
        <div
          style={{ backgroundColor: canvasColor, color: secondaryColor }}
          className="px-4 py-1.5 border-t border-black/10 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold opacity-90"
        >
          {(commerce?.codEnabled ?? true) && (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              Paiement à la livraison (COD)
            </span>
          )}
          {(commerce?.freeShippingThresholdDZD ?? 8000) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              Livraison offerte dès{" "}
              {(commerce?.freeShippingThresholdDZD ?? 8000).toLocaleString("fr-DZ")} DA
            </span>
          )}
        </div>
      )}
    </div>
  );
};
