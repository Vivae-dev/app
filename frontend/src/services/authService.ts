// services/authService.ts

import axios from "axios";

const authUrl = import.meta.env.VITE_AUTH_URI || "http://localhost:8002";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const res = await axios.post(`${authUrl}/api/auth/login`, payload);

    return res.data;
  },

  async register(payload: RegisterPayload) {
    const res = await axios.post(`${authUrl}/api/auth/register`, payload);

    return res.data;
  },

  saveUser(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem("user");
  },
};
