import React from 'react';
import { Store, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

interface StoreLoadingStateProps {
  message: string;
}

export const StoreLoadingState: React.FC<StoreLoadingStateProps> = ({ message }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
    <div className="relative flex items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/15 animate-pulse">
        <Store className="w-7 h-7 text-slate-100" />
      </div>
      <div className="absolute -inset-2 border border-dashed border-slate-400/50 rounded-3xl animate-spin [animation-duration:8s]" />
    </div>
    <Spinner />
    <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">{message}</span>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{d('loadError')}</h2>
          <p className="text-sm text-slate-600">{d('loadErrorDesc')}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <span>{d('retry')}</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{d('notExist')}</h2>
        <p className="text-sm text-slate-600">{d('notExistDesc')}</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm mt-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{d('backToCatalog')}</span>
        </button>
      </div>
    </div>
  );
};
