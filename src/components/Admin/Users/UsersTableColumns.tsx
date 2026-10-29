import React from "react";
import {
  Building2,
  Star,
  CheckCircle2,
  PowerOff,
  Monitor,
  CheckSquare,
  Square,
  ShieldCheck,
} from "lucide-react";

export interface AdminUserItem {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  clientType?: string;
  orderCount?: number;
  status?: string;
  wilaya?: string;
  createdAt?:
    | {
        toDate?: () => Date;
        toMillis?: () => number;
      }
    | string
    | number;
  [key: string]: unknown;
}

interface BuildUserColumnsParams {
  t: (key: string) => string;
  selectedUserIds: string[];
  filteredUsers: AdminUserItem[];
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  onUpdateClientType: (userId: string, newType: string) => void;
  onToggleStatus: (user: AdminUserItem) => void;
  onOpenIpLogs: (user: AdminUserItem) => void;
}

export const buildUserTableColumns = ({
  t,
  selectedUserIds,
  filteredUsers,
  onSelectAll,
  onSelectUser,
  onUpdateRole,
  onUpdateClientType,
  onToggleStatus,
  onOpenIpLogs,
}: BuildUserColumnsParams) => [
  {
    header: (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectAll(
            selectedUserIds.length !== filteredUsers.length &&
              filteredUsers.length > 0
          );
        }}
        className="text-zinc-400 hover:text-[#A54055] transition-colors cursor-pointer bg-transparent border-none p-0"
      >
        {selectedUserIds.length > 0 &&
        selectedUserIds.length === filteredUsers.length ? (
          <CheckSquare className="w-5 h-5 text-[#A54055]" />
        ) : (
          <Square className="w-5 h-5" />
        )}
      </button>
    ),
    accessor: (user: AdminUserItem) => {
      const isSelected = selectedUserIds.includes(user.id);
      return (
        <div
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onSelectUser(user.id, !isSelected)}
            className="text-zinc-400 hover:text-[#A54055] transition-colors inline-block cursor-pointer bg-transparent border-none p-0"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-[#A54055]" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        </div>
      );
    },
    className: "w-12 text-center",
  },
  {
    header: t("Utilisateur"),
    accessor: (user: AdminUserItem) => {
      const isSuspended =
        user.status === "suspended" ||
        user.status === "blocked" ||
        user.status === "inactive";
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A1836] text-[#E99856] rounded-full flex items-center justify-center font-sans font-bold uppercase shadow-inner">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
          </div>
          <div>
            <span className="font-bold text-zinc-900 block">
              {user.displayName || "Sans nom"}
            </span>
            <span className="text-xs text-zinc-500 block">{user.email}</span>
            {isSuspended && (
              <span className="text-[9px] font-bold text-red-600 uppercase">
                Suspendu
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    header: t("Rôle & Accès"),
    accessor: (user: AdminUserItem) => (
      <div className="relative inline-block w-40">
        <select
          value={user.role || "buyer"}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          className="w-full appearance-none px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 cursor-pointer outline-none focus:border-[#A54055]"
        >
          <option value="buyer">Acheteur (Buyer)</option>
          <option value="seller">Vendeur (Boutique)</option>
          <option value="artisan">Artisan / Pro</option>
          <option value="property_owner">Annonceur Immo</option>
          <option value="admin">Administrateur</option>
        </select>
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    ),
  },
  {
    header: t("Commandes"),
    accessor: (user: AdminUserItem) => (
      <span className="inline-flex items-center justify-center min-w-[2rem] h-8 bg-rose-50 text-[#A54055] rounded-lg text-xs font-bold px-2">
        {user.orderCount || 0}
      </span>
    ),
    className: "text-center",
  },
  {
    header: t("Segment Client (B2C/B2B)"),
    accessor: (user: AdminUserItem) => {
      const normalizedType =
        user.clientType === "B2B_ENTREPRISE" || user.clientType === "B2B_PARTICULIER"
          ? user.clientType
          : "B2C";
      return (
        <div className="relative inline-block w-44">
          <select
            value={normalizedType}
            onChange={(e) => onUpdateClientType(user.id, e.target.value)}
            className={`w-full appearance-none px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-colors cursor-pointer outline-none ${
              normalizedType === "B2B_ENTREPRISE"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : normalizedType === "B2B_PARTICULIER"
                  ? "bg-purple-50 border-purple-200 text-purple-800"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
            }`}
          >
            <option value="B2C">{t("Particulier (B2C)")}</option>
            <option value="B2B_PARTICULIER">{t("VIP / Pro (B2B)")}</option>
            <option value="B2B_ENTREPRISE">{t("Entreprise (B2B)")}</option>
          </select>
          <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {normalizedType === "B2B_ENTREPRISE" && (
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
            )}
            {normalizedType === "B2B_PARTICULIER" && (
              <Star className="w-3.5 h-3.5 text-purple-600" />
            )}
            {normalizedType === "B2C" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </div>
        </div>
      );
    },
  },
  {
    header: t("Actions"),
    accessor: (user: AdminUserItem) => {
      const isSuspended =
        user.status === "suspended" ||
        user.status === "blocked" ||
        user.status === "inactive";
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenIpLogs(user);
            }}
            title={t("Voir l'historique IP")}
            className="p-2 rounded-xl bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(user);
            }}
            title={
              isSuspended ? "Réactiver le compte" : "Suspendre le compte"
            }
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSuspended
                ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                : "bg-red-50 text-red-500 hover:bg-red-100"
            }`}
          >
            <PowerOff className="w-4 h-4" />
          </button>
        </div>
      );
    },
    className: "text-end",
  },
];
