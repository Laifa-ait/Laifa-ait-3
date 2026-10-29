import React from "react";
import {
  X,
  LayoutDashboard,
  Package,
  ShieldCheck,
  MapPin,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserAvatar } from "../ui/UserAvatar";

interface GoogleAccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAccountMenu: React.FC<GoogleAccountMenuProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/");
  };

  const displayName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Utilisateur";

  const quickLinks = [
    {
      label: t("Mon Espace Client"),
      sub: t("Vue d'ensemble, commandes et préférences"),
      icon: LayoutDashboard,
      path: "/dashboard/buyer",
    },
    {
      label: t("Commandes et suivi"),
      sub: t("Suivi des colis et factures"),
      icon: Package,
      path: "/dashboard/buyer?tab=orders",
    },
    {
      label: t("Adresses (69 Wilayas)"),
      sub: t("Domicile et points relais"),
      icon: MapPin,
      path: "/dashboard/buyer?tab=addresses",
    },
    {
      label: t("Sécurité et connexion"),
      sub: t("Mot de passe et protection"),
      icon: ShieldCheck,
      path: "/dashboard/buyer?tab=security",
    },
    {
      label: t("Assistance & Support"),
      sub: t("Tickets d'aide et médiation"),
      icon: HelpCircle,
      path: "/dashboard/buyer?tab=support",
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-start sm:justify-end sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-[#1A1836]/45 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full sm:w-[390px] max-w-full bg-white rounded-t-[32px] sm:rounded-[28px] shadow-2xl border border-[#E0B4B2]/50 z-[130] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="w-12 h-1 bg-[#E0B4B2] rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[#1A1836] font-black text-base tracking-tight">OLMART</span>
            <span className="text-xs text-[#A54055] font-bold">• {t("Mon Compte")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Fermer")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#622347] hover:text-[#1A1836] hover:bg-[#FAF7F8] transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-1 pb-4 flex flex-col items-center text-center shrink-0">
          <div className="relative mb-2">
            <UserAvatar
              photoURL={userProfile?.photoURL || currentUser?.photoURL}
              displayName={displayName}
              email={currentUser?.email}
              providerData={currentUser?.providerData}
              size="xl"
              alt={displayName}
            />
            <button
              type="button"
              onClick={() => handleNav("/dashboard/buyer?tab=profile")}
              title={t("Modifier la photo")}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#E0B4B2] shadow-xs flex items-center justify-center text-[#622347] hover:text-[#A54055] hover:border-[#A54055] transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="font-extrabold text-base text-[#1A1836] truncate max-w-[280px]">{displayName}</h3>
          <p className="text-xs text-zinc-500 truncate max-w-[280px]">{currentUser?.email}</p>

          <span className="mt-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#A54055]/10 text-[#A54055] border border-[#A54055]/25">
            {userProfile?.role === "admin"
              ? t("Compte Administrateur")
              : userProfile?.role === "seller"
              ? t("Compte Vendeur Pro")
              : t("Compte Client")}
          </span>

          <button
            type="button"
            onClick={() => handleNav("/dashboard/buyer")}
            className="mt-3 px-5 py-2 rounded-xl bg-gradient-to-r from-[#1A1836] to-[#42164B] text-white hover:brightness-110 font-bold text-xs shadow-xs transition-all cursor-pointer border-none"
          >
            {t("Accéder à mon espace client")}
          </button>
        </div>

        <div className="px-4 pb-20 sm:pb-4 overflow-y-auto space-y-2">
          <div className="bg-[#FAF7F8] rounded-2xl border border-[#E0B4B2]/40 p-1.5 shadow-2xs space-y-0.5">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white hover:shadow-2xs transition-all group cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#622347] group-hover:text-white group-hover:bg-[#A54055] flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left rtl:text-right">
                      <p className="text-xs font-bold text-[#1A1836] group-hover:text-[#A54055] transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-zinc-500">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#A54055] rtl:rotate-180 transition-colors" />
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("Déconnexion")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
