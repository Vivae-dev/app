import axios from "axios";

const cancelamentoUrl = import.meta.env.VITE_CANCELAMENTO_URI || "http://localhost:8005";

export const cancelamentoService = {
  async cancelReserva(id: number, token: string) {
    const res = await axios.delete(`${cancelamentoUrl}/api/cancelamento/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};