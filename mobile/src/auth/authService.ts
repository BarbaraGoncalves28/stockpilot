import { apiFetch } from "../api/client";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
};

export type RegisterResponse = AuthUser;

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ??
        data.message ??
        "Não foi possível entrar.",
    );
  }

  return data as LoginResponse;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ??
        data.message ??
        "Não foi possível criar sua conta.",
    );
  }

  return data as RegisterResponse;
}