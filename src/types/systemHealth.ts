export type MonitoredServiceId =
  | "npm_dependencies"
  | "frontend_pipeline"
  | "backend_bundle"
  | "i18n_locales"
  | "csrf_security"
  | "firebase_admin"
  | "seo_cache_worker";

export type ServiceHealthStatus = "healthy" | "repaired" | "degraded";

export interface ServiceCheckResult {
  id: MonitoredServiceId;
  label: string;
  status: ServiceHealthStatus;
  autoRepaired: boolean;
  detail: string;
  checkedAt: string;
  durationMs: number;
}

export interface SystemSelfHealReport {
  overallStatus: ServiceHealthStatus;
  timestamp: string;
  totalServices: number;
  healthyCount: number;
  repairedCount: number;
  degradedCount: number;
  services: ServiceCheckResult[];
}
