import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Users } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost, apiPut } from "../../lib/api";
import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { AdminStatCard } from "../../components/ui/Admin/AdminStatCard";
import { AdminDataTable } from "../../components/ui/Admin/AdminDataTable";
import { useConfirm } from "../../hooks/useConfirm";
import { IpLogsModal } from "../../components/Admin/IpLogsModal";
import { AdminUserItem, buildUserTableColumns } from "../../components/Admin/Users/UsersTableColumns";
import { UsersFilterToolbar } from "../../components/Admin/Users/UsersFilterToolbar";
import { exportToCSVNative } from "../../utils/csvExport";

export const UsersAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [sortByFilter, setSortByFilter] = useState("createdAt_desc");
  const [ipLogsUser, setIpLogsUser] = useState<AdminUserItem | null>(null);
  const lastVisibleRef = useRef<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchUsers = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setLoading(true);
        lastVisibleRef.current = null;
      } else {
        setLoadingMore(true);
      }

      try {
        const queryParams = new URLSearchParams();
        if (roleFilter !== "all") queryParams.append("role", roleFilter);
        queryParams.append("limit", "50");
        if (isLoadMore && lastVisibleRef.current) {
          queryParams.append("lastDocId", lastVisibleRef.current);
        }

        const res = await apiGet<{
          success?: boolean;
          users?: AdminUserItem[];
          lastVisibleId?: string;
          hasMore?: boolean;
        }>(`/api/v1/admin/users?${queryParams.toString()}`);

        if (res && res.success) {
          const fetched = res.users || [];
          setUsers((prev) => (isLoadMore ? [...prev, ...fetched] : fetched));
          lastVisibleRef.current = res.lastVisibleId || null;
          setHasMore(Boolean(res.hasMore));
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Erreur lors du chargement des utilisateurs.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [roleFilter]
  );

  useEffect(() => {
    void fetchUsers(false);
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiPut(`/api/v1/admin/users/${userId}/role`, { role: newRole });
      toast.success("Rôle utilisateur mis à jour");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur de modification du rôle");
    }
  };

  const handleUpdateClientType = async (userId: string, newType: string) => {
    try {
      await apiPut(`/api/v1/admin/users/${userId}/client-type`, { clientType: newType });
      toast.success("Segment B2C/B2B mis à jour");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, clientType: newType } : u)));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleToggleStatus = async (user: AdminUserItem) => {
    const isSuspended = user.status === "suspended" || user.status === "blocked" || user.status === "inactive";
    const actionTxt = isSuspended ? "réactiver" : "suspendre";
    const confirmed = await showConfirmModal(
      `Voulez-vous vraiment ${actionTxt} le compte de ${user.displayName || user.email} ?`
    );
    if (!confirmed) return;

    try {
      const newStatus = isSuspended ? "active" : "suspended";
      await apiPut(`/api/v1/admin/users/${user.id}/status`, { status: newStatus });
      toast.success(`Compte ${isSuspended ? "réactivé" : "suspendu"} avec succès`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'opération");
    }
  };

  const handleBulkStatusUpdate = async (newStatus: "active" | "suspended") => {
    if (selectedUserIds.length === 0) return;
    setBulkLoading(true);
    try {
      await apiPost("/api/v1/admin/users/bulk-status", { userIds: selectedUserIds, status: newStatus });
      setUsers((prev) => prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: newStatus } : u)));
      setSelectedUserIds([]);
      toast.success("Statuts mis à jour en lot");
    } catch {
      toast.error(t("Erreur lors de la mise à jour en lot"));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    const confirmed = await showConfirmModal(t("Supprimer définitivement les comptes sélectionnés ?"));
    if (!confirmed) return;
    setBulkLoading(true);
    try {
      await apiPost("/api/v1/admin/users/bulk-delete", { userIds: selectedUserIds });
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);
      toast.success(t("Utilisateurs supprimés avec succès"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("Erreur lors de la suppression"));
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const matchesSearch =
        !searchTerm ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWilaya = wilayaFilter === "all" || u.wilaya === wilayaFilter;
      const uStatus = u.status || "active";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && uStatus === "active") ||
        (statusFilter === "suspended" && uStatus !== "active");
      return matchesSearch && matchesWilaya && matchesStatus;
    })
    .sort((a, b) => {
      if (sortByFilter === "orders_desc") return (b.orderCount || 0) - (a.orderCount || 0);
      if (sortByFilter === "orders_asc") return (a.orderCount || 0) - (b.orderCount || 0);
      return 0;
    });

  const exportCSV = () => {
    const rows = filteredUsers.map((u) => ({
      ID: u.id,
      Nom: u.displayName || "",
      Email: u.email || "",
      Role: u.role || "buyer",
      Segment: u.clientType || "B2C",
      Commandes: u.orderCount || 0,
      Statut: u.status || "active",
    }));
    exportToCSVNative(rows, `olmart_users_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Export CSV réussi");
  };

  const columns = buildUserTableColumns({
    t,
    selectedUserIds,
    filteredUsers,
    onSelectAll: (checked) => setSelectedUserIds(checked ? filteredUsers.map((u) => u.id) : []),
    onSelectUser: (id, checked) =>
      setSelectedUserIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id))),
    onUpdateRole: (id, role) => void handleUpdateRole(id, role),
    onUpdateClientType: (id, type) => void handleUpdateClientType(id, type),
    onToggleStatus: (u) => void handleToggleStatus(u),
    onOpenIpLogs: (u) => setIpLogsUser(u),
  });

  return (
    <div className="space-y-8">
      <ConfirmationDialog />
      <AdminPageHeader
        title={t("Utilisateurs, Rôles & Segments B2B")}
        subtitle={t("Gérez les comptes acheteurs, vendeurs, artisans, annonceurs Immo et privilèges B2B.")}
        actions={
          <AdminStatCard
            title={t("Comptes affichés")}
            value={`${filteredUsers.length}${hasMore ? "+" : ""}`}
            icon={Users}
            colorClass="text-[#A54055]"
            iconBgClass="bg-rose-50"
          />
        }
      />

      <UsersFilterToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        wilayaFilter={wilayaFilter}
        setWilayaFilter={setWilayaFilter}
        sortByFilter={sortByFilter}
        setSortByFilter={setSortByFilter}
        onExportCSV={exportCSV}
        selectedUserIds={selectedUserIds}
        bulkLoading={bulkLoading}
        onBulkStatusUpdate={(st) => void handleBulkStatusUpdate(st)}
        onBulkDelete={() => void handleBulkDelete()}
      />

      <AdminDataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={loading}
        emptyState={<div className="text-zinc-500 font-medium">{t("Aucun utilisateur trouvé.")}</div>}
      />

      {!loading && hasMore && filteredUsers.length > 0 && (
        <div className="p-6 flex justify-center">
          <button
            onClick={() => void fetchUsers(true)}
            disabled={loadingMore}
            className="px-8 py-3 bg-white border border-zinc-200 text-zinc-700 font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loadingMore ? t("Chargement...") : t("Charger plus d'utilisateurs")}
          </button>
        </div>
      )}

      <AnimatePresence>
        {ipLogsUser && <IpLogsModal user={ipLogsUser} onClose={() => setIpLogsUser(null)} />}
      </AnimatePresence>
    </div>
  );
};
