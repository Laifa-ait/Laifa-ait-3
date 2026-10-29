import {
  LayoutDashboard,
  Palette,
  Package,
  ShoppingBag,
  Truck,
  RotateCcw,
  Sparkles,
  BarChart3,
  AlertTriangle,
  Star,
  Tag,
  Settings,
  ShieldCheck,
  LifeBuoy,
  LucideIcon,
} from "lucide-react";
import { TFunction } from "i18next";

export interface SellerNavItem {
  id?: string;
  to: string;
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  end?: boolean;
}

export interface SellerNavGroup {
  groupId: string;
  groupTitle: string;
  items: SellerNavItem[];
}

export function getSellerNavGroups(t: TFunction): SellerNavGroup[] {
  return [
    {
      groupId: "pilotage",
      groupTitle: t("Pilotage & Performance"),
      items: [
        {
          id: "seller-nav-overview",
          to: "/dashboard/seller",
          icon: LayoutDashboard,
          label: t("seller.menu.overview", "Vue d'ensemble"),
          subtitle: t("KPIs, chiffre d'affaires et santé boutique"),
          end: true,
        },
        {
          id: "seller-nav-analytics",
          to: "/dashboard/seller/analytics",
          icon: BarChart3,
          label: t("seller.menu.analytics", "Statistiques & Ventes"),
          subtitle: t("Analyses détaillées et conversions"),
        },
      ],
    },
    {
      groupId: "catalog",
      groupTitle: t("Boutique & Catalogue"),
      items: [
        {
          id: "seller-nav-catalog",
          to: "/dashboard/seller/catalog",
          icon: Package,
          label: t("seller.menu.catalog", "Catalogue Produits"),
          subtitle: t("Gestion des stocks, prix DZD et variantes"),
        },
        {
          id: "seller-nav-studio",
          to: "/dashboard/seller/studio",
          icon: Palette,
          label: t("seller.menu.studio", "Studio Vitrine"),
          subtitle: t("Personnalisation visuelle de votre boutique"),
        },
      ],
    },
    {
      groupId: "logistics",
      groupTitle: t("Commandes & Logistique (69 Wilayas)"),
      items: [
        {
          id: "seller-nav-orders",
          to: "/dashboard/seller/orders",
          icon: ShoppingBag,
          label: t("seller.menu.orders", "Commandes Clients"),
          subtitle: t("Traitement, bordereaux et suivi colis"),
        },
        {
          id: "seller-nav-shipping",
          to: "/dashboard/seller/shipping",
          icon: Truck,
          label: t("seller.menu.shipping", "Expéditions & Tarifs"),
          subtitle: t("Grille tarifaire domicile & stop-desk"),
        },
        {
          id: "seller-nav-returns",
          to: "/dashboard/seller/returns",
          icon: RotateCcw,
          label: t("seller.menu.returns", "Retours & Échanges"),
          subtitle: t("Validation des retours et remboursements"),
        },
        {
          id: "seller-nav-disputes",
          to: "/dashboard/seller/disputes",
          icon: AlertTriangle,
          label: t("seller.menu.disputes", "Litiges & Médiation"),
          subtitle: t("Dossiers de réclamation et messagerie"),
        },
      ],
    },
    {
      groupId: "marketing",
      groupTitle: t("Croissance & Réputation"),
      items: [
        {
          id: "seller-nav-coupons",
          to: "/dashboard/seller/coupons",
          icon: Tag,
          label: t("seller.menu.coupons", "Codes Promo & Coupons"),
          subtitle: t("Campagnes de réduction et fidélisation"),
        },
        {
          id: "seller-nav-sponsorships",
          to: "/dashboard/seller/sponsorships",
          icon: Sparkles,
          label: t("seller.menu.sponsorships", "Sponsoring & Visibilité"),
          subtitle: t("Mise en avant de vos produits phares"),
        },
        {
          id: "seller-nav-reviews",
          to: "/dashboard/seller/reviews",
          icon: Star,
          label: t("seller.menu.reviews", "Avis & Évaluations"),
          subtitle: t("Notes clients et e-réputation"),
        },
      ],
    },
    {
      groupId: "settings",
      groupTitle: t("Configuration & Conformité"),
      items: [
        {
          id: "seller-nav-verification",
          to: "/dashboard/seller/verification",
          icon: ShieldCheck,
          label: t("seller.menu.verification", "Vérification KYC (Loi 18-05)"),
          subtitle: t("Registre de commerce, NIF et RIB"),
        },
        {
          id: "seller-nav-settings",
          to: "/dashboard/seller/settings",
          icon: Settings,
          label: t("seller.menu.settings", "Paramètres Boutique & 2FA"),
          subtitle: t("Identité, logo, bannière et sécurité"),
        },
        {
          id: "seller-nav-support",
          to: "/dashboard/seller/support",
          icon: LifeBuoy,
          label: t("seller.menu.support", "Support & Assistance"),
          subtitle: t("Tickets d'aide équipe Olmart"),
        },
      ],
    },
  ];
}

export function getSellerNavItems(t: TFunction): SellerNavItem[] {
  return getSellerNavGroups(t).flatMap((group) => group.items);
}
