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
    <div className="flex flex-col h-full bg-white select-none">
      <div className="px-4 py-3.5 border-b border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-900">
              Commandes ({orders.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              0% de commission Olmart sur vos ventes
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 cursor-pointer"
            title="Actualiser les commandes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-slate-900" : ""}`} />
          </button>
        </div>

        <div className="px-2.5 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-900">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>100% de vos ventes nettes vous reviennent.</span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-lg bg-slate-50/50 text-center tabular-nums">
          <div className="p-2">
            <span className="block text-[13px] font-semibold text-slate-900">{pendingCount}</span>
            <span className="block text-[10px] text-slate-500">À traiter</span>
          </div>
          <div className="p-2">
            <span className="block text-[13px] font-semibold text-emerald-700">{deliveredCount}</span>
            <span className="block text-[10px] text-slate-500">Livrées</span>
          </div>
          <div className="p-2">
            <span className="block text-[11.5px] font-semibold text-slate-900 font-mono truncate">
              {totalRevenueDZD.toLocaleString("fr-DZ")} DA
            </span>
            <span className="block text-[10px] text-slate-500">Ventes brutes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
        {loading ? (
          <div className="p-8 text-center text-[12px] text-slate-500">
            Chargement de vos commandes...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 my-2">
            <ClipboardList className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-[12.5px] font-semibold text-slate-900">
              Aucune commande reçue
            </p>
            <p className="text-[11px] text-slate-500">
              Publiez votre boutique pour recevoir vos premières commandes clients.
            </p>
          </div>
        ) : (
          orders.slice(0, 12).map((order) => {
            const status = (order.status || "pending").toLowerCase();
            const amount = Number(order.totalAmount ?? order.total ?? 0);
            const customer =
              order.shippingAddress?.fullName || order.customerName || "Client Olmart";
            const wilaya = order.shippingAddress?.wilaya || order.shippingAddress?.city || "Algérie";
            const statusText =
              status === "pending"
                ? "En attente"
                : status === "confirmed" || status === "processing"
                ? "En préparation"
                : status === "shipped"
                ? "Expédiée"
                : status === "delivered"
                ? "Livrée"
                : status;

            return (
              <div
                key={order.id}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-slate-900 tabular-nums">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10.5px] font-medium ${
                      status === "delivered"
                        ? "text-emerald-700"
                        : status === "shipped"
                        ? "text-sky-700"
                        : "text-amber-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        status === "delivered"
                          ? "bg-emerald-500"
                          : status === "shipped"
                          ? "bg-sky-500"
                          : "bg-amber-500"
                      }`}
                    />
                    {statusText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-600 truncate">
                    {customer} · <strong className="font-medium text-slate-900">{wilaya}</strong>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 shrink-0 tabular-nums">
                    {amount.toLocaleString("fr-DZ")} DZD
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {status === "pending" && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => void handleQuickStatusUpdate(order.id, "confirmed")}
                      className="flex-1 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
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
                      className="flex-1 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Marquer expédiée</span>
                    </button>
                  )}
                  {status !== "pending" && status !== "confirmed" && status !== "processing" && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Suivi actif dans le gestionnaire
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <button
          type="button"
          onClick={() => navigate("/dashboard/seller/orders")}
          className="w-full h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Ouvrir le gestionnaire de commandes</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
