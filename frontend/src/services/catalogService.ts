// services/catalogService.ts

import axios from "axios";

const catalogUrl = import.meta.env.VITE_CATALOGO_URI || "http://localhost:8001";

export interface Box {
  id: number;
  name: string;
  description: string;
  type: "ASSINATURA" | "AVULSA";
  price: number;
  image: string;
  stock: number;
}

export interface BoxPayload {
  name: string;
  description: string;
  type: "ASSINATURA" | "AVULSA";
  price: number;
  image: string;
  stock: number;
}

export const catalogService = {
  async getCaixas(): Promise<Box[]> {
    const res = await axios.get(`${catalogUrl}/api/caixas`);
    return res.data;
  },

  async createCaixa(payload: BoxPayload, token: string): Promise<Box> {
    const res = await axios.post(`${catalogUrl}/api/caixas`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async updateCaixa(
    id: number,
    payload: BoxPayload,
    token: string,
  ): Promise<Box> {
    const res = await axios.put(`${catalogUrl}/api/caixas/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async deleteCaixa(id: number, token: string): Promise<void> {
    await axios.delete(`${catalogUrl}/api/caixas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
