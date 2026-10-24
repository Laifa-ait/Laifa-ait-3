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
      {/* Floating Simulated Cart Pill */}
      <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4 duration-200">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-12 px-4 rounded-full bg-gray-900 text-white shadow-xl hover:bg-black flex items-center gap-3 border border-gray-700 cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
              {cartItems.length}
            </span>
          </div>
          <span className="text-xs font-semibold">Simulateur Panier :</span>
          <span className="text-xs font-mono font-bold text-orange-400">
            {totalAmount.toLocaleString()} DZD
          </span>
        </button>
      </div>

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-5 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Simulation Panier Client ({cartItems.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Items */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {cartItems.map((prod, idx) => (
                <div
                  key={`${prod.id}-${idx}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50"
                >
                  <img
                    src={prod.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                    <p className="text-xs font-mono text-orange-600 font-bold mt-0.5">
                      {prod.price?.toLocaleString()} DZD
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Total Simulation :</span>
                <span className="font-mono font-bold text-base text-gray-900">
                  {totalAmount.toLocaleString()} DZD
                </span>
              </div>
              <div className="p-2 bg-green-50 rounded-lg border border-green-100 text-[11px] text-green-800 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>Simulation active : les boutons d'ajout fonctionnent parfaitement.</span>
              </div>
              <button
                type="button"
                onClick={onClearCart}
                className="w-full h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
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
