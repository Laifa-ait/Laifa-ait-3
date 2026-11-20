import React from "react";
import { useNavigate } from "react-router-dom";
import { X, LogIn } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ArtisanProfile } from "../../../types/artisan";

interface DrawerHeaderProps {
  onClose: () => void;
  artisanProfile: ArtisanProfile | null;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  onClose,
  artisanProfile,
}) => {
  const navigate = useNavigate();
  const { user, currentUser } = useAuth();
  const displayName = user?.displayName || currentUser?.displayName || "Client Olmart";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="px-5 pt-5 pb-4 bg-white border-b border-slate-200 shrink-0 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-[#0F172A] font-['Playfair_Display',serif]">
            OLMA
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
            ARTISANS
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Fermer le menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentUser ? (
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("/dashboard/buyer?tab=profile");
          }}
          className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 flex items-center gap-3 text-left transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white font-semibold flex items-center justify-center text-xs shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0F172A] truncate">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {artisanProfile ? `Artisan · ${artisanProfile.tradeName}` : user?.email || "Mon compte"}
            </p>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("/auth?redirect=/artisans");
          }}
          className="w-full h-10 px-3.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Se connecter / S&apos;inscrire</span>
        </button>
      )}
    </div>
  );
};
