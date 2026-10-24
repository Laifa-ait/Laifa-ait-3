import React from "react";
import { Truck, User, MapPin, Phone, MessageSquare, Mail, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Order } from "../../../../domains/order/order.types";

interface OrderCustomerInfoProps {
  order: Order;
}

export const OrderCustomerInfo: React.FC<OrderCustomerInfoProps> = ({ order }) => {
  const { t } = useTranslation();

  const shipping = order.shippingAddress as unknown as Record<string, unknown> | undefined;
  const clientName = (shipping?.name as string) || (shipping?.fullName as string) || "Acheteur Olmart";
  const clientEmail = (shipping?.email as string) || "";
  const clientPhone = (shipping?.phone as string) || "";
  const wilaya = (shipping?.wilaya as string) || "";
  const daira = (shipping?.daira as string) || "";
  const commune = (shipping?.commune as string) || "";
  const landmarkOrStreet =
    (shipping?.street as string) || (shipping?.address as string) || "N/A";
  const deliveryMethod =
    (shipping?.deliveryMethod as string) || (order as unknown as Record<string, unknown>).deliveryMethod || "domicile";
  const selectedAgency =
    (shipping?.selectedAgency as string) || ((order as unknown as Record<string, unknown>).selectedAgency as string) || "";

  return (
    <div className="bg-zinc-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-zinc-200/80 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-600 shrink-0" />
          <h4 className="text-xs font-sans font-bold text-zinc-900 uppercase tracking-wider">
            {t("Client & Destination", "Client & Destination")}
          </h4>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
            deliveryMethod === "stopdesk"
              ? "bg-amber-100 text-amber-950 border border-amber-200"
              : "bg-emerald-100 text-emerald-900 border border-emerald-200"
          }`}
        >
          {deliveryMethod === "stopdesk" ? "Point Relais (StopDesk)" : "À Domicile COD"}
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Customer Identity */}
        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-sans font-bold text-zinc-950 truncate">
              {clientName}
            </p>
            {clientEmail && (
              <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{clientEmail}</span>
              </p>
            )}
          </div>
        </div>

        {/* Geographic Delivery Info: Wilaya, Daïra, Commune, Address */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-amber-600 mt-1 shrink-0" />
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-bold text-zinc-900 text-sm">
              {wilaya} {daira ? `› ${daira}` : ""} › {commune}
            </p>
            <p className="text-zinc-600 font-medium mt-1 leading-relaxed bg-white p-2.5 rounded-xl border border-zinc-200/70">
              <span className="font-bold text-zinc-700 block text-[11px] uppercase tracking-wider mb-0.5">
                {deliveryMethod === "stopdesk" ? "Consignes & Bureau :" : "Adresse & Repères :"}
              </span>
              {landmarkOrStreet}
            </p>
            {deliveryMethod === "stopdesk" && selectedAgency && (
              <p className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 mt-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>Bureau de retrait : {selectedAgency}</span>
              </p>
            )}
          </div>
        </div>

        {/* Contact Links: Phone & WhatsApp Direct */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200/60">
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <a
              href={`tel:${clientPhone}`}
              className="text-sm font-sans font-bold text-zinc-950 hover:text-emerald-600 transition-colors tabular-nums"
            >
              {clientPhone || "N/A"}
            </a>
          </div>

          {clientPhone && (
            <a
              href={`https://wa.me/213${clientPhone.replace(/^0/, "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Bonjour ${clientName}, je suis votre vendeur sur Olmart concernant votre commande #${order.id.substring(0, 8).toUpperCase()}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
