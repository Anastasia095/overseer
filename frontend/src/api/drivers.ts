import { api } from "./client";

export interface Driver {
  id: number;
  name: string;
  email: string;
  status: string | null;
  dispatcher: string | null;
  phone: string | null;
}

export const driversApi = {
  list: () => api.get<Driver[]>("/drivers"),
};
