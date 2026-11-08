import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, ShoppingBag, Check } from "lucide-react";
import { useOptionalCart } from "../../context/CartContext";
import { useOptionalUI } from "../../context/UIContext";
import { toast } from "react-hot-toast";
import { PublicStoreInfo } from "../../pages/Public/StoreProfile";

interface StoreBoutiqueNavbarProps {
  storeInfo: PublicStoreInfo;
}

export const StoreBoutiqueNavbar: React.FC<StoreBoutiqueNavbarProps> = ({ storeInfo }) => {
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
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/shop");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shopName,
          text: `Découvrez la boutique ${shopName} sur Olmart`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
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
        color: "var(--store-secondary, #18181B)",
        fontFamily: "var(--store-font-body, inherit)",
      }}
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-black/10"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          style={{
            backgroundColor: "var(--store-canvas, #FAF6F0)",
            color: "var(--store-secondary, #18181B)",
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 hover:opacity-85 transition-opacity text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="Retour au catalogue"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: "var(--store-primary, #B45309)" }} />
          <span>Retour</span>
        </button>

        <span
          style={{
            color: "var(--store-secondary, #18181B)",
            fontFamily: "var(--store-font-heading, inherit)",
          }}
          className="text-sm sm:text-base font-extrabold tracking-tight truncate"
        >
          {shopName}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            style={{
              backgroundColor: "var(--store-canvas, #FAF6F0)",
              color: "var(--store-secondary, #18181B)",
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 hover:opacity-85 transition-opacity text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            title="Partager cette boutique"
            aria-label="Partager cette boutique"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" style={{ color: "var(--store-primary, #B45309)" }} />
                <span className="hidden sm:inline font-bold">Copié</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" style={{ color: "var(--store-primary, #B45309)" }} />
                <span className="hidden sm:inline">Partager</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => uiContext?.setIsCartOpen(true)}
            style={{
              backgroundColor: "var(--store-primary, #B45309)",
              color: "#FFFFFF",
            }}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:opacity-90 text-xs font-bold transition-opacity shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
            title="Ouvrir le panier"
            aria-label="Panier d'achat"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Panier</span>
            {itemCount > 0 && (
              <span
                style={{
                  backgroundColor: "var(--store-surface, #FFFFFF)",
                  color: "var(--store-secondary, #18181B)",
                }}
                className="px-1.5 py-0.2 text-[10px] font-black rounded-full tabular-nums"
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
