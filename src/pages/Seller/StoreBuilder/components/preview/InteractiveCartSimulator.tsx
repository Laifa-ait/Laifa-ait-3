import React, { useState } from "react";
import { ShoppingBag, X, Check } from "lucide-react";
import { Product } from "../../../../../domains/product/product.types";

interface InteractiveCartSimulatorProps {
  isInteractiveMode: boolean;
  cartItems: Product[];
  onClearCart: () => void;
}

export const InteractiveCartSimulator: React.FC<InteractiveCartSimulatorProps> = ({
  isInteractiveMode,
  cartItems,
  onClearCart,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isInteractiveMode || cartItems.length === 0) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <>
      <div className="fixed bottom-6 end-6 z-40">
        <button
          type="button"
          data-testid="interactive-cart-simulator-btn"
          onClick={() => setIsOpen(true)}
          className="h-11 px-4 rounded-lg bg-slate-900 text-white shadow-lg hover:bg-slate-800 flex items-center gap-3 border border-slate-700 cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-1.5 -end-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              {cartItems.length}
            </span>
          </div>
          <span className="text-xs font-medium">Simulateur Panier ({cartItems.length}) :</span>
          <span className="text-xs font-semibold tabular-nums text-emerald-300">
            {totalAmount.toLocaleString()} DZD
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35">
          <div className="w-full max-w-sm bg-white h-full border-s border-slate-200 flex flex-col p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-900" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Simulation Panier ({cartItems.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {cartItems.map((prod, idx) => (
                <div
                  key={`${prod.id}-${idx}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                >
                  {prod.images?.[0] || prod.image ? (
                    <img
                      src={prod.images?.[0] || prod.image}
                      alt={prod.name}
                      className="w-11 h-11 rounded-md object-cover bg-white border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{prod.name}</p>
                    <p className="text-xs tabular-nums text-slate-700 font-semibold mt-0.5">
                      {prod.price?.toLocaleString()} DZD
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Simulation :</span>
                <span className="tabular-nums font-semibold text-base text-slate-900">
                  {totalAmount.toLocaleString()} DZD
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Les boutons d&apos;ajout au panier répondent correctement.</span>
              </div>
              <button
                type="button"
                onClick={onClearCart}
                className="w-full h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
              >
                Vider le panier de test
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
