import React from 'react';
import { Store, ChevronLeft, AlertTriangle } from 'lucide-react';

interface StoreLoadingStateProps {
  message: string;
}

export const StoreLoadingState: React.FC<StoreLoadingStateProps> = ({ message }) => (
  <div className="min-h-screen bg-[#F8FBFC] flex flex-col items-center justify-center gap-4">
    <div className="relative flex items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#023859] to-[#26658C] flex items-center justify-center shadow-lg shadow-[#023859]/15 animate-pulse">
        <Store className="w-7 h-7 text-[#A7EBF2]" />
      </div>
      <div className="absolute -inset-2 border-2 border-dashed border-[#54ACBF]/40 rounded-3xl animate-spin [animation-duration:8s]" />
    </div>
    <span className="text-xs font-bold text-[#023859] tracking-wide uppercase">{message}</span>
  </div>
);

interface StoreErrorStateProps {
  errorType?: 'notFound' | 'serverError' | null;
  d: (key: string) => string;
  onRetry: () => void;
  onBack: () => void;
}

export const StoreErrorState: React.FC<StoreErrorStateProps> = ({
  errorType,
  d,
  onRetry,
  onBack,
}) => {
  if (errorType === 'serverError') {
    return (
      <div className="min-h-screen bg-[#F8FBFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-[#26658C]/15 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#011C40]">{d('loadError')}</h2>
          <p className="text-sm text-[#26658C]/80">{d('loadErrorDesc')}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#023859] text-white rounded-2xl text-xs font-bold hover:bg-[#011C40] transition-all cursor-pointer shadow-sm shadow-[#023859]/20"
            >
              <span>{d('retry')}</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F8FBFC] text-[#023859] border border-[#26658C]/20 rounded-2xl text-xs font-bold hover:bg-[#A7EBF2]/20 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{d('backToCatalog')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-[#26658C]/15 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-[#A7EBF2]/25 text-[#023859] rounded-2xl flex items-center justify-center mx-auto border border-[#54ACBF]/30">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#011C40]">{d('notExist')}</h2>
        <p className="text-sm text-[#26658C]/80">{d('notExistDesc')}</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#023859] text-white rounded-2xl text-xs font-bold hover:bg-[#011C40] transition-all cursor-pointer shadow-sm shadow-[#023859]/20 mt-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{d('backToCatalog')}</span>
        </button>
      </div>
    </div>
  );
};
