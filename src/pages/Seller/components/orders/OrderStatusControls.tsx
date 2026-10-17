import React from "react";
import { useTranslation } from "react-i18next";
import { Order, OrderStatus } from "../../../../domains/order/order.types";
import { getStatusLabel } from "./orderTypes";

interface OrderStatusControlsProps {
  order: Order;
  onUpdateStatus: (orderId: string, status?: OrderStatus, returnStatus?: string) => void;
}

const MAIN_STATUSES: OrderStatus[] = ["processing", "picked_up", "in_transit", "delivered"];
const CANCELLATION_STATUSES: OrderStatus[] = ["canceled", "returned"];

export const OrderStatusControls: React.FC<OrderStatusControlsProps> = ({ order, onUpdateStatus }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full space-y-3">
      <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest text-center mb-1">
        {t("Mettre à jour l'état")}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {MAIN_STATUSES.map((s) => {
          const currentLower = (order.status || "").toLowerCase();
          const targetLower = s.toLowerCase();
          let effectiveCurrent = currentLower;
          if (currentLower === "preparing" || currentLower === "confirmed") effectiveCurrent = "processing";
          if (currentLower === "shipped") effectiveCurrent = "in_transit";

          const isCurrent = effectiveCurrent === targetLower;

          return (
            <button
              key={s}
              disabled={isCurrent}
              onClick={() => !isCurrent && onUpdateStatus(order.id, s)}
              className={`py-3.5 px-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border cursor-pointer ${
                isCurrent
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-md cursor-default"
                  : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-600 hover:text-white"
              }`}
            >
              {getStatusLabel(s.toUpperCase())}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 pt-1">
        {CANCELLATION_STATUSES.map((s) => {
          const isCurrent = (order.status || "").toLowerCase() === s;
          return (
            <button
              key={s}
              disabled={isCurrent}
              onClick={() => !isCurrent && onUpdateStatus(order.id, s)}
              className={`flex-1 py-2 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all border cursor-pointer ${
                isCurrent
                  ? "bg-rose-950 text-white border-rose-950 opacity-80"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-600 hover:text-white"
              }`}
            >
              {getStatusLabel(s.toUpperCase())}
            </button>
          );
        })}
      </div>

      {/* Return Requests Management */}
      <div className="w-full pt-3 border-t border-zinc-100 space-y-2">
        <p className="text-[9px] font-sans font-bold text-amber-700 uppercase tracking-widest text-center">
          {t("Gestion des Retours (returnStatus)")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "requested", label: "Demande Reçue" },
            { key: "approved", label: "Retour Accepté" },
            { key: "rejected", label: "Retour Refusé" },
            { key: "completed", label: "Retour Traité" },
          ].map(({ key, label }) => {
            const isCurrentReturn = (order.returnStatus || "").toLowerCase() === key;
            return (
              <button
                key={key}
                onClick={() => onUpdateStatus(order.id, undefined, key)}
                className={`py-2 px-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  isCurrentReturn
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "bg-amber-50/80 text-amber-800 border-amber-200 hover:bg-amber-600 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
