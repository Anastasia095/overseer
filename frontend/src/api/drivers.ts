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
  lastLocationLabel: string | null;
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

export interface DriverVacation {
  id: number;
  startDate: string;
  endDate: string;
}

export interface DriverProfile extends Driver {
  licenseNo: string | null;
  licenseClass: string | null;
  licenseExpiry: string | null;
  vehicles: DriverVehicleDetail[];
  vacations: DriverVacation[];
  createdAt: string;
}

export const driversApi = {
  list: () => api.get<Driver[]>("/drivers"),
  get: (id: number) => api.get<DriverProfile>(`/drivers/${id}`),
  resolveAddress: (id: number) =>
    api.post<{ address: string | null }>(`/drivers/${id}/geocode`, {}),
  updateDispatcher: (id: number, dispatcherId: number | null) =>
    api.put<{ driverId: number; dispatcherId: number | null }>(
      `/drivers/${id}/dispatcher`,
      { dispatcherId },
    ),
  updateVehicles: (id: number, vehicleIds: number[]) =>
    api.put<{ driverId: number; vehicleIds: number[] }>(`/drivers/${id}/vehicles`, {
      vehicleIds,
    }),
  createVacation: (id: number, dates: { startDate: string; endDate: string }) =>
    api.post<DriverVacation>(`/drivers/${id}/vacations`, dates),
  updateVacation: (
    id: number,
    vacationId: number,
    dates: { startDate: string; endDate: string },
  ) => api.put<DriverVacation>(`/drivers/${id}/vacations/${vacationId}`, dates),
  deleteVacation: (id: number, vacationId: number) =>
    api.delete<{ deleted: boolean }>(`/drivers/${id}/vacations/${vacationId}`),
};
