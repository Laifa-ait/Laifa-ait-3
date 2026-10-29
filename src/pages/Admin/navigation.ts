import React from "react";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Megaphone,
  Settings,
  Database,
  LayoutGrid,
  AlertTriangle,
  MessageSquare,
  MessageSquareWarning,
  Star,
  ImageIcon,
  LayoutTemplate,
  Tag,
  Bot,
  Languages,
  Download,
  Activity,
  ShieldCheck,
  Sparkles,
  Wrench,
  Car,
  Building2,
  CreditCard,
  Network,
  Store,
  Award,
} from "lucide-react";

export interface AdminNavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
  badge?: string;
}

export interface AdminNavGroup {
  id: string;
  title: string;
  items: AdminNavItem[];
}

export const getNavGroups = (t: (key: string) => string): AdminNavGroup[] => [
  {
    id: "pilotage",
    title: t("Pilotage & Analytique"),
    items: [
      {
        to: "/dashboard/admin",
        icon: LayoutDashboard,
        label: t("Vue d'Ensemble (KPIs)"),
        end: true,
      },
      {
        to: "/dashboard/admin/reports",
        icon: Download,
        label: t("Exports & Rapports CSV"),
      },
    ],
  },
  {
    id: "merchants",
    title: t("Marchands, Comptes & Forfaits"),
    items: [
      {
        to: "/dashboard/admin/sellers",
        icon: Store,
        label: t("Vendeurs & KYC"),
      },
      {
        to: "/dashboard/admin/subscriptions",
        icon: CreditCard,
        label: t("Abonnements Studio (RIB)"),
        badge: "PRO",
      },
      {
        to: "/dashboard/admin/users",
        icon: Users,
        label: t("Utilisateurs, Rôles & B2B"),
      },
    ],
  },
  {
    id: "catalog",
    title: t("Catalogue & Marketplace"),
    items: [
      {
        to: "/dashboard/admin/orders",
        icon: LayoutGrid,
        label: t("Commandes Globales"),
      },
      {
        to: "/dashboard/admin/products-moderation",
        icon: ShieldAlert,
        label: t("Modération Produits"),
      },
      {
        to: "/dashboard/admin/curation",
        icon: Star,
        label: t("Curation & Score IA"),
      },
      {
        to: "/dashboard/admin/categories",
        icon: Network,
        label: t("Catégories & Commissions"),
      },
      {
        to: "/dashboard/admin/reviews",
        icon: MessageSquareWarning,
        label: t("Modération des Avis"),
      },
    ],
  },
  {
    id: "ecosystem",
    title: t("Écosystème Olma (Verticales)"),
    items: [
      {
        to: "/dashboard/admin/artisans",
        icon: Wrench,
        label: t("Artisans & Services Pros"),
      },
      {
        to: "/dashboard/admin/auto",
        icon: Car,
        label: t("Olma Auto (Véhicules)"),
      },
      {
        to: "/dashboard/admin/immo",
        icon: Building2,
        label: t("Olma Immo & Agences"),
        badge: "NEW",
      },
      {
        to: "/dashboard/admin/univers",
        icon: Sparkles,
        label: t("Apps Univers Olma"),
      },
    ],
  },
  {
    id: "mediation_growth",
    title: t("Médiation, Vitrine & Croissance"),
    items: [
      {
        to: "/dashboard/admin/disputes",
        icon: AlertTriangle,
        label: t("Litiges & Arbitrage"),
      },
      {
        to: "/dashboard/admin/support",
        icon: MessageSquare,
        label: t("Tickets Support"),
      },
      {
        to: "/dashboard/admin/homepage",
        icon: LayoutTemplate,
        label: t("Homepage Studio"),
      },
      {
        to: "/dashboard/admin/banners",
        icon: ImageIcon,
        label: t("Visuels & Bannières"),
      },
      {
        to: "/dashboard/admin/sponsorships",
        icon: Award,
        label: t("Sponsoring & Packs"),
      },
      {
        to: "/dashboard/admin/promotions",
        icon: Tag,
        label: t("Codes Promo"),
      },
      {
        to: "/dashboard/admin/newsletter",
        icon: Megaphone,
        label: t("Newsletter 2.0"),
      },
    ],
  },
  {
    id: "system",
    title: t("Système, IA & Sécurité"),
    items: [
      {
        to: "/dashboard/admin/agents",
        icon: Bot,
        label: t("Agents IA & Sentinel"),
      },
      {
        to: "/dashboard/admin/search-index",
        icon: Database,
        label: t("Indexation & Recherche"),
      },
      {
        to: "/dashboard/admin/translations",
        icon: Languages,
        label: t("Traductions (FR/AR/EN)"),
      },
      {
        to: "/dashboard/admin/audit-logs",
        icon: ShieldCheck,
        label: t("Audit & Sécurité"),
      },
      {
        to: "/dashboard/admin/health",
        icon: Activity,
        label: t("Santé du Système"),
      },
      {
        to: "/dashboard/admin/site-logs",
        icon: AlertTriangle,
        label: t("Exceptions & Erreurs"),
      },
      {
        to: "/dashboard/admin/checkout-audit",
        icon: ShieldCheck,
        label: t("Audit UX Checkout"),
      },
      {
        to: "/dashboard/admin/seed",
        icon: Database,
        label: t("Base Démo (Seed)"),
      },
      {
        to: "/dashboard/admin/settings",
        icon: Settings,
        label: t("Paramètres & Légal"),
      },
    ],
  },
];
