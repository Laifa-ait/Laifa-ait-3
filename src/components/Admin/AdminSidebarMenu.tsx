import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminNavGroup } from "../../pages/Admin/navigation";

interface AdminSidebarMenuProps {
  navGroups: AdminNavGroup[];
  menuSearch: string;
  setMenuSearch: (val: string) => void;
  collapsedGroups: Record<string, boolean>;
  toggleGroup: (id: string) => void;
  onItemClick?: () => void;
}

export const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({
  navGroups,
  menuSearch,
  setMenuSearch,
  collapsedGroups,
  toggleGroup,
  onItemClick,
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="space-y-3.5">
      <div className="px-1 relative">
        <Search className="w-3.5 h-3.5 text-[#E0B4B2]/60 absolute start-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={menuSearch}
          onChange={(e) => setMenuSearch(e.target.value)}
          placeholder={t("Filtrer les 26 menus admin...")}
          className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-[#E0B4B2]/50 focus:outline-none focus:border-[#E99856]"
        />
      </div>

      {navGroups.map((group) => {
        const filteredItems = group.items.filter((item) =>
          item.label.toLowerCase().includes(menuSearch.trim().toLowerCase())
        );
        if (filteredItems.length === 0) return null;

        const hasActiveChild = filteredItems.some((item) =>
          item.end ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(item.to + "/")
        );
        const isCollapsed = menuSearch.trim() === "" && Boolean(collapsedGroups[group.id]) && !hasActiveChild;

        return (
          <div key={group.id} className="rounded-2xl bg-white/[0.03] border border-white/5 p-2">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="w-full min-h-[38px] flex items-center justify-between px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-[#E99856] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
            >
              <span className="truncate">{group.title}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                  isCollapsed ? "-rotate-90" : "rotate-0"
                }`}
              />
            </button>

            {!isCollapsed && (
              <div className="space-y-1 mt-1">
                {filteredItems.map((item) => {
                  const isActive = item.end
                    ? location.pathname === item.to
                    : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onItemClick}
                      className={`min-h-[42px] flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#A54055] to-[#E99856] text-white shadow-lg shadow-[#A54055]/30"
                          : "text-[#E0B4B2]/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[9px] font-extrabold text-white shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
