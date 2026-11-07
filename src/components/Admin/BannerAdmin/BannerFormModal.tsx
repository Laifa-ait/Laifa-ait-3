import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Check, Type, Palette, Image as ImageIcon, Package, Target } from "lucide-react";
import { useBannerAdmin } from "../../../hooks/useBannerAdmin";
import { BannerVisualForm } from "./BannerVisualForm";
import { BannerStyleControls } from "./BannerStyleControls";
import { BannerMediaUploadFields } from "./BannerMediaUploadFields";
import { BannerFeaturedProductsForm } from "./BannerFeaturedProductsForm";
import { BannerTargetingForm } from "./BannerTargetingForm";
import { BannerMediaPreview } from "./BannerMediaPreview";

interface BannerFormModalProps {
  state: ReturnType<typeof useBannerAdmin>;
}

type ModalStep = "content" | "style" | "media" | "products" | "targeting";

export const BannerFormModal: React.FC<BannerFormModalProps> = ({ state }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<ModalStep>("content");

  if (!state.isBannerModalOpen) return null;

  const steps: { id: ModalStep; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "content", label: t("1. Textes & Liens"), icon: <Type className="w-3.5 h-3.5" /> },
    { id: "style", label: t("2. Couleurs, Marge & Ombre"), icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "media", label: t("3. Photos & Galerie"), icon: <ImageIcon className="w-3.5 h-3.5" /> },
    {
      id: "products",
      label: t("4. Produits"),
      icon: <Package className="w-3.5 h-3.5" />,
      badge: state.bannerFeaturedProducts.length > 0 ? String(state.bannerFeaturedProducts.length) : undefined,
    },
    {
      id: "targeting",
      label: t("5. Ciblage & Dates"),
      icon: <Target className="w-3.5 h-3.5" />,
      badge: state.bannerTargetRegions.length > 0 ? `${state.bannerTargetRegions.length}W` : undefined,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden border border-zinc-200 flex flex-col">
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-orange-600 text-[10px] font-black uppercase tracking-widest">
                Banner Studio Pro
              </span>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                {state.selectedBanner ? `ID: ${state.selectedBanner.id.slice(0, 8)}` : t("Nouvelle Création")}
              </span>
            </div>
            <h3 className="text-lg font-sans font-black uppercase tracking-tight mt-0.5">
              {state.selectedBanner ? t("Modifier la Bannière") : t("Créer une Bannière Interactive")}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => state.setIsBannerModalOpen(false)}
            className="p-2 hover:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {steps.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                step === s.id
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
              {s.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-black">
                  {s.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1">
          <form id="banner-studio-form" onSubmit={state.handleSaveBanner} className="lg:col-span-7 space-y-5">
            {step === "content" && (
              <BannerVisualForm
                bannerTitle={state.bannerTitle}
                setBannerTitle={state.setBannerTitle}
                bannerSubtitle={state.bannerSubtitle}
                setBannerSubtitle={state.setBannerSubtitle}
                bannerButtonText={state.bannerButtonText}
                setBannerButtonText={state.setBannerButtonText}
                badge={state.badge}
                setBadge={state.setBadge}
                discountLabel={state.discountLabel}
                setDiscountLabel={state.setDiscountLabel}
                secondaryButtonText={state.secondaryButtonText}
                setSecondaryButtonText={state.setSecondaryButtonText}
                secondaryCtaLink={state.secondaryCtaLink}
                setSecondaryCtaLink={state.setSecondaryCtaLink}
                redirectType={state.redirectType}
                setRedirectType={state.setRedirectType}
                bannerTagId={state.bannerTagId}
                setBannerTagId={state.setBannerTagId}
                ctaLink={state.ctaLink}
                setCtaLink={state.setCtaLink}
                targetCategory={state.targetCategory}
                setTargetCategory={state.setTargetCategory}
                translations={state.translations}
                setTranslations={state.setTranslations}
                tags={state.tags}
                allProducts={state.allProducts}
              />
            )}

            {step === "style" && (
              <BannerStyleControls
                titleColor={state.bannerTitleColor}
                setTitleColor={state.setBannerTitleColor}
                subtitleColor={state.bannerSubtitleColor}
                setSubtitleColor={state.setBannerSubtitleColor}
                btnBgColor={state.bannerBtnBgColor}
                setBtnBgColor={state.setBannerBtnBgColor}
                btnTextColor={state.bannerBtnTextColor}
                setBtnTextColor={state.setBannerBtnTextColor}
                badgeColor={state.badgeColor}
                setBadgeColor={state.setBadgeColor}
                bgColor={state.bgColor}
                setBgColor={state.setBgColor}
                overlayColor={state.overlayColor}
                setOverlayColor={state.setOverlayColor}
                overlayOpacity={state.overlayOpacity}
                setOverlayOpacity={state.setOverlayOpacity}
                shadowIntensity={state.shadowIntensity}
                setShadowIntensity={state.setShadowIntensity}
                imageMargin={state.imageMargin}
                setImageMargin={state.setImageMargin}
                imageFit={state.imageFit}
                setImageFit={state.setImageFit}
                imagePosition={state.imagePosition}
                setImagePosition={state.setImagePosition}
                textAlign={state.textAlign}
                setTextAlign={state.setTextAlign}
                contentPosition={state.contentPosition}
                setContentPosition={state.setContentPosition}
                applyColorTheme={state.applyColorTheme}
              />
            )}

            {step === "media" && (
              <BannerMediaUploadFields
                bannerDesktopImage={state.bannerDesktopImage}
                setBannerDesktopImage={state.setBannerDesktopImage}
                bannerMobileImage={state.bannerMobileImage}
                setBannerMobileImage={state.setBannerMobileImage}
                isUploadingDesktop={state.isUploadingDesktop}
                uploadProgressDesktop={state.uploadProgressDesktop}
                isUploadingMobile={state.isUploadingMobile}
                uploadProgressMobile={state.uploadProgressMobile}
                handleImageUpload={state.handleImageUpload}
              />
            )}

            {step === "products" && (
              <BannerFeaturedProductsForm
                allProducts={state.allProducts}
                bannerFeaturedProducts={state.bannerFeaturedProducts}
                setBannerFeaturedProducts={state.setBannerFeaturedProducts}
                productSearchTerm={state.productSearchTerm}
                setProductSearchTerm={state.setProductSearchTerm}
              />
            )}

            {step === "targeting" && (
              <BannerTargetingForm
                bannerIsActive={state.bannerIsActive}
                setBannerIsActive={state.setBannerIsActive}
                bannerTargetUserType={state.bannerTargetUserType}
                setBannerTargetUserType={state.setBannerTargetUserType}
                bannerTargetRegions={state.bannerTargetRegions}
                setBannerTargetRegions={state.setBannerTargetRegions}
                bannerStartDate={state.bannerStartDate}
                setBannerStartDate={state.setBannerStartDate}
                bannerEndDate={state.bannerEndDate}
                setBannerEndDate={state.setBannerEndDate}
                bannerZone={state.bannerZone}
                setBannerZone={state.setBannerZone}
                bannerAbGroup={state.bannerAbGroup}
                setBannerAbGroup={state.setBannerAbGroup}
                sortOrder={state.sortOrder}
                setSortOrder={state.setSortOrder}
                showCountdown={state.showCountdown}
                setShowCountdown={state.setShowCountdown}
              />
            )}
          </form>

          <div className="lg:col-span-5">
            <BannerMediaPreview {...state} />
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs font-bold text-zinc-500">
            {state.bannerFeaturedProducts.length} {t("produits liés")} •{" "}
            {state.bannerTargetRegions.length === 0
              ? t("69 Wilayas")
              : `${state.bannerTargetRegions.length} ${t("Wilayas")}`}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => state.setIsBannerModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-extrabold uppercase text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              form="banner-studio-form"
              disabled={state.isSubmitting || state.isUploadingDesktop || state.isUploadingMobile}
              className="px-6 py-2.5 bg-orange-600 text-white hover:bg-orange-500 rounded-xl font-sans font-black text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{state.isSubmitting ? t("Enregistrement...") : t("Enregistrer la Bannière")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
