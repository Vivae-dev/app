import axios from "axios";

const reservaUrl = import.meta.env.VITE_RESERVA_URI || "http://localhost:8003";

export const cancelamentoService = {
  async cancelReserva(id: number, token: string) {
    const res = await axios.delete(`${reservaUrl}/api/reservas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
