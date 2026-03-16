import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [mensagem, setMensagem] = useState("Carregando...");

  useEffect(() => {
    fetch("http://localhost:3001/api/health")
      .then((res) => res.json())
      .then((data) => {
        setMensagem(data.mensagem);
      })
      .catch(() => {
        setMensagem("Erro ao conectar com o backend.");
      });
  }, []);

  return (
    <div className="app-container">
      <div className="card">
        <h1>Vivae</h1>
        <p className="subtitle">Viva experiências inesquecíveis.</p>

        <div className="backend-box">
          <span>Resposta do backend:</span>
          <strong>{mensagem}</strong>
        </div>
      </div>
    </div>
  );
}

export default App;