interface Box {
  id: number;
  name: string;
  description: string;
  type: "ASSINATURA" | "AVULSA";
  price: number;
  image: string;
  stock: number;
}

interface ConfirmStepProps {
  selectedBox: Box | null;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  onBackToCatalog: () => void;
  onChangeAddress: () => void;
  onProceedPayment: () => void;
}

export default function ConfirmStep({
  selectedBox,
  cep,
  rua,
  numero,
  complemento,
  onBackToCatalog,
  onChangeAddress,
  onProceedPayment,
}: ConfirmStepProps) {
  return (
    <div className="checkout-view">
      <button className="back-button" onClick={onBackToCatalog}>
        ⬅ Voltar para a vitrine
      </button>

      <h2>Confirme seu Pedido</h2>

      <div className="summary-card">
        <p>
          <strong>Item:</strong> {selectedBox?.name}
        </p>

        <p>
          <strong>Endereço:</strong> {rua}, {numero}
        </p>

        <p
          style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
          }}
        >
          {cep}
          {complemento && ` - ${complemento}`}
        </p>

        <hr
          style={{
            margin: "1rem 0",
            borderColor: "#334155",
          }}
        />

        <p className="price">
          Total:{" "}
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(selectedBox?.price || 0)}
        </p>
      </div>

      <button
        onClick={onProceedPayment}
        className="submit-button"
        style={{ background: "#10b981" }}
      >
        Ir para Pagamento
      </button>

      <button onClick={onChangeAddress} className="back-button">
        Alterar Endereço
      </button>
    </div>
  );
}
