import React from "react";
import { ShieldCheck, Upload, FileText, Info, FileImage } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface VerificationFormData {
  brandName: string;
  designStyle: string;
  portfolioUrl: string;
  brandStory: string;
  rcNumber: string;
  nifNumber: string;
  rib: string;
  fileRC: string;
  fileId: string;
  fileRib: string;
}

interface VerificationDocumentsFormProps {
  formData: VerificationFormData;
  onChangeFormData: React.Dispatch<React.SetStateAction<VerificationFormData>>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: "RC" | "Id" | "Rib") => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  uploadProgress: string;
  status: string;
  hasLegalChanges: boolean;
}

export const VerificationDocumentsForm: React.FC<VerificationDocumentsFormProps> = ({
  formData,
  onChangeFormData,
  onFileChange,
  onSubmit,
  loading,
  uploadProgress,
  status,
  hasLegalChanges,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-5 bg-[#FAF7F8] p-6 rounded-3xl border border-[#E0B4B2]/40">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#A54055] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{t("Étape 1 : Identité Commerciale & Atelier")}</span>
        </h4>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
              {t("Nom de la marque / Boutique")}
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3.5 bg-white border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836] focus:border-[#A54055]"
              value={formData.brandName || ""}
              onChange={(e) => onChangeFormData((prev) => ({ ...prev, brandName: e.target.value }))}
              placeholder={t("Ex: Maison Olma")}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
              {t("Spécialité / Style principal")}
            </label>
            <select
              required
              className="w-full px-4 py-3.5 bg-white border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836] focus:border-[#A54055]"
              value={formData.designStyle || ""}
              onChange={(e) => onChangeFormData((prev) => ({ ...prev, designStyle: e.target.value }))}
            >
              <option value="" disabled>{t("Sélectionnez une spécialité...")}</option>
              <option value="Contemporain">{t("Contemporain")}</option>
              <option value="Minimaliste">{t("Minimaliste")}</option>
              <option value="Mid-Century">{t("Mid-Century")}</option>
              <option value="Artisanal">{t("Artisanal")}</option>
              <option value="Industriel">{t("Industriel")}</option>
              <option value="Autre">{t("Autre")}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
              {t("Lien Portfolio / Catalogue Externe (Optionnel)")}
            </label>
            <input
              type="url"
              className="w-full px-4 py-3.5 bg-white border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836] focus:border-[#A54055]"
              value={formData.portfolioUrl || ""}
              onChange={(e) => onChangeFormData((prev) => ({ ...prev, portfolioUrl: e.target.value }))}
              placeholder="https://votre-catalogue.dz"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
              {t("Présentation de votre activité (Optionnel)")}
            </label>
            <textarea
              className="w-full px-4 py-3.5 bg-white border border-[#E0B4B2]/50 rounded-2xl outline-none font-medium text-sm text-[#1A1836] h-28 resize-none focus:border-[#A54055]"
              value={formData.brandStory || ""}
              onChange={(e) => onChangeFormData((prev) => ({ ...prev, brandStory: e.target.value }))}
              placeholder={t("Décrivez votre savoir-faire, vos produits...")}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-2">
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1A1836] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#A54055]" />
            <span>{t("Étape 2 : Informations Légales (Algérie)")}</span>
          </h4>
          <div>
            <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
              {t("Numéro Registre de Commerce (RC)")}
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836]"
              value={formData.rcNumber || ""}
              onChange={(e) => onChangeFormData((prev) => ({ ...prev, rcNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
              {t("NIF (Identifiant Fiscal)")}
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836]"
              value={formData.nifNumber || ""}
              onChange={(e) => onChangeFormData((prev) => ({ ...prev, nifNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
              {t("Compte Bancaire / CCP (RIB / RIP)")}
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2]/50 rounded-2xl outline-none font-bold text-sm text-[#1A1836]"
              value={formData.rib || ""}
              onChange={(e) => onChangeFormData((prev) => ({ ...prev, rib: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#A54055] flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>{t("Justificatifs Officiels (PDF / Image)")}</span>
          </h4>
          {[
            { key: "RC" as const, field: formData.fileRC, label: t("Registre de Commerce (CNRC)"), empty: t("Déposer Registre de Commerce") },
            { key: "Id" as const, field: formData.fileId, label: t("Pièce d'identité (CNI / Passeport)"), empty: t("Déposer Pièce d'identité") },
            { key: "Rib" as const, field: formData.fileRib, label: t("Relevé d'identité bancaire / CCP (RIB)"), empty: t("Déposer Attestation RIB") },
          ].map((doc) => (
            <div key={doc.key}>
              <label className="block text-[11px] font-bold text-[#622347] uppercase tracking-wider mb-1.5">
                {doc.label}
              </label>
              <div className="relative overflow-hidden w-full px-4 py-3.5 bg-[#FAF7F8] border border-[#E0B4B2] border-dashed rounded-2xl flex items-center justify-center hover:bg-[#E0B4B2]/15 transition-colors cursor-pointer">
                <input
                  required={!doc.field}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => onFileChange(e, doc.key)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 pointer-events-none">
                  <FileImage className={`w-5 h-5 ${doc.field ? "text-emerald-600" : "text-[#A54055]"}`} />
                  <span className="text-xs font-bold text-[#1A1836]">
                    {doc.field ? t("Document chargé ✓") : doc.empty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FAF7F8] border border-[#E0B4B2]/40 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-[#A54055] shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-600 leading-relaxed">
          {t("Conformément à la Loi 18-05 relative au commerce électronique en Algérie, ces pièces permettent de certifier votre boutique auprès des acheteurs.")}
        </p>
      </div>

      {status === "active" && hasLegalChanges && (
        <div id="kyc-warning" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-medium flex gap-3">
          <Info className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold uppercase tracking-wider mb-0.5">{t("Attention : Révocation de Certification")}</p>
            <p>{t("La modification de vos informations légales (RC, NIF, RIB) remettra votre boutique en attente de vérification administrative.")}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#1A1836] to-[#42164B] hover:from-[#42164B] hover:to-[#622347] text-white py-4 rounded-2xl font-extrabold uppercase tracking-wider text-xs transition-all shadow-lg disabled:opacity-50 cursor-pointer border-none"
      >
        {loading
          ? uploadProgress || t("Traitement en cours...")
          : status === "active" && !hasLegalChanges
          ? t("Profil Certifié (Mettre à jour la présentation)")
          : t("Sauvegarder & Soumettre pour vérification")}
      </button>
    </form>
  );
};
