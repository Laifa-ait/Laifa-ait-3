import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { storage } from "../../lib/firebase";
import { apiPut, apiPost } from "../../lib/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { hasExternalChannel } from "../../utils/masking";
import {
  VerificationDocumentsForm,
  VerificationFormData,
} from "./components/verification/VerificationDocumentsForm";

interface SellerProfile {
  brandName?: string;
  designStyle?: string;
  portfolioUrl?: string;
  brandStory?: string;
  rcNumber?: string;
  nifNumber?: string;
  rib?: string;
  documents?: {
    fileRC?: string;
    fileId?: string;
    fileRib?: string;
  };
}

interface OcrApiResponse {
  success?: boolean;
  result?: {
    rcNumber?: string;
    documentNumber?: string;
  };
}

export const Verification: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const profile = userProfile as unknown as SellerProfile;

  const [formData, setFormData] = useState<VerificationFormData>({
    brandName: profile?.brandName || "",
    designStyle: profile?.designStyle || "",
    portfolioUrl: profile?.portfolioUrl || "",
    brandStory: profile?.brandStory || "",
    rcNumber: profile?.rcNumber || "",
    nifNumber: profile?.nifNumber || "",
    rib: profile?.rib || "",
    fileRC: profile?.documents?.fileRC || "",
    fileId: profile?.documents?.fileId || "",
    fileRib: profile?.documents?.fileRib || "",
  });

  const [selectedFileRC, setSelectedFileRC] = useState<File | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<File | null>(null);
  const [selectedFileRib, setSelectedFileRib] = useState<File | null>(null);

  const statuses = {
    pending: { label: t("En attente de validation"), icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    pending_verification: { label: t("En attente de validation"), icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    active: { label: t("Boutique Certifiée"), icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    rejected: { label: t("Validation Refusée"), icon: XCircle, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
  };

  const status = (userProfile?.status || "pending_verification").toLowerCase();
  const currentStatus = statuses[status as keyof typeof statuses] || statuses.pending_verification;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = userProfile?.uid;
    if (!uid) return void toast.error(t("Veuillez vous reconnecter."));

    if (
      hasExternalChannel(formData.brandName) ||
      hasExternalChannel(formData.designStyle) ||
      hasExternalChannel(formData.brandStory)
    ) {
      toast.error(t("external_channel_blocked", "Les coordonnées extérieures ne sont pas autorisées dans ce champ."));
      return;
    }

    const ALLOWED_KYC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
    const MAX_KYC_SIZE = 10 * 1024 * 1024;
    const validateKYCFile = (file: File): boolean => {
      if (!ALLOWED_KYC_TYPES.includes(file.type)) {
        toast.error(t("Format PDF, JPG ou PNG uniquement"));
        return false;
      }
      if (file.size > MAX_KYC_SIZE) {
        toast.error(t("Fichier trop volumineux (max 10 Mo)"));
        return false;
      }
      return true;
    };

    if (selectedFileRC && !validateKYCFile(selectedFileRC)) return;
    if (selectedFileId && !validateKYCFile(selectedFileId)) return;
    if (selectedFileRib && !validateKYCFile(selectedFileRib)) return;

    setLoading(true);
    let finalFileRC = formData.fileRC;
    let finalFileId = formData.fileId;
    let finalFileRib = formData.fileRib;

    try {
      setUploadProgress(t("Upload sécurisé des documents (KYC Vault)..."));
      const uploadKYCFile = async (file: File, prefix: string) => {
        try {
          const extension = file.name.split(".").pop() || "png";
          const storageRef = ref(storage, `kyc/${uid}/${prefix}_${Date.now()}.${extension}`);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        } catch (err) {
          console.error(err);
          toast.error(t("Erreur lors de l'upload du document"));
          return null;
        }
      };

      if (selectedFileRC) finalFileRC = (await uploadKYCFile(selectedFileRC, "RC")) || finalFileRC;
      if (selectedFileId) finalFileId = (await uploadKYCFile(selectedFileId, "ID")) || finalFileId;
      if (selectedFileRib) finalFileRib = (await uploadKYCFile(selectedFileRib, "RIB")) || finalFileRib;

      setUploadProgress(t("Sauvegarde des données..."));
      await apiPut("/api/v1/seller/profile/verification", {
        brandName: formData.brandName,
        designStyle: formData.designStyle,
        portfolioUrl: formData.portfolioUrl,
        brandStory: formData.brandStory,
        rcNumber: formData.rcNumber,
        nifNumber: formData.nifNumber,
        rib: formData.rib,
        documents: { fileRC: finalFileRC, fileId: finalFileId, fileRib: finalFileRib },
      });

      setFormData((prev) => ({ ...prev, fileRC: finalFileRC, fileId: finalFileId, fileRib: finalFileRib }));
      setSelectedFileRC(null);
      setSelectedFileId(null);
      setSelectedFileRib(null);
      setUploadProgress("");
      await updateUserProfile();
      toast.success(t("Documents envoyés pour validation !"));
    } catch (err: unknown) {
      console.error("Critical submission error:", err);
      toast.error(err instanceof Error ? err.message : t("Impossible d'envoyer les documents"));
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "RC" | "Id" | "Rib") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase()) || file.size > 10 * 1024 * 1024) {
      toast.error(t("Format PDF/PNG/JPEG uniquement (Max 10 Mo)."));
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (type === "RC") {
      setSelectedFileRC(file);
      setFormData((prev) => ({ ...prev, fileRC: previewUrl }));
    } else if (type === "Id") {
      setSelectedFileId(file);
      setFormData((prev) => ({ ...prev, fileId: previewUrl }));
    } else {
      setSelectedFileRib(file);
      setFormData((prev) => ({ ...prev, fileRib: previewUrl }));
    }

    if ((type === "RC" && !formData.rcNumber) || (type === "Id" && !formData.nifNumber)) {
      try {
        toast.loading(isArabic ? "جاري استخراج البيانات..." : "Extraction automatique des données...", { id: "ocr-toast" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(",")[1];
            const data = await apiPost<OcrApiResponse>("/api/v1/seller/ocr", {
              type: type === "RC" ? "RC" : "ID",
              imageBase64: base64Data,
              base64Data,
              mimeType: file.type,
            });
            if (type === "RC" && data?.result?.rcNumber) {
              setFormData((prev) => ({ ...prev, rcNumber: data.result?.rcNumber || "" }));
              toast.success(t("Numéro RC extrait avec succès !"), { id: "ocr-toast" });
              return;
            }
            if (type === "Id" && data?.result?.documentNumber) {
              setFormData((prev) => ({ ...prev, nifNumber: data.result?.documentNumber || "" }));
              toast.success(t("Numéro d'identité extrait avec succès !"), { id: "ocr-toast" });
              return;
            }
          } catch {
            // Silent fallback when OCR is unavailable
          }
          toast.dismiss("ocr-toast");
        };
        reader.readAsDataURL(file);
      } catch (err) {
        toast.dismiss("ocr-toast");
        console.error("OCR Auto-fill error:", err);
      }
    }
  };

  const hasLegalChanges =
    formData.rcNumber !== (userProfile?.rcNumber || "") ||
    formData.nifNumber !== (userProfile?.nifNumber || "") ||
    formData.rib !== (userProfile?.rib || "") ||
    selectedFileRC !== null ||
    selectedFileId !== null ||
    selectedFileRib !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1836]">
          {t("Vérification KYC & Conformité Légale")}
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm mt-1">
          {t("Conformément à la Loi 18-05 du commerce électronique en Algérie.")}
        </p>
      </div>

      <div className={`p-6 rounded-3xl border ${currentStatus.bg} flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-2xl bg-white shadow-2xs flex items-center justify-center shrink-0 ${currentStatus.color}`}>
          <currentStatus.icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-base sm:text-lg font-extrabold ${currentStatus.color}`}>{currentStatus.label}</h3>
          <p className="text-zinc-600 text-xs sm:text-sm">
            {status === "active"
              ? t("Votre boutique est certifiée et vos produits sont visibles publiquement.")
              : t("Nos agents examinent vos pièces justificatives (délai moyen : 24h).")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E0B4B2]/40 shadow-2xs overflow-hidden p-6 sm:p-8">
        <VerificationDocumentsForm
          formData={formData}
          onChangeFormData={setFormData}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          loading={loading}
          uploadProgress={uploadProgress}
          status={status}
          hasLegalChanges={hasLegalChanges}
        />
      </div>
    </div>
  );
};
