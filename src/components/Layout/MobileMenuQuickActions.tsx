import React from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Heart, Package, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

interface MobileMenuQuickActionsProps {
  onNavigate: (path: string) => void;
  onClose: () => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

export const MobileMenuQuickActions: React.FC<MobileMenuQuickActionsProps> = ({
  onNavigate,
  onClose,
  onOpenCart,
  onOpenWishlist,
}) => {
  const { t } = useTranslation();
  const { cart = [], wishlist = [] } = useCart();
  const cartCount = cart.reduce((acc: number, it: { quantity?: number }) => acc + (it.quantity || 1), 0);
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  const actions = [
    {
      id: "catalog",
      label: t("Catalogue"),
      icon: ShoppingBag,
      color: "text-[#1A1836]",
      bg: "bg-[#1A1836]/10",
      border: "border-[#1A1836]/15",
      onClick: () => {
        onNavigate("/shop");
        onClose();
      },
    },
    {
      id: "wishlist",
      label: t("Favoris"),
      icon: Heart,
      color: "text-[#A54055]",
      bg: "bg-[#A54055]/10",
      border: "border-[#A54055]/20",
      badge: wishlistCount > 0 ? String(wishlistCount) : undefined,
      onClick: () => {
        onClose();
        if (onOpenWishlist) {
          onOpenWishlist();
        } else {
          onNavigate("/shop");
        }
      },
    },
    {
      id: "orders",
      label: t("Commandes"),
      icon: Package,
      color: "text-[#E99856]",
      bg: "bg-[#E99856]/15",
      border: "border-[#E99856]/30",
      onClick: () => {
        onNavigate("/dashboard/buyer?tab=orders");
        onClose();
      },
    },
    {
      id: "cart",
      label: t("Panier"),
      icon: ShoppingCart,
      color: "text-[#622347]",
      bg: "bg-[#622347]/10",
      border: "border-[#622347]/20",
      badge: cartCount > 0 ? String(cartCount) : undefined,
      onClick: () => {
        onClose();
        if (onOpenCart) onOpenCart();
      },
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            type="button"
            onClick={act.onClick}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white hover:bg-[#FAF7F8] active:scale-95 transition-all border border-[#E0B4B2]/40 shadow-2xs group cursor-pointer text-center relative"
          >
            <div
              className={`w-9 h-9 rounded-xl ${act.bg} ${act.color} flex items-center justify-center transition-transform group-hover:scale-105 border ${act.border}`}
            >
              <Icon className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-[#1A1836] mt-1.5 truncate max-w-full">
              {act.label}
            </span>
            {act.badge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#A54055] text-white shadow-xs">
                {act.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
