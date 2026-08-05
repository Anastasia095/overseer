import { api } from "./client";

export interface DashboardStats {
  activeDrivers: number;
  offlineDrivers: number;
  totalVehicles: number;
  activeAssignments: number;
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard/stats"),
};
