import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

interface StoreVipLockGateProps {
  shopName: string;
  logoUrl?: string;
  primaryColor?: string;
  vipError?: string | null;
  vipSubmitting?: boolean;
  onSubmitPassword: (password: string) => Promise<void> | void;
}

export const StoreVipLockGate: React.FC<StoreVipLockGateProps> = ({
  shopName,
  logoUrl,
  primaryColor = "#B45309",
  vipError,
  vipSubmitting = false,
  onSubmitPassword,
}) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || vipSubmitting) return;
    void onSubmitPassword(password.trim());
  };

  return (
    <div
      data-testid="store-vip-lock-gate"
      className="min-h-[70vh] flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md overflow-hidden">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shopName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <Lock className="w-7 h-7" />
          )}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accès Privé • Pré-lancement VIP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{shopName}</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Cette vitrine est actuellement réservée aux membres disposant d&apos;un code d&apos;invitation VIP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label htmlFor="vip-access-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Code d&apos;accès VIP
            </label>
            <input
              id="vip-access-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Saisissez votre code secret..."
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>

          {vipError && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {vipError}
            </p>
          )}

          <button
            type="submit"
            disabled={vipSubmitting || !password.trim()}
            style={{ backgroundColor: primaryColor }}
            className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <span>{vipSubmitting ? "Vérification..." : "Déverrouiller la vitrine"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
