import React from "react";
import { useTranslation } from "react-i18next";
import { UserProfile, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { UserAvatar } from "../ui/UserAvatar";
import { ShieldCheck, Store, LogIn, ChevronRight, User as UserIcon, LogOut } from "lucide-react";

interface MobileUserCardProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  onNavigate: (path: string) => void;
  onClose: () => void;
  onLogout?: () => void;
}

export const MobileUserCard: React.FC<MobileUserCardProps> = ({
  currentUser,
  userProfile,
  onNavigate,
  onClose,
  onLogout,
}) => {
  const { t } = useTranslation();

  if (!currentUser) {
    return (
      <div className="bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] rounded-2xl p-4.5 border border-[#A54055]/30 shadow-md text-white">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E99856]/20 text-[#E99856] flex items-center justify-center shrink-0 border border-[#E99856]/30">
            <LogIn className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-white leading-tight">
              {t("Bienvenue sur Olmart")}
            </h4>
            <p className="text-xs text-[#E0B4B2] font-normal mt-1 leading-relaxed">
              {t("Connectez-vous pour suivre vos commandes et gérer vos favoris.")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onNavigate("/auth");
            onClose();
          }}
          className="w-full mt-3.5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E99856] to-[#d8823e] text-[#1A1836] font-extrabold text-xs transition-all shadow-xs cursor-pointer border-none"
        >
          <span>{t("Se connecter / S'inscrire")}</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  const role = userProfile?.role || "buyer";
  const isAdmin = role === "admin" || role === "superadmin";
  const isSeller = role === "seller" || isAdmin;
  const displayName =
    userProfile?.displayName ||
    currentUser.displayName ||
    currentUser.email?.split("@")[0] ||
    "Utilisateur";

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E0B4B2]/40 shadow-xs space-y-3.5">
      <div className="flex items-center gap-3.5">
        <UserAvatar
          photoURL={userProfile?.photoURL || currentUser.photoURL}
          displayName={displayName}
          email={currentUser.email}
          size="lg"
          showOnlineBadge={true}
          role={role}
          alt={displayName}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-sm text-[#1A1836] truncate leading-snug">
              {displayName}
            </h4>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A54055]/15 text-[#A54055] border border-[#A54055]/30">
                <ShieldCheck className="w-3 h-3 text-[#A54055]" />
                <span>{t("Admin", "Admin")}</span>
              </span>
            )}
            {role === "seller" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#622347]/15 text-[#622347] border border-[#622347]/30">
                <Store className="w-3 h-3 text-[#622347]" />
                <span>{t("Vendeur", "Vendeur")}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5 font-normal">
            {currentUser.email}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-[#FAF7F8]">
        <button
          type="button"
          onClick={() => {
            onNavigate("/dashboard/buyer");
            onClose();
          }}
          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#FAF7F8] hover:bg-[#E0B4B2]/20 text-[#1A1836] text-xs font-bold transition-all border border-[#E0B4B2]/40 active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#622347] border border-[#E0B4B2]/40 shadow-2xs">
              <UserIcon className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <span>{t("Mon Espace Client")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 rtl:rotate-180" />
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              onNavigate("/dashboard/admin");
              onClose();
            }}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#A54055]/10 hover:bg-[#A54055]/15 text-[#A54055] text-xs font-bold transition-all border border-[#A54055]/25 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#A54055] text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>{t("Espace Administration")}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A54055] rtl:rotate-180" />
          </button>
        )}

        {isSeller && (
          <button
            type="button"
            onClick={() => {
              onNavigate("/dashboard/seller");
              onClose();
            }}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#1A1836] hover:bg-[#42164B] text-white text-xs font-bold transition-all border border-[#622347] active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#E99856] text-[#1A1836] flex items-center justify-center shadow-2xs">
                <Store className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>{t("Espace Vendeur Pro")}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#E99856] rtl:rotate-180" />
          </button>
        )}

        {onLogout && (
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-rose-50/90 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200/90 active:scale-98 cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-200/80 text-rose-700 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span>{t("Se déconnecter", "Se déconnecter")}</span>
            </div>
            <span className="text-[11px] text-rose-600 font-semibold">{t("Déconnexion")}</span>
          </button>
        )}
      </div>
    </div>
  );
};
