import React from "react";
import {
  ShieldCheck, MapPin, Star, UserPlus, UserCheck, Camera, Truck, Clock, RotateCcw, Package,
} from "lucide-react";
import { OptimizedImage } from "../ui/OptimizedImage";
import { Spinner } from "../ui/Spinner";
import { PublicStoreInfo } from "../../pages/Public/StoreProfile";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface StoreProfileHeaderProps {
  storeInfo: PublicStoreInfo;
  productsCount?: number;
  isOwner: boolean;
  uploadingBanner: boolean;
  uploadingLogo: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  d: (key: string) => string;
  onBannerSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFollowToggle: () => void;
}

export const StoreProfileHeader: React.FC<StoreProfileHeaderProps> = ({
  storeInfo, productsCount = 0, isOwner, uploadingBanner, uploadingLogo,
  isFollowing, followLoading, d, onBannerSelect, onLogoSelect, onFollowToggle,
}) => {
  const rawCover =
    storeInfo.bannerUrl || storeInfo.coverUrl || storeInfo.coverImage ||
    storeInfo.banner || storeInfo.sellerBanner || storeInfo.storeBanner || storeInfo.bannerImage;
  const coverUrl = rawCover && !rawCover.includes("images.unsplash.com") ? rawCover : undefined;
  const logoUrl =
    storeInfo.logoUrl || storeInfo.avatarUrl || storeInfo.photoURL || storeInfo.photoUrl || storeInfo.avatar;
  const shopName = storeInfo.shopName || storeInfo.displayName || storeInfo.brand || "Boutique Officielle";
  const initial = (shopName || "B").charAt(0).toUpperCase();
  const prepTime = storeInfo.avgPreparationTime || "24h - 48h";
  const returnBadgeLabel = storeInfo.returnPolicy ? "Conditions de retour définies" : "Vérification à la livraison";

  return (
    <section
      style={{
        backgroundColor: "var(--store-surface, #FFFFFF)",
        borderRadius: "var(--store-border-radius, 16px)",
        fontFamily: "var(--store-font-body, inherit)",
      }}
      className="mb-6 border border-black/10 shadow-xs overflow-hidden"
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--store-secondary, #18181B) 0%, var(--store-primary, #B45309) 100%)",
        }}
        className="relative h-28 sm:h-40 md:h-48 w-full overflow-hidden"
      >
        {coverUrl ? (
          <>
            <OptimizedImage src={getOptimizedImageUrl(coverUrl, 1400)} alt={`Bannière ${shopName}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full relative flex items-center justify-between px-6 sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="relative z-10 hidden sm:flex items-center gap-2 text-white/85 text-xs font-semibold tracking-wide">
              <span>Boutique Officielle Certifiée</span>
              <span aria-hidden="true">·</span>
              <span>Livraison 69 Wilayas</span>
            </div>
          </div>
        )}

        {isOwner && (
          <label className="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer z-20">
            <input type="file" accept="image/*" className="hidden" onChange={onBannerSelect} disabled={uploadingBanner} />
            <div className="px-3 py-1.5 bg-black/70 hover:bg-black/85 backdrop-blur-md text-white rounded-xl text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 shadow-sm">
              {uploadingBanner ? <Spinner size="sm" className="text-white" /> : <Camera className="w-3.5 h-3.5" style={{ color: "var(--store-accent, #F59E0B)" }} />}
              <span>{uploadingBanner ? d("uploadingCover") : d("editCover")}</span>
            </div>
          </label>
        )}
      </div>

      <div style={{ backgroundColor: "var(--store-surface, #FFFFFF)" }} className="px-4 sm:px-7 pt-3 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-5 min-w-0">
            <div className="relative group shrink-0 -mt-12 sm:-mt-14 self-start">
              <div style={{ backgroundColor: "var(--store-surface, #FFFFFF)" }} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 shadow-md ring-1 ring-black/10 overflow-hidden relative z-10">
                {logoUrl ? (
                  <OptimizedImage src={getOptimizedImageUrl(logoUrl, 300)} alt={`Logo ${shopName}`} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div
                    style={{
                      backgroundColor: "var(--store-primary, #B45309)",
                      color: "#FFFFFF",
                      fontFamily: "var(--store-font-heading, inherit)",
                    }}
                    className="w-full h-full font-black text-2xl sm:text-3xl flex items-center justify-center rounded-xl"
                  >
                    {initial}
                  </div>
                )}
              </div>

              {isOwner && (
                <label className="absolute inset-0 cursor-pointer z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/65 rounded-2xl backdrop-blur-xs">
                  <input type="file" accept="image/*" className="hidden" onChange={onLogoSelect} disabled={uploadingLogo} />
                  <div className="text-white text-center p-1">
                    {uploadingLogo ? <Spinner size="sm" className="mx-auto text-white" /> : <Camera className="w-4 h-4 mx-auto mb-0.5 text-white" />}
                    <span className="text-[10px] font-semibold block">Photo</span>
                  </div>
                </label>
              )}
            </div>

            <div className="space-y-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  style={{ color: "var(--store-secondary, #18181B)", fontFamily: "var(--store-font-heading, inherit)" }}
                  className="text-lg sm:text-2xl font-extrabold tracking-tight leading-snug"
                >
                  {shopName}
                </h1>
                <span style={{ color: "var(--store-primary, #B45309)" }} className="inline-flex items-center gap-1 text-xs font-bold" title="Vendeur Vérifié">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-semibold">Vérifié</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs opacity-80 flex-wrap tabular-nums">
                {storeInfo.wilaya && (
                  <>
                    <span style={{ color: "var(--store-primary, #B45309)" }} className="inline-flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {storeInfo.wilaya}
                    </span>
                    <span aria-hidden="true" className="opacity-40">·</span>
                  </>
                )}

                <span style={{ color: "var(--store-secondary, #18181B)" }} className="inline-flex items-center gap-1 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  {storeInfo.rating != null && storeInfo.rating > 0 ? storeInfo.rating.toFixed(1) : "5.0"}
                </span>

                <span aria-hidden="true" className="opacity-40">·</span>

                <span className="inline-flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--store-primary, #B45309)" }} />
                  <strong style={{ color: "var(--store-secondary, #18181B)" }} className="font-bold">{productsCount}</strong>{" "}
                  {productsCount > 1 ? "articles" : "article"}
                </span>

                <span aria-hidden="true" className="opacity-40">·</span>

                <span>
                  <strong style={{ color: "var(--store-secondary, #18181B)" }} className="font-bold">{storeInfo.followersCount || 0}</strong>{" "}
                  {d("subscribers").toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {!isOwner && (
            <div className="shrink-0 self-start sm:self-center">
              <button
                type="button" onClick={onFollowToggle} disabled={followLoading}
                style={
                  isFollowing
                    ? { backgroundColor: "var(--store-canvas, #FAF6F0)", color: "var(--store-secondary, #18181B)", borderRadius: "var(--store-border-radius, 12px)" }
                    : { backgroundColor: "var(--store-primary, #B45309)", color: "#FFFFFF", borderRadius: "var(--store-border-radius, 12px)" }
                }
                className={`px-5 py-2 font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  isFollowing ? "border border-black/15 hover:opacity-85" : "shadow-xs hover:opacity-90"
                }`}
              >
                {followLoading ? (
                  <Spinner size="sm" className={isFollowing ? "text-slate-600" : "text-white"} />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" style={{ color: "var(--store-primary, #B45309)" }} />
                    <span>Abonné</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>S&apos;abonner</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {(storeInfo.shopDescription || storeInfo.description) && (
          <p className="mt-3 text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
            {storeInfo.shopDescription || storeInfo.description}
          </p>
        )}
      </div>

      <div
        style={{ backgroundColor: "var(--store-canvas, #FAF6F0)", color: "var(--store-secondary, #18181B)" }}
        className="border-t border-black/10 px-4 sm:px-7 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar text-[11px] sm:text-xs font-medium"
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <Truck className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--store-primary, #B45309)" }} />
          <span>Livraison 69 Wilayas</span>
        </div>
        <span aria-hidden="true" className="opacity-25">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--store-primary, #B45309)" }} />
          <span>Paiement à la livraison</span>
        </div>
        <span aria-hidden="true" className="opacity-25">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--store-primary, #B45309)" }} />
          <span>Expédition {prepTime}</span>
        </div>
        <span aria-hidden="true" className="opacity-25">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <RotateCcw className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--store-primary, #B45309)" }} />
          <span>{returnBadgeLabel}</span>
        </div>
      </div>
    </section>
  );
};
