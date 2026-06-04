interface Box {
  id: number;
  name: string;
  description: string;
  type: "ASSINATURA" | "AVULSA";
  price: number;
  image: string;
  stock: number;
}

interface PaymentStepProps {
  selectedBox: Box | null;

  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;

  setCardNumber: (value: string) => void;
  setCardName: (value: string) => void;
  setCardExpiry: (value: string) => void;
  setCardCvv: (value: string) => void;

  paymentLoading: boolean;

  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export default function PaymentStep({
  selectedBox,
  cardNumber,
  cardName,
  cardExpiry,
  cardCvv,
  setCardNumber,
  setCardName,
  setCardExpiry,
  setCardCvv,
  paymentLoading,
  onSubmit,
  onBack,
}: PaymentStepProps) {
  return (
    <div className="checkout-view">
      <button className="back-button" onClick={onBack}>
        ⬅ Voltar para confirmação
      </button>

      <div className="checkout-header">
        <h2>Pagamento</h2>
        <p>Insira os dados do cartão para finalizar.</p>
      </div>

      <div className="summary-card" style={{ marginBottom: "1.5rem" }}>
        <p>
          <strong>Item:</strong> {selectedBox?.name}
        </p>

        <p className="price">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(selectedBox?.price || 0)}
        </p>
      </div>

      <form className="checkout-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Número do Cartão</label>
          <input
            type="text"
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            required
            className="input-field"
            value={cardNumber}
            onChange={(e) =>
              setCardNumber(
                e.target.value
                  .replace(/\D/g, "")
                  .replace(/(.{4})/g, "$1 ")
                  .trim(),
              )
            }
          />
        </div>

        <div className="form-group">
          <label>Nome no Cartão</label>
          <input
            type="text"
            placeholder="NOME SOBRENOME"
            required
            className="input-field"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Validade</label>
            <input
              type="text"
              placeholder="MM/AA"
              maxLength={5}
              required
              className="input-field"
              value={cardExpiry}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");

                setCardExpiry(
                  v.length >= 2 ? v.slice(0, 2) + "/" + v.slice(2, 4) : v,
                );
              }}
            />
          </div>

          <div className="form-group flex-1">
            <label>CVV</label>
            <input
              type="text"
              placeholder="000"
              maxLength={4}
              required
              className="input-field"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          style={{ background: "#10b981" }}
          disabled={paymentLoading}
        >
          {paymentLoading ? "Processando..." : "🔒 Pagar Agora"}
        </button>
      </form>
    </div>
  );
}
