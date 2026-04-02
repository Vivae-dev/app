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

	const catalogUrl =
		import.meta.env.VITE_CATALOGO_URI || 'http://localhost:3001';
	const reservaUrl =
		import.meta.env.VITE_RESERVA_URI || 'http://localhost:3002';

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
				<h1>Vivae</h1>
				<p>
					Viva experiências inesquecíveis entregues diretamente na sua casa.
				</p>
			</header>

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
