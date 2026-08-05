import { api } from "./client";

export interface MonthlyPoint {
  label: string;
  activeDrivers: number;
  totalVehicles: number;
}

export interface WeeklyPoint {
  label: string;
  dispatched: number;
  completed: number;
  cancelled: number;
}

export interface DashboardStats {
  activeDrivers: number;
  totalVehicles: number;
  activeLoads: number;
  monthly: MonthlyPoint[];
  weekly: WeeklyPoint[];
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard/stats"),
};
