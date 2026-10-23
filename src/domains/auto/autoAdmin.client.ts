import { apiGet, apiPost } from "../../lib/api";
import { AdminModerationListingItemDto, AdminReportItemDto } from "./autoAdmin.types";

interface PendingModerationResponse {
  success: boolean;
  pending: AdminModerationListingItemDto[];
  rejected: AdminModerationListingItemDto[];
}

export const autoAdminClient = {
  async getPendingModeration(): Promise<PendingModerationResponse> {
    const res = await apiGet<PendingModerationResponse>("/api/v1/auto/admin/pending");
    return {
      success: res.success,
      pending: res.pending || [],
      rejected: res.rejected || [],
    };
  },

  async approveListing(id: string): Promise<void> {
    await apiPost<{ success: boolean; message: string }>(`/api/v1/auto/admin/listings/${id}/approve`, {});
  },

  async rejectListing(id: string, reason: string): Promise<void> {
    await apiPost<{ success: boolean; message: string }>(`/api/v1/auto/admin/listings/${id}/reject`, { reason });
  },

  async toggleVerifiedBadge(id: string, isVerified: boolean): Promise<void> {
    await apiPost<{ success: boolean; message: string }>(`/api/v1/auto/admin/listings/${id}/verify-badge`, {
      isVerified,
    });
  },

  async getReports(): Promise<AdminReportItemDto[]> {
    const res = await apiGet<{ success: boolean; reports: AdminReportItemDto[] }>("/api/v1/auto/admin/reports");
    return res.reports || [];
  },

  async dismissReport(id: string): Promise<void> {
    await apiPost<{ success: boolean; message: string }>(`/api/v1/auto/admin/reports/${id}/dismiss`, {});
  },
};
