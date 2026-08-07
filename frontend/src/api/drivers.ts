import { api } from "./client";

export interface Driver {
  id: number;
  name: string;
  email: string;
  status: string | null;
  dispatcherId: number | null;
  dispatcher: string | null;
  vehicleIds: number[];
  phone: string | null;
  lastLat: number | null;
  lastLng: number | null;
  lastLocationAt: string | null;
}

export interface DriverVehicleDetail {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  plate: string;
  status: string;
  ownership: string;
  ownerName: string | null;
}

export interface DriverProfile extends Driver {
  licenseNo: string | null;
  licenseClass: string | null;
  licenseExpiry: string | null;
  vehicles: DriverVehicleDetail[];
  createdAt: string;
}

export const driversApi = {
  list: () => api.get<Driver[]>("/drivers"),
  get: (id: number) => api.get<DriverProfile>(`/drivers/${id}`),
  updateDispatcher: (id: number, dispatcherId: number | null) =>
    api.put<{ driverId: number; dispatcherId: number | null }>(
      `/drivers/${id}/dispatcher`,
      { dispatcherId },
    ),
  updateVehicles: (id: number, vehicleIds: number[]) =>
    api.put<{ driverId: number; vehicleIds: number[] }>(`/drivers/${id}/vehicles`, {
      vehicleIds,
    }),
};
