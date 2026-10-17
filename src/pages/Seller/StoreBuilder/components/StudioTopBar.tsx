import React, { useState } from "react";
import { SaveStatus } from "../hooks/useSellerStudio";
import { StoreHistoryEntry } from "../../../../domains/seller/customPage.types";

interface StudioTopBarProps {
  activeTab: "editor" | "theme" | "media";
  setActiveTab: (tab: "editor" | "theme" | "media") => void;
  viewport: "mobile" | "tablet" | "desktop";
  setViewport: (vp: "mobile" | "tablet" | "desktop") => void;
  saveStatus: SaveStatus;
  historyList: StoreHistoryEntry[];
  onPublish: (changeSummary?: string) => void;
  onRollback: (versionNumber: number) => void;
  shopSlug?: string;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  activeTab,
  setActiveTab,
  viewport,
  setViewport,
  saveStatus,
  historyList,
  onPublish,
  onRollback,
  shopSlug,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");

  const handleConfirmPublish = () => {
    onPublish(changeSummary);
    setShowPublishModal(false);
    setChangeSummary("");
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      {/* Tab Switcher */}
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs md:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("editor")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "editor" ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm" : "text-gray-600 dark:text-gray-400"
          }`}
        >
          🧩 Sections & Agencement
        </button>
        <button
          onClick={() => setActiveTab("theme")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "theme" ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm" : "text-gray-600 dark:text-gray-400"
          }`}
        >
          🎨 Thème & Profil
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "media" ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm" : "text-gray-600 dark:text-gray-400"
          }`}
        >
          🖼️ Médiathèque
        </button>
      </div>

      {/* Viewport Selector */}
      {activeTab === "editor" && (
        <div className="hidden lg:flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300">
          <button
            onClick={() => setViewport("mobile")}
            className={`px-3 py-1 rounded-lg ${viewport === "mobile" ? "bg-purple-600 text-white shadow-sm" : ""}`}
          >
            📱 Mobile (375px)
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`px-3 py-1 rounded-lg ${viewport === "tablet" ? "bg-purple-600 text-white shadow-sm" : ""}`}
          >
            Tablet (768px)
          </button>
          <button
            onClick={() => setViewport("desktop")}
            className={`px-3 py-1 rounded-lg ${viewport === "desktop" ? "bg-purple-600 text-white shadow-sm" : ""}`}
          >
            🖥️ Desktop (100%)
          </button>
        </div>
      )}

      {/* Status & Actions */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-semibold">
          {saveStatus === "saving" && <span className="text-amber-500 animate-pulse">⏳ Enregistrement...</span>}
          {saveStatus === "saved" && <span className="text-emerald-600">✓ Brouillon sauvegardé</span>}
          {saveStatus === "error" && <span className="text-red-500">❌ Échec sauvegarde</span>}
        </span>

        {historyList.length > 0 && (
          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 px-3 py-2 rounded-xl font-bold text-gray-700 dark:text-gray-200"
          >
            📜 Historique ({historyList.length})
          </button>
        )}

        {shopSlug && (
          <a
            href={`/store/${shopSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-xl font-bold border border-purple-200 dark:border-purple-800 hidden md:inline-block"
          >
            👁️ Voir la boutique
          </a>
        )}

        <button
          onClick={() => setShowPublishModal(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white text-xs md:text-sm font-extrabold px-4 py-2 rounded-xl shadow-md transition-transform active:scale-95"
        >
          🚀 Publier
        </button>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Historique des publications</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {historyList.map((entry) => (
                <div key={entry.versionNumber} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold block text-purple-700 dark:text-purple-300">Version #{entry.versionNumber}</span>
                    <span className="text-gray-500">{entry.changeSummary || "Publication"}</span>
                  </div>
                  <button
                    onClick={() => {
                      onRollback(entry.versionNumber);
                      setShowHistoryModal(false);
                    }}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-purple-600 hover:text-white px-2.5 py-1 rounded-lg font-bold"
                  >
                    Restaurer
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHistoryModal(false)} className="mt-4 w-full py-2 bg-gray-100 text-xs font-bold rounded-xl">Fermer</button>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Publier votre boutique</h3>
            <p className="text-xs text-gray-500 mb-4">Votre nouvel agencement sera immédiatement visible par vos clients.</p>
            <textarea
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Note de version optionnelle (ex: Ajout de la collection Été)..."
              className="w-full text-xs p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 mb-4 focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <div className="flex space-x-2">
              <button onClick={() => setShowPublishModal(false)} className="flex-1 py-2 bg-gray-100 text-xs font-bold rounded-xl">Annuler</button>
              <button onClick={handleConfirmPublish} className="flex-1 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md">Confirmer la publication</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
