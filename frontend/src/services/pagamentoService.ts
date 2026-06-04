// services/pagamentoService.ts

import axios from "axios";

const pagamentoUrl =
  import.meta.env.VITE_PAGAMENTO_URI || "http://localhost:8004";

export interface PaymentData {
  amount: number;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
}

export const processPayment = async (data: PaymentData) => {
  const response = await axios.post(`${pagamentoUrl}/api/pagamento`, data);

  return response.data;
};
