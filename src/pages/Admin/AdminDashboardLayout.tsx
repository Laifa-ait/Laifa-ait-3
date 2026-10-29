import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, LogOut, Menu, X, Home, Monitor, LayoutDashboard, LayoutGrid, Store, MessageSquare } from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth } from "../../lib/firebase";
import { AdminInternalNotifications } from "../../components/Admin/AdminInternalNotifications";
import { AdminSidebarMenu } from "../../components/Admin/AdminSidebarMenu";
import { getNavGroups } from "./navigation";

export const AdminDashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/auth", { replace: true });
  };

  const navGroups = getNavGroups(t);
  const toggleGroup = (id: string) => setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeBreadcrumb = (() => {
    for (const g of navGroups) {
      const found = g.items.find((it) =>
        it.end ? location.pathname === it.to : location.pathname === it.to || location.pathname.startsWith(it.to + "/")
      );
      if (found) return { group: g.title, label: found.label };
    }
    return null;
  })();

  const mobileTabs = [
    { to: "/dashboard/admin", label: "KPIs", icon: LayoutDashboard, end: true },
    { to: "/dashboard/admin/orders", label: "Commandes", icon: LayoutGrid },
    { to: "/dashboard/admin/sellers", label: "Vendeurs", icon: Store },
    { to: "/dashboard/admin/support", label: "Support", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-between w-full h-14 px-3 bg-[#1A1836] text-white border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Ouvrir le menu admin"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-xl text-[#E0B4B2] bg-transparent border-none cursor-pointer shrink-0"
            id="admin-mobile-menu-open"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <span className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#E99856] truncate">
              {activeBreadcrumb?.group || t("OLMA ADMIN")}
            </span>
            <span className="block text-xs font-sans font-extrabold tracking-tight text-white truncate">
              {activeBreadcrumb?.label || t("Tableau de Bord")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <AdminInternalNotifications />
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Retour à la boutique"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#E0B4B2] hover:text-white bg-transparent border-none cursor-pointer rounded-xl"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed start-0 top-0 bottom-0 w-[86vw] max-w-[320px] bg-gradient-to-b from-[#1A1836] via-[#2A173B] to-[#1A1836] z-[60] flex flex-col text-white lg:hidden shadow-2xl"
            >
              <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A54055] to-[#E99856] flex items-center justify-center text-white">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-sans font-bold text-white">{t("OLMA ADMIN")}</h1>
                    <p className="text-[9px] font-bold text-[#E99856] uppercase tracking-widest">{t("Marketplace Control")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Fermer le menu"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-xl text-[#E0B4B2] bg-transparent border-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3.5 overflow-y-auto">
                <AdminSidebarMenu
                  navGroups={navGroups}
                  menuSearch={menuSearch}
                  setMenuSearch={setMenuSearch}
                  collapsedGroups={collapsedGroups}
                  toggleGroup={toggleGroup}
                  onItemClick={() => setIsMobileNavOpen(false)}
                />
              </nav>
              <div className="p-3.5 border-t border-white/10 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setIsMobileNavOpen(false); navigate("/"); }}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-3 rounded-xl text-[10px] uppercase tracking-wider font-bold text-[#E0B4B2] bg-white/5 border border-white/10 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#E99856]" />
                  {t("Boutique")}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsMobileNavOpen(false); void handleLogout(); }}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-3 rounded-xl text-[10px] uppercase tracking-wider font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {t("Sortir")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside className="w-80 bg-gradient-to-b from-[#1A1836] via-[#28163B] to-[#1A1836] border-r border-white/10 sticky top-0 h-screen hidden lg:flex flex-col text-white shrink-0 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A54055] to-[#E99856] flex items-center justify-center text-white shadow-lg shadow-[#A54055]/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-sans font-bold tracking-tight text-white">{t("OLMA ADMIN")}</h1>
            <p className="text-[10px] font-sans font-bold text-[#E99856] uppercase tracking-widest">{t("Core Marketplace")}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <AdminSidebarMenu
            navGroups={navGroups}
            menuSearch={menuSearch}
            setMenuSearch={setMenuSearch}
            collapsedGroups={collapsedGroups}
            toggleGroup={toggleGroup}
          />
        </nav>
        <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[10px] uppercase tracking-wider font-bold text-[#E0B4B2] hover:bg-white/10 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#E99856]" />
            {t("Boutique")}
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[10px] uppercase tracking-wider font-bold text-rose-300 hover:bg-rose-500/20 hover:text-white bg-rose-500/10 border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t("Sortir")}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        <header className="hidden lg:flex h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 px-10 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.18em] text-[#1A1836]">
              {t("Olmart Core Control • 69 Wilayas")}
            </span>
            {activeBreadcrumb && (
              <div className="flex items-center gap-2 ms-3 ps-3 border-s border-zinc-200 text-xs">
                <span className="font-bold text-[#A54055] uppercase tracking-wider text-[10px]">{activeBreadcrumb.group}</span>
                <span className="text-zinc-300">/</span>
                <span className="font-extrabold text-[#1A1836]">{activeBreadcrumb.label}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 bg-zinc-100 rounded-full px-4 py-2 border border-zinc-200">
              <Monitor className="w-3.5 h-3.5 text-[#A54055]" />
              <span className="text-[10px] font-sans font-bold text-zinc-700 uppercase tracking-widest">
                {auth.currentUser?.email}
              </span>
            </div>
            <div className="bg-[#1A1836] px-2.5 py-1.5 rounded-xl shadow-md">
              <AdminInternalNotifications />
            </div>
          </div>
        </header>
        <div className="p-3.5 sm:p-6 md:p-8 lg:p-10 pb-24 lg:pb-12">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Accès rapide mobile admin"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#1A1836]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 items-center px-1"
      >
        {mobileTabs.map((tab) => {
          const isActive = tab.end
            ? location.pathname === tab.to
            : location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                isActive ? "text-[#E99856]" : "text-[#E0B4B2]/75 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[9px] font-sans font-bold uppercase tracking-tight truncate max-w-[64px]">{tab.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[#E0B4B2]/75 hover:text-white bg-transparent border-none cursor-pointer"
        >
          <Menu className="w-4 h-4 text-[#A54055]" />
          <span className="text-[9px] font-sans font-bold uppercase tracking-tight">Menu (26)</span>
        </button>
      </nav>
    </div>
  );
};



