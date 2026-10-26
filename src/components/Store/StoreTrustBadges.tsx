import React from 'react';
import { Truck, ShieldCheck, Clock, RotateCcw } from 'lucide-react';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';

interface StoreTrustBadgesProps {
  storeInfo: PublicStoreInfo;
}

export const StoreTrustBadges: React.FC<StoreTrustBadgesProps> = ({ storeInfo }) => {
  const prepTime = storeInfo.avgPreparationTime || 'Expédition sous 24h';
  const returnPolicy = storeInfo.returnPolicy || 'Retours sous 7 jours';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 py-3 sm:py-4">
      <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#26658C]/15 shadow-2xs hover:border-[#54ACBF]/40 transition-colors">
        <div className="w-8 h-8 rounded-xl bg-[#A7EBF2]/20 text-[#26658C] flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#011C40] leading-tight">69 Wilayas</p>
          <p className="text-[10px] text-[#26658C]/80 truncate">Livraison à domicile</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#26658C]/15 shadow-2xs hover:border-[#54ACBF]/40 transition-colors">
        <div className="w-8 h-8 rounded-xl bg-[#A7EBF2]/20 text-[#023859] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#011C40] leading-tight">Vendeur Vérifié</p>
          <p className="text-[10px] text-[#26658C]/80 truncate">Paiement à la livraison</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#26658C]/15 shadow-2xs hover:border-[#54ACBF]/40 transition-colors">
        <div className="w-8 h-8 rounded-xl bg-[#A7EBF2]/20 text-[#26658C] flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#011C40] leading-tight">Préparation Rapide</p>
          <p className="text-[10px] text-[#26658C]/80 truncate">{prepTime}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#26658C]/15 shadow-2xs hover:border-[#54ACBF]/40 transition-colors">
        <div className="w-8 h-8 rounded-xl bg-[#A7EBF2]/20 text-[#54ACBF] flex items-center justify-center shrink-0">
          <RotateCcw className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#011C40] leading-tight">Garantie & Retour</p>
          <p className="text-[10px] text-[#26658C]/80 truncate">{returnPolicy}</p>
        </div>
      </div>
    </div>
  );
};
