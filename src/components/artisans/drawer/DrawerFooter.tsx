import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { OlmaLanguageSelector } from "../../common/OlmaLanguageSelector";

interface DrawerFooterProps {
  onLogout: () => void;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({ onLogout }) => {
  const { currentUser } = useAuth();

  return (
    <div className="px-5 py-4 bg-white border-t border-slate-200 shrink-0 space-y-3">
      <OlmaLanguageSelector variant="drawer" />

      {currentUser && (
        <button
          type="button"
          onClick={onLogout}
          className="w-full h-9 px-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      )}
    </div>
  );
};
