import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { getLucideCategoryIcon } from "../../../pages/Seller/StoreBuilder/constants/categoryCanvaOptions";
import { CategoryItem } from "../../../pages/Seller/StoreBuilder/constants/categoryPresets";
import { CategoryBubblesRow } from "./category/CategoryBubblesRow";
import { CategoryBentoGrid } from "./category/CategoryBentoGrid";

interface FeaturedCategoriesRendererProps {
  settings: Record<string, unknown>;
  theme: {
    borderRadiusPx?: number;
    surfaceColor?: string;
    primaryColor?: string;
  };
  maxWidth: string;
  headingClass: string;
  headingStyle: React.CSSProperties;
  wrapperClass: string;
  sectionStyle: React.CSSProperties;
  isEditable?: boolean;
  onSelect?: () => void;
}

const getRatioClass = (ratio?: string) => {
  switch (ratio) {
    case "4/5": return "aspect-[4/5]";
    case "16/9": return "aspect-[16/9]";
    case "4/3": return "aspect-[4/3]";
    case "circle": return "aspect-square rounded-full";
    case "1/1":
    default: return "aspect-square";
  }
};

const getHoverClass = (hover?: string) => {
  switch (hover) {
    case "lift": return "hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300";
    case "glow": return "hover:ring-2 hover:ring-orange-500 hover:shadow-lg transition-all duration-300";
    case "grayscale-reveal": return "grayscale hover:grayscale-0 transition-all duration-300";
    case "zoom":
    default: return "group hover:shadow-lg transition-all duration-300";
  }
};

const getRadiusClass = (rad?: string, fallbackPx?: number) => {
  switch (rad) {
    case "none": return "rounded-none";
    case "sm": return "rounded-lg";
    case "md": return "rounded-2xl";
    case "lg": return "rounded-3xl";
    case "full": return "rounded-full";
    default: return fallbackPx ? `rounded-[${fallbackPx}px]` : "rounded-2xl";
  }
};

export const FeaturedCategoriesRenderer: React.FC<FeaturedCategoriesRendererProps> = ({
  settings,
  theme,
  maxWidth,
  headingClass,
  headingStyle,
  wrapperClass,
  sectionStyle,
  isEditable,
  onSelect,
}) => {
  const categories = Array.isArray(settings.categories)
    ? (settings.categories as CategoryItem[])
    : [];

  const layout = String(settings.layout || "grid");
  const aspectRatio = String(settings.aspectRatio || "1/1");
  const borderRadius = String(settings.borderRadius || "md");
  const hoverEffect = String(settings.hoverEffect || "zoom");
  const textPosition = String(settings.textPosition || (layout === "overlay" ? "overlay-bottom" : "below"));
  const overlayOpacity = typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : 40;
  const showBadge = settings.showBadge !== false;
  const showCount = settings.showItemCount !== false;
  const glassmorphism = Boolean(settings.glassmorphism);

  const ratioClass = getRatioClass(aspectRatio);
  const hoverClass = getHoverClass(hoverEffect);
  const radiusClass = getRadiusClass(borderRadius, theme.borderRadiusPx);

  return (
    <section onClick={isEditable ? onSelect : undefined} className={wrapperClass} style={sectionStyle}>
      <div className={maxWidth}>
        <div className="mb-6 text-center space-y-1">
          <h2 className={headingClass} style={headingStyle}>
            {String(settings.title || "Nos Rayons & Collections")}
          </h2>
          {Boolean(settings.subtitle) && (
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              {String(settings.subtitle)}
            </p>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Sparkles className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Aucun rayon configuré</p>
            <p className="text-xs text-slate-400 mt-1">Utilisez l'inspecteur pour importer un pack ou créer vos rayons.</p>
          </div>
        ) : layout === "bubbles" ? (
          <CategoryBubblesRow categories={categories} />
        ) : layout === "pills" ? (
          <div className="flex flex-wrap gap-2.5 justify-center">
            {categories.map((cat, i) => {
              const IconComp = getLucideCategoryIcon(cat.iconName);
              return (
                <div
                  key={cat.id || i}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50/50 shadow-xs transition-all cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                    {cat.name}
                  </span>
                  {showCount && Boolean(cat.itemCount) && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {cat.itemCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : layout === "bento" ? (
          <CategoryBentoGrid
            categories={categories}
            radiusClass={radiusClass}
            hoverClass={hoverClass}
            surfaceColor={theme.surfaceColor}
            overlayOpacity={overlayOpacity}
            showBadge={showBadge}
            showCount={showCount}
          />
        ) : (
          /* Adaptive Modern Grid / Overlay Cards */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {categories.map((cat, i) => {
              const IconComp = getLucideCategoryIcon(cat.iconName);
              const isOverlay = textPosition === "overlay-bottom" || textPosition === "card-inside";

              return (
                <article
                  key={cat.id || i}
                  className={`group relative overflow-hidden border border-slate-200/80 bg-white ${radiusClass} ${hoverClass} cursor-pointer flex flex-col`}
                >
                  <div className={`relative w-full overflow-hidden ${ratioClass} bg-slate-100`}>
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
                        <IconComp className="w-8 h-8 text-orange-400" />
                      </div>
                    )}

                    {showBadge && Boolean(cat.badge) && (
                      <div className="absolute top-2.5 right-2.5 z-20">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: cat.badgeColor || "#F97316" }}
                        >
                          {cat.badge}
                        </span>
                      </div>
                    )}

                    {isOverlay && (
                      <>
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                          style={{ opacity: overlayOpacity / 100 }}
                        />
                        <div className={`absolute inset-x-0 bottom-0 p-3 text-white z-10 ${glassmorphism ? "backdrop-blur-xs bg-black/20" : ""}`}>
                          <h3 className="text-xs sm:text-sm font-bold line-clamp-1 drop-shadow-sm">{cat.name}</h3>
                          {Boolean(cat.subtitle) && (
                            <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">{cat.subtitle}</p>
                          )}
                          {showCount && Boolean(cat.itemCount) && (
                            <span className="text-[10px] text-orange-300 font-semibold mt-1 inline-flex items-center gap-1">
                              <span>{cat.itemCount} articles</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {!isOverlay && (
                    <div className="p-3 text-center space-y-0.5 flex-1 flex flex-col justify-center">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                      {Boolean(cat.subtitle) && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{cat.subtitle}</p>
                      )}
                      {showCount && Boolean(cat.itemCount) && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {cat.itemCount} article{Number(cat.itemCount) > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
