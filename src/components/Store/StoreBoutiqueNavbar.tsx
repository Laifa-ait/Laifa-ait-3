import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ShoppingBag, Check } from 'lucide-react';
import { useOptionalCart } from '../../context/CartContext';
import { useOptionalUI } from '../../context/UIContext';
import { toast } from 'react-hot-toast';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';

interface StoreBoutiqueNavbarProps {
  storeInfo: PublicStoreInfo;
}

export const StoreBoutiqueNavbar: React.FC<StoreBoutiqueNavbarProps> = ({ storeInfo }) => {
  const navigate = useNavigate();
  const cartContext = useOptionalCart();
  const uiContext = useOptionalUI();
  const [copied, setCopied] = useState(false);

  const shopName =
    storeInfo.shopName || storeInfo.displayName || storeInfo.brand || 'Boutique Olmart';
  const itemCount = cartContext?.cart
    ? cartContext.cart.reduce((acc, item) => acc + (item.quantity || 1), 0)
    : 0;

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/shop');
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
      toast.success('Lien de la boutique copié !');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.success('Lien disponible');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#26658C]/12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Back Navigation */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FBFC] hover:bg-[#A7EBF2]/25 text-[#023859] border border-[#26658C]/15 transition-colors text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="Retour au catalogue"
        >
          <ArrowLeft className="w-4 h-4 text-[#26658C]" />
          <span>Retour</span>
        </button>

        {/* Zone 2: Single-line Store Brand Wordmark */}
        <span className="text-sm sm:text-base font-extrabold text-[#011C40] tracking-tight truncate">
          {shopName}
        </span>

        {/* Zone 3: Share & Shopping Bag */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FBFC] hover:bg-[#A7EBF2]/25 text-[#023859] border border-[#26658C]/15 transition-colors text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            title="Partager cette boutique"
            aria-label="Partager cette boutique"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#54ACBF]" />
                <span className="hidden sm:inline text-[#023859] font-bold">Copié</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#26658C]" />
                <span className="hidden sm:inline">Partager</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => uiContext?.setIsCartOpen(true)}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#023859] hover:bg-[#011C40] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
            title="Ouvrir le panier"
            aria-label="Panier d'achat"
          >
            <ShoppingBag className="w-4 h-4 text-[#A7EBF2]" />
            <span className="hidden sm:inline">Panier</span>
            {itemCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#54ACBF] text-[#011C40] text-[10px] font-black rounded-full tabular-nums">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
