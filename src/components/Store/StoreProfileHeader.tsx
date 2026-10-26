import React from 'react';
import {
  ShieldCheck,
  MapPin,
  Star,
  UserPlus,
  UserCheck,
  Camera,
  Truck,
  Clock,
  RotateCcw,
  Package,
} from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';
import { Spinner } from '../ui/Spinner';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

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
  storeInfo,
  productsCount = 0,
  isOwner,
  uploadingBanner,
  uploadingLogo,
  isFollowing,
  followLoading,
  d,
  onBannerSelect,
  onLogoSelect,
  onFollowToggle,
}) => {
  const rawCover =
    storeInfo.bannerUrl ||
    storeInfo.coverUrl ||
    storeInfo.coverImage ||
    storeInfo.banner ||
    storeInfo.sellerBanner ||
    storeInfo.storeBanner ||
    storeInfo.bannerImage;

  const coverUrl =
    rawCover && !rawCover.includes('images.unsplash.com') ? rawCover : undefined;

  const logoUrl =
    storeInfo.logoUrl ||
    storeInfo.avatarUrl ||
    storeInfo.photoURL ||
    storeInfo.photoUrl ||
    storeInfo.avatar;

  const shopName =
    storeInfo.shopName || storeInfo.displayName || storeInfo.brand || 'Boutique Olmart';
  const initial = (shopName || 'O').charAt(0).toUpperCase();
  const prepTime = storeInfo.avgPreparationTime || '24h - 48h';

  return (
    <section className="mb-6 rounded-3xl bg-white border border-[#26658C]/15 shadow-xs overflow-hidden">
      {/* 1. Architectural Cover Banner */}
      <div className="relative h-28 sm:h-40 md:h-48 w-full bg-gradient-to-r from-[#011C40] via-[#023859] to-[#26658C] overflow-hidden">
        {coverUrl ? (
          <>
            <OptimizedImage
              src={getOptimizedImageUrl(coverUrl, 1400)}
              alt={shopName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#011C40]/60 via-transparent to-black/15 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full relative flex items-center justify-between px-6 sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(167,235,242,0.22),transparent_55%)]" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#54ACBF]/15 blur-3xl pointer-events-none" />
            <div className="relative z-10 hidden sm:flex items-center gap-2 text-[#A7EBF2]/80 text-xs font-semibold tracking-wide">
              <span>Boutique Officielle Certifiée</span>
              <span aria-hidden="true">·</span>
              <span>Olmart Algérie</span>
            </div>
          </div>
        )}

        {isOwner && (
          <label className="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer z-20">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onBannerSelect}
              disabled={uploadingBanner}
            />
            <div className="px-3 py-1.5 bg-[#011C40]/75 hover:bg-[#011C40] backdrop-blur-md text-white rounded-xl text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 shadow-sm">
              {uploadingBanner ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-[#A7EBF2]" />
              )}
              <span>{uploadingBanner ? d('uploadingCover') : d('editCover')}</span>
            </div>
          </label>
        )}
      </div>

      {/* 2. Store Identity & Primary Actions (Zero text overlap with banner) */}
      <div className="px-4 sm:px-7 pt-3 pb-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left: Avatar + Unclipped Store Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-5 min-w-0">
            {/* Avatar Squircle (only avatar overlaps banner cleanly) */}
            <div className="relative group shrink-0 -mt-12 sm:-mt-14 self-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-md ring-1 ring-[#26658C]/15 overflow-hidden relative z-10">
                {logoUrl ? (
                  <OptimizedImage
                    src={getOptimizedImageUrl(logoUrl, 300)}
                    alt={shopName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#011C40] via-[#023859] to-[#26658C] text-[#A7EBF2] font-black text-2xl sm:text-3xl flex items-center justify-center rounded-xl">
                    {initial}
                  </div>
                )}
              </div>

              {isOwner && (
                <label className="absolute inset-0 cursor-pointer z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#011C40]/65 rounded-2xl backdrop-blur-xs">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onLogoSelect}
                    disabled={uploadingLogo}
                  />
                  <div className="text-white text-center p-1">
                    {uploadingLogo ? (
                      <Spinner size="sm" className="mx-auto text-white" />
                    ) : (
                      <Camera className="w-4 h-4 mx-auto mb-0.5 text-[#A7EBF2]" />
                    )}
                    <span className="text-[10px] font-semibold block">Photo</span>
                  </div>
                </label>
              )}
            </div>

            {/* Store Name, Verified Check & Clean Unboxed Metadata */}
            <div className="space-y-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold text-[#011C40] tracking-tight leading-snug">
                  {shopName}
                </h1>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#023859]"
                  title="Vendeur Vérifié par Olmart"
                >
                  <ShieldCheck className="w-4 h-4 text-[#54ACBF] shrink-0" />
                  <span className="text-[11px] text-[#26658C] font-semibold">Vérifié</span>
                </span>
              </div>

              {/* Clean unboxed metadata row with middot separators */}
              <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap tabular-nums">
                {storeInfo.wilaya && (
                  <>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#023859]">
                      <MapPin className="w-3.5 h-3.5 text-[#54ACBF] shrink-0" />
                      {storeInfo.wilaya}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                  </>
                )}

                <span className="inline-flex items-center gap-1 font-semibold text-[#011C40]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  {storeInfo.rating != null && storeInfo.rating > 0
                    ? storeInfo.rating.toFixed(1)
                    : '5.0'}
                </span>

                <span aria-hidden="true" className="text-slate-300">·</span>

                <span className="inline-flex items-center gap-1 text-slate-600">
                  <Package className="w-3.5 h-3.5 text-[#26658C] shrink-0" />
                  <strong className="font-bold text-[#011C40]">{productsCount}</strong>{' '}
                  {productsCount > 1 ? 'articles' : 'article'}
                </span>

                <span aria-hidden="true" className="text-slate-300">·</span>

                <span className="text-slate-600">
                  <strong className="font-bold text-[#011C40]">
                    {storeInfo.followersCount || 0}
                  </strong>{' '}
                  {d('subscribers').toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Follow Button */}
          {!isOwner && (
            <div className="shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={onFollowToggle}
                disabled={followLoading}
                className={`px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  isFollowing
                    ? 'bg-[#F8FBFC] text-[#023859] border border-[#26658C]/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-[#023859] hover:bg-[#011C40] text-white shadow-xs'
                }`}
              >
                {followLoading ? (
                  <Spinner size="sm" className={isFollowing ? 'text-slate-600' : 'text-white'} />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 text-[#54ACBF]" />
                    <span>Abonné</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-[#A7EBF2]" />
                    <span>S'abonner</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Store Bio / Description */}
        {(storeInfo.shopDescription || storeInfo.description) && (
          <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            {storeInfo.shopDescription || storeInfo.description}
          </p>
        )}
      </div>

      {/* 3. Integrated Slim Reassurance Bar */}
      <div className="bg-[#F8FBFC] border-t border-[#26658C]/10 px-4 sm:px-7 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar text-[11px] sm:text-xs text-[#023859] font-medium">
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <Truck className="w-3.5 h-3.5 text-[#54ACBF] shrink-0" />
          <span>Livraison 58 Wilayas</span>
        </div>
        <span aria-hidden="true" className="text-[#26658C]/20">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#54ACBF] shrink-0" />
          <span>Paiement à la livraison</span>
        </div>
        <span aria-hidden="true" className="text-[#26658C]/20">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#54ACBF] shrink-0" />
          <span>Expédition {prepTime}</span>
        </div>
        <span aria-hidden="true" className="text-[#26658C]/20">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <RotateCcw className="w-3.5 h-3.5 text-[#54ACBF] shrink-0" />
          <span>Retours sous 14 jours</span>
        </div>
      </div>
    </section>
  );
};
