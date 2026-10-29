import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Compass, CarFront, Plus, Heart, User } from "lucide-react";
import { useVehicleFavorites } from "../../hooks/useVehicleFavorites";

export const OlmaAutoBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { count: favoritesCount } = useVehicleFavorites();

  const isExplorerActive =
    (location.pathname === "/auto" ||
      location.pathname.startsWith("/auto/catalog") ||
      location.pathname.startsWith("/auto/vehicules")) &&
    !location.search.includes("tab=favorites") &&
    !location.search.includes("brand=");

  const isAddActive = location.pathname.startsWith("/auto/deposer");
  const isFavoritesActive = location.search.includes("tab=favorites");
  const isDashboardActive =
    (location.pathname.startsWith("/auto/dashboard") ||
      location.pathname.startsWith("/auto/mon-garage") ||
      location.pathname.startsWith("/dashboard/seller/auto")) &&
    !isFavoritesActive;

  const openBrandPicker = () => {
    window.dispatchEvent(new CustomEvent("olmart:open-auto-brand-picker"));
  };

  const navItems = [
    {
      id: "explorer",
      label: "Explorer",
      icon: Compass,
      isActive: isExplorerActive,
      onClick: () => navigate("/auto"),
    },
    {
      id: "marques",
      label: "Par Marque",
      icon: CarFront,
      isActive: Boolean(location.search.includes("brand=")),
      onClick: openBrandPicker,
    },
    {
      id: "ajouter",
      label: "Ajouter",
      icon: Plus,
      isSpecial: true,
      isActive: isAddActive,
      onClick: () => navigate("/auto/deposer"),
    },
    {
      id: "favoris",
      label: "Favoris",
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      isActive: isFavoritesActive,
      onClick: () => navigate("/auto/dashboard?tab=favorites"),
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: User,
      isActive: isDashboardActive,
      onClick: () => navigate("/auto/dashboard"),
    },
  ];

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] px-2 pt-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))]"
    >
      <nav className="grid grid-cols-5 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center justify-center -mt-4 cursor-pointer focus:outline-none bg-transparent border-none active:scale-95 transition-transform"
                aria-label="Ajouter un véhicule"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md border-2 border-white ${
                    item.isActive
                      ? "bg-slate-900 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.6]" />
                </div>
                <span className="text-[10px] font-extrabold text-blue-600 mt-0.5 tracking-tight">
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
              className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer bg-transparent border-none ${
                item.isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative flex items-center justify-center w-7 h-7">
                <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.4]" : "stroke-[1.9]"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 bg-blue-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 tabular-nums">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  item.isActive ? "font-extrabold text-blue-600" : "font-medium text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
