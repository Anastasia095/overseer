import { api } from "./client";

export interface Dispatcher {
  id: number;
  name: string;
  email: string;
}

export const dispatchersApi = {
  list: () => api.get<Dispatcher[]>("/dispatchers"),
};
