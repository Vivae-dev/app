interface Box {
  id: number;
  name: string;
  description: string;
  type: "ASSINATURA" | "AVULSA";
  price: number;
  image: string;
  stock: number;
}

interface ProductCardProps {
  box: Box;
  onBuy: (box: Box) => void;
}

export default function ProductCard({ box, onBuy }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={box.image} alt={box.name} />
      </div>

      <h3>{box.name}</h3>

      <p
        style={{
          fontSize: "0.9rem",
          color: "#94a3b8",
          marginBottom: "1rem",
        }}
      >
        {box.type === "ASSINATURA" ? "📦 Assinatura" : "🛍️ Avulsa"} -{" "}
        {box.description}
      </p>

      <p className="price">
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(box.price)}

        {box.type === "ASSINATURA" && (
          <span
            style={{
              fontSize: "1rem",
              fontWeight: "normal",
              color: "#94a3b8",
              marginLeft: "4px",
            }}
          >
            / mês
          </span>
        )}
      </p>

      <button className="buy-button" onClick={() => onBuy(box)}>
        {box.type === "ASSINATURA" ? "Assinar Agora" : "Comprar Avulsa"}
      </button>
    </div>
  );
}
