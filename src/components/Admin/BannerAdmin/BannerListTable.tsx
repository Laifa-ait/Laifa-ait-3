import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown, Tag, AlertCircle, Eye, Edit, Trash2, Copy, Power, Layers, Package } from "lucide-react";
import { DbBanner, TagType } from "../../../hooks/useBannerAdmin";
import { getBannerFallbackImage } from "../../../utils/imageUtils";

interface BannerListTableProps {
  banners: DbBanner[];
  tags: TagType[];
  draggedIndex: number | null;
  shiftIndex: (index: number, direction: "up" | "down") => Promise<void>;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, index: number) => Promise<void>;
  setPreviewBannerData: (banner: DbBanner | null) => void;
  setPreviewDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void;
  setIsPreviewModalOpen: (open: boolean) => void;
  handleOpenBannerModal: (banner: DbBanner | null) => void;
  handleDeleteBanner: (id: string) => Promise<void>;
  handleToggleBannerActive: (banner: DbBanner) => Promise<void>;
  handleDuplicateBanner: (banner: DbBanner) => Promise<void>;
}

export const BannerListTable: React.FC<BannerListTableProps> = ({
  banners,
  tags,
  draggedIndex,
  shiftIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setPreviewBannerData,
  setPreviewDeviceMode,
  setIsPreviewModalOpen,
  handleOpenBannerModal,
  handleDeleteBanner,
  handleToggleBannerActive,
  handleDuplicateBanner,
}) => {
  const { t } = useTranslation();
  const [zoneFilter, setZoneFilter] = useState<string>("all");

  const filteredBanners = (banners || []).filter((b) =>
    zoneFilter === "all" ? true : (b.zone || "carousel_main") === zoneFilter
  );

  const zoneNames: Record<string, string> = {
    carousel_main: t("Carrousel Principal"),
    grid_top: t("Grille Haute"),
    grid_bottom: t("Grille Basse"),
    sidebar: t("Bannière Latérale"),
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <Layers className="w-4 h-4 text-orange-600 mr-1" />
          {[
            { id: "all", label: `${t("Toutes les zones")} (${banners.length})` },
            { id: "carousel_main", label: t("Carrousel Principal") },
            { id: "grid_top", label: t("Grille Haute") },
            { id: "grid_bottom", label: t("Grille Basse") },
            { id: "sidebar", label: t("Latérale") },
          ].map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setZoneFilter(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                zoneFilter === z.id ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => handleOpenBannerModal(null)}
          className="bg-orange-600 text-white px-4 py-2 rounded-xl font-sans font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-sm cursor-pointer"
        >
          + {t("Nouvelle Bannière")}
        </button>
      </div>

      {filteredBanners.length === 0 ? (
        <div className="p-14 text-center bg-white rounded-2xl border-2 border-dashed border-zinc-200">
          <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-700 uppercase">{t("Aucune bannière dans cette zone")}</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden divide-y divide-zinc-100">
          {filteredBanners.map((banner, index) => {
            const associatedTag = tags.find((tg) => tg.id === banner.tag_id);
            const views = banner.views || 0;
            const clicks = banner.clicks || 0;
            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";
            const displayZone = zoneNames[banner.zone || "carousel_main"] || t("Carrousel Principal");
            const fallbackSrc = getBannerFallbackImage(banner);

            return (
              <div
                key={banner.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => void handleDrop(e, index)}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 hover:bg-zinc-50/70 transition-colors cursor-move ${
                  draggedIndex === index ? "opacity-40" : ""
                }`}
              >
                <div className="col-span-full md:col-span-1 flex md:flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => void shiftIndex(index, "up")}
                    className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-lg">
                    {banner.sort_order || index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === filteredBanners.length - 1}
                    onClick={() => void shiftIndex(index, "down")}
                    className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="col-span-full md:col-span-3 flex items-center gap-2.5 justify-center md:justify-start">
                  <div
                    className="relative aspect-[21/9] w-32 rounded-xl overflow-hidden border border-zinc-200 shrink-0"
                    style={{ backgroundColor: banner.bg_color || "#1A1836", padding: `${Math.min(banner.image_margin || 0, 8)}px` }}
                  >
                    <img
                      loading="lazy"
                      src={banner.desktop_image || fallbackSrc}
                      alt={banner.title || "Bannière"}
                      onError={(e) => {
                        e.currentTarget.src = fallbackSrc;
                      }}
                      className="w-full h-full object-cover rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    {banner.discount_label && (
                      <span className="absolute top-1 end-1 px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-black">
                        {banner.discount_label}
                      </span>
                    )}
                  </div>
                  {banner.mobile_image && (
                    <div className="relative aspect-[4/5] w-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                      <img
                        loading="lazy"
                        src={banner.mobile_image}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = fallbackSrc;
                        }}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                <div className="col-span-full md:col-span-4 space-y-1 text-center md:text-start">
                  <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
                    <h4 className="text-sm font-black text-zinc-900 truncate max-w-[200px]">{banner.title}</h4>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                      {displayZone}
                    </span>
                    {banner.badge && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {banner.badge}
                      </span>
                    )}
                  </div>
                  {banner.subtitle && (
                    <p className="text-xs text-zinc-500 font-medium truncate max-w-[260px]">{banner.subtitle}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-0.5 text-[11px] font-bold text-zinc-500">
                    {associatedTag ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                        <Tag className="w-3 h-3" />
                        {associatedTag.name}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                        {banner.redirect_type || "shop"}: {banner.target_category || banner.cta_link || "/shop"}
                      </span>
                    )}
                    {banner.featured_products && banner.featured_products.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        <Package className="w-3 h-3" />
                        {banner.featured_products.length} {t("produits")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-full md:col-span-2 flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleToggleBannerActive(banner)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                      banner.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {banner.is_active ? t("Publié") : t("Brouillon")}
                  </button>
                  <span className="text-[11px] font-mono font-bold text-zinc-500">
                    {views} vues • {clicks} clics ({ctr}%)
                  </span>
                </div>

                <div className="col-span-full md:col-span-2 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewBannerData(banner);
                      setPreviewDeviceMode("desktop");
                      setIsPreviewModalOpen(true);
                    }}
                    className="p-2 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                    title={t("Prévisualiser")}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenBannerModal(banner)}
                    className="p-2 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                    title={t("Modifier")}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDuplicateBanner(banner)}
                    className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl transition-all cursor-pointer"
                    title={t("Dupliquer")}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteBanner(banner.id)}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                    title={t("Supprimer")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
