import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Truck, Printer, Search, PackageCheck, RefreshCw, CheckCircle2, Clock, ShieldCheck, Barcode } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { ShippingLabelPrinter } from "../../components/Seller/ShippingLabelPrinter";
import { Order } from "../../domains/order/order.types";
import { ShippingRatesResponse } from "../../services/shippingClient";
import { ShippingRateAndProfitSimulator } from "./components/shipping/ShippingRateAndProfitSimulator";
import toast from "react-hot-toast";

interface TrackResult {
  id: string;
  trackingNumber: string;
  status: string;
  wilaya: string;
  recipient: string;
  lastUpdate: string;
  notFound?: boolean;
}

export const SellerShipping: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [trackInput, setTrackInput] = useState("");
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
  const [searchingTrack, setSearchingTrack] = useState(false);
  const [selectedWilayaId, setSelectedWilayaId] = useState<string>("16");
  const [, setShippingRates] = useState<ShippingRatesResponse | null>(null);

  const fetchSellerOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ orders: Order[] }>("/api/v1/seller/orders");
      if (res && res.orders) setOrders(res.orders);
    } catch {
      toast.error(t("shipping_loading_error") || "Erreur de chargement des expéditions");
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchRates = useCallback(async (wilayaId: string) => {
    try {
      const res = await apiGet<ShippingRatesResponse>(`/api/v1/shipping/rates/${wilayaId}`);
      setShippingRates(res || null);
    } catch {
      setShippingRates(null);
    }
  }, []);

  useEffect(() => {
    fetchSellerOrders();
    fetchRates("16");
  }, [fetchSellerOrders, fetchRates]);

  const handleWilayaChange = (val: string) => {
    setSelectedWilayaId(val);
    fetchRates(val);
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    setSearchingTrack(true);
    const query = trackInput.trim().toLowerCase();
    const found = orders.find(
      (o) => o.id.toLowerCase() === query || o.trackingNumber?.toLowerCase() === query || o.trackingId?.toLowerCase() === query
    );
    setTimeout(() => {
      setTrackResult(
        found
          ? {
              id: found.id,
              trackingNumber: found.trackingNumber || found.trackingId || "OLM-SHP-" + found.id.substring(0, 8).toUpperCase(),
              status: found.status || "CONFIRMED",
              wilaya: found.shippingAddress?.wilaya || "Alger",
              recipient: found.shippingAddress?.fullName || found.shippingAddress?.name || "Client Olmart",
              lastUpdate: new Date().toLocaleString("fr-FR"),
              notFound: false,
            }
          : { id: "", trackingNumber: "", status: "", wilaya: "", recipient: "", lastUpdate: "", notFound: true }
      );
      setSearchingTrack(false);
    }, 300);
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      Boolean(order.trackingNumber?.toLowerCase().includes(q)) ||
      Boolean(order.shippingAddress?.fullName?.toLowerCase().includes(q)) ||
      Boolean(order.shippingAddress?.wilaya?.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    const st = (order.status || "").toUpperCase();
    if (statusFilter === "READY") return ["CONFIRMED", "PROCESSING", "NEW"].includes(st);
    if (statusFilter === "SHIPPED") return ["SHIPPED", "IN_TRANSIT", "PICKED_UP"].includes(st);
    if (statusFilter === "DELIVERED") return st === "DELIVERED";
    return true;
  });

  const readyToShipCount = orders.filter((o) => ["CONFIRMED", "PROCESSING", "NEW"].includes((o.status || "").toUpperCase())).length;
  const inTransitCount = orders.filter((o) => ["SHIPPED", "IN_TRANSIT", "PICKED_UP"].includes((o.status || "").toUpperCase())).length;
  const deliveredCount = orders.filter((o) => (o.status || "").toUpperCase() === "DELIVERED").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {selectedOrderForPrint && (
        <ShippingLabelPrinter order={selectedOrderForPrint} onClose={() => setSelectedOrderForPrint(null)} />
      )}

      <div className="bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#A54055]/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E99856]/20 border border-[#E99856]/30 text-[#E99856] text-xs font-extrabold uppercase">
              <Truck className="w-4 h-4" />
              <span>{t("Logistique Directe • 69 Wilayas")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{t("shipping_hub_title")}</h1>
            <p className="text-[#E0B4B2] text-xs sm:text-sm">{t("shipping_hub_subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={fetchSellerOrders}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs uppercase border border-white/15 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#E99856] ${loading ? "animate-spin" : ""}`} />
            <span>{t("shipping_refresh")}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          {[
            { label: t("shipping_ready_to_ship"), val: readyToShipCount, icon: Clock, color: "text-[#E99856]" },
            { label: t("shipping_in_transit"), val: inTransitCount, icon: Truck, color: "text-sky-300" },
            { label: t("shipping_delivered"), val: deliveredCount, icon: CheckCircle2, color: "text-emerald-300" },
            { label: t("shipping_coverage"), val: "69 Wilayas", icon: ShieldCheck, color: "text-[#E0B4B2]" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-1 ${stat.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{stat.label}</span>
                </div>
                <p className="text-2xl font-extrabold text-white tabular-nums">{stat.val}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E0B4B2]/40 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#1A1836]">{t("shipping_list_title")}</h2>
              <p className="text-xs text-zinc-500">{t("shipping_list_subtitle")}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FAF7F8] p-1 rounded-xl border border-[#E0B4B2]/40">
              {[
                { id: "ALL", label: t("shipping_filter_all") },
                { id: "READY", label: `${t("shipping_ready_to_ship")} (${readyToShipCount})` },
                { id: "SHIPPED", label: t("shipping_in_transit") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                    statusFilter === tab.id ? "bg-[#1A1836] text-white" : "bg-transparent text-zinc-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("shipping_search_placeholder")}
              className="w-full ps-11 pe-4 py-3 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#A54055]"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500">{t("shipping_loading")}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-[#FAF7F8] rounded-2xl border border-dashed border-[#E0B4B2]">
              <PackageCheck className="w-10 h-10 text-[#A54055]/50 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#1A1836]">{t("shipping_no_orders")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const trackingNum = order.trackingNumber || order.trackingId || `OLM-SHP-${order.id.substring(0, 8).toUpperCase()}`;
                return (
                  <div key={order.id} className="p-4 bg-[#FAF7F8] hover:bg-white border border-[#E0B4B2]/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#1A1836]">#{order.id.substring(0, 8).toUpperCase()}</span>
                        <span className="text-xs font-mono font-bold text-[#A54055] bg-[#A54055]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Barcode className="w-3 h-3" /> {trackingNum}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#1A1836]/10 text-[#1A1836]">{order.status}</span>
                      </div>
                      <p className="text-xs text-zinc-600">
                        {order.shippingAddress?.fullName || order.shippingAddress?.name || "Client"} • <span className="font-bold text-[#1A1836]">{order.shippingAddress?.wilaya}</span> • <span className="font-extrabold text-[#1A1836]">{formatPrice(order.total)}</span>
                      </p>
                    </div>
                    <button type="button" onClick={() => setSelectedOrderForPrint(order)} className="px-4 py-2 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border-none">
                      <Printer className="w-3.5 h-3.5 text-[#E99856]" />
                      <span>{t("shipping_print_label")}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-[#1A1836]">{t("shipping_track_title")}</h3>
            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input type="text" value={trackInput} onChange={(e) => setTrackInput(e.target.value)} placeholder="Ex: OLM-SHP-8F3921" className="flex-1 px-3.5 py-2.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-xl text-xs font-mono uppercase focus:outline-none" />
              <button type="submit" disabled={searchingTrack} className="px-4 py-2.5 bg-[#A54055] hover:bg-[#622347] text-white font-bold text-xs rounded-xl cursor-pointer border-none">
                {searchingTrack ? "..." : t("shipping_track_btn")}
              </button>
            </form>
            {trackResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#1A1836] text-white rounded-2xl text-xs space-y-1">
                {trackResult.notFound ? (
                  <p className="text-[#E0B4B2] text-center">{t("Aucun colis trouvé avec ce numéro")}</p>
                ) : (
                  <>
                    <div className="flex justify-between font-mono text-[#E99856] font-bold">
                      <span>{trackResult.trackingNumber}</span>
                      <span>{trackResult.status}</span>
                    </div>
                    <p>{trackResult.recipient} • {trackResult.wilaya}</p>
                  </>
                )}
              </motion.div>
            )}
          </div>
          <ShippingRateAndProfitSimulator selectedWilayaId={selectedWilayaId} onWilayaChange={handleWilayaChange} />
        </div>
      </div>
    </div>
  );
};
