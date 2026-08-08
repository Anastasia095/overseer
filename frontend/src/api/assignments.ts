import { api } from "./client";

export type AssignmentStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface AssignmentLoad {
  id: number;
  status: AssignmentStatus;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehicleName: string;
  vehiclePlate: string;
  origin: string | null;
  destination: string | null;
  assignedAt: string;
  startsAt: string | null;
  endsAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface AssignmentListResponse {
  data: AssignmentLoad[];
  total: number;
  page: number;
  limit: number;
}

export type AssignmentFilter = "active" | "completed" | undefined;

export const assignmentsApi = {
  list: (params: { filter?: AssignmentFilter; page: number; limit: number }) => {
    const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
    if (params.filter) query.set("status", params.filter);
    return api.get<AssignmentListResponse>(`/assignments?${query.toString()}`);
  },
};
