import React from 'react';
import { TFunction } from 'i18next';
import { ShieldCheck, Building2, Truck, Undo2 } from 'lucide-react';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';

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
    <div className="bg-white border border-[#26658C]/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#26658C]/10 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#54ACBF]" />
          <h3 className="text-sm font-sans font-bold uppercase text-[#011C40] tracking-wider">
            {isRTL ? 'التزامات المتجر وخدمة العملاء' : 'Engagements & Service Client'}
          </h3>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsEditingAbout(!isEditingAbout)}
            className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#023859] hover:text-[#011C40] bg-[#A7EBF2]/20 hover:bg-[#A7EBF2]/40 px-3 py-1.5 rounded-lg transition-colors border border-[#54ACBF]/30 cursor-pointer"
          >
            {isEditingAbout ? (isRTL ? 'إلغاء التعديل' : 'Annuler') : isRTL ? 'تعديل' : 'Modifier'}
          </button>
        )}
      </div>

      {isEditingAbout ? (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
              {isRTL ? 'الوضع القانوني (اختياري)' : 'Statut Légal (Optionnel)'}
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
            <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
              {isRTL ? 'متوسط وقت التحضير' : 'Délai moyen de préparation'}
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
            <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
              {isRTL ? 'سياسة الإرجاع' : 'Politique de retour et garantie'}
            </label>
            <textarea
              value={editForm.returnPolicy}
              onChange={(e) => setEditForm((prev) => ({ ...prev, returnPolicy: e.target.value }))}
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              placeholder={isRTL ? 'أدخل سياسة الإرجاع...' : 'Saisissez votre politique...'}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={saveAboutInfo}
              disabled={savingAbout}
              className="px-8 py-3.5 bg-[#023859] text-white hover:bg-[#011C40] rounded-xl font-sans font-bold text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto border border-[#54ACBF]/30"
            >
              {savingAbout
                ? isRTL
                  ? 'جاري الحفظ...'
                  : 'Enregistrement...'
                : isRTL
                ? 'حفظ التغييرات'
                : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {storeInfo.legalStatus && (
            <div className="flex gap-4 p-4 rounded-2xl bg-[#F8FBFC] border border-[#26658C]/15">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#26658C]/15 flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-4 h-4 text-[#26658C]" />
              </div>
              <div>
                <h4 className="text-[10px] font-sans font-bold text-[#26658C] uppercase tracking-wider">
                  {d('legalStatus')}
                </h4>
                <p className="text-xs font-sans font-bold text-[#011C40] mt-0.5">{storeInfo.legalStatus}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {t(
                    'store_profile.verified_desc',
                    "Vendeur certifié ayant fourni ses documents d'immatriculation officiels."
                  )}
                </p>
              </div>
            </div>
          )}

          {storeInfo.avgPreparationTime && (
            <div className="flex gap-4 p-4 rounded-2xl bg-[#A7EBF2]/10 border border-[#54ACBF]/20">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#54ACBF]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Truck className="w-4 h-4 text-[#26658C]" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-sans font-bold text-[#023859] uppercase tracking-wider">
                  {d('prepTime')}
                </h4>
                <p className="text-xs font-sans font-bold text-[#011C40] mt-0.5">
                  {storeInfo.avgPreparationTime}
                </p>
                <p className="text-[11px] text-slate-600 font-semibold mt-1">
                  {t(
                    'store_profile.dispatch_desc',
                    "Délai estimé pour confier votre commande à l'agence d'expédition agréée."
                  )}
                </p>
              </div>
            </div>
          )}

          {storeInfo.returnPolicy && (
            <div className="flex gap-4 p-4 rounded-2xl bg-[#F8FBFC] border border-[#26658C]/15">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#26658C]/15 flex items-center justify-center shrink-0 shadow-2xs">
                <Undo2 className="w-4 h-4 text-[#54ACBF]" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-sans font-bold text-[#023859] uppercase tracking-wider">
                  {d('returnPolicy')}
                </h4>
                <p className="text-xs font-sans font-bold text-[#011C40] leading-relaxed mt-1 italic">
                  "{storeInfo.returnPolicy}"
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-2">
                  {t(
                    'store_profile.guarantee_desc',
                    "La conformité de la marchandise est garantie selon la législation algérienne sur le commerce électronique."
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
