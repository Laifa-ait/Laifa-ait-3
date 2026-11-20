import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutGrid,
  Menu,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Compass,
  Wrench,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMyArtisanProfile, fetchClientMyRequests } from "../../services/artisan.api";
import { ArtisanProfile } from "../../types/artisan";
import { ArtisanSideDrawer } from "./ArtisanSideDrawer";
import { SuperAppSwitcherModal } from "../common/SuperAppSwitcherModal";
import { OlmaArtisanUserMenu } from "./shell/OlmaArtisanUserMenu";
import { OlmaLanguageSelector } from "../common/OlmaLanguageSelector";

interface ArtisanNavbarProps {
  activeTab?: string;
}

export const ArtisanNavbar: React.FC<ArtisanNavbarProps> = ({
  activeTab = "explorer",
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [myArtisanProfile, setMyArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [clientQuotesCount, setClientQuotesCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setLoadingProfile(true);
      fetchMyArtisanProfile()
        .then((profile) => setMyArtisanProfile(profile))
        .finally(() => setLoadingProfile(false));

      fetchClientMyRequests()
        .then((quotes) => setClientQuotesCount(quotes.length))
        .catch(() => setClientQuotesCount(0));
    } else {
      setMyArtisanProfile(null);
      setClientQuotesCount(0);
    }
  }, [currentUser]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + SuperApp Switcher */}
          <div className="flex items-center gap-3">
            <Link to="/artisans" className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-[#0F172A] font-['Playfair_Display',serif] select-none">
                OLMA
              </span>
              <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                ARTISANS
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsSwitcherOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:text-[#0F172A] hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
              title="Changer d'univers Olmart"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Applications</span>
            </button>
          </div>

          {/* Center: 100% Demandeur de Travaux Navigation */}
          <nav
            aria-label="Navigation Demandeur"
            className="hidden md:flex items-center gap-1 bg-slate-100 rounded-xl border border-slate-200/70 p-1"
          >
            <button
              type="button"
              onClick={() => navigate("/artisans")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "explorer"
                  ? "bg-white text-[#0F172A] shadow-2xs"
                  : "text-slate-600 hover:text-[#0F172A]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Offres de travaux</span>
            </button>

            <button
              type="button"
              onClick={() =>
                currentUser
                  ? navigate("/artisans/mes-demandes")
                  : navigate("/auth?redirect=/artisans/mes-demandes")
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "quotes"
                  ? "bg-white text-[#0F172A] shadow-2xs"
                  : "text-slate-600 hover:text-[#0F172A]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mes devis</span>
              {clientQuotesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#1E3A8A] text-white text-[10px] font-bold tabular-nums">
                  {clientQuotesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                currentUser
                  ? navigate("/artisans/messages")
                  : navigate("/auth?redirect=/artisans/messages")
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "messages"
                  ? "bg-white text-[#0F172A] shadow-2xs"
                  : "text-slate-600 hover:text-[#0F172A]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messagerie</span>
            </button>
          </nav>

          {/* Right: Discreet Artisan Portal Link + User Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <OlmaLanguageSelector variant="compact" />

            {loadingProfile ? (
              <div className="h-9 w-28 bg-slate-100 animate-pulse rounded-xl" />
            ) : myArtisanProfile ? (
              <button
                type="button"
                onClick={() => navigate("/artisans/dashboard")}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 bg-white transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Espace Artisan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    currentUser
                      ? "/artisans/devenir-artisan"
                      : "/auth?redirect=/artisans/devenir-artisan"
                  )
                }
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0F172A] px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                <span>Espace Artisan</span>
              </button>
            )}

            <OlmaArtisanUserMenu
              artisanProfile={myArtisanProfile}
              clientQuotesCount={clientQuotesCount}
            />

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Ouvrir le menu complet"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <ArtisanSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        artisanProfile={myArtisanProfile}
        loadingProfile={loadingProfile}
      />

      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
