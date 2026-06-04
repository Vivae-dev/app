interface AddressStepProps {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;

  onCepChange: (value: string) => void;
  onRuaChange?: (value: string) => void;
  onNumeroChange: (value: string) => void;
  onComplementoChange: (value: string) => void;

  onCepBlur: () => void;
  onBack: () => void;
  onNext: () => void;
}

export default function AddressStep({
  cep,
  rua,
  numero,
  complemento,
  onCepChange,
  onNumeroChange,
  onComplementoChange,
  onCepBlur,
  onBack,
  onNext,
}: AddressStepProps) {
  return (
    <div className="checkout-view">
      <button className="back-button" onClick={onBack}>
        ⬅ Voltar para a vitrine
      </button>

      <div className="checkout-header">
        <h2>Dados de Entrega</h2>
        <p>Preencha o CEP para localizarmos sua rua automaticamente.</p>
      </div>

      <form
        className="checkout-form"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="form-group">
          <label>CEP</label>
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onBlur={onCepBlur}
            onChange={(e) => onCepChange(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-3">
            <label>Rua (Preenchido pelo CEP)</label>
            <input
              type="text"
              value={rua}
              readOnly
              placeholder="Digite o CEP acima..."
              className="input-field readonly-field"
            />
          </div>

          <div className="form-group flex-1">
            <label>Número</label>
            <input
              type="text"
              placeholder="Ex: 123"
              value={numero}
              onChange={(e) => onNumeroChange(e.target.value)}
              required
              className="input-field"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Complemento</label>
          <input
            type="text"
            placeholder="Apto, bloco, ponto de referência..."
            value={complemento}
            onChange={(e) => onComplementoChange(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" className="submit-button main-buy-button">
          Ir para Confirmação
        </button>
      </form>
    </div>
  );
}
