import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  FileText,
  MessageSquare,
  Megaphone,
  Settings,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ArtisanProfile } from "../../../types/artisan";

export type ArtisanDashboardTab =
  | "overview"
  | "offers"
  | "publish"
  | "quotes"
  | "messages"
  | "ads"
  | "settings";

interface ArtisanDashboardLayoutProps {
  profile: ArtisanProfile;
  activeTab: ArtisanDashboardTab;
  onSelectTab: (tab: ArtisanDashboardTab) => void;
  offersCount: number;
  pendingQuotesCount: number;
  updatingAvailability: boolean;
  onToggleAvailability: () => void;
  children: React.ReactNode;
}

const TAB_LABELS: Record<ArtisanDashboardTab, string> = {
  overview: "Vue d'ensemble",
  offers: "Mes Offres de Travaux",
  publish: "Publier une Offre",
  quotes: "Demandes & Devis",
  messages: "Messagerie Clients",
  ads: "Publicité & Boost (Olma Ads)",
  settings: "Mon Profil & Disponibilité",
};

export const ArtisanDashboardLayout: React.FC<ArtisanDashboardLayoutProps> = ({
  profile,
  activeTab,
  onSelectTab,
  offersCount,
  pendingQuotesCount,
  updatingAvailability,
  onToggleAvailability,
  children,
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{
    id: ArtisanDashboardTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }> = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "offers", label: "Mes Offres", icon: Briefcase, badge: offersCount },
    { id: "publish", label: "Publier une offre", icon: PlusCircle },
    { id: "quotes", label: "Demandes & Devis", icon: FileText, badge: pendingQuotesCount },
    { id: "messages", label: "Messagerie Clients", icon: MessageSquare },
    { id: "ads", label: "Publicité & Boost", icon: Megaphone },
    { id: "settings", label: "Profil & Zone", icon: Settings },
  ];

  const handleSelect = (tab: ArtisanDashboardTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/artisans")}
            className="text-left cursor-pointer"
          >
            <span className="text-lg font-extrabold text-[#0F172A] font-['Playfair_Display',serif]">
              OLMA
            </span>
            <span className="ml-1.5 text-[10px] font-bold tracking-widest uppercase text-[#1E3A8A]">
              ESPACE ARTISAN
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <p className="text-xs font-bold text-[#0F172A] truncate">
            {profile.professionalName || profile.fullName}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {profile.tradeName} · {profile.wilaya}
          </p>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
              profile.status === "approved"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {profile.status === "approved" ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Profil vérifié</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                <span>En cours de vérification</span>
              </>
            )}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? "bg-[#1E3A8A] text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-[#0F172A]"
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.badge === "number" && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                    active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate("/artisans")}
          className="w-full h-9 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-[#0F172A] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Voir la vitrine clients</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Desktop 260px Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-xl z-10">
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
              aria-label="Ouvrir la navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500">Espace Artisan Indépendant</p>
              <h1 className="text-sm sm:text-base font-bold text-[#0F172A] truncate">
                {TAB_LABELS[activeTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={updatingAvailability}
              onClick={onToggleAvailability}
              className={`h-9 px-3 rounded-xl text-xs font-semibold border inline-flex items-center gap-2 transition-colors cursor-pointer ${
                profile.isAvailable
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  profile.isAvailable ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <span>{profile.isAvailable ? "Disponible" : "Indisponible"}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("publish")}
              className="hidden sm:inline-flex h-9 px-3.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-semibold items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nouvelle offre</span>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};
