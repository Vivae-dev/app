// hooks/useOrders.ts

import { useState } from "react";
import { reservasService } from "../services/reservasService";
import { cancelamentoService } from "../services/cancelamentoService";

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

  const cancelOrder = async (id: number, token: string) => {
    try {
      await cancelamentoService.cancelReserva(id, token);

      setOrders((prevOrders) => prevOrders.filter((order) => order.id_pedido !== id));
      
    } catch (error) {
      console.error("Erro ao cancelar pedido", error);
      throw error;
    }
  };

  return {
    orders,
    ordersLoading,
    fetchOrders,
    setOrders,
    cancelOrder,
  };
}
