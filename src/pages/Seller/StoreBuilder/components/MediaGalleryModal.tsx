import React from "react";
import { MediaGalleryItem } from "../../../../domains/seller/customPage.types";

interface MediaGalleryModalProps {
  mediaGallery: MediaGalleryItem[];
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({ mediaGallery }) => {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-md border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🖼️ Galerie Média du Vendeur</h2>
            <p className="text-xs text-gray-500">Visualisez et réutilisez vos visuels pour vos bannières et carrousels.</p>
          </div>
        </div>

        {mediaGallery.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            Aucun visuel enregistré dans la galerie.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaGallery.map((item) => (
              <div
                key={item.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group relative"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-900">
                  <img src={item.url} alt={item.name || "Media"} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {item.name || "Visuel boutique"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
