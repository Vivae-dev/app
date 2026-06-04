// hooks/useOrders.ts

import { useState } from "react";
import { reservasService } from "../services/reservasService";

export interface Order {
  id_pedido: number;
  data_reserva: string;
  valor_total: number;
  estado: string;
  nome_experiencia: string | null;
  imagem: string | null;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = async (token: string) => {
    setOrdersLoading(true);

    try {
      const data = await reservasService.getReservas(token);

      setOrders(data);

      return data;
    } finally {
      setOrdersLoading(false);
    }
  };

  return {
    orders,
    ordersLoading,
    fetchOrders,
    setOrders,
  };
}
