interface Box {
  id: number;
  name: string;
  description: string;
  type: "ASSINATURA" | "AVULSA";
  price: number;
  image: string;
  stock: number;
}

interface AdminListProps {
  boxes: Box[];
  onEdit: (box: Box) => void;
  onDelete: (id: number) => void;
}

export default function AdminList({ boxes, onEdit, onDelete }: AdminListProps) {
  return (
    <>
      <h3
        style={{
          marginTop: "2.5rem",
          marginBottom: "1rem",
        }}
      >
        Caixas Cadastradas ({boxes.length})
      </h3>

      <div className="product-grid">
        {boxes.map((box) => (
          <div key={box.id} className="product-card">
            <div className="product-image">
              <img src={box.image} alt={box.name} />
            </div>

            <h3>{box.name}</h3>

            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginBottom: "0.5rem",
              }}
            >
              {box.type === "ASSINATURA" ? "📦 Assinatura" : "🛍️ Avulsa"}
            </p>

            <p className="price">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(box.price)}
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.75rem",
              }}
            >
              <button
                className="buy-button"
                style={{
                  background: "#f59e0b",
                  flex: 1,
                }}
                onClick={() => onEdit(box)}
              >
                ✏️ Editar
              </button>

              <button
                className="buy-button"
                style={{
                  background: "#ef4444",
                  flex: 1,
                }}
                onClick={() => onDelete(box.id)}
              >
                🗑️ Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
