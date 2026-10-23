import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, Smartphone, Share2 } from "lucide-react";

interface PreviewQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopSlug?: string;
  shopName?: string;
}

export const PreviewQrModal: React.FC<PreviewQrModalProps> = ({
  isOpen,
  onClose,
  shopSlug,
  shopName = "Boutique Olmart",
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://olmart.dz";
  const previewPath = shopSlug ? `/store/${shopSlug}` : "/seller/store-builder";
  const previewUrl = `${currentOrigin}${previewPath}?preview=seller_studio`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenNewTab = () => {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Regarde l'aperçu de ma boutique ${shopName} sur Olmart : ${previewUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#F9FAFB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFF1E7] text-[#F97316] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Aperçu Mobile en Direct</h3>
              <p className="text-[11px] text-gray-500">Testez le rendu en conditions réelles</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* QR Code Container */}
          <div className="p-3 bg-white border-2 border-dashed border-[#FDBA74] rounded-2xl shadow-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                previewUrl
              )}&color=ea580c&bgcolor=ffffff&margin=1`}
              alt={`QR Code pour tester ${shopName}`}
              className="w-48 h-48 rounded-lg block"
              loading="lazy"
            />
          </div>

          <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
            Pointez l'appareil photo de votre smartphone vers ce code pour charger votre vitrine instantanément.
          </p>

          {/* URL Box */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-left">
            <span className="text-xs font-mono text-gray-700 truncate select-all">{previewUrl}</span>
            <button
              type="button"
              onClick={handleCopy}
              className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copié !" : "Copier"}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="h-10 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewTab}
              className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ouvrir onglet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
