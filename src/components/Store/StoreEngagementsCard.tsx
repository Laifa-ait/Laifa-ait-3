import React from "react";
import { TFunction } from "i18next";
import { ShieldCheck, Building2, Truck, Undo2 } from "lucide-react";
import { PublicStoreInfo } from "../../pages/Public/StoreProfile";

interface StoreEngagementsCardProps {
  storeInfo: PublicStoreInfo;
  isOwner: boolean;
  isEditingAbout: boolean;
  setIsEditingAbout: (editing: boolean) => void;
  savingAbout: boolean;
  editForm: {
    legalStatus: string;
    avgPreparationTime: string;
    returnPolicy: string;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      shopName: string;
      shopDescription: string;
      wilaya: string;
      legalStatus: string;
      avgPreparationTime: string;
      returnPolicy: string;
    }>
  >;
  saveAboutInfo: () => Promise<void>;
  isRTL: boolean;
  d: (key: string) => string;
  t: TFunction;
}

export const StoreEngagementsCard: React.FC<StoreEngagementsCardProps> = ({
  storeInfo,
  isOwner,
  isEditingAbout,
  setIsEditingAbout,
  savingAbout,
  editForm,
  setEditForm,
  saveAboutInfo,
  isRTL,
  d,
  t,
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--store-surface, #FFFFFF)",
        borderRadius: "var(--store-border-radius, 20px)",
        fontFamily: "var(--store-font-body, inherit)",
        color: "var(--store-secondary, #18181B)",
      }}
      className="border border-black/10 p-6 sm:p-8 space-y-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5" style={{ color: "var(--store-primary, #B45309)" }} />
          <h3
            style={{
              color: "var(--store-secondary, #18181B)",
              fontFamily: "var(--store-font-heading, inherit)",
            }}
            className="text-sm font-bold uppercase tracking-wider"
          >
            {isRTL ? "التزامات المتجر وخدمة العملاء" : "Engagements & Service Client"}
          </h3>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => setIsEditingAbout(!isEditingAbout)}
            style={{
              color: "var(--store-primary, #B45309)",
              backgroundColor: "var(--store-canvas, #FAF6F0)",
            }}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 border border-black/10 cursor-pointer"
          >
            {isEditingAbout ? (isRTL ? "إلغاء التعديل" : "Annuler") : isRTL ? "تعديل" : "Modifier"}
          </button>
        )}
      </div>

      {isEditingAbout ? (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">
              {isRTL ? "الوضع القانوني (اختياري)" : "Statut Légal (Optionnel)"}
            </label>
            <input
              type="text"
              value={editForm.legalStatus}
              onChange={(e) => setEditForm((prev) => ({ ...prev, legalStatus: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              placeholder="SARL, EURL, Auto-entrepreneur..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">
              {isRTL ? "متوسط وقت التحضير" : "Délai moyen de préparation"}
            </label>
            <input
              type="text"
              value={editForm.avgPreparationTime}
              onChange={(e) => setEditForm((prev) => ({ ...prev, avgPreparationTime: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              placeholder="ex: 24 - 48 heures"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">
              {isRTL ? "سياسة الإرجاع" : "Modalités de retour et d'échange"}
            </label>
            <textarea
              value={editForm.returnPolicy}
              onChange={(e) => setEditForm((prev) => ({ ...prev, returnPolicy: e.target.value }))}
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              placeholder={isRTL ? "أدخل سياسة الإرجاع..." : "Précisez vos conditions réelles d'échange ou de retour..."}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => void saveAboutInfo()}
              disabled={savingAbout}
              style={{
                backgroundColor: "var(--store-primary, #B45309)",
                color: "#FFFFFF",
                borderRadius: "var(--store-border-radius, 12px)",
              }}
              className="px-8 py-3.5 font-bold text-[11px] uppercase tracking-widest transition-opacity hover:opacity-90 shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              {savingAbout
                ? isRTL
                  ? "جاري الحفظ..."
                  : "Enregistrement..."
                : isRTL
                ? "حفظ التغييرات"
                : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {storeInfo.legalStatus && (
            <div
              style={{ backgroundColor: "var(--store-canvas, #FAF6F0)" }}
              className="flex gap-4 p-4 rounded-2xl border border-black/10"
            >
              <div
                style={{ backgroundColor: "var(--store-surface, #FFFFFF)" }}
                className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center shrink-0 shadow-2xs"
              >
                <Building2 className="w-4 h-4" style={{ color: "var(--store-primary, #B45309)" }} />
              </div>
              <div>
                <h4
                  style={{ color: "var(--store-primary, #B45309)" }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  {d("legalStatus")}
                </h4>
                <p className="text-xs font-bold mt-0.5">{storeInfo.legalStatus}</p>
                <p className="text-[11px] opacity-70 font-medium mt-1">
                  {t(
                    "store_profile.verified_desc",
                    "Vendeur certifié ayant fourni ses documents d'immatriculation officiels."
                  )}
                </p>
              </div>
            </div>
          )}

          {storeInfo.avgPreparationTime && (
            <div
              style={{ backgroundColor: "var(--store-canvas, #FAF6F0)" }}
              className="flex gap-4 p-4 rounded-2xl border border-black/10"
            >
              <div
                style={{ backgroundColor: "var(--store-surface, #FFFFFF)" }}
                className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center shrink-0 shadow-2xs"
              >
                <Truck className="w-4 h-4" style={{ color: "var(--store-primary, #B45309)" }} />
              </div>
              <div className="flex-1">
                <h4
                  style={{ color: "var(--store-primary, #B45309)" }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  {d("prepTime")}
                </h4>
                <p className="text-xs font-bold mt-0.5">{storeInfo.avgPreparationTime}</p>
                <p className="text-[11px] opacity-75 font-medium mt-1">
                  {t(
                    "store_profile.dispatch_desc",
                    "Délai estimé pour confier votre commande à l'agence d'expédition sur les 69 Wilayas."
                  )}
                </p>
              </div>
            </div>
          )}

          {storeInfo.returnPolicy && (
            <div
              style={{ backgroundColor: "var(--store-canvas, #FAF6F0)" }}
              className="flex gap-4 p-4 rounded-2xl border border-black/10"
            >
              <div
                style={{ backgroundColor: "var(--store-surface, #FFFFFF)" }}
                className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center shrink-0 shadow-2xs"
              >
                <Undo2 className="w-4 h-4" style={{ color: "var(--store-primary, #B45309)" }} />
              </div>
              <div className="flex-1">
                <h4
                  style={{ color: "var(--store-primary, #B45309)" }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  {d("returnPolicy")}
                </h4>
                <p className="text-xs font-bold leading-relaxed mt-1 italic">
                  « {storeInfo.returnPolicy} »
                </p>
                <p className="text-[11px] opacity-70 font-medium mt-2">
                  {t(
                    "store_profile.guarantee_desc",
                    "Modalités de retour appliquées directement par cette boutique."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
