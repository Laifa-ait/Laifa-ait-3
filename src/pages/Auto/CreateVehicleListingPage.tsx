import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, ArrowLeft, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { autoClient } from "../../domains/auto/auto.client";
import { AutoSellerType, CreateVehicleListingInput, VehicleCatalogItemDto } from "../../domains/auto/auto.types";
import { ListingWizardStep1, Step1Data } from "../../components/Auto/ListingWizardStep1";
import { ListingWizardStep2, Step2Data } from "../../components/Auto/ListingWizardStep2";
import { ListingWizardStep3, Step3Data } from "../../components/Auto/ListingWizardStep3";
import { ListingLivePreviewSidebar } from "../../components/Auto/ListingLivePreviewSidebar";
import { useEphemeralAutoStudio, buildVehicleStudioSvgDataUri } from "../../hooks/useEphemeralAutoStudio";
import toast from "react-hot-toast";

export const CreateVehicleListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();
  const { customConfig, updateCustomConfig } = useEphemeralAutoStudio();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ id: string; status: string } | null>(null);

  const [step1, setStep1] = useState<Step1Data>({
    title: customConfig.title, brand: customConfig.brand, model: customConfig.model,
    version: customConfig.version, year: customConfig.year, mileage: customConfig.mileage,
    fuel: customConfig.fuel, transmission: customConfig.transmission,
    wilayaId: customConfig.wilayaId, wilayaName: customConfig.wilayaName,
  });

  const [step2, setStep2] = useState<Step2Data>({
    wilayaId: customConfig.wilayaId, wilayaName: customConfig.wilayaName,
    commune: customConfig.commune, paperStatus: customConfig.paperStatus,
    bodyCondition: customConfig.bodyCondition, price: customConfig.price, priceType: customConfig.priceType,
  });

  const [step3, setStep3] = useState<Step3Data>({
    images: [buildVehicleStudioSvgDataUri(customConfig.brand, customConfig.model, customConfig.year, "#2563EB")],
    options: customConfig.options, description: customConfig.description,
    sellerPhoneNumber: "0550123456", sellerWhatsappNumber: "0550123456",
    sellerType: "particulier" as AutoSellerType, submitForReview: true,
  });

  const syncEphemeralPreview = () => {
    updateCustomConfig({
      title: step1.title.trim() || `${step1.brand} ${step1.model} ${step1.year}`,
      brand: step1.brand, model: step1.model, version: step1.version || "",
      year: Number(step1.year), mileage: Number(step1.mileage),
      fuel: step1.fuel, transmission: step1.transmission,
      wilayaId: Number(step2.wilayaId), wilayaName: step2.wilayaName, commune: step2.commune,
      paperStatus: step2.paperStatus, bodyCondition: step2.bodyCondition,
      price: Number(step2.price), priceType: step2.priceType,
      options: step3.options, description: step3.description,
    });
    toast.success("Aperçu de votre véhicule généré !");
    navigate("/auto/vehicules/ephemeral-custom");
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      setError("Connectez-vous pour publier votre annonce, ou cliquez sur « Prévisualiser la fiche complète ».");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: CreateVehicleListingInput = {
      title: step1.title.trim() || `${step1.brand} ${step1.model} ${step1.year}`,
      brand: step1.brand.trim(), model: step1.model.trim(), version: step1.version?.trim() || undefined,
      year: Number(step1.year), mileage: Number(step1.mileage),
      fuel: step1.fuel, transmission: step1.transmission,
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
      setError(err instanceof Error ? err.message : "Erreur lors de la publication de l'annonce");
    } finally {
      setSubmitting(false);
    }
  };

  const livePreviewVehicle = useMemo<VehicleCatalogItemDto>(() => {
    const fallbackSvg = buildVehicleStudioSvgDataUri(step1.brand, step1.model, Number(step1.year), "#2563EB");
    return {
      id: "ephemeral-custom",
      title: step1.title || `${step1.brand} ${step1.model} ${step1.year}`,
      brand: step1.brand, model: step1.model, year: Number(step1.year), mileage: Number(step1.mileage),
      fuel: step1.fuel, transmission: step1.transmission,
      price: Number(step2.price), priceType: step2.priceType, currency: "DZD",
      paperStatus: step2.paperStatus, bodyCondition: step2.bodyCondition,
      wilayaId: Number(step2.wilayaId), wilayaName: step2.wilayaName,
      primaryImageUrl: step3.images[0] || fallbackSvg,
      isSellerVerified: true, isVehicleInspected: true, status: "active",
      createdAt: new Date().toISOString(),
    };
  }, [step1, step2, step3.images]);

  if (createdResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Véhicule Ajouté avec Succès !</h1>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link to="/auto/dashboard?tab=garage" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-extrabold">
            Voir mes annonces
          </Link>
          <Link to="/auto" className="px-6 py-2.5 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold">
            Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/auto" className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200">
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Retour aux véhicules</span>
          </Link>
          <span className="text-xs font-extrabold text-slate-900">
            Ajouter un véhicule (Publication publicitaire simple)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              {[
                { id: 1, label: "1. Marque & Modèle" },
                { id: 2, label: "2. Wilaya & Prix" },
                { id: 3, label: "3. Photos & Contact" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id as 1 | 2 | 3)}
                  className="flex-1 flex items-center text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs shrink-0 ${
                      step === s.id
                        ? "bg-blue-600 text-white"
                        : step > s.id
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step > s.id ? "✓" : s.id}
                  </div>
                  <span className="ml-2.5 text-xs font-extrabold text-slate-900 hidden sm:block truncate">{s.label}</span>
                  {s.id < 3 && <div className="flex-1 h-0.5 bg-slate-200 mx-3" />}
                </button>
              ))}
            </div>

            {!currentUser && (
              <div className="mb-6 p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-800 font-medium">
                  Remplissez votre annonce librement, ou connectez-vous pour la publier en ligne.
                </span>
                {openAuthModal && (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer border-none"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Se connecter</span>
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <ListingWizardStep1
                data={step1}
                onChange={(u) => {
                  setStep1((prev) => ({ ...prev, ...u }));
                  if (u.wilayaId) setStep2((prev) => ({ ...prev, wilayaId: u.wilayaId!, wilayaName: u.wilayaName || prev.wilayaName }));
                }}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <ListingWizardStep2
                data={step2}
                onChange={(u) => {
                  setStep2((prev) => ({ ...prev, ...u }));
                  if (u.wilayaId) setStep1((prev) => ({ ...prev, wilayaId: u.wilayaId!, wilayaName: u.wilayaName || prev.wilayaName }));
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

          <ListingLivePreviewSidebar
            step={step}
            previewVehicle={livePreviewVehicle}
            onSyncAndPreview={syncEphemeralPreview}
          />
        </div>
      </div>
    </div>
  );
};
