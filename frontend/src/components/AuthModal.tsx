import { useState } from "react";

interface AuthData {
  name: string;
  email: string;
  password: string;
  isRegister: boolean;
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AuthData) => Promise<void>;
}

export default function AuthModal({ open, onClose, onSubmit }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      name,
      email,
      password,
      isRegister,
    });

    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? "active" : ""}`}
            onClick={() => setIsRegister(false)}
          >
            Login
          </button>

          <button
            type="button"
            className={`auth-tab ${isRegister ? "active" : ""}`}
            onClick={() => setIsRegister(true)}
          >
            Cadastro
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Nome Completo</label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
          )}

          <div className="form-group">
            <label>E-mail</label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-button">
            {isRegister ? "Criar Conta" : "Acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}
