import React from "react";
import { AnimatePresence } from "motion/react";
import { Search, Eye, ChevronLeft, ChevronRight, CheckSquare, Square, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useSellerModeration, Seller } from "../../hooks/useSellerModeration";
import { useConfirm } from "../../hooks/useConfirm";

import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { AdminDataTable } from "../../components/ui/Admin/AdminDataTable";
import { StatusBadge } from "../../components/ui/Admin/StatusBadge";
import { Button } from "../../components/ui/Button";
import { SellersBulkBar } from "../../components/Admin/Sellers/SellersBulkBar";
import { SellerRejectModal } from "../../components/Admin/Sellers/SellerRejectModal";
import { SellerDrawer } from "../../components/Admin/Sellers/SellerDrawer";
import { SellerDocPreviewModal } from "../../components/Admin/Sellers/SellerDocPreviewModal";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import { normalizeTimestamp } from "../../utils/date";

export const SellerModeration: React.FC = () => {
  const { confirm, ConfirmationDialog } = useConfirm();
  const {
    t,
    currentUser,
    pageParam,
    statusParam,
    sellers,
    setSellers,
    loading,
    totalPages,
    totalCount,
    searchTerm,
    setSearchTerm,
    selectedSeller,
    setSelectedSeller,
    selectedSellerIds,
    setSelectedSellerIds,
    bulkLoading,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReasons,
    setRejectReasons,
    rejectComment,
    setRejectComment,
    previewDocUrl,
    setPreviewDocUrl,
    ocrLoading,
    setOcrLoading,
    ocrResult,
    setOcrResult,
    refreshSellers,
    handleSelectAllSellers,
    handleSelectSeller,
    handleBulkApproveSellers,
    handleBulkSuspendSellers,
    handleBulkDeleteSellers,
    handleUpdateStatus,
    handleScheduleMeet,
    handlePageChange,
    handleStatusFilter,
  } = useSellerModeration(confirm);

  const [searchParams, setSearchParams] = useSearchParams();
  const sortByParam = searchParams.get("sortBy") || "createdAt";
  const sortOrderParam = searchParams.get("sortOrder") || "desc";

  const columns = [
    {
      header: (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAllSellers(selectedSellerIds.length !== sellers.length && sellers.length > 0);
          }}
          className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          {selectedSellerIds.length > 0 && selectedSellerIds.length === sellers.length ? (
            <CheckSquare className="w-5 h-5 text-[#1A1836]" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
      ),
      accessor: (s: Seller) => {
        const isSelected = selectedSellerIds.includes(s.id);
        return (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleSelectSeller(s.id, !isSelected)}
              className="text-zinc-400 hover:text-zinc-900 transition-colors inline-block cursor-pointer bg-transparent border-none p-0"
            >
              {isSelected ? <CheckSquare className="w-5 h-5 text-[#1A1836]" /> : <Square className="w-5 h-5" />}
            </button>
          </div>
        );
      },
      className: "w-12 text-center",
    },
    {
      header: t("Boutique / Vendeur"),
      accessor: (s: Seller) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 shadow-inner">
            <OptimizedImage
              src={s.logoUrl || `https://ui-avatars.com/api/?name=${s.shopName || s.displayName}&background=random`}
              alt={s.shopName || s.displayName || "Shop Logo"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm text-[#1A1836] leading-none mb-1">
              {s.shopName || s.displayName}
            </h4>
            <p className="text-[11px] font-mono text-zinc-400">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: t("Wilaya"),
      accessor: (s: Seller) => (
        <span className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-wider">{s.wilaya}</span>
      ),
    },
    {
      header: t("Statut KYC"),
      accessor: (s: Seller) => <StatusBadge status={s.status} label={s.status} />,
    },
    {
      header: (
        <div
          className="cursor-pointer hover:text-zinc-950 transition-colors flex items-center gap-1"
          onClick={() => {
            const nextOrder = sortByParam === "createdAt" && sortOrderParam === "desc" ? "asc" : "desc";
            setSearchParams((prev) => {
              prev.set("sortBy", "createdAt");
              prev.set("sortOrder", nextOrder);
              return prev;
            });
          }}
        >
          {t("Date d'inscription")}
          {sortByParam === "createdAt" && (sortOrderParam === "desc" ? "↓" : "↑")}
        </div>
      ),
      accessor: (s: Seller) => (
        <span className="text-xs font-sans font-bold text-zinc-700 tabular-nums">
          {s.createdAt ? normalizeTimestamp(s.createdAt).toDate().toLocaleDateString("fr-FR") : "N/A"}
        </span>
      ),
    },
    {
      header: t("Actions"),
      accessor: (s: Seller) => (
        <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => setSelectedSeller(s)} />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <ConfirmationDialog />
      <AdminPageHeader
        title={t("Validation KYC & Annuaire Vendeurs")}
        subtitle={t("Auditez les dossiers marchands, vérifiez les registres de commerce et gérez les accès.")}
        actions={
          <button
            onClick={refreshSellers}
            disabled={loading}
            className="px-4 py-2.5 bg-[#1A1836] hover:bg-[#42164B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#E99856] ${loading ? "animate-spin" : ""}`} />
            {t("Actualiser")}
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder={t("Rechercher par nom de boutique, email ou vendeur...")}
            className="w-full ps-12 pe-4 py-3.5 bg-white border border-zinc-200 rounded-2xl outline-none font-sans font-semibold text-sm focus:border-[#A54055] transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "", label: "Tous" },
            { id: "pending", label: "En attente" },
            { id: "active", label: "Approuvés" },
            { id: "rejected", label: "Rejetés" },
            { id: "suspended", label: "Suspendus" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleStatusFilter(st.id)}
              className={`px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                statusParam === st.id
                  ? "bg-[#1A1836] text-white shadow-md"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <AdminDataTable data={sellers} columns={columns} keyExtractor={(item) => item.id} isLoading={loading} />
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/40">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider tabular-nums">
              {t("Page")} {pageParam} / {totalPages} ({totalCount} boutiques)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => handlePageChange(Math.max(1, pageParam - 1))}
                disabled={pageParam === 1 || loading}
              />
              <Button
                variant="outline"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => handlePageChange(Math.min(totalPages, pageParam + 1))}
                disabled={pageParam === totalPages || loading}
              />
            </div>
          </div>
        )}
      </div>

      <SellersBulkBar
        selectedSellerIds={selectedSellerIds}
        bulkLoading={bulkLoading}
        handleBulkApproveSellers={handleBulkApproveSellers}
        handleBulkSuspendSellers={handleBulkSuspendSellers}
        handleBulkDeleteSellers={handleBulkDeleteSellers}
        setSelectedSellerIds={setSelectedSellerIds}
      />

      <AnimatePresence>
        {selectedSeller && (
          <SellerDrawer
            selectedSeller={selectedSeller}
            setSelectedSeller={setSelectedSeller}
            setPreviewDocUrl={setPreviewDocUrl}
            currentUser={currentUser}
            setSellers={setSellers}
            sellers={sellers}
            ocrLoading={ocrLoading}
            setOcrLoading={setOcrLoading}
            ocrResult={
              ocrResult as {
                fullName?: string;
                documentNumber?: string;
                dateOfBirth?: string;
                expiryDate?: string;
              } | null
            }
            setOcrResult={setOcrResult}
            handleScheduleMeet={handleScheduleMeet}
            handleUpdateStatus={handleUpdateStatus}
            setRejectModalOpen={setRejectModalOpen}
          />
        )}
      </AnimatePresence>

      <SellerRejectModal
        rejectModalOpen={rejectModalOpen}
        setRejectModalOpen={setRejectModalOpen}
        rejectReasons={rejectReasons}
        setRejectReasons={setRejectReasons}
        rejectComment={rejectComment}
        setRejectComment={setRejectComment}
        handleConfirmReject={() => {
          if (selectedSeller) {
            handleUpdateStatus(selectedSeller.id, "rejected");
          }
        }}
      />

      <SellerDocPreviewModal previewDocUrl={previewDocUrl} onClose={() => setPreviewDocUrl(null)} />
    </div>
  );
};
