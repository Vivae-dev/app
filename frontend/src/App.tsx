import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

interface Box {
	id: number;
	name: string;
	description: string;
	type: 'ASSINATURA' | 'AVULSA';
	price: number;
	image: string;
	stock: number;
}

interface Toast {
	id: number;
	message: string;
}

function App() {
	const [boxes, setBoxes] = useState<Box[]>([]);
	const [loading, setLoading] = useState(true);
	const [toasts, setToasts] = useState<Toast[]>([]);

	// Auth States
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [isRegister, setIsRegister] = useState(false);
	const [authName, setAuthName] = useState('');
	const [authEmail, setAuthEmail] = useState('');
	const [authPassword, setAuthPassword] = useState('');

	const catalogUrl =
		import.meta.env.VITE_CATALOGO_URI || 'http://localhost:8001';
	const authUrl = import.meta.env.VITE_AUTH_URI || 'http://localhost:8002';
	const reservaUrl =
		import.meta.env.VITE_RESERVA_URI || 'http://localhost:8003';

	useEffect(() => {
		axios
			.get(`${catalogUrl}/api/caixas`)
			.then((response) => {
				setBoxes(response.data);
				setTimeout(() => setLoading(false), 800);
			})
			.catch((error) => {
				console.error('Erro ao buscar caixas:', error);
				setLoading(false);
			});
	}, [catalogUrl]);

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
			const payload = isRegister
				? { name: authName, email: authEmail, password: authPassword }
				: { email: authEmail, password: authPassword };

			const res = await axios.post(`${authUrl}${endpoint}`, payload);
			setCurrentUser(res.data);
			setShowAuthModal(false);
			setAuthName('');
			setAuthEmail('');
			setAuthPassword('');

			const id = Date.now();
			setToasts((prev) => [
				...prev,
				{ id, message: `✨ Bem-vindo(a), ${res.data.name}!` },
			]);
			setTimeout(
				() => setToasts((prev) => prev.filter((t) => t.id !== id)),
				5000,
			);
		} catch (error: any) {
			console.error('Erro de autenticação:', error);
			const msg = error.response?.data?.message || 'Erro na autenticação';
			const id = Date.now();
			setToasts((prev) => [...prev, { id, message: `❌ ${msg}` }]);
			setTimeout(
				() => setToasts((prev) => prev.filter((t) => t.id !== id)),
				5000,
			);
		}
	};

	const handleBook = async (box: Box) => {
		try {
			const res = await axios.post(`${reservaUrl}/api/reservas`, {
				experienceId: box.id,
				experienceName: box.name,
				price: box.price,
			});
			console.log('Reserva feita:', res.data);

			const id = Date.now();
			setToasts((prev) => [
				...prev,
				{ id, message: `✨ ${box.name} reservado com sucesso!` },
			]);

			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, 5000);
		} catch (error) {
			console.error('Erro ao reservar:', error);
			const id = Date.now();
			setToasts((prev) => [
				...prev,
				{ id, message: `❌ Erro ao reservar ${box.name}` },
			]);
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, 5000);
		}
	};

	return (
		<div className="app-container">
			<header className="header">
				<div className="auth-menu">
					{currentUser ? (
						<>
							<span style={{ color: '#94a3b8' }}>Olá, {currentUser.name}</span>
							<button
								className="auth-button"
								onClick={() => setCurrentUser(null)}
							>
								Sair
							</button>
						</>
					) : (
						<button
							className="auth-button"
							onClick={() => setShowAuthModal(true)}
						>
							Entrar
						</button>
					)}
				</div>
				<h1>Vivae</h1>
				<p>
					Viva experiências inesquecíveis entregues diretamente na sua casa.
				</p>
			</header>

			{showAuthModal && (
				<div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<button
							className="modal-close"
							onClick={() => setShowAuthModal(false)}
						>
							&times;
						</button>
						<div className="auth-tabs">
							<button
								className={`auth-tab ${!isRegister ? 'active' : ''}`}
								onClick={() => setIsRegister(false)}
							>
								Login
							</button>
							<button
								className={`auth-tab ${isRegister ? 'active' : ''}`}
								onClick={() => setIsRegister(true)}
							>
								Cadastro
							</button>
						</div>

						<form onSubmit={handleAuth}>
							{isRegister && (
								<div className="form-group">
									<label>Nome Completo</label>
									<input
										type="text"
										required
										value={authName}
										onChange={(e) => setAuthName(e.target.value)}
										placeholder="Seu nome"
									/>
								</div>
							)}
							<div className="form-group">
								<label>E-mail</label>
								<input
									type="email"
									required
									value={authEmail}
									onChange={(e) => setAuthEmail(e.target.value)}
									placeholder="seu@email.com"
								/>
							</div>
							<div className="form-group">
								<label>Senha</label>
								<input
									type="password"
									required
									value={authPassword}
									onChange={(e) => setAuthPassword(e.target.value)}
									placeholder="••••••••"
								/>
							</div>
							<button type="submit" className="submit-button">
								{isRegister ? 'Criar Conta' : 'Acessar'}
							</button>
						</form>
					</div>
				</div>
			)}

			<main className="main-content">
				<h2>Nossas Caixas Mensais e Avulsas</h2>

				{loading ? (
					<div className="product-grid">
						{[1, 2, 3].map((i) => (
							<div key={i} className="skeleton"></div>
						))}
					</div>
				) : (
					<div className="product-grid">
						{boxes.map((box) => (
							<div key={box.id} className="product-card">
								<div className="product-image">
									<img src={box.image} alt={box.name} />
								</div>
								<h3>{box.name}</h3>
								<p
									style={{
										fontSize: '0.9rem',
										color: '#94a3b8',
										marginBottom: '1rem',
									}}
								>
									{box.type === 'ASSINATURA' ? '📦 Assinatura' : '🛍️ Avulsa'} -{' '}
									{box.description}
								</p>
								<p className="price">
									{new Intl.NumberFormat('pt-BR', {
										style: 'currency',
										currency: 'BRL',
									}).format(box.price)}
									{box.type === 'ASSINATURA' && (
										<span
											style={{
												fontSize: '1rem',
												fontWeight: 'normal',
												color: '#94a3b8',
												marginLeft: '4px',
											}}
										>
											/ mês
										</span>
									)}
								</p>
								<button className="buy-button" onClick={() => handleBook(box)}>
									{box.type === 'ASSINATURA'
										? 'Assinar Agora'
										: 'Comprar Avulsa'}
								</button>
							</div>
						))}
					</div>
				)}
			</main>

			<div className="toast-container">
				{toasts.map((toast) => (
					<div key={toast.id} className="toast">
						<span>{toast.message}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default App;
