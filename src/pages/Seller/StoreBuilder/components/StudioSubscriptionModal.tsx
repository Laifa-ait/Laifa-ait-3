import React, { useState } from "react";
import { Send, AlertCircle, ShieldCheck, X } from "lucide-react";
import { SubscriptionPlan, SubscriptionRequest } from "../../../../domains/seller/subscription.types";
import { StoreConfig, CustomPageSection } from "../../../../domains/seller/customPage.types";
import { StoreReviewStep } from "./modal/StoreReviewStep";
import { SubscriptionStepChoose } from "./modal/SubscriptionStepChoose";
import { SubscriptionStepPayment } from "./modal/SubscriptionStepPayment";

interface StudioSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  pendingRequest?: SubscriptionRequest | null;
  storeConfig?: StoreConfig | null;
  sections?: CustomPageSection[];
  onRequestPlan: (planId: string) => Promise<void>;
  onSubmitProof: (payload: {
    requestId: string;
    transactionReference: string;
    paymentDate: string;
    proofFileUrl?: string;
    receiptNote?: string;
  }) => Promise<void>;
}

export const StudioSubscriptionModal: React.FC<StudioSubscriptionModalProps> = ({
  isOpen,
  onClose,
  plans,
  pendingRequest,
  storeConfig = null,
  sections = [],
  onRequestPlan,
  onSubmitProof,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans[1]?.id || plans[0]?.id || "pro_creator"
  );

  const initialStep =
    pendingRequest?.status === "payment_declared"
      ? "pending"
      : pendingRequest?.status === "payment_requested"
      ? "payment"
      : "review";

  const [step, setStep] = useState<"review" | "choose" | "payment" | "pending">(initialStep);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [proofFileUrl, setProofFileUrl] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSelectAndProceed = async (planId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await onRequestPlan(planId);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sélection du forfait.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRequest) return;
    setIsLoading(true);
    setError(null);
    try {
      await onSubmitProof({
        requestId: pendingRequest.id,
        transactionReference,
        paymentDate,
        proofFileUrl: proofFileUrl.trim() || undefined,
        receiptNote: receiptNote.trim() || undefined,
      });
      setStep("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la transmission du justificatif.");
    } finally {
      setIsLoading(false);
    }
  };

  const instructions = pendingRequest?.paymentInstructions || {
    bankName: "Banque Nationale d'Algérie (BNA) / CCP Algérie Poste",
    accountHolder: "OLMART E-COMMERCE ALGERIE EURL",
    rib: "007 99999 000000000000 00 (CCP: 21000000 Clé 99)",
    amount: plans.find((p) => p.id === selectedPlanId)?.priceDZD || 7000,
    referenceCode: `OLM-${Date.now().toString().slice(-6)}`,
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-200/80">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Publication & Activation de votre Boutique
              </h3>
              <p className="text-xs text-slate-500">
                Processus officiel de mise en ligne sécurisé avec l'administration Olmart.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Revue de la vitrine créée */}
        {step === "review" && (
          <StoreReviewStep
            storeConfig={storeConfig}
            sections={sections}
            onNext={() => setStep("choose")}
          />
        )}

        {/* STEP 2: Choisir le Forfait */}
        {step === "choose" && (
          <SubscriptionStepChoose
            plans={plans}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            isLoading={isLoading}
            onSelectAndProceed={handleSelectAndProceed}
            onBack={() => setStep("review")}
          />
        )}

        {/* STEP 3: Instructions & Déclaration Paiement DZD */}
        {step === "payment" && (
          <SubscriptionStepPayment
            instructions={instructions}
            copiedField={copiedField}
            onCopy={handleCopy}
            transactionReference={transactionReference}
            setTransactionReference={setTransactionReference}
            paymentDate={paymentDate}
            setPaymentDate={setPaymentDate}
            proofFileUrl={proofFileUrl}
            setProofFileUrl={setProofFileUrl}
            receiptNote={receiptNote}
            setReceiptNote={setReceiptNote}
            isLoading={isLoading}
            onBackToChoose={() => setStep("choose")}
            onSubmitPayment={handleSubmitPayment}
          />
        )}

        {/* STEP 4: En attente de vérification Admin */}
        {step === "pending" && (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Dossier de publication transmis à l'Administration
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Votre vitrine personnalisée et votre déclaration de virement sont transmises pour rapprochement comptable par l'équipe Olmart. Vous conservez votre accès complet au Studio pour peaufiner vos sections et votre catalogue.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Retourner au Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
