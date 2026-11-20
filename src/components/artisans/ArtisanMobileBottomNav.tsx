import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  FileText,
  MessageSquare,
  LayoutGrid,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMyArtisanProfile, fetchClientMyRequests } from "../../services/artisan.api";
import { ArtisanProfile } from "../../types/artisan";
import { SuperAppSwitcherModal } from "../common/SuperAppSwitcherModal";

export const ArtisanMobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [myArtisanProfile, setMyArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [quotesCount, setQuotesCount] = useState<number>(0);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchMyArtisanProfile()
        .then((profile) => setMyArtisanProfile(profile))
        .catch(() => setMyArtisanProfile(null));

      fetchClientMyRequests()
        .then((quotes) => setQuotesCount(quotes.length))
        .catch(() => setQuotesCount(0));
    } else {
      setMyArtisanProfile(null);
      setQuotesCount(0);
    }
  }, [currentUser]);

  const isExplorerActive =
    location.pathname === "/artisans" ||
    location.pathname === "/bricolage" ||
    location.pathname.startsWith("/artisans/offres");
  const isQuotesActive = location.pathname === "/artisans/mes-demandes";
  const isMessagesActive = location.pathname.startsWith("/artisans/messages");
  const isArtisanSpaceActive =
    location.pathname.startsWith("/artisans/dashboard") ||
    location.pathname === "/artisans/devenir-artisan";

  const navItems = [
    {
      id: "explorer",
      label: "Offres",
      icon: Compass,
      isActive: isExplorerActive,
      onClick: () => navigate("/artisans"),
    },
    {
      id: "quotes",
      label: "Mes devis",
      icon: FileText,
      isActive: isQuotesActive,
      badgeCount: quotesCount,
      onClick: () =>
        currentUser
          ? navigate("/artisans/mes-demandes")
          : navigate("/auth?redirect=/artisans/mes-demandes"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      isActive: isMessagesActive,
      onClick: () =>
        currentUser
          ? navigate("/artisans/messages")
          : navigate("/auth?redirect=/artisans/messages"),
    },
    {
      id: "switcher",
      label: "Apps",
      icon: LayoutGrid,
      isActive: isSwitcherOpen,
      onClick: () => setIsSwitcherOpen(true),
    },
    {
      id: "artisan-space",
      label: "Artisan",
      icon: LayoutDashboard,
      isActive: isArtisanSpaceActive,
      onClick: () => {
        if (!currentUser) {
          navigate("/auth?redirect=/artisans/devenir-artisan");
        } else if (myArtisanProfile) {
          navigate("/artisans/dashboard");
        } else {
          navigate("/artisans/devenir-artisan");
        }
      },
    },
  ];

  return (
    <>
      <div
        className="md:hidden fixed bottom-0 inset-x-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-slate-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <nav className="w-full max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge =
              "badgeCount" in item && typeof item.badgeCount === "number" && item.badgeCount > 0
                ? item.badgeCount
                : null;

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] transition-colors relative cursor-pointer ${
                  item.isActive ? "text-[#1E3A8A] font-semibold" : "text-slate-500"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge !== null && (
                    <span className="absolute -top-1.5 -right-2 bg-[#1E3A8A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center tabular-nums">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
