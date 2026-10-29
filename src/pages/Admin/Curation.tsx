import React from "react";
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  MessageSquareX,
  Edit2,
  CheckSquare,
  Loader2,
  X,
  Check,
} from "lucide-react";

import { useCuration } from "./hooks/useCuration";
import { CurationPendingList } from "../../components/Admin/Curation/CurationPendingList";
import { CurationMobilePreview } from "../../components/Admin/Curation/CurationMobilePreview";
import { CurationProductEditForm } from "../../components/Admin/Curation/CurationProductEditForm";
import { CurationQualityPanel } from "../../components/Admin/Curation/CurationQualityPanel";

export const Curation: React.FC = () => {
  const {
    t,
    products,
    loading,
    searchTerm,
    setSearchTerm,
    selectedProduct,
    setSelectedProduct,
    relatedProducts,
    isEditMode,
    setIsEditMode,
    editForm,
    setEditForm,
    isSaving,
    isRejecting,
    setIsRejecting,
    rejectionReason,
    setRejectionReason,
    isActionInProgress,
    activeImageIndex,
    setActiveImageIndex,
    hierarchy,
    filteredProducts,
    checklist,
    calculatedScore,
    duplicates,
    handleToggleCompliance,
    handleApproveProduct,
    handleRejectProduct,
    handleStartEditing,
    handleSaveChanges,
  } = useCuration();

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-140px)] animate-fade-in text-zinc-900">
      <CurationPendingList
        products={products}
        filteredProducts={filteredProducts}
        selectedProduct={selectedProduct}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectProduct={setSelectedProduct}
      />

      <div className="flex-1 min-w-0 space-y-6">
        {!selectedProduct ? (
          <div className="bg-white rounded-3xl p-12 border border-zinc-100 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-sans font-bold text-zinc-800 uppercase tracking-wide">
              {t("Aucun produit sélectionné")}
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              {t("Sélectionnez un produit dans la liste pour démarrer l'audit de modération.")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    {t("En attente de validation")}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                    ID: #{selectedProduct.id.slice(0, 8)}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-sans font-bold text-[#1A1836] uppercase tracking-tight">
                  {selectedProduct.name}
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  {t("Proposé par")}{" "}
                  <strong className="text-zinc-800">{selectedProduct.sellerName || t("Vendeur inconnu")}</strong>{" "}
                  {t("dans la catégorie")} <strong className="text-zinc-800">{selectedProduct.category}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                {!isEditMode && (
                  <button
                    onClick={handleStartEditing}
                    className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-[#A54055]" />
                    {t("Éditer")}
                  </button>
                )}

                <button
                  onClick={() => setIsRejecting(true)}
                  disabled={isActionInProgress}
                  className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  {t("Refuser")}
                </button>

                <button
                  onClick={handleApproveProduct}
                  disabled={isActionInProgress}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isActionInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {t("Approuver & Publier")}
                </button>
              </div>
            </div>

            {isRejecting && (
              <div className="bg-red-50/70 border border-red-200 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-sans font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquareX className="w-4 h-4 text-red-600" />
                    {t("Motif de Refus du Produit")}
                  </h4>
                  <button onClick={() => setIsRejecting(false)} className="text-red-400 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t("Ex: Les photos sont floues, le titre contient des termes abusifs...")}
                  className="w-full text-xs p-4 bg-white border border-red-200 rounded-2xl outline-none focus:border-red-500 font-medium resize-none"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-4 py-2 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer"
                  >
                    {t("Annuler")}
                  </button>
                  <button
                    onClick={handleRejectProduct}
                    disabled={isActionInProgress}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                  >
                    {isActionInProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    {t("Confirmer le refus")}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-7 space-y-6">
                {isEditMode && editForm ? (
                  <CurationProductEditForm
                    editForm={editForm}
                    setEditForm={setEditForm}
                    hierarchy={hierarchy}
                    isSaving={isSaving}
                    onCancel={() => setIsEditMode(false)}
                    onSave={handleSaveChanges}
                  />
                ) : (
                  <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                      <CheckSquare className="w-5 h-5 text-[#1A1836]" />
                      <h3 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-widest">
                        {t("Checklist de conformité")}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {checklist.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start justify-between gap-4 p-3 hover:bg-zinc-50 rounded-2xl transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleCompliance(item.key)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                                item.status
                                  ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                                  : "bg-red-100 border-red-500 text-red-700"
                              }`}
                            >
                              {item.status ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                            <div>
                              <h4 className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-wide">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              item.status ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.status ? t("Conforme") : t("Alerte")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <CurationQualityPanel
                  calculatedScore={calculatedScore}
                  activeProduct={isEditMode && editForm ? editForm : selectedProduct}
                  relatedProductsCount={relatedProducts.length}
                  duplicates={duplicates}
                  selectedProductId={selectedProduct.id}
                />
              </div>

              <CurationMobilePreview
                selectedProduct={selectedProduct}
                isEditMode={isEditMode}
                editForm={editForm}
                activeImageIndex={activeImageIndex}
                setActiveImageIndex={setActiveImageIndex}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
