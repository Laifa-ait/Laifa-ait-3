import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface CategoryCardConfig {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
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

const normalize = (val: string): string =>
  val
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

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
        key: "Jeux & Jouets",
        title: t("cat_jouets", "Jeux & Jouets"),
        subtitle: t("cat_jouets_desc", "Découvrez notre collection"),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Supermarché",
        title: t("cat_supermarche", "Supermarché"),
        subtitle: t("cat_supermarche_desc", "Produits frais & quotidien"),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-900/80 via-zinc-900/20 to-transparent",
        withExploreButton: true,
      },
      {
        key: "Scolaire & Bureau",
        title: t("cat_scolaire", "Scolaire & Bureau"),
        subtitle: t("cat_scolaire_desc", "Livres, fournitures & rentrée"),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Mode",
        title: t("cat_fashion_title", "Mode & Élégance"),
        subtitle: t("cat_fashion_desc", "Prêt-à-porter, Chaussures & Sacs..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Maison & Déco",
        title: t("cat_maison_deco", "Maison & Décoration"),
        subtitle: t("cat_home_desc", "Salons, Mobilier, Linge de maison..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Électronique",
        title: t("cat_tech", "Tech & Performance"),
        subtitle: t("cat_tech_desc", "Gadgets connectés, Audio & PC..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Beauté & Santé",
        title: t("cat_beaute", "Beauté & Soins"),
        subtitle: t("cat_beaute_desc", "Parfums, Cosmétiques & Bien-être..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Électroménager",
        title: t("cat_electromenager", "Électroménager"),
        subtitle: t("cat_electromenager_desc", "Froid, Cuisson & Petit déjeuner..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Auto & Moto",
        title: t("cat_auto", "Auto & Moto"),
        subtitle: t("cat_auto_desc", "Pièces détachées, Huiles & Entretien..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Bricolage & Outillage",
        title: t("cat_bricolage", "Outillage & Travaux"),
        subtitle: t("cat_bricolage_desc", "Outillage pro, Jardin & Maison..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Sport & Loisirs",
        title: t("cat_sport", "Sport & Fitness"),
        subtitle: t("cat_sport_desc", "Musculation, Running & Plein air..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Bébé & Puériculture",
        title: t("cat_bebe", "Bébé & Puériculture"),
        subtitle: t("cat_bebe_desc", "Poussettes, Sommeil, Éveil & Jeux..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Artisanat & Tradition",
        title: t("cat_artisanat", "Artisanat & Tradition"),
        subtitle: t("cat_artisanat_desc", "Céramique, Tissage, Cuir & Terroir..."),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
    ],
    [t]
  );

  const activeCategoriesConfig = useMemo<CategoryCardConfig[]>(() => {
    const safeHierarchy = categoryHierarchy || {};
    const baseMap = Object.keys(safeHierarchy).map((catKey) => {
      const catKeyNorm = normalize(catKey);
      const defaultMapping =
        defaultCategoryMapping.find((dm) => dm.key === catKey) ||
        defaultCategoryMapping.find((dm) => normalize(dm.key) === catKeyNorm);

      const translatedTitle = defaultMapping?.title || t(`categories.${catKey}`, t(`cat_${catKey}`, catKey));
      const translatedSub = defaultMapping?.subtitle || t("home.discover_category_articles", { category: translatedTitle });

      return (
        defaultMapping || {
          key: catKey,
          title: translatedTitle,
          subtitle: translatedSub,
          image: "/images/placeholders/product.svg",
          gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
        }
      );
    });

    return baseMap.map((categoryItem) => {
      const custom = customCategories.find((cc) => cc.id === categoryItem.key);
      if (custom) {
        const title = custom.title || categoryItem.title;
        return {
          ...categoryItem,
          title,
          subtitle: custom.subtitle || categoryItem.subtitle,
          image: custom.image || categoryItem.image,
          gradient: custom.gradient || categoryItem.gradient,
          featuredProductIds: custom.featuredProductIds || [],
        };
      }
      return {
        ...categoryItem,
        featuredProductIds: [],
      };
    });
  }, [customCategories, defaultCategoryMapping, categoryHierarchy, t]);

  const sortedCategoryCards = useMemo<CategoryCardConfig[]>(() => {
    return [...activeCategoriesConfig].sort((a, b) => {
      const aCount = categoriesVisiteesCount?.[a.key] || 0;
      const bCount = categoriesVisiteesCount?.[b.key] || 0;

      if (bCount !== aCount) {
        return bCount - aCount;
      }

      if (favoriteCategory === a.key) return -1;
      if (favoriteCategory === b.key) return 1;

      const defaultOrder = Object.keys(categoryHierarchy);
      const defaultOrderArray = Array.isArray(defaultOrder) ? defaultOrder : [];
      return defaultOrderArray.indexOf(a.key) - defaultOrderArray.indexOf(b.key);
    });
  }, [activeCategoriesConfig, categoriesVisiteesCount, favoriteCategory, categoryHierarchy]);

  return { sortedCategoryCards };
};
