interface Order {
  id_pedido: number;
  data_reserva: string;
  valor_total: number;
  estado: string;
  nome_experiencia: string | null;
  imagem: string | null;
}

interface OrdersListProps {
  orders: Order[];
  ordersLoading: boolean;
  onBack: () => void;
}

export default function OrdersList({
  orders,
  ordersLoading,
  onBack,
}: OrdersListProps) {
  return (
    <div className="checkout-view">
      <button className="back-button" onClick={onBack}>
        ⬅ Voltar para a vitrine
      </button>

      <h2>📦 Meus Pedidos</h2>

      {ordersLoading ? (
        <div className="product-grid">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p
          style={{
            color: "#94a3b8",
            marginTop: "2rem",
          }}
        >
          Nenhum pedido encontrado.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {orders.map((o) => (
            <div
              key={o.id_pedido}
              className="summary-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                {o.imagem && (
                  <img
                    src={o.imagem}
                    alt={o.nome_experiencia || ""}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 8,
                      flexShrink: 0,
                    }}
                  />
                )}

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    #{o.id_pedido} ·{" "}
                    {new Date(o.data_reserva).toLocaleDateString("pt-BR")}
                  </p>

                  <p
                    style={{
                      fontWeight: 600,
                      margin: "0.2rem 0",
                      color: "#e2e8f0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {o.nome_experiencia || "—"}
                  </p>

                  <p
                    className="price"
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                    }}
                  >
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(o.valor_total)}
                  </p>
                </div>
              </div>

              {(() => {
                const steps = [
                  {
                    key: "pago",
                    label: "Pagamento confirmado",
                  },
                  {
                    key: "separando",
                    label: "Separando o kit",
                  },
                  {
                    key: "enviado",
                    label: "Nos Correios",
                  },
                  {
                    key: "entregue",
                    label: "Entregue",
                  },
                ];

                const activeIdx = steps.findIndex((s) => s.key === o.estado);

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    {steps.map((step, idx) => {
                      const done = idx <= activeIdx;

                      const active = idx === activeIdx;

                      return (
                        <div
                          key={step.key}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            {idx > 0 && (
                              <div
                                style={{
                                  flex: 1,
                                  height: 2,
                                  background:
                                    idx <= activeIdx ? "#7c3aed" : "#334155",
                                }}
                              />
                            )}

                            <div
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: done
                                  ? o.estado === "entregue"
                                    ? "#059669"
                                    : "#7c3aed"
                                  : "#334155",
                                border: active ? "2px solid #a78bfa" : "none",
                              }}
                            />

                            {idx < steps.length - 1 && (
                              <div
                                style={{
                                  flex: 1,
                                  height: 2,
                                  background:
                                    idx < activeIdx ? "#7c3aed" : "#334155",
                                }}
                              />
                            )}
                          </div>

                          <p
                            style={{
                              fontSize: "0.65rem",
                              color: done ? "#a78bfa" : "#475569",
                              margin: "0.3rem 0 0",
                              textAlign: "center",
                              lineHeight: 1.2,
                              fontWeight: active ? 700 : 400,
                            }}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
