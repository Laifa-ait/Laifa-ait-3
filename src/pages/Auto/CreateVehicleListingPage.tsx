import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { autoClient } from "../../domains/auto/auto.client";
import {
  VehicleFuel,
  VehicleTransmission,
  VehiclePaperStatus,
  VehicleBodyCondition,
  VehiclePriceType,
  AutoSellerType,
  CreateVehicleListingInput,
} from "../../domains/auto/auto.types";
import { ListingWizardStep1, Step1Data } from "../../components/Auto/ListingWizardStep1";
import { ListingWizardStep2, Step2Data } from "../../components/Auto/ListingWizardStep2";
import { ListingWizardStep3, Step3Data } from "../../components/Auto/ListingWizardStep3";

export const CreateVehicleListingPage: React.FC = () => {
  const { currentUser, openAuthModal } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ id: string; status: string } | null>(null);

  const [step1, setStep1] = useState<Step1Data>({
    title: "Renault Clio 4 GT Line 2019",
    brand: "Renault",
    model: "Clio 4",
    version: "GT Line",
    year: 2019,
    mileage: 82000,
    fuel: "diesel" as VehicleFuel,
    transmission: "manuelle" as VehicleTransmission,
    wilayaId: 16,
    wilayaName: "Alger",
  });

  const [step2, setStep2] = useState<Step2Data>({
    wilayaId: 16,
    wilayaName: "Alger",
    commune: "Chéraga",
    paperStatus: "safia" as VehiclePaperStatus,
    bodyCondition: "origine" as VehicleBodyCondition,
    price: 2450000,
    priceType: "negociable" as VehiclePriceType,
  });

  const [step3, setStep3] = useState<Step3Data>({
    images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"],
    options: ["Climatisation", "Radar de recul", "Jantes alliage", "Régulateur de vitesse"],
    description: "Véhicule en parfait état, carnet d'entretien à jour chez concessionnaire. Papiers carte grise safia, aucun frais à prévoir.",
    sellerPhoneNumber: "0550123456",
    sellerWhatsappNumber: "0550123456",
    sellerType: "particulier" as AutoSellerType,
    submitForReview: true,
  });

  const handleSubmit = async () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      setError("Veuillez vous connecter pour publier votre annonce automobile.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateVehicleListingInput = {
      title: step1.title.trim() || `${step1.brand} ${step1.model} ${step1.year}`,
      brand: step1.brand.trim(), model: step1.model.trim(), version: step1.version?.trim() || undefined,
      year: Number(step1.year), mileage: Number(step1.mileage), fuel: step1.fuel, transmission: step1.transmission,
      paperStatus: step2.paperStatus, bodyCondition: step2.bodyCondition,
      price: Number(step2.price), priceType: step2.priceType, currentOfferPrice: step2.currentOfferPrice,
      wilayaId: Number(step2.wilayaId), wilayaName: step2.wilayaName, commune: step2.commune.trim(),
      images: step3.images, options: step3.options, description: step3.description.trim(),
      sellerPhoneNumber: step3.sellerPhoneNumber.trim(), sellerWhatsappNumber: step3.sellerWhatsappNumber.trim(),
      sellerType: step3.sellerType, submitForReview: step3.submitForReview,
    };

    try {
      const res = await autoClient.createListing(payload);
      setCreatedResult({ id: res.id, status: res.status });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création de l'annonce";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (createdResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Annonce Déposée avec Succès !</h1>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          {createdResult.status === "pending_review"
            ? "Votre annonce a été soumise à notre équipe de modération. Vous serez notifié dès sa validation."
            : "Votre annonce a été enregistrée comme brouillon. Vous pourrez la finaliser quand vous le souhaitez."}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/dashboard/seller/auto"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Accéder à Mon Garage
          </Link>
          <Link
            to="/auto"
            className="px-6 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
          >
            Retour au Showroom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/auto"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Showroom Olma Auto
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Vérification d'annonces certifiée Olmart</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s
                    ? "bg-emerald-600 text-white"
                    : step > s
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              <div className="ml-2 hidden sm:block">
                <span className="text-[11px] font-bold text-slate-800 block">
                  {s === 1 ? "Identité" : s === 2 ? "Papiers & Prix" : "Photos & Contact"}
                </span>
              </div>
              {s < 3 && <div className="flex-1 h-0.5 bg-slate-200 mx-3" />}
            </div>
          ))}
        </div>

        {!currentUser && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-800">
            <div className="flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Vous devez être connecté pour finaliser la publication.</span>
            </div>
            {openAuthModal && (
              <button
                type="button"
                onClick={openAuthModal}
                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Se connecter
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Impossible de créer l'annonce</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <ListingWizardStep1
            data={step1}
            onChange={(u) => {
              setStep1((prev) => ({ ...prev, ...u }));
              if (u.wilayaId) {
                setStep2((prev) => ({
                  ...prev,
                  wilayaId: u.wilayaId!,
                  wilayaName: u.wilayaName || prev.wilayaName,
                }));
              }
            }}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <ListingWizardStep2
            data={step2}
            onChange={(u) => {
              setStep2((prev) => ({ ...prev, ...u }));
              if (u.wilayaId) {
                setStep1((prev) => ({
                  ...prev,
                  wilayaId: u.wilayaId,
                  wilayaName: u.wilayaName || prev.wilayaName,
                }));
              }
            }}
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <ListingWizardStep3
            data={step3}
            onChange={(u) => setStep3((prev) => ({ ...prev, ...u }))}
            onSubmit={handleSubmit}
            onPrev={() => setStep(2)}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};
