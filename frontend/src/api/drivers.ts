// custom api instance import
import { api } from "./client";

// shape of the object returned by the server
export interface Driver {
  id: number;
  name: string;
  email: string;
  status: string | null;
  dispatcher: string | null;
  phone: string | null;
}

export const driversApi = {
  list() {
    return api.get<Driver[]>("/drivers")
  }
};
