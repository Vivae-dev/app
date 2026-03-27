import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

interface Experience {
	id: number;
	name: string;
	price: number;
	image: string;
}

interface Toast {
	id: number;
	message: string;
}

function App() {
	const [experiences, setExperiences] = useState<Experience[]>([]);
	const [loading, setLoading] = useState(true);
	const [toasts, setToasts] = useState<Toast[]>([]);

	const catalogUrl =
		import.meta.env.VITE_CATALOGO_URI || 'http://localhost:3001';
	const reservaUrl =
		import.meta.env.VITE_RESERVA_URI || 'http://localhost:3002';

	useEffect(() => {
		axios
			.get(`${catalogUrl}/api/produtos`)
			.then((response) => {
				setExperiences(response.data);
				setTimeout(() => setLoading(false), 800);
			})
			.catch((error) => {
				console.error('Erro ao buscar experiências:', error);
				setLoading(false);
			});
	}, [catalogUrl]);

	const handleBook = async (exp: Experience) => {
		try {
			const res = await axios.post(`${reservaUrl}/api/reservas`, {
				experienceId: exp.id,
				experienceName: exp.name,
				price: exp.price,
			});
			console.log('Reserva feita:', res.data);

			const id = Date.now();
			setToasts((prev) => [
				...prev,
				{ id, message: `✨ ${exp.name} reservado com sucesso!` },
			]);

			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, 5000);
		} catch (error) {
			console.error('Erro ao reservar:', error);
			const id = Date.now();
			setToasts((prev) => [
				...prev,
				{ id, message: `❌ Erro ao reservar ${exp.name}` },
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
				<h2>Nossas Experiências</h2>

				{loading ? (
					<div className="product-grid">
						{[1, 2, 3].map((i) => (
							<div key={i} className="skeleton"></div>
						))}
					</div>
				) : (
					<div className="product-grid">
						{experiences.map((exp) => (
							<div key={exp.id} className="product-card">
								<div className="product-image">
									<img 
										src={exp.image} 
										alt={exp.name} 
										onError={(e) => {
											(e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Vivae+Experiência';
										}}
									/>
								</div>
								<h3>{exp.name}</h3>
								<p className="price">
									{new Intl.NumberFormat('pt-BR', {
										style: 'currency',
										currency: 'BRL',
									}).format(exp.price)}
								</p>
								<button className="buy-button" onClick={() => handleBook(exp)}>
									Reservar Agora
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
