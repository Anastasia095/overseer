import { api } from "./client";

export type VehicleStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE";
export type VehicleOwnership = "OWNER_OPERATOR" | "LEASED";

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  plate: string;
  status: VehicleStatus;
  ownership: VehicleOwnership;
  ownerDriverId: number | null;
  ownerName: string | null;
  driverIds: number[];
}

export interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  vin: string;
  plate: string;
  status?: VehicleStatus;
  ownership?: VehicleOwnership;
  ownerDriverId?: number | null;
}

export const vehiclesApi = {
  list: () => api.get<Vehicle[]>("/vehicles"),
  create: (input: CreateVehicleInput) =>
    api.post<{ vehicle: Vehicle }>("/vehicles", input),
};
