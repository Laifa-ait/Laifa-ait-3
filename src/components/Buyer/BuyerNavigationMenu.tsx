import React from "react";
import {
  Search,
  SlidersHorizontal,
  User,
  MapPin,
  Package,
  ShieldCheck,
  Heart,
  Store,
  Star,
  RotateCcw,
  FolderLock,
  Headphones,
  Info,
  ChevronRight,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export type SettingTab =
  | "index"
  | "general"
  | "profile"
  | "addresses"
  | "orders"
  | "security"
  | "preferences"
  | "following"
  | "reviews"
  | "returns"
  | "documents"
  | "support"
  | "about";

export interface BuyerMenuItem {
  id: SettingTab;
  icon: React.FC<{ className?: string }>;
  title: string;
  subtitle: string;
  badge?: number;
  accentColor: string;
  accentBg: string;
}

export interface BuyerMenuGroup {
  groupTitle: string;
  items: BuyerMenuItem[];
}

interface BuyerNavigationMenuProps {
  activeTab: SettingTab;
  onSelectTab: (tab: SettingTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  ordersCount: number;
  addressesCount: number;
}

export const useBuyerMenuGroups = (ordersCount: number, addressesCount: number): BuyerMenuGroup[] => {
  const { t } = useTranslation();

  return React.useMemo(
    () => [
      {
        groupTitle: t("Activité & Achats"),
        items: [
          { id: "orders", icon: Package, title: t("Commandes et suivi"), subtitle: t("Historique d'achats, reçus et suivi 69 wilayas"), badge: ordersCount > 0 ? ordersCount : undefined, accentColor: "text-[#A54055]", accentBg: "bg-[#A54055]/10" },
          { id: "returns", icon: RotateCcw, title: t("Retours et réclamations"), subtitle: t("Demandes de retour directes auprès des vendeurs"), accentColor: "text-[#E99856]", accentBg: "bg-[#E99856]/15" },
          { id: "reviews", icon: Star, title: t("Avis et évaluations"), subtitle: t("Notes déposées et produits livrés à évaluer"), accentColor: "text-[#E99856]", accentBg: "bg-[#E99856]/15" },
          { id: "following", icon: Store, title: t("Boutiques suivies"), subtitle: t("Commerçants certifiés et artisans favoris"), accentColor: "text-[#622347]", accentBg: "bg-[#622347]/10" },
        ],
      },
      {
        groupTitle: t("Mon Compte & Livraison"),
        items: [
          { id: "profile", icon: User, title: t("Informations personnelles"), subtitle: t("Nom, email, téléphone et photo de profil"), accentColor: "text-[#42164B]", accentBg: "bg-[#42164B]/10" },
          { id: "addresses", icon: MapPin, title: t("Carnet d'adresses (69 Wilayas)"), subtitle: t("Lieux de livraison à domicile et stop-desk"), badge: addressesCount > 0 ? addressesCount : undefined, accentColor: "text-[#A54055]", accentBg: "bg-[#A54055]/10" },
          { id: "preferences", icon: Heart, title: t("Préférences d'achat"), subtitle: t("Centres d'intérêt et rayons personnalisés"), accentColor: "text-[#A54055]", accentBg: "bg-[#A54055]/10" },
        ],
      },
      {
        groupTitle: t("Sécurité & Documents"),
        items: [
          { id: "security", icon: ShieldCheck, title: t("Connexion et sécurité"), subtitle: t("Mot de passe, protection du compte et accès"), accentColor: "text-emerald-700", accentBg: "bg-emerald-500/10" },
          { id: "documents", icon: FolderLock, title: t("Coffre-fort Documents"), subtitle: t("Factures certifiées et pièces justificatives"), accentColor: "text-[#1A1836]", accentBg: "bg-[#1A1836]/10" },
        ],
      },
      {
        groupTitle: t("Système & Assistance"),
        items: [
          { id: "general", icon: SlidersHorizontal, title: t("Affichage et alertes"), subtitle: t("Langue FR/AR, devise DZD et notifications"), accentColor: "text-[#622347]", accentBg: "bg-[#622347]/10" },
          { id: "support", icon: Headphones, title: t("Assistance & Support"), subtitle: t("Tickets d'aide et médiation plateforme Olmart"), accentColor: "text-[#A54055]", accentBg: "bg-[#A54055]/10" },
          { id: "about", icon: Info, title: t("À propos d'Olmart"), subtitle: t("Rôle d'intermédiaire, CGU et confidentialité"), accentColor: "text-[#42164B]", accentBg: "bg-[#42164B]/10" },
        ],
      },
    ],
    [t, ordersCount, addressesCount]
  );
};

export const BuyerNavigationMenu: React.FC<BuyerNavigationMenuProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  ordersCount,
  addressesCount,
}) => {
  const { t } = useTranslation();
  const groups = useBuyerMenuGroups(ordersCount, addressesCount);

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 text-[#622347] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("Rechercher une rubrique...")}
          className="w-full pl-10 pr-9 py-2.5 bg-white hover:bg-[#FAF7F8] focus:bg-white text-xs sm:text-sm rounded-2xl border border-[#E0B4B2]/50 focus:border-[#A54055] focus:ring-2 focus:ring-[#A54055]/15 outline-none transition-all text-[#1A1836] placeholder:text-[#622347]/60 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label={t("Effacer la recherche")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#622347] hover:text-[#1A1836] border-none bg-transparent cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelectTab("index")}
        className={`hidden lg:flex w-full items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
          activeTab === "index"
            ? "bg-gradient-to-r from-[#1A1836] to-[#42164B] text-white border-[#42164B] shadow-md"
            : "bg-white hover:bg-[#FAF7F8] text-[#1A1836] border-[#E0B4B2]/40 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTab === "index" ? "bg-white/15 text-[#E99856]" : "bg-[#1A1836]/10 text-[#1A1836]"}`}>
            <LayoutDashboard className="w-4.5 h-4.5" />
          </div>
          <div className="text-left rtl:text-right">
            <p className="text-xs sm:text-sm font-bold">{t("Vue d'ensemble")}</p>
            <p className={`text-[11px] ${activeTab === "index" ? "text-[#E0B4B2]" : "text-zinc-500"}`}>
              {t("Résumé de votre activité et accès rapides")}
            </p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 shrink-0 rtl:rotate-180 ${activeTab === "index" ? "text-[#E99856]" : "text-zinc-400"}`} />
      </button>

      {filteredGroups.map((group) => (
        <div key={group.groupTitle} className="bg-white rounded-2xl border border-[#E0B4B2]/40 overflow-hidden shadow-2xs">
          <div className="px-4 py-2.5 bg-[#FAF7F8] border-b border-[#E0B4B2]/30">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#622347]">{group.groupTitle}</h3>
          </div>
          <div className="divide-y divide-[#FAF7F8]">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 text-left rtl:text-right transition-colors cursor-pointer border-none min-h-[60px] ${
                    isSelected ? "bg-[#A54055]/10 text-[#1A1836]" : "bg-white hover:bg-[#FAF7F8] text-[#1A1836]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-[#A54055] text-white shadow-xs" : `${item.accentBg} ${item.accentColor}`}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? "text-[#A54055]" : "text-[#1A1836]"}`}>
                          {item.title}
                        </p>
                        {item.badge !== undefined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E99856]/20 text-[#A54055] tabular-nums">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 rtl:rotate-180 ${isSelected ? "text-[#A54055]" : "text-zinc-400"}`} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
