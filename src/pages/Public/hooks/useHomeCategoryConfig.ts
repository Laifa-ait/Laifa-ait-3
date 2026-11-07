import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { resolveCanonicalCategoryKey } from "../../../utils/categoryCanonical";

export interface CategoryCardConfig {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
  subcategoriesPreview?: string[];
  featuredProductIds?: string[];
  withExploreButton?: boolean;
}

interface CustomCategoryItem {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  gradient?: string;
  featuredProductIds?: string[];
}

export const useHomeCategoryConfig = (
  customCategories: CustomCategoryItem[] = [],
  categoryHierarchy: Record<string, unknown> | Record<string, Record<string, string[]>> = {},
  categoriesVisiteesCount?: Record<string, number>,
  favoriteCategory?: string | null
) => {
  const { t } = useTranslation();

  const defaultCategoryMapping = useMemo<CategoryCardConfig[]>(
    () => [
      {
        key: "Maison & Déco",
        title: t("cat_maison_deco", "Maison & Décoration"),
        subtitle: t("cat_home_desc", "Salons d'architecte, Mobilier & Luminaires"),
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Électronique",
        title: t("cat_tech", "Tech & Performance"),
        subtitle: t("cat_tech_desc", "Smartphones, PC Pro, Audio & Domotique"),
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Électroménager",
        title: t("cat_electromenager", "Électroménager"),
        subtitle: t("cat_electromenager_desc", "Froid, Cuisson encastrable & Caféterie"),
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Mode",
        title: t("cat_fashion_title", "Mode & Élégance"),
        subtitle: t("cat_fashion_desc", "Prêt-à-porter, Maroquinerie & Horlogerie"),
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Artisanat & Tradition",
        title: t("cat_artisanat", "Artisanat & Tradition"),
        subtitle: t("cat_artisanat_desc", "Haute couture algérienne, Dinanderie & Tapis"),
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Beauté & Santé",
        title: t("cat_beaute", "Beauté & Soins"),
        subtitle: t("cat_beaute_desc", "Haute Parfumerie, Dermo-cosmétique & Soins"),
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Auto & Moto",
        title: t("cat_auto", "Auto & Moto"),
        subtitle: t("cat_auto_desc", "Pièces OEM, Pneumatiques & Équipement"),
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Sport & Loisirs",
        title: t("cat_sport", "Sport & Fitness"),
        subtitle: t("cat_sport_desc", "Musculation, Running, Cyclisme & Outdoor"),
        image: "https://images.unsplash.com/photo-1517649763962-0c6232662000?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Bébé & Puériculture",
        title: t("cat_bebe", "Bébé & Puériculture"),
        subtitle: t("cat_bebe_desc", "Poussettes Trio, Chambre & Premier Âge"),
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Bricolage & Outillage",
        title: t("cat_bricolage", "Bricolage & Outillage"),
        subtitle: t("cat_bricolage_desc", "Électroportatif Pro, Plomberie & Chantier"),
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Jeux & Jouets",
        title: t("cat_jouets", "Jeux & Jouets"),
        subtitle: t("cat_jouets_desc", "Jeux éducatifs, Figurines & Plein air"),
        image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
      {
        key: "Supermarché",
        title: t("cat_supermarche", "Supermarché"),
        subtitle: t("cat_supermarche_desc", "Épicerie fine, Huile de Kabylie & Quotidien"),
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
        withExploreButton: true,
      },
      {
        key: "Scolaire & Bureau",
        title: t("cat_scolaire", "Scolaire & Bureau"),
        subtitle: t("cat_scolaire_desc", "Papeterie, Livres, Manuels & Maroquinerie"),
        image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&q=80&w=800",
        gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
      },
    ],
    [t]
  );

  const activeCategoriesConfig = useMemo<CategoryCardConfig[]>(() => {
    const safeHierarchy = (categoryHierarchy || {}) as Record<string, Record<string, string[]>>;
    const seenCanonicalKeys = new Set<string>();
    const deduplicatedItems: CategoryCardConfig[] = [];

    Object.keys(safeHierarchy).forEach((rawKey) => {
      const canonicalKey = resolveCanonicalCategoryKey(rawKey);
      if (!canonicalKey || seenCanonicalKeys.has(canonicalKey)) {
        return;
      }
      seenCanonicalKeys.add(canonicalKey);

      const defaultMapping = defaultCategoryMapping.find((dm) => dm.key === canonicalKey);
      const subMap = safeHierarchy[canonicalKey] || safeHierarchy[rawKey] || {};
      const subcategoriesPreview = Object.keys(subMap).slice(0, 3);

      const baseCard: CategoryCardConfig = defaultMapping
        ? { ...defaultMapping, subcategoriesPreview }
        : {
            key: canonicalKey,
            title: t(`categories.${canonicalKey}`, canonicalKey),
            subtitle:
              subcategoriesPreview.length > 0
                ? subcategoriesPreview.join(" • ")
                : t("home.discover_category_articles", { category: canonicalKey }),
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
            gradient: "from-zinc-950/90 via-zinc-950/35 to-transparent",
            subcategoriesPreview,
          };

      const custom = customCategories.find((cc) => resolveCanonicalCategoryKey(cc.id) === canonicalKey);
      if (custom) {
        const hasValidImage =
          custom.image &&
          !custom.image.includes("placeholder") &&
          custom.image.trim().length > 0;

        deduplicatedItems.push({
          ...baseCard,
          title: custom.title || baseCard.title,
          subtitle: custom.subtitle || baseCard.subtitle,
          image: hasValidImage ? (custom.image as string) : baseCard.image,
          gradient: custom.gradient || baseCard.gradient,
          featuredProductIds: custom.featuredProductIds || [],
        });
      } else {
        deduplicatedItems.push({
          ...baseCard,
          featuredProductIds: [],
        });
      }
    });

    return deduplicatedItems;
  }, [customCategories, defaultCategoryMapping, categoryHierarchy, t]);

  const sortedCategoryCards = useMemo<CategoryCardConfig[]>(() => {
    const canonicalOrder = Object.keys(categoryHierarchy || {}).map((k) => resolveCanonicalCategoryKey(k));
    return [...activeCategoriesConfig].sort((a, b) => {
      const aCount = categoriesVisiteesCount?.[a.key] || 0;
      const bCount = categoriesVisiteesCount?.[b.key] || 0;

      if (bCount !== aCount) {
        return bCount - aCount;
      }

      if (favoriteCategory === a.key) return -1;
      if (favoriteCategory === b.key) return 1;

      return canonicalOrder.indexOf(a.key) - canonicalOrder.indexOf(b.key);
    });
  }, [activeCategoriesConfig, categoriesVisiteesCount, favoriteCategory, categoryHierarchy]);

  return { sortedCategoryCards };
};
