import React from "react";
import { ShieldCheck, Truck, RotateCcw, HelpCircle, MapPin, Clock, Star, CheckCircle2, ChevronDown, Bell } from "lucide-react";
import { CustomPageSection, CustomPageTheme } from "../../../domains/seller/customPage.types";
import { EditorialHeading } from "../EditorialHeading";
import { useStudioStore, SectionSubElement } from "../../../pages/Seller/StoreBuilder/store/useStudioStore";

interface SectionTrustAndContactProps {
  section: CustomPageSection;
  theme: CustomPageTheme;
  wrapperClass?: string;
  isEditable?: boolean;
  onSelect?: () => void;
  isSubActive?: (sub: string) => boolean;
  handleSubElementClick?: (sub: string, e: React.MouseEvent) => void;
}

export const SectionTrustAndContact: React.FC<SectionTrustAndContactProps> = ({
  section, theme, isEditable, onSelect,
}) => {
  const selectSection = useStudioStore((s) => s.selectSection);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedSubElement = useStudioStore((s) => s.selectedSubElement);
  const rawSettings = (section.settings || {}) as Record<string, unknown>;
  const primaryColor = section.styles?.headingColor || theme.primaryColor || "#0F172A";
  const textColor = section.styles?.textColor || theme.secondaryColor || "#0F172A";
  const accentColor = theme.accentColor || primaryColor;
  const surfaceBg = section.styles?.backgroundColor || theme.surfaceColor || "#FFFFFF";
  const radiusPx = theme.borderRadiusPx ?? 16;

  const isSubSelected = (sub: SectionSubElement) => Boolean(isEditable && selectedSectionId === section.id && selectedSubElement === sub);
  const subRing = (sub: SectionSubElement) =>
    isEditable ? `${isSubSelected(sub) ? "ring-2 ring-[var(--studio-focus,#2563EB)] rounded-lg" : "hover:ring-1 hover:ring-[var(--studio-focus,#2563EB)]/50 rounded-lg"} cursor-pointer transition-all` : "";
  const handleSubClick = (e: React.MouseEvent, sub: SectionSubElement) => {
    if (!isEditable) return;
    e.stopPropagation();
    selectSection(section.id, sub);
    onSelect?.();
  };

  if (section.type === "verified_reviews") {
    const minRating = Number(rawSettings.filterMinRating ?? 4);
    const maxReviews = Math.min(Number(rawSettings.maxReviews ?? 6), 6);
    const customReviews = Array.isArray(rawSettings.customReviews)
      ? (rawSettings.customReviews as Array<{ id?: string; author?: string; wilaya?: string; rating?: number; text?: string; verifiedLabel?: string }>)
          .filter((r) => Boolean(r && (r.author || r.text)))
      : [];
    const reviews = customReviews.filter((r) => (r.rating ?? 5) >= minRating).slice(0, maxReviews);

    return (
      <section onClick={isEditable ? onSelect : undefined} style={{ backgroundColor: surfaceBg, color: textColor }} className={`w-full py-12 px-5 sm:px-8 border-b border-black/5 ${isEditable ? "cursor-pointer" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span onClick={(e) => handleSubClick(e, "badge")} style={{ color: accentColor }} className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] mb-1.5 px-1 ${subRing("badge")}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Acheteurs Vérifiés Olmart
              </span>
              <EditorialHeading
                text={(rawSettings.title as string) || section.title || "Ils nous font *confiance*"}
                as="h2" theme={theme} accentColorOverride={accentColor}
                onClick={(e) => handleSubClick(e, "title")}
                className={`text-2xl sm:text-3xl font-black tracking-tight px-1 break-words ${subRing("title")}`}
              />
            </div>
            {reviews.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-black">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{reviews.length} avis client{reviews.length > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <div data-testid="verified-reviews-empty-state" className="p-6 rounded-2xl border border-dashed border-black/15 bg-black/[0.02] text-center space-y-1.5">
              <p className="text-sm font-bold opacity-80">Aucun avis client configuré pour le moment</p>
              <p className="text-xs opacity-60 max-w-md mx-auto">
                Ajoutez de vrais témoignages clients depuis l&apos;onglet Contenu ou masquez cette section tant que vous n&apos;avez pas reçu d&apos;avis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((rev, i) => (
                <div key={rev.id || i} onClick={(e) => handleSubClick(e, `review-${i}`)} style={{ borderRadius: `${radiusPx}px` }} className={`p-6 bg-black/[0.02] border border-black/5 flex flex-col justify-between ${subRing(`review-${i}`)}`}>
                  <div>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: Math.min(5, Math.max(1, Number(rev.rating ?? 5))) }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed mb-4 break-words">&ldquo;{rev.text}&rdquo;</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-black/5 text-xs">
                    <span className="font-bold">{rev.author || "Client"} {rev.wilaya ? `• ${rev.wilaya}` : ""}</span>
                    <span className="text-[10px] font-bold text-emerald-600">{rev.verifiedLabel || "Achat vérifié"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section.type === "delivery_info") {
    const freeAbove = Number(rawSettings.freeShippingAbove || 0);
    const timeframe = (rawSettings.defaultTimeframe as string) || "24h à 72h";
    const carriersText = (rawSettings.carriersText as string) || "Livraison à domicile & Stop-Desk dans les 69 Wilayas";
    const highlightText = (rawSettings.codText as string) || "Vérification du colis & paiement espèces à la livraison disponibles";
    return (
      <section onClick={isEditable ? onSelect : undefined} style={{ backgroundColor: surfaceBg, color: textColor }} className={`w-full py-10 px-5 sm:px-8 border-b border-black/5 ${isEditable ? "cursor-pointer" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <EditorialHeading
            text={(rawSettings.title as string) || section.title || "Livraison *69 Wilayas*"}
            as="h2" theme={theme} accentColorOverride={accentColor}
            onClick={(e) => handleSubClick(e, "title")}
            className={`text-xl sm:text-2xl font-black tracking-tight mb-6 px-1 inline-block break-words ${subRing("title")}`}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div onClick={(e) => handleSubClick(e, "card-0")} style={{ borderRadius: `${radiusPx}px` }} className={`p-5 bg-black/[0.02] border border-black/5 flex items-start gap-3.5 ${subRing("card-0")}`}>
              <Truck className="w-6 h-6 shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <div>
                <h3 className="font-bold text-sm">Expédition Nationale (69 Wilayas)</h3>
                <p className="text-xs opacity-70 mt-1">Délai moyen constaté : <strong>{timeframe}</strong> ({carriersText}).</p>
              </div>
            </div>
            <div onClick={(e) => handleSubClick(e, "card-1")} style={{ borderRadius: `${radiusPx}px` }} className={`p-5 bg-black/[0.02] border border-black/5 flex items-start gap-3.5 ${subRing("card-1")}`}>
              <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <div>
                <h3 className="font-bold text-sm">Paiement à la réception (COD)</h3>
                <p className="text-xs opacity-70 mt-1">{highlightText}.</p>
              </div>
            </div>
            <div onClick={(e) => handleSubClick(e, "card-2")} style={{ borderRadius: `${radiusPx}px` }} className={`p-5 bg-black/[0.02] border border-black/5 flex items-start gap-3.5 ${subRing("card-2")}`}>
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <div>
                <h3 className="font-bold text-sm">{freeAbove > 0 ? `Livraison offerte dès ${freeAbove.toLocaleString("fr-DZ")} DA` : "Tarifs wilaya transparents"}</h3>
                <p className="text-xs opacity-70 mt-1">Calcul automatique du tarif exact au moment de la commande.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "return_policy") {
    const delayDays = Number(rawSettings.delayDays || 7);
    const feeBy = rawSettings.returnShippingFeeBy === "seller" ? "pris en charge par la boutique" : "à la charge de l'acheteur (sauf défaut avéré)";
    return (
      <section onClick={isEditable ? onSelect : undefined} style={{ backgroundColor: surfaceBg, color: textColor }} className={`w-full py-10 px-5 sm:px-8 border-b border-black/5 ${isEditable ? "cursor-pointer" : ""}`}>
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-black/[0.02] border border-black/5 flex flex-col sm:flex-row items-start gap-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: primaryColor }}>
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <EditorialHeading
              text={(rawSettings.title as string) || section.title || "Politique de *Retours & Échanges*"}
              as="h2" theme={theme} accentColorOverride={accentColor}
              onClick={(e) => handleSubClick(e, "title")}
              className={`text-xl font-black tracking-tight px-1 inline-block break-words ${subRing("title")}`}
            />
            <p onClick={(e) => handleSubClick(e, "description")} className={`text-sm opacity-80 mt-2 leading-relaxed px-1 break-words ${subRing("description")}`}>
              {(rawSettings.conditions as string) || `Vous disposez de ${delayDays} jours après réception de votre colis pour demander un échange ou un retour.`}
            </p>
            <p className="text-xs font-semibold opacity-65 mt-2">
              Délai : <strong>{delayDays} jours</strong> • Frais de retour : <strong>{feeBy}</strong>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "faq_accordion") {
    const rawItems = Array.isArray(rawSettings.items) ? (rawSettings.items as Array<{ question: string; answer: string }>) : [];
    const items = rawItems.length > 0 ? rawItems : [
      { question: "Quels sont les délais de livraison vers ma wilaya ?", answer: "Les expéditions prennent généralement 24h à 48h pour les grandes wilayas et jusqu'à 72h pour le Sud." },
      { question: "Puis-je payer à la livraison (Cash on Delivery) ?", answer: "Oui, vous réglez votre commande en espèces directement au livreur lors de la remise du colis." },
    ];
    return (
      <section onClick={isEditable ? onSelect : undefined} style={{ backgroundColor: surfaceBg, color: textColor }} className={`w-full py-12 px-5 sm:px-8 border-b border-black/5 ${isEditable ? "cursor-pointer" : ""}`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <HelpCircle className="w-5 h-5" style={{ color: primaryColor }} />
            <EditorialHeading
              text={(rawSettings.title as string) || section.title || "Questions *Fréquentes*"}
              as="h2" theme={theme} accentColorOverride={accentColor}
              onClick={(e) => handleSubClick(e, "title")}
              className={`text-2xl font-black tracking-tight px-1 break-words ${subRing("title")}`}
            />
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <details key={idx} onClick={(e) => handleSubClick(e, `faq-${idx}`)} open={idx === 0} style={{ borderRadius: `${Math.min(radiusPx, 16)}px` }} className={`group bg-black/[0.02] border border-black/5 px-5 py-4 ${subRing(`faq-${idx}`)}`}>
                <summary className="font-bold text-sm cursor-pointer list-none flex items-center justify-between gap-2">
                  <span className="break-words">{item.question}</span>
                  <ChevronDown className="w-4 h-4 opacity-50 group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <p className="text-xs sm:text-sm opacity-75 mt-2.5 leading-relaxed break-words">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="contact-footer-section" onClick={isEditable ? onSelect : undefined} style={{ backgroundColor: surfaceBg, color: textColor }} className={`w-full py-10 px-5 sm:px-8 border-t border-black/10 ${isEditable ? "cursor-pointer" : ""}`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <EditorialHeading
            text={(rawSettings.title as string) || section.title || "Assistance & *Suivi Client*"}
            as="h3" theme={theme} accentColorOverride={accentColor}
            onClick={(e) => handleSubClick(e, "title")}
            className={`text-lg font-black tracking-tight px-1 inline-block break-words ${subRing("title")}`}
          />
          <p onClick={(e) => handleSubClick(e, "subtitle")} className={`text-xs opacity-70 mt-1 px-1 break-words ${subRing("subtitle")}`}>
            {(rawSettings.subtitle as string) || "Service client et suivi de commande assurés via les notifications internes Olmart."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <span data-testid="contact-footer-internal-channel" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/[0.04]">
            <Bell className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Notifications internes Olmart</span>
          </span>
          {Boolean(rawSettings.workingHours) && (
            <span onClick={(e) => handleSubClick(e, "card-0")} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/[0.04] ${subRing("card-0")}`}>
              <Clock className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>{String(rawSettings.workingHours)}</span>
            </span>
          )}
          {(Boolean(rawSettings.address) || Boolean(rawSettings.wilaya)) && (
            <span onClick={(e) => handleSubClick(e, "card-1")} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/[0.04] ${subRing("card-1")}`}>
              <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>{String(rawSettings.address || rawSettings.wilaya)}</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
