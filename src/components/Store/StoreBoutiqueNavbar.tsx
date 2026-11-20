import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, ShoppingBag, Check, Sparkles } from "lucide-react";
import { useOptionalCart } from "../../context/CartContext";
import { useOptionalUI } from "../../context/UIContext";
import { toast } from "react-hot-toast";
import { PublicStoreInfo } from "../../pages/Public/StoreProfile";

interface StoreBoutiqueNavbarProps {
  storeInfo: PublicStoreInfo;
  isOwner?: boolean;
  isDraftPreview?: boolean;
}

export const StoreBoutiqueNavbar: React.FC<StoreBoutiqueNavbarProps> = ({
  storeInfo,
  isOwner = false,
  isDraftPreview = false,
}) => {
  const navigate = useNavigate();
  const cartContext = useOptionalCart();
  const uiContext = useOptionalUI();
  const [copied, setCopied] = useState(false);

  const shopName =
    storeInfo.shopName || storeInfo.displayName || storeInfo.brand || "Boutique Officielle";
  const itemCount = cartContext?.cart
    ? cartContext.cart.reduce((acc, item) => acc + (item.quantity || 1), 0)
    : 0;

  const handleBack = () => {
    if (isDraftPreview) {
      navigate("/dashboard/seller/studio");
      return;
    }
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/shop");
    }
  };

  const handleShare = async () => {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shopName,
          text: `Découvrez la boutique ${shopName} sur Olmart`,
          url: cleanUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      toast.success("Lien de la boutique copié !");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.success("Lien disponible");
    }
  };

  return (
    <header
      style={{
        backgroundColor: "color-mix(in srgb, var(--store-surface, #FFFFFF) 94%, transparent)",
        color: "var(--store-secondary, #0F172A)",
        fontFamily: "var(--store-font-body, inherit)",
      }}
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            style={{
              backgroundColor: "var(--store-canvas, #F8FAFC)",
              color: "var(--store-secondary, #0F172A)",
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:opacity-85 transition-opacity text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={isDraftPreview ? "Retour au Studio" : "Retour au catalogue"}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--store-primary, #0F172A)" }} />
            <span>{isDraftPreview ? "Retour au Studio" : "Retour"}</span>
          </button>

          {isDraftPreview && (
            <span
              data-testid="storefront-draft-preview-badge"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Aperçu Brouillon Studio
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span
            style={{
              color: "var(--store-secondary, #0F172A)",
              fontFamily: "var(--store-font-heading, inherit)",
            }}
            className="text-sm sm:text-base font-extrabold tracking-tight truncate"
          >
            {shopName}
          </span>
          {storeInfo.wilaya && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-slate-100 text-slate-600 shrink-0">
              {storeInfo.wilaya}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(isOwner || isDraftPreview) && (
            <button
              type="button"
              data-testid="open-seller-studio-btn"
              onClick={() => navigate("/dashboard/seller/studio")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
              title="Personnaliser cette boutique dans le Studio Vendeur"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Studio Vendeur</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            style={{
              backgroundColor: "var(--store-canvas, #F8FAFC)",
              color: "var(--store-secondary, #0F172A)",
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:opacity-85 transition-opacity text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            title="Partager cette boutique"
            aria-label="Partager cette boutique"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" style={{ color: "var(--store-primary, #0F172A)" }} />
                <span className="hidden sm:inline font-bold">Copié</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" style={{ color: "var(--store-primary, #0F172A)" }} />
                <span className="hidden sm:inline">Partager</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => uiContext?.setIsCartOpen(true)}
            style={{
              backgroundColor: "var(--store-primary, #0F172A)",
              color: "#FFFFFF",
            }}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg hover:opacity-90 text-xs font-bold transition-opacity shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
            title="Ouvrir le panier"
            aria-label="Panier d'achat"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Panier</span>
            {itemCount > 0 && (
              <span
                style={{
                  backgroundColor: "var(--store-surface, #FFFFFF)",
                  color: "var(--store-secondary, #0F172A)",
                }}
                className="px-1.5 py-0.2 text-[10px] font-black rounded-sm tabular-nums"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
