import { Box } from "lucide-react";
import { useTranslation } from "react-i18next";
import { computeVolumetricWeight, isBulkyCategory } from "../../../../domains/shipping/services/shippingCalculatorService";

interface VolumetricNoticeProps {
  dimensions?: string;
  weight?: string | number;
  category?: string;
}

export const VolumetricNotice: React.FC<VolumetricNoticeProps> = ({
  dimensions,
  weight,
  category
}) => {
  const { t } = useTranslation();
  const volumetricWeight = computeVolumetricWeight(dimensions);
  const realWeight = typeof weight === "number" ? weight : parseFloat(String(weight || "0")) || 0;
  const isBulky = isBulkyCategory(category);

  if (!volumetricWeight && !isBulky) return null;

  const willApplyVolumetric = volumetricWeight > realWeight;

  return (
    <div className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
      willApplyVolumetric
        ? "bg-amber-50/80 border-amber-300 text-amber-950"
        : "bg-blue-50/70 border-blue-200 text-blue-950"
    }`}>
      <div className="flex items-center gap-2 font-bold mb-1">
        <Box className="w-4 h-4 text-[#C75C1A]" />
        <span>
          {willApplyVolumetric
            ? t("Tarification Volumétrique Active (Articles Encombrants)")
            : t("Information Poids Volumétrique (Standard Transporteurs)")}
        </span>
        {willApplyVolumetric && (
          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            (L x l x h) / 5000
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-700">
        {willApplyVolumetric ? (
          <>
            Pour vos dimensions ({dimensions}), le poids volumétrique calculé est de{" "}
            <strong className="text-amber-950">{volumetricWeight} kg</strong>, supérieur au poids réel ({realWeight} kg).
            Les transporteurs algériens (Yalidine, ZR Express) appliqueront le barème sur cette base volumétrique.
          </>
        ) : (
          <>
            Poids volumétrique calculé : <strong>{volumetricWeight} kg</strong> (Poids réel retenu : <strong>{realWeight} kg</strong>).
            La formule standard algérienne (L x l x h) / 5000 s'applique automatiquement si le volume dépasse le poids physique.
          </>
        )}
      </p>
    </div>
  );
};
