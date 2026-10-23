import React from "react";
import { X } from "lucide-react";
import { CustomPageSectionType } from "../../../../domains/seller/customPage.types";
import { SECTION_CATALOG, SectionOption } from "../constants/sectionCatalog";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (type: CustomPageSectionType, defaultSettings: Record<string, unknown>, defaultTitle?: string) => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ isOpen, onClose, onAddSection }) => {
  if (!isOpen) return null;

  const categories: Array<SectionOption["category"]> = [
    "Bannières & Vitrine",
    "Catalogue Produits",
    "Marque & Histoire",
    "Confiance & Contact",
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ajouter une Section</h2>
            <p className="text-xs text-slate-500">Composez l'agencement de votre vitrine personnalisée</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Categories */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-orange-600 font-mono">{cat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {SECTION_CATALOG.filter((s) => s.category === cat).map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.type}
                      onClick={() => {
                        onAddSection(sec.type, sec.defaultSettings, sec.title);
                        onClose();
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-400 rounded-2xl text-left transition-all group cursor-pointer flex items-start gap-3 shadow-xs"
                    >
                      <div className="p-2 rounded-xl bg-white group-hover:bg-orange-500 text-orange-600 group-hover:text-white shrink-0 transition-colors border border-slate-200 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-900 block group-hover:text-orange-700 transition-colors">
                          {sec.title}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {sec.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
