import { api } from "./client";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "admin" | "hr" | "dispatcher" | "driver";
  licenseNo?: string;
  licenseClass?: string;
  licenseExpiry?: string;
  dispatcherId?: number | null;
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),
  me: () => api.get<{ user: AuthUser }>("/auth/me"),
  register: (input: RegisterInput) =>
    api.post<RegisterResponse>("/auth/register", input),
};
