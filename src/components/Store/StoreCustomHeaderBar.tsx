import React, { useState } from "react";
import {
  Search, ShoppingBag, Truck, ShieldCheck, MessageCircle, AlertTriangle, Store, Clock, X,
} from "lucide-react";
import { CustomPageTheme, SellerStoreConfig, StoreNavMenuLink } from "../../domains/seller/customPage.types";
import { useOptionalCart } from "../../context/CartContext";
import { useOptionalUI } from "../../context/UIContext";
import { readableTextColor } from "./sections/themeColorUtils";
import { safeNavigationHref } from "./sections/safeNavigationHref";

interface StoreCustomHeaderBarProps {
  storeConfig?: SellerStoreConfig | null;
  theme: CustomPageTheme;
  shopName?: string;
  isEditable?: boolean;
  disableSticky?: boolean;
  onSelectHeader?: () => void;
  onNavigateView?: (mode: "home" | "collection") => void;
}

const SECTION_ANCHOR_BY_TARGET: Record<string, string> = {
  contact: "contact_footer", faq: "faq_accordion", delivery: "delivery_info", returns: "return_policy",
};

export const StoreCustomHeaderBar: React.FC<StoreCustomHeaderBarProps> = ({
  storeConfig, theme, shopName = "Ma Boutique", isEditable = false,
  disableSticky = false, onSelectHeader, onNavigateView,
}) => {
  const cartContext = useOptionalCart();
  const uiContext = useOptionalUI();
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const announcement = storeConfig?.announcementBar;
  const headerCfg = storeConfig?.headerConfig;
  const commerce = storeConfig?.commerceConfig;
  const storeStatus = storeConfig?.storeStatus;
  const displayShopName = storeConfig?.shopName || shopName;
  const layout = headerCfg?.layout || "left";
  const isSticky = !disableSticky && (headerCfg?.sticky ?? true);
  const showSearch = headerCfg?.showSearch ?? true;
  const showTrustBar = headerCfg?.showTrustBar ?? true;
  const primaryColor = theme.primaryColor || "var(--store-primary, #0F172A)";
  const secondaryColor = theme.secondaryColor || "var(--store-secondary, #0F172A)";
  const surfaceColor = theme.surfaceColor || "var(--store-surface, #FFFFFF)";
  const canvasColor = theme.canvasColor || "var(--store-canvas, #F8FAFC)";
  const buttonBg = theme.buttonColor || primaryColor;
  const buttonText = theme.buttonTextColor || readableTextColor(buttonBg);
  const announcementBg = announcement?.bgColor || primaryColor;
  const announcementText = announcement?.textColor || readableTextColor(announcementBg);

  const itemCount = cartContext?.cart ? cartContext.cart.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
  const navLinks: StoreNavMenuLink[] =
    headerCfg?.navLinks && headerCfg.navLinks.length > 0
      ? headerCfg.navLinks
      : [{ id: "nav-home", label: "Accueil", target: "home" }, { id: "nav-cat", label: "Catalogue", target: "collection" }];

  const handleNavClick = (link: StoreNavMenuLink, e: React.MouseEvent) => {
    e.stopPropagation();
    if (link.target === "collection") {
      onNavigateView?.("collection");
      window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode: "collection" } }));
      return;
    }
    if (link.target === "about") {
      window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode: "about" } }));
      return;
    }
    if (link.target === "page" && link.pageSlug) {
      const targetPage = (storeConfig?.customPages || []).find((cp) => cp.slug === link.pageSlug);
      if (targetPage) {
        window.dispatchEvent(new CustomEvent("studio:navigate-page", { detail: { viewMode: "custom-page", customPage: targetPage } }));
        return;
      }
    }
    if (link.target === "url" && link.url && !isEditable) {
      const safeUrl = safeNavigationHref(link.url);
      if (safeUrl) window.location.assign(safeUrl);
      return;
    }
    onNavigateView?.("home");
    window.dispatchEvent(new CustomEvent("studio:navigate-page", {
      detail: { viewMode: "home", scrollToSectionType: SECTION_ANCHOR_BY_TARGET[link.target] },
    }));
  };

  const handleHeaderSurfaceClick = () => {
    if (!isEditable) return;
    if (onSelectHeader) onSelectHeader();
    else window.dispatchEvent(new CustomEvent("studio:select-nav-mode", { detail: { mode: "header" } }));
  };

  return (
    <div
      onClick={handleHeaderSurfaceClick} data-testid="store-custom-header-bar"
      style={{ backgroundColor: surfaceColor, color: secondaryColor, fontFamily: theme.bodyFontFamily || theme.fontFamily || "var(--store-font-body, inherit)" }}
      className={`w-full border-b border-black/10 select-none ${isSticky ? "sticky top-0 z-30" : ""} ${isEditable ? "cursor-pointer hover:ring-1 hover:ring-slate-900/20 transition-shadow" : ""}`}
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

      {(announcement?.enabled ?? true) && !announcementDismissed && (
        <div
          data-testid="header-announcement-bar"
          className="px-4 py-2 text-[11.5px] font-bold text-center tracking-wide flex items-center justify-center gap-2 relative"
          style={{ backgroundColor: announcementBg, color: announcementText }}
        >
          <span className="break-words">{announcement?.text || "Livraison rapide 69 Wilayas • Paiement à la livraison (COD) disponible"}</span>
          {announcement?.dismissible && !isEditable && (
            <button
              type="button" onClick={(e) => { e.stopPropagation(); setAnnouncementDismissed(true); }}
              className="absolute end-3 p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer" aria-label="Fermer l'annonce"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button" onClick={(e) => handleNavClick({ id: "logo-home", label: "Accueil", target: "home" }, e)}
          className={`flex items-center gap-2.5 text-start cursor-pointer ${layout === "center" ? "mx-auto sm:mx-0 order-1" : ""}`}
        >
          {storeConfig?.logoUrl ? (
            <img src={storeConfig.logoUrl} alt={displayShopName} className="w-9 h-9 rounded-xl object-cover border border-black/10" />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs" style={{ backgroundColor: primaryColor, color: readableTextColor(primaryColor) }}>
              <Store className="w-4 h-4" />
            </div>
          )}
          <div>
            <span style={{ color: secondaryColor, fontFamily: theme.headingFontFamily || theme.fontFamily || "var(--store-font-heading, inherit)" }} className="block text-[15px] font-extrabold tracking-tight leading-tight break-words">
              {displayShopName}
            </span>
            {storeConfig?.wilaya && (
              <span className="block text-[10.5px] opacity-65 font-medium">
                Expédié depuis {storeConfig.commune ? `${storeConfig.commune}, ` : ""}{storeConfig.wilaya}
              </span>
            )}
          </div>
        </button>

        {layout !== "minimal" && (
          <nav className="flex flex-wrap items-center gap-4 text-[12.5px] font-bold">
            {navLinks.map((link) => (
              <button key={link.id} type="button" onClick={(e) => handleNavClick(link, e)} style={{ color: secondaryColor }} className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                {link.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              type="button" onClick={(e) => handleNavClick({ id: "search-cat", label: "Catalogue", target: "collection" }, e)}
              style={{ backgroundColor: canvasColor, color: secondaryColor }}
              className="hidden sm:flex items-center h-8 px-2.5 rounded-lg border border-black/10 opacity-75 hover:opacity-100 text-[11.5px] gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" style={{ color: primaryColor }} /><span>Rechercher...</span>
            </button>
          )}
          {commerce?.whatsappOrderEnabled && (
            <span title={commerce.whatsappNumber || "Commande directe WhatsApp"} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold">
              <MessageCircle className="w-3.5 h-3.5" /><span className="hidden sm:inline">WhatsApp Direct</span>
            </span>
          )}
          <button
            type="button" data-testid="header-cart-btn"
            onClick={(e) => { if (!isEditable) { e.stopPropagation(); uiContext?.setIsCartOpen(true); } }}
            className="h-8 px-2.5 rounded-lg text-[11.5px] font-bold flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: theme.buttonStyle === "outline" ? "transparent" : buttonBg,
              color: theme.buttonStyle === "outline" ? buttonBg : buttonText,
              border: theme.buttonStyle === "outline" ? `1.5px solid ${buttonBg}` : undefined,
              borderRadius: theme.buttonStyle === "pill" ? "999px" : theme.buttonStyle === "sharp" ? "0px" : theme.borderRadiusPx ? `${Math.min(14, theme.borderRadiusPx)}px` : "8px",
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" /><span>Panier</span>
            {itemCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-white/20 tabular-nums">{itemCount > 99 ? "99+" : itemCount}</span>
            )}
          </button>
        </div>
      </div>

      {showTrustBar && (
        <div style={{ backgroundColor: canvasColor, color: secondaryColor }} className="px-4 py-1.5 border-t border-black/10 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold opacity-90">
          {(commerce?.codEnabled ?? true) && (
            <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" style={{ color: primaryColor }} />Paiement à la livraison (COD)</span>
          )}
          {(commerce?.freeShippingThresholdDZD ?? 8000) > 0 && (
            <span className="inline-flex items-center gap-1"><Truck className="w-3.5 h-3.5" style={{ color: primaryColor }} />Livraison offerte dès {(commerce?.freeShippingThresholdDZD ?? 8000).toLocaleString("fr-DZ")} DA</span>
          )}
          {commerce?.preparationTimeHours && (
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />Préparation {commerce.preparationTimeHours}h</span>
          )}
          {(commerce?.minOrderAmountDZD ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1">Min. commande {Number(commerce?.minOrderAmountDZD).toLocaleString("fr-DZ")} DA</span>
          )}
        </div>
      )}
    </div>
  );
};
