import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { getModelsForBrand } from "../../domains/auto/auto.brands";
import { AutoHeroSearchForm } from "./AutoHeroSearchForm";

export const AutoHeroShowroom: React.FC = () => {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  const availableModels = selectedBrand ? getModelsForBrand(selectedBrand) : [];

  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    setSelectedModel("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickSearch.trim()) params.set("query", quickSearch.trim());
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedModel) params.set("model", selectedModel);
    if (selectedWilaya) params.set("wilayaId", selectedWilaya);
    if (selectedBudget) params.set("maxPrice", selectedBudget);
    navigate(`/auto/catalog?${params.toString()}`);
  };

  return (
    <div className="relative mb-8">
      {/* Hero Card Sombre Automotive Studio */}
      <div className="relative bg-gradient-to-br from-[#0B1730] via-[#101E3D] to-[#0B1730] text-white pt-6 pb-6 px-4 sm:px-6 rounded-2xl sm:rounded-3xl border border-[#172B4D] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9F66F]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#172B4D]/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge officiel de marché automobile */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#172B4D]/90 border border-[#23416A] text-[11px] font-bold text-[#D9F66F] shadow-xs backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9F66F]" />
              <span>Place de marché automobile n°1 · 69 Wilayas</span>
            </span>
          </div>

          {/* Titre Principal */}
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-4 leading-snug">
            Trouvez votre prochaine <span className="text-white">voiture</span> en{" "}
            <span className="text-[#D9F66F] bg-gradient-to-r from-[#D9F66F] via-[#E2FB7D] to-[#C5E94F] bg-clip-text text-transparent">
              Algérie
            </span>
          </h1>

          {/* Formulaire de Recherche Automobile avec Barre de Recherche Intégrée */}
          <AutoHeroSearchForm
            quickSearch={quickSearch}
            onQuickSearchChange={setQuickSearch}
            selectedBrand={selectedBrand}
            selectedModel={selectedModel}
            selectedWilaya={selectedWilaya}
            selectedBudget={selectedBudget}
            availableModels={availableModels}
            onBrandChange={handleBrandChange}
            onModelChange={setSelectedModel}
            onWilayaChange={setSelectedWilaya}
            onBudgetChange={setSelectedBudget}
            onSubmit={handleSearchSubmit}
          />
        </div>
      </div>
    </div>
  );
};
