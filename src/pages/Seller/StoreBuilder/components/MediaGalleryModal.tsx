import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { MediaGalleryItem } from "../../../../domains/seller/customPage.types";

interface MediaGalleryModalProps {
  mediaGallery: MediaGalleryItem[];
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({ mediaGallery }) => {
  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Médiathèque de la Boutique</h2>
              <p className="text-xs text-slate-500">Visualisez et réutilisez vos visuels pour vos bannières et carrousels.</p>
            </div>
          </div>
        </div>

        {mediaGallery.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            Aucun visuel enregistré dans la galerie pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaGallery.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 group relative shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-slate-100">
                  <img src={item.url} alt={item.name || "Media"} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5 text-[11px] font-semibold text-slate-800 truncate">
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
