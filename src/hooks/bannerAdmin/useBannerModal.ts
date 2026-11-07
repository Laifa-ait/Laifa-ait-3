import { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  BANNER_COLOR_THEMES,
  BannerColorThemePreset,
  BannerContentPosition,
  BannerImageFit,
  BannerImagePosition,
  BannerRedirectType,
  BannerShadowIntensity,
  BannerTextAlign,
  BannerZone,
  DbBanner,
} from "./useBannerTypes";
import { uploadBannerImageAsset } from "./bannerUploadHelper";
import { apiPost, apiPut } from "../../lib/api";

export function useBannerModal(banners: DbBanner[], fetchData: () => Promise<void>) {
  const [activeTab, setActiveTab] = useState<"banners" | "tags" | "wilayas">("banners");
  const [selectedZone, setSelectedZone] = useState<BannerZone>("carousel_main");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState<DbBanner | null>(null);

  const [title, setTitle] = useState("");
  const [titleColor, setTitleColor] = useState("#FFFFFF");
  const [subtitle, setSubtitle] = useState("");
  const [subtitleColor, setSubtitleColor] = useState("#F3E8EE");
  const [badge, setBadge] = useState("");
  const [badgeColor, setBadgeColor] = useState("#E99856");
  const [discountLabel, setDiscountLabel] = useState("");
  const [buttonText, setButtonText] = useState("Découvrir la sélection");
  const [btnBgColor, setBtnBgColor] = useState("#E99856");
  const [btnTextColor, setBtnTextColor] = useState("#1A1836");
  const [secondaryButtonText, setSecondaryButtonText] = useState("");
  const [secondaryCtaLink, setSecondaryCtaLink] = useState("");

  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [redirectType, setRedirectType] = useState<BannerRedirectType>("shop");
  const [tagId, setTagId] = useState("");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [targetCategory, setTargetCategory] = useState("");

  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  const [textAlign, setTextAlign] = useState<BannerTextAlign>("left");
  const [contentPosition, setContentPosition] = useState<BannerContentPosition>("bottom");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(55);
  const [overlayColor, setOverlayColor] = useState<string>("#1A1836");
  const [shadowIntensity, setShadowIntensity] = useState<BannerShadowIntensity>("medium");
  const [imageMargin, setImageMargin] = useState<number>(0);
  const [imageFit, setImageFit] = useState<BannerImageFit>("cover");
  const [imagePosition, setImagePosition] = useState<BannerImagePosition>("center");
  const [bgColor, setBgColor] = useState<string>("#1A1836");
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({ fr: {}, ar: {}, en: {} });

  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
  const [targetUserType, setTargetUserType] = useState<"all" | "new" | "logged_in">("all");
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [previewDeviceMode, setPreviewDeviceMode] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [abGroup, setAbGroup] = useState<"all" | "A" | "B">("all");

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewBannerData, setPreviewBannerData] = useState<DbBanner | null>(null);

  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [uploadProgressDesktop, setUploadProgressDesktop] = useState(0);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [uploadProgressMobile, setUploadProgressMobile] = useState(0);

  const applyColorTheme = (theme: BannerColorThemePreset) => {
    setTitleColor(theme.titleColor);
    setSubtitleColor(theme.subtitleColor);
    setBtnBgColor(theme.btnBgColor);
    setBtnTextColor(theme.btnTextColor);
    setBadgeColor(theme.badgeColor);
    setBgColor(theme.bgColor);
    setOverlayColor(theme.overlayColor);
  };

  const resetBannerForm = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setBadge("");
    setDiscountLabel("");
    setButtonText("Découvrir la sélection");
    setSecondaryButtonText("");
    setSecondaryCtaLink("");
    applyColorTheme(BANNER_COLOR_THEMES[0]);
    setDesktopImage("");
    setMobileImage("");
    setRedirectType("shop");
    setTagId("");
    setCtaLink("/shop");
    setTargetCategory("");
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setShowCountdown(false);
    setTextAlign("left");
    setContentPosition("bottom");
    setOverlayOpacity(55);
    setShadowIntensity("medium");
    setImageMargin(0);
    setImageFit("cover");
    setImagePosition("center");
    setTranslations({ fr: {}, ar: {}, en: {} });
    setFeaturedProducts([]);
    setTargetUserType("all");
    setTargetRegions([]);
    setSelectedZone("carousel_main");
    setAbGroup("all");
  };

  const handleOpenAddModal = () => {
    resetBannerForm();
    setIsModalOpen(true);
  };

  const handleEditBanner = (b: DbBanner) => {
    setEditingBanner(b);
    setTitle(b.title || "");
    setTitleColor(b.title_color || "#FFFFFF");
    setSubtitle(b.subtitle || "");
    setSubtitleColor(b.subtitle_color || "#F3E8EE");
    setBadge(b.badge || "");
    setBadgeColor(b.badge_color || "#E99856");
    setDiscountLabel(b.discount_label || "");
    setButtonText(b.button_text || "Découvrir la sélection");
    setBtnBgColor(b.btn_bg_color || "#E99856");
    setBtnTextColor(b.btn_text_color || "#1A1836");
    setSecondaryButtonText(b.secondary_button_text || "");
    setSecondaryCtaLink(b.secondary_cta_link || "");
    setDesktopImage(b.desktop_image || "");
    setMobileImage(b.mobile_image || "");
    setRedirectType(b.redirect_type || (b.tag_id ? "tag" : b.cta_link || b.ctaLink ? "custom_url" : "shop"));
    setTagId(b.tag_id || "");
    setCtaLink(b.cta_link || b.ctaLink || "/shop");
    setTargetCategory(b.target_category || "");
    setSortOrder(b.sort_order || b.order || 1);
    setIsActive(b.is_active !== undefined ? b.is_active : true);
    setStartDate(b.start_date ? b.start_date.slice(0, 16) : "");
    setEndDate(b.end_date ? b.end_date.slice(0, 16) : "");
    setShowCountdown(Boolean(b.show_countdown));
    setTextAlign(b.text_align || "left");
    setContentPosition(b.content_position || "bottom");
    setOverlayOpacity(b.overlay_opacity !== undefined ? b.overlay_opacity : 55);
    setOverlayColor(b.overlay_color || "#1A1836");
    setShadowIntensity(b.shadow_intensity || "medium");
    setImageMargin(b.image_margin || 0);
    setImageFit(b.image_fit || "cover");
    setImagePosition(b.image_position || "center");
    setBgColor(b.bg_color || "#1A1836");
    setTranslations(b.translations || { fr: {}, ar: {}, en: {} });
    setFeaturedProducts(b.featured_products || []);
    setTargetUserType(b.target_user_type || "all");
    setTargetRegions(b.target_regions || []);
    setSelectedZone(b.zone || "carousel_main");
    setAbGroup(b.ab_group || "all");
    setIsModalOpen(true);
  };

  const handleOpenPreviewModal = (banner: DbBanner) => {
    setPreviewBannerData(banner);
    setIsPreviewModalOpen(true);
  };

  const handleDesktopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadBannerImageAsset(e.target.files?.[0], "desktop", 1920, 1080, "up-desk", setIsUploadingDesktop, setUploadProgressDesktop, setDesktopImage);
  };

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadBannerImageAsset(e.target.files?.[0], "mobile", 1080, 1080, "up-mob", setIsUploadingMobile, setUploadProgressMobile, setMobileImage);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desktopImage) {
      toast.error("Veuillez sélectionner ou coller une image Desktop obligatoire");
      return;
    }
    setIsSubmitting(true);
    const resolvedCtaLink =
      redirectType === "category" && targetCategory
        ? `/shop?category=${encodeURIComponent(targetCategory)}`
        : redirectType === "custom_url"
        ? ctaLink || "/shop"
        : redirectType === "shop"
        ? "/shop"
        : ctaLink || "";

    const numericOrder = Number(sortOrder) || 1;
    const payload = {
      title, title_color: titleColor, subtitle, subtitle_color: subtitleColor,
      badge, badge_color: badgeColor, discount_label: discountLabel,
      button_text: buttonText, btn_bg_color: btnBgColor, btn_text_color: btnTextColor,
      secondary_button_text: secondaryButtonText, secondary_cta_link: secondaryCtaLink,
      desktop_image: desktopImage, mobile_image: mobileImage || null,
      redirect_type: redirectType, tag_id: tagId,
      cta_link: resolvedCtaLink, ctaLink: resolvedCtaLink,
      target_category: targetCategory, sort_order: numericOrder, order: numericOrder,
      is_active: Boolean(isActive), isActive: Boolean(isActive),
      featured_products: featuredProducts, target_user_type: targetUserType,
      target_regions: targetRegions, ab_group: abGroup, zone: selectedZone,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      show_countdown: Boolean(showCountdown), text_align: textAlign,
      content_position: contentPosition, overlay_opacity: Number(overlayOpacity),
      overlay_color: overlayColor, shadow_intensity: shadowIntensity,
      image_margin: Number(imageMargin) || 0, image_fit: imageFit,
      image_position: imagePosition, bg_color: bgColor,
      translations: {
        ...translations,
        fr: { ...(translations.fr || {}), title: translations.fr?.title || title, subtitle: translations.fr?.subtitle || subtitle, button_text: translations.fr?.button_text || buttonText, badge: translations.fr?.badge || badge },
      },
    };

    try {
      if (editingBanner) {
        try { await apiPut(`/api/v1/admin/banners/${editingBanner.id}`, payload); } catch { await updateDoc(doc(db, "banners", editingBanner.id), payload); }
        toast.success("Bannière mise à jour avec succès");
      } else {
        const createBody = { ...payload, views: 0, clicks: 0, created_at: new Date().toISOString() };
        try { await apiPost("/api/v1/admin/banners", createBody); } catch { await addDoc(collection(db, "banners"), createBody); }
        toast.success("Bannière créée avec succès");
      }
      setIsModalOpen(false);
      resetBannerForm();
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde de la bannière");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab, setActiveTab, selectedZone, setSelectedZone, isModalOpen, setIsModalOpen,
    isSubmitting, editingBanner, title, setTitle, titleColor, setTitleColor,
    subtitle, setSubtitle, subtitleColor, setSubtitleColor, badge, setBadge,
    badgeColor, setBadgeColor, discountLabel, setDiscountLabel,
    buttonText, setButtonText, btnBgColor, setBtnBgColor, btnTextColor, setBtnTextColor,
    secondaryButtonText, setSecondaryButtonText, secondaryCtaLink, setSecondaryCtaLink,
    desktopImage, setDesktopImage, mobileImage, setMobileImage,
    redirectType, setRedirectType, tagId, setTagId, ctaLink, setCtaLink,
    targetCategory, setTargetCategory, sortOrder, setSortOrder, isActive, setIsActive,
    startDate, setStartDate, endDate, setEndDate, showCountdown, setShowCountdown,
    textAlign, setTextAlign, contentPosition, setContentPosition,
    overlayOpacity, setOverlayOpacity, overlayColor, setOverlayColor,
    shadowIntensity, setShadowIntensity, imageMargin, setImageMargin,
    imageFit, setImageFit, imagePosition, setImagePosition, bgColor, setBgColor,
    translations, setTranslations, applyColorTheme,
    featuredProducts, setFeaturedProducts, targetUserType, setTargetUserType,
    targetRegions, setTargetRegions, productSearchTerm, setProductSearchTerm,
    previewDeviceMode, setPreviewDeviceMode, abGroup, setAbGroup,
    isPreviewModalOpen, setIsPreviewModalOpen, previewBannerData, setPreviewBannerData,
    isUploadingDesktop, uploadProgressDesktop, isUploadingMobile, uploadProgressMobile,
    resetBannerForm, handleOpenAddModal, handleEditBanner, handleOpenPreviewModal,
    handleDesktopImageUpload, handleMobileImageUpload, handleSaveBanner,
  };
}
