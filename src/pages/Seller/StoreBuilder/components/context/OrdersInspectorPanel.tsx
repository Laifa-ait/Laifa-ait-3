import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Truck,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { apiGet, apiPatch } from "../../../../../lib/api";
import { toast } from "react-hot-toast";

interface StudioOrderItem {
  id: string;
  status?: string;
  totalAmount?: number;
  total?: number;
  createdAt?: string | number | { _seconds?: number };
  shippingAddress?: {
    fullName?: string;
    wilaya?: string;
    city?: string;
  };
  customerName?: string;
}

export const OrdersInspectorPanel: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<StudioOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ orders?: StudioOrderItem[] }>("/api/v1/seller/orders");
      setOrders(Array.isArray(res?.orders) ? res.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleQuickStatusUpdate = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      await apiPatch(`/api/v1/seller/orders/${orderId}/status`, { status: nextStatus });
      toast.success("Statut de la commande mis à jour");
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Impossible de mettre à jour la commande";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = orders.filter((o) =>
    ["pending", "confirmed", "processing"].includes((o.status || "pending").toLowerCase())
  ).length;

  const deliveredCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "delivered"
  ).length;

  const totalRevenueDZD = orders
    .filter((o) => (o.status || "").toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#E4E7EC] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[#17191C]">
              Commandes & Suivi ({orders.length})
            </h2>
            <p className="text-[12px] text-[#667085]">
              0% de commission Olmart sur vos ventes
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="w-8 h-8 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center justify-center text-[#475467] cursor-pointer"
            title="Actualiser les commandes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#F97316]" : ""}`} />
          </button>
        </div>

        {/* Zero Commission Guarantee Banner */}
        <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-2 text-[11px] text-[#166534]">
          <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>
            <strong>100% de vos ventes vous reviennent :</strong> Olmart se rémunère uniquement par la publicité.
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-2 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="block text-[13px] font-bold text-[#B45309]">{pendingCount}</span>
            <span className="block text-[10px] text-[#92400E]">À traiter</span>
          </div>
          <div className="p-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
            <span className="block text-[13px] font-bold text-[#15803D]">{deliveredCount}</span>
            <span className="block text-[10px] text-[#166534]">Livrées</span>
          </div>
          <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="block text-[11px] font-bold text-[#17191C] font-mono truncate">
              {totalRevenueDZD.toLocaleString("fr-DZ")} DA
            </span>
            <span className="block text-[10px] text-[#64748B]">Ventes brutes</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="p-8 text-center text-[12px] text-[#667085]">
            Chargement de vos commandes en direct...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center bg-[#F9FAFB] rounded-xl border border-[#E4E7EC] space-y-2 my-2">
            <ClipboardList className="w-7 h-7 text-[#F97316] mx-auto" />
            <p className="text-[13px] font-semibold text-[#17191C]">
              Aucune commande reçue
            </p>
            <p className="text-[11px] text-[#667085]">
              Publiez votre boutique et partagez votre lien pour recevoir vos premières commandes clients.
            </p>
          </div>
        ) : (
          orders.slice(0, 12).map((order) => {
            const status = (order.status || "pending").toLowerCase();
            const amount = Number(order.totalAmount ?? order.total ?? 0);
            const customer =
              order.shippingAddress?.fullName || order.customerName || "Client Olmart";
            const wilaya = order.shippingAddress?.wilaya || order.shippingAddress?.city || "Algérie";

            return (
              <div
                key={order.id}
                className="p-3 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#CBD5E1] transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[#17191C]">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      status === "delivered"
                        ? "bg-[#F0FDF4] text-[#15803D]"
                        : status === "shipped"
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : "bg-[#FFFBEB] text-[#B45309]"
                    }`}
                  >
                    {status === "pending"
                      ? "En attente"
                      : status === "confirmed" || status === "processing"
                      ? "En préparation"
                      : status === "shipped"
                      ? "Expédiée"
                      : status === "delivered"
                      ? "Livrée"
                      : status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#475467] truncate">
                    {customer} · <strong className="text-[#17191C]">{wilaya}</strong>
                  </span>
                  <span className="font-mono font-bold text-[#EA580C] shrink-0">
                    {amount.toLocaleString("fr-DZ")} DZD
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {status === "pending" && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => void handleQuickStatusUpdate(order.id, "confirmed")}
                      className="flex-1 h-7 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Confirmer</span>
                    </button>
                  )}
                  {(status === "confirmed" || status === "processing") && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => void handleQuickStatusUpdate(order.id, "shipped")}
                      className="flex-1 h-7 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Marquer expédiée</span>
                    </button>
                  )}
                  {status !== "pending" && status !== "confirmed" && status !== "processing" && (
                    <span className="text-[11px] text-[#667085] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Suivi actif dans le gestionnaire
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link to Full Orders Manager */}
      <div className="p-3 border-t border-[#E4E7EC] bg-[#F8FAFC]">
        <button
          type="button"
          onClick={() => navigate("/dashboard/seller/orders")}
          className="w-full h-9 px-3 rounded-lg bg-[#17191C] hover:bg-[#344054] text-white text-[12px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Ouvrir le gestionnaire de commandes</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
