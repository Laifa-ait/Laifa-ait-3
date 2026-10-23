import React from "react";
import { ShieldCheck, FileCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export const AutoTrustSection: React.FC = () => {
  return (
    <section className="mb-14 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
      <div className="max-w-3xl mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Charte de Sécurité Automobile</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Guide des transactions sécurisées en Algérie
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          Recommandations essentielles pour sécuriser votre achat de véhicule d'occasion de particulier à particulier ou auprès d'un showroom agréé.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Règle 1: Papiers */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-[#0B1730] text-[#D9F66F] flex items-center justify-center font-bold text-xs mb-3">
            01
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Statut Administratif Rigoureux</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exigez la <strong>Carte Grise Safia</strong> pour un transfert immédiat. Pour les licences Moudjahid ou procurations (Wekala), vérifiez la date de levée d'incessibilité et le certificat de non-gage auprès de la Daïra.
          </p>
        </div>

        {/* Règle 2: Examen physique */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-[#0B1730] text-[#D9F66F] flex items-center justify-center font-bold text-xs mb-3">
            02
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Contrôle Châssis & Tôlerie</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Inspectez le numéro de châssis frappé à froid (VIN) et vérifiez la tôlerie à la lumière du jour. Faites examiner le véhicule par un tôlier ou mécanicien de confiance pour détecter les découpes ou retouches dissimulées.
          </p>
        </div>

        {/* Règle 3: Paiement et Remise */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-[#0B1730] text-[#D9F66F] flex items-center justify-center font-bold text-xs mb-3">
            03
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Zéro Acompte à Distance</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ne versez <strong>jamais d'arrhes ou d'avance</strong> par virement ou mandat avant d'avoir rencontré le vendeur, essayé le véhicule en personne et vérifié la conformité des pièces d'identité originales.
          </p>
        </div>
      </div>
    </section>
  );
};
