import React from "react";

interface Box {
  id: number;
  name: string;
  description: string;
  type: "ASSINATURA" | "AVULSA";
  price: number;
  image: string;
  stock: number;
}

interface AdminFormProps {
  adminEditBox: Box | null;
  adminForm: {
    name: string;
    description: string;
    type: "ASSINATURA" | "AVULSA";
    price: number;
    image: string;
    stock: number;
  };
  adminLoading: boolean;
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export default function AdminForm({
  adminEditBox,
  adminForm,
  adminLoading,
  onFormChange,
  onSubmit,
  onClear,
}: AdminFormProps) {
  return (
    <>
      <h3 style={{ marginBottom: "1rem" }}>
        {adminEditBox ? `Editar: ${adminEditBox.name}` : "Nova Caixa"}
      </h3>

      <form className="checkout-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Nome</label>
          <input
            type="text"
            required
            className="input-field"
            value={adminForm.name}
            onChange={(e) => onFormChange("name", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <input
            type="text"
            className="input-field"
            value={adminForm.description}
            onChange={(e) => onFormChange("description", e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Tipo</label>
            <select
              className="input-field"
              value={adminForm.type}
              onChange={(e) => onFormChange("type", e.target.value)}
            >
              <option value="AVULSA">Avulsa</option>
              <option value="ASSINATURA">Assinatura</option>
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="input-field"
              value={adminForm.price}
              onChange={(e) =>
                onFormChange("price", parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div className="form-group flex-1">
            <label>Estoque</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={adminForm.stock}
              onChange={(e) =>
                onFormChange("stock", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>URL da Imagem</label>
          <input
            type="text"
            className="input-field"
            placeholder="https://..."
            value={adminForm.image}
            onChange={(e) => onFormChange("image", e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            className="submit-button"
            disabled={adminLoading}
          >
            {adminLoading
              ? "Salvando..."
              : adminEditBox
                ? "Atualizar Caixa"
                : "Criar Caixa"}
          </button>

          {adminEditBox && (
            <button type="button" onClick={onClear} className="back-button">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </>
  );
}
