import axios from "axios";

const reservaUrl = import.meta.env.VITE_RESERVA_URI || "http://localhost:8003";

export interface Address {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
}

export interface CreateReservaPayload {
  experienceId: number;
  experienceName: string;
  price: number;
  userId: number;
  address: Address;
}

export const reservasService = {
  async getReservas(token: string) {
    const res = await axios.get(`${reservaUrl}/api/reservas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },

  async createReserva(payload: CreateReservaPayload, token: string) {
    const res = await axios.post(`${reservaUrl}/api/reservas`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },

  async getUserAddress(userId: number, token: string) {
    const res = await axios.get(`${reservaUrl}/api/users/${userId}/address`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },
};
