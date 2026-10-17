import React from "react";
import { AutoSellerType } from "../../domains/auto/auto.types";
import { ImageUploaderWithMagicBytes } from "./ImageUploaderWithMagicBytes";
import { Loader2 } from "lucide-react";

export interface Step3Data {
  images: string[];
  options: string[];
  description: string;
  sellerPhoneNumber: string;
  sellerWhatsappNumber: string;
  sellerType: AutoSellerType;
  submitForReview: boolean;
}

interface Step3Props {
  data: Step3Data;
  onChange: (updates: Partial<Step3Data>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  submitting: boolean;
}

const COMMON_AUTO_OPTIONS = [
  "Climatisation",
  "Toit panoramique / ouvrant",
  "Régulateur de vitesse",
  "Radar de recul",
  "Caméra de recul",
  "Sièges en cuir",
  "Jantes alliage",
  "Phares Full LED",
  "Système de navigation GPS",
  "Accès & démarrage sans clé",
  "Alarme d'origine",
  "Rétroviseurs rabattables",
];

export const ListingWizardStep3: React.FC<Step3Props> = ({
  data,
  onChange,
  onSubmit,
  onPrev,
  submitting,
}) => {
  const toggleOption = (opt: string) => {
    if (data.options.includes(opt)) {
      onChange({ options: data.options.filter((o) => o !== opt) });
    } else {
      onChange({ options: [...data.options, opt] });
    }
  };

  const phoneValid = /^(05|06|07|02)[0-9]{8}$/.test(data.sellerPhoneNumber.trim());
  const isValid =
    data.images.length > 0 &&
    data.description.trim().length >= 10 &&
    phoneValid;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-900">3. Photos, Équipements & Contact Vendeur</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ajoutez des visuels nets, détaillez les équipements et vos numéros sécurisés.
        </p>
      </div>

      <ImageUploaderWithMagicBytes
        images={data.images}
        onChange={(images) => onChange({ images })}
        maxImages={8}
      />

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Équipements & Options de série
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_AUTO_OPTIONS.map((opt) => {
            const selected = data.options.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() => toggleOption(opt)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  selected
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {selected ? "✓ " : "+ "}
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Description complète <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Détaillez l'historique d'entretien, révision vidange, carnet d'entretien, deuxième clé, état des pneus..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
          <span>Minimum 10 caractères</span>
          <span>{data.description.length}/5000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Numéro de téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="05 / 06 / 07 / 02..."
            value={data.sellerPhoneNumber}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                sellerPhoneNumber: val,
                sellerWhatsappNumber: data.sellerWhatsappNumber || val,
              });
            }}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium ${
              phoneValid || data.sellerPhoneNumber === ""
                ? "border-slate-300 focus:ring-2 focus:ring-emerald-500"
                : "border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20"
            }`}
          />
          <p className="text-[11px] text-slate-500 mt-1">Format algérien (10 chiffres)</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            WhatsApp de contact <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="0550... ou +213..."
            value={data.sellerWhatsappNumber}
            onChange={(e) => onChange({ sellerWhatsappNumber: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Pour les demandes directes</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Profil vendeur <span className="text-red-500">*</span>
          </label>
          <select
            value={data.sellerType}
            onChange={(e) => onChange({ sellerType: e.target.value as AutoSellerType })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="particulier">Particulier</option>
            <option value="professionnel">Professionnel indépendant</option>
            <option value="concessionnaire">Concessionnaire / Showroom</option>
          </select>
        </div>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <input
          type="checkbox"
          id="submitForReviewCheck"
          checked={data.submitForReview}
          onChange={(e) => onChange({ submitForReview: e.target.checked })}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="submitForReviewCheck" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
          <span className="font-bold text-slate-900 block mb-0.5">
            Soumettre immédiatement à l'équipe de vérification Olmart
          </span>
          Votre annonce sera contrôlée par nos modérateurs avant publication sur le Showroom public. Vous
          pourrez suivre sa progression en temps réel depuis votre espace « Mon Garage ».
        </label>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          disabled={submitting}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors"
        >
          &larr; Retour
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || submitting}
          className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traitement en cours...
            </>
          ) : data.submitForReview ? (
            "Publier l'Annonce Automobile"
          ) : (
            "Enregistrer le Brouillon"
          )}
        </button>
      </div>
    </div>
  );
};
