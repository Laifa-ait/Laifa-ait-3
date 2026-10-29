import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="relative bg-gradient-to-br from-[#1A1836] via-[#42164B] to-[#622347] text-white py-7 px-5 sm:px-8 rounded-3xl border border-[#A54055]/30 shadow-xl overflow-hidden">
        <div className="relative max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-[#E99856] mb-2">
            Showroom Automobile Certifié · 69 Wilayas · Transactions Directes
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-5 leading-tight max-w-2xl">
            Trouvez, estimez ou vendez votre véhicule en toute confiance en Algérie
          </h1>

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
