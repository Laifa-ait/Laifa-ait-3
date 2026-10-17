import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const OlmaAutoBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();

  const isHomeActive = location.pathname === "/auto";
  const isSearchActive = location.pathname.startsWith("/auto/catalog") && !location.search.includes("tab=favorites");
  const isVendreActive = location.pathname === "/auto/deposer";
  const isFavoritesActive = location.search.includes("tab=favorites");
  const isAccountActive =
    location.pathname.startsWith("/dashboard/seller/auto") ||
    location.pathname.startsWith("/profile");

  const handleAccountClick = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else window.dispatchEvent(new CustomEvent("auth:openModal", { detail: { mode: "login" } }));
      return;
    }
    navigate("/dashboard/seller/auto");
  };

  const navItems = [
    {
      id: "home",
      label: "Accueil",
      icon: Home,
      isActive: isHomeActive,
      onClick: () => navigate("/auto"),
    },
    {
      id: "search",
      label: "Rechercher",
      icon: Search,
      isActive: isSearchActive,
      onClick: () => navigate("/auto/catalog"),
    },
    {
      id: "vendre",
      label: "Vendre",
      icon: Plus,
      isSpecial: true,
      isActive: isVendreActive,
      onClick: () => navigate("/auto/deposer"),
    },
    {
      id: "favorites",
      label: "Favoris",
      icon: Heart,
      isActive: isFavoritesActive,
      onClick: () => navigate("/auto/catalog?tab=favorites"),
    },
    {
      id: "account",
      label: "Compte",
      icon: User,
      isActive: isAccountActive,
      onClick: handleAccountClick,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0B1730]/98 backdrop-blur-md border-t border-[#172B4D] shadow-[0_-4px_25px_rgba(0,0,0,0.5)] px-2 py-1.5 pb-safe">
      <nav className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center justify-center -mt-6 group cursor-pointer focus:outline-none"
                aria-label={item.label}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 border-2 border-[#0B1730] shadow-[0_8px_20px_rgba(217,246,111,0.4)] ${
                    item.isActive
                      ? "bg-gradient-to-br from-[#E2FB7D] to-[#C5E94F] text-[#0B1730] scale-105 ring-2 ring-[#D9F66F]"
                      : "bg-gradient-to-br from-[#D9F66F] via-[#E2FB7D] to-[#C5E94F] text-[#0B1730] group-hover:scale-105"
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-black text-[#D9F66F] mt-1 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
                item.isActive ? "text-[#D9F66F]" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] font-bold mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
