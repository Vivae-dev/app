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
	const pagamentoUrl =
		import.meta.env.VITE_PAGAMENTO_URI || 'http://localhost:8004';

	const [selectedBox, setSelectedBox] = useState<Box | null>(null);

	// Pagamento
	const [cardNumber, setCardNumber] = useState('');
	const [cardName, setCardName] = useState('');
	const [cardExpiry, setCardExpiry] = useState('');
	const [cardCvv, setCardCvv] = useState('');
	const [paymentLoading, setPaymentLoading] = useState(false);

	// Acompanhamento de pedidos
	interface Order { id_pedido: number; data_reserva: string; valor_total: number; estado: string; nome_experiencia: string | null; imagem: string | null; }
	const [orders, setOrders] = useState<Order[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);

	// Dados de Endereço
	const [cep, setCep] = useState('');
	const [rua, setRua] = useState('');
	const [numero, setNumero] = useState('');
	const [complemento, setComplemento] = useState('');

	// Controle de Telas
	const [currentView, setCurrentView] = useState<'catalog' | 'checkout-address' | 'checkout-confirm' | 'checkout-payment' | 'orders' | 'admin'>('catalog');

	// Admin
	const [adminEditBox, setAdminEditBox] = useState<Box | null>(null);
	const [adminForm, setAdminForm] = useState({
		name: '', description: '', type: 'AVULSA' as 'ASSINATURA' | 'AVULSA',
		price: 0, image: '', stock: 0,
	});
	const [adminLoading, setAdminLoading] = useState(false);

	const authHeaders = () => ({
		headers: { Authorization: `Bearer ${currentUser?.token}` },
	});

	const handleExpiredSession = () => {
		localStorage.removeItem('user');
		setCurrentUser(null);
		setCurrentView('catalog');
		setShowAuthModal(true);
		showToast('⚠️ Sessão expirada. Faça login novamente.');
	};

	const isExpiredError = (error: any) =>
		error.response?.status === 401;

	const handleAdminEdit = (box: Box) => {
		setAdminEditBox(box);
		setAdminForm({ name: box.name, description: box.description, type: box.type, price: box.price, image: box.image, stock: box.stock });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleAdminClear = () => {
		setAdminEditBox(null);
		setAdminForm({ name: '', description: '', type: 'AVULSA', price: 0, image: '', stock: 0 });
	};

	const handleAdminSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAdminLoading(true);
		try {
			if (adminEditBox) {
				const res = await axios.put(`${catalogUrl}/api/caixas/${adminEditBox.id}`, adminForm, authHeaders());
				setBoxes((prev) => prev.map((b) => (b.id === adminEditBox.id ? res.data : b)));
				showToast('✅ Caixa atualizada!');
			} else {
				const res = await axios.post(`${catalogUrl}/api/caixas`, adminForm, authHeaders());
				setBoxes((prev) => [...prev, res.data]);
				showToast('✅ Caixa criada!');
			}
			handleAdminClear();
		} catch (error: any) {
			showToast(`❌ ${error.response?.data?.message || 'Erro ao salvar'}`);
		} finally {
			setAdminLoading(false);
		}
	};

	const handleAdminDelete = async (id: number) => {
		if (!window.confirm('Deletar esta caixa permanentemente?')) return;
		try {
			await axios.delete(`${catalogUrl}/api/caixas/${id}`, authHeaders());
			setBoxes((prev) => prev.filter((b) => b.id !== id));
			showToast('✅ Caixa removida!');
		} catch (error: any) {
			showToast(`❌ ${error.response?.data?.message || 'Erro ao deletar'}`);
		}
	};

	const showToast = (message: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };

	useEffect(() => {
		axios
			.get(`${catalogUrl}/api/caixas`)
			.then((response) => {
				setBoxes(response.data);
				setTimeout(() => setLoading(false), 800);
				const savedUser = localStorage.getItem('user');
    			if (savedUser) setCurrentUser(JSON.parse(savedUser));
			})
			.catch((error) => {
				console.error('Erro ao buscar caixas:', error);
				setLoading(false);
			});
	}, [catalogUrl]);

	const fetchOrders = async () => {
		if (!currentUser) return;
		setOrdersLoading(true);
		try {
			const res = await axios.get(`${reservaUrl}/api/reservas`, authHeaders());
			setOrders(res.data);
		} catch (error: any) {
			if (isExpiredError(error)) { handleExpiredSession(); return; }
			const msg = error.code === 'ERR_NETWORK'
				? 'Serviço de reservas offline.'
				: error.response?.data?.message || 'Erro ao carregar pedidos.';
			showToast(`❌ ${msg}`);
		} finally {
			setOrdersLoading(false);
		}
	};

	const handleOpenOrders = () => {
		setCurrentView('orders');
		fetchOrders();
	};

	const handlePayment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBox) return;
		setPaymentLoading(true);
		try {
			const payRes = await axios.post(`${pagamentoUrl}/api/pagamento`, {
				amount: selectedBox.price,
				cardNumber,
				cardName,
				cardExpiry,
				cardCvv,
			});

			if (!payRes.data.success) {
				showToast('❌ Pagamento recusado.');
				setPaymentLoading(false);
				return;
			}

			const payload = {
				experienceId: selectedBox.id,
				experienceName: selectedBox.name,
				price: selectedBox.price,
				userId: currentUser!.id,
				address: { cep, rua, numero, complemento },
			};
			await axios.post(`${reservaUrl}/api/reservas`, payload, authHeaders());

			// Atualiza currentUser com endereço salvo para próximas reservas na mesma sessão
			const updatedUser = { ...currentUser!, cep, logradouro: rua, numeroCasa: numero, complemento };
			setCurrentUser(updatedUser);
			localStorage.setItem('user', JSON.stringify(updatedUser));

			showToast(`✅ Pedido de ${selectedBox.name} realizado! ID: ${payRes.data.transactionId}`);
			setCurrentView('catalog');
			setSelectedBox(null);
			setCep(''); setRua(''); setNumero(''); setComplemento('');
			setCardNumber(''); setCardName(''); setCardExpiry(''); setCardCvv('');
		} catch (error: any) {
			if (isExpiredError(error)) { handleExpiredSession(); return; }
			const msg = error.response?.data?.error
				?? (error.code === 'ERR_NETWORK' ? 'Serviço de pagamento offline. Rode: npm run dev' : 'Erro ao processar pagamento.');
			showToast(`❌ ${msg}`);
		} finally {
			setPaymentLoading(false);
		}
	};

	// TODO: após register, mostrar mensagem "verifique seu e-mail" em vez de tentar logar
	// TODO: adicionar campos numeroCasa no formulário de cadastro (registro agora aceita numeroCasa)
	// TODO: adicionar página /confirmar/:token que chama GET /api/auth/confirmar/:token
	// TODO: quebrar em componentes (AuthModal, ProductCard, CheckoutFlow, AdminPanel)
	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
			const payload = isRegister
				? { name: authName, email: authEmail, password: authPassword }
				: { email: authEmail, password: authPassword };

			const res = await axios.post(`${authUrl}${endpoint}`, payload);
			localStorage.setItem('user', JSON.stringify(res.data));
			setCurrentUser(res.data);
			setShowAuthModal(false);
			setAuthName('');
			setAuthEmail('');
			setAuthPassword('');
			showToast(`✨ Bem-vindo(a), ${res.data.name}!`);
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

	// Verifica endereço salvo: usa dados do login primeiro, fallback para API
	const checkSavedAddress = async () => {
		// Login já retorna cep/logradouro/numeroCasa — usa direto sem chamada extra
		if (currentUser?.cep) {
			setCep(currentUser.cep);
			setRua(currentUser.logradouro || '');
			setNumero(currentUser.numeroCasa || '');
			setComplemento(currentUser.complemento || '');
			return true;
		}
		// Fallback: busca no serviço (endereço pode ter sido salvo em outra sessão)
		try {
			const res = await axios.get(`${reservaUrl}/api/users/${currentUser.id}/address`, authHeaders());
			if (res.data?.cep) {
				setCep(res.data.cep);
				setRua(res.data.rua || '');
				setNumero(res.data.numero || '');
				setComplemento(res.data.complemento || '');
				return true;
			}
			return false;
		} catch {
			return false;
		}
	};

	const handleBook = async (box: Box) => {
		if (!currentUser) {
            setShowAuthModal(true);
            showToast("⚠️ Faça login para continuar.");
            return;
        }
        
        setSelectedBox(box);
        setLoading(true);
        const hasAddress = await checkSavedAddress();
        setLoading(false);

        if (hasAddress) {
            setCurrentView('checkout-confirm');
        } else {
            setCurrentView('checkout-address');
        }
	};

	const handleCepBlur = async () => {
		const cleanCep = cep.replace(/\D/g, '');
		if (cleanCep.length !== 8) return;

		try {
			const res = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
			if (!res.data.erro) {
				// Preenche a rua e deixa o cursor pronto para o número
				setRua(res.data.logradouro);
				showToast("📍 Endereço localizado!");
			} else {
				showToast("❌ CEP não encontrado.");
			}
		} catch (error) {
			console.error("Erro ao buscar CEP", error);
		}
	};

	const handleLogout = () => {
		// Limpa o armazenamento persistente
		localStorage.removeItem('user');

		// Limpa o estado da aplicação
		setCurrentUser(null);

		setCurrentView('catalog');

		const id = Date.now();
		setToasts((prev) => [
			...prev,
			{ id, message: "👋 Até logo! Você saiu da sua conta." },
		]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
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
								onClick={handleOpenOrders}
								style={{ background: '#0891b2', marginRight: '0.5rem' }}
							>
								📦 Meus Pedidos
							</button>
							{currentUser.role === 'admin' && (
								<button
									className="auth-button"
									onClick={() => setCurrentView('admin')}
									style={{ background: '#7c3aed', marginRight: '0.5rem' }}
								>
									⚙️ Admin
								</button>
							)}
							<button
								className="auth-button"
								onClick={handleLogout}
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
				{currentView === 'catalog' && (
        		<>
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
								<p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
									{box.type === 'ASSINATURA' ? '📦 Assinatura' : '🛍️ Avulsa'} - {box.description}
								</p>
								<p className="price">
									{new Intl.NumberFormat('pt-BR', {
										style: 'currency',
										currency: 'BRL',
									}).format(box.price)}
									{box.type === 'ASSINATURA' && (
										<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#94a3b8', marginLeft: '4px' }}>
											/ mês
										</span>
									)}
								</p>
								<button className="buy-button" onClick={() => handleBook(box)}>
									{box.type === 'ASSINATURA' ? 'Assinar Agora' : 'Comprar Avulsa'}
								</button>
							</div>
						))}
					</div>
				)}
			</>
		)}
		{currentView === 'checkout-address' && (
			<div className="checkout-view">
				<button className="back-button" onClick={() => setCurrentView('catalog')}>
					⬅ Voltar para a vitrine
				</button>
				
				<div className="checkout-header">
					<h2>Dados de Entrega</h2>
					<p>Preencha o CEP para localizarmos sua rua automaticamente.</p>
				</div>

				<form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setCurrentView('checkout-confirm'); }}>
					
					{/* Linha 1: CEP Sozinho */}
					<div className="form-group">
						<label>CEP</label>
						<input 
							type="text" 
							placeholder="00000-000" 
							value={cep} 
							onBlur={handleCepBlur} 
							onChange={(e) => setCep(e.target.value)} 
							required 
							className="input-field"
						/>
					</div>

					{/* Linha 2: Rua e Número Lado a Lado */}
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
								onChange={(e) => setNumero(e.target.value)} 
								required 
								className="input-field"
							/>
						</div>
					</div>

					{/* Linha 3: Complemento Sozinho */}
					<div className="form-group">
						<label>Complemento</label>
						<input 
							type="text" 
							placeholder="Apto, bloco, ponto de referência..." 
							value={complemento} 
							onChange={(e) => setComplemento(e.target.value)} 
							className="input-field"
						/>
					</div>

					<button type="submit" className="submit-button main-buy-button">
						Ir para Confirmação
					</button>
				</form>
			</div>
		)}

                {currentView === 'checkout-confirm' && (
                    <div className="checkout-view">
                        <button className="back-button" onClick={() => setCurrentView('catalog')}>
                            ⬅ Voltar para a vitrine
                        </button>
                        <h2>Confirme seu Pedido</h2>
                        <div className="summary-card">
                            <p><strong>Item:</strong> {selectedBox?.name}</p>
                            <p><strong>Endereço:</strong> {rua}, {numero}</p>
							<p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {cep} {complemento && ` - ${complemento}`}
                            </p>
                            <hr style={{ margin: '1rem 0', borderColor: '#334155' }} />
                            <p className="price">
								Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedBox?.price || 0)}
							</p>
                            </div>
                        <button onClick={() => setCurrentView('checkout-payment')} className="submit-button" style={{ background: '#10b981' }}>
                            Ir para Pagamento
                        </button>
                        <button onClick={() => setCurrentView('checkout-address')} className="back-button">
                            Alterar Endereço
                        </button>
                    </div>
                )}
			{currentView === 'checkout-payment' && (
				<div className="checkout-view">
					<button className="back-button" onClick={() => setCurrentView('checkout-confirm')}>
						⬅ Voltar para confirmação
					</button>
					<div className="checkout-header">
						<h2>Pagamento</h2>
						<p>Insira os dados do cartão para finalizar.</p>
					</div>
					<div className="summary-card" style={{ marginBottom: '1.5rem' }}>
						<p><strong>Item:</strong> {selectedBox?.name}</p>
						<p className="price">
							{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedBox?.price || 0)}
						</p>
					</div>
					<form className="checkout-form" onSubmit={handlePayment}>
						<div className="form-group">
							<label>Número do Cartão</label>
							<input
								type="text"
								placeholder="0000 0000 0000 0000"
								maxLength={19}
								required
								className="input-field"
								value={cardNumber}
								onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
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
										const v = e.target.value.replace(/\D/g, '');
										setCardExpiry(v.length >= 2 ? v.slice(0, 2) + '/' + v.slice(2, 4) : v);
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
									onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
								/>
							</div>
						</div>
						<button type="submit" className="submit-button" style={{ background: '#10b981' }} disabled={paymentLoading}>
							{paymentLoading ? 'Processando...' : '🔒 Pagar Agora'}
						</button>
					</form>
				</div>
			)}

			{currentView === 'orders' && (
				<div className="checkout-view">
					<button className="back-button" onClick={() => setCurrentView('catalog')}>
						⬅ Voltar para a vitrine
					</button>
					<h2>📦 Meus Pedidos</h2>
					{ordersLoading ? (
						<div className="product-grid">
							{[1, 2].map((i) => <div key={i} className="skeleton" />)}
						</div>
					) : orders.length === 0 ? (
						<p style={{ color: '#94a3b8', marginTop: '2rem' }}>Nenhum pedido encontrado.</p>
					) : (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
							{orders.map((o) => (
								<div key={o.id_pedido} className="summary-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
										{o.imagem && (
											<img
												src={o.imagem}
												alt={o.nome_experiencia || ''}
												style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
											/>
										)}
										<div style={{ flex: 1, minWidth: 0 }}>
											<p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
												#{o.id_pedido} · {new Date(o.data_reserva).toLocaleDateString('pt-BR')}
											</p>
											<p style={{ fontWeight: 600, margin: '0.2rem 0', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
												{o.nome_experiencia || '—'}
											</p>
											<p className="price" style={{ margin: 0, fontSize: '1rem' }}>
												{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.valor_total)}
											</p>
										</div>
									</div>
									{(() => {
										const steps: { key: string; label: string }[] = [
											{ key: 'pago', label: 'Pagamento confirmado' },
											{ key: 'separando', label: 'Separando o kit' },
											{ key: 'enviado', label: 'Nos Correios' },
											{ key: 'entregue', label: 'Entregue' },
										];
										const activeIdx = steps.findIndex(s => s.key === o.estado);
										return (
											<div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
												{steps.map((step, idx) => {
													const done = idx <= activeIdx;
													const active = idx === activeIdx;
													return (
														<div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
															<div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
																{idx > 0 && <div style={{ flex: 1, height: 2, background: idx <= activeIdx ? '#7c3aed' : '#334155' }} />}
																<div style={{
																	width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
																	background: done ? (o.estado === 'entregue' ? '#059669' : '#7c3aed') : '#334155',
																	border: active ? '2px solid #a78bfa' : 'none',
																	boxShadow: active ? '0 0 6px #7c3aed' : 'none',
																}} />
																{idx < steps.length - 1 && <div style={{ flex: 1, height: 2, background: idx < activeIdx ? '#7c3aed' : '#334155' }} />}
															</div>
															<p style={{ fontSize: '0.65rem', color: done ? '#a78bfa' : '#475569', margin: '0.3rem 0 0', textAlign: 'center', lineHeight: 1.2, fontWeight: active ? 700 : 400 }}>
																{step.label}
															</p>
														</div>
													);
												})}
											</div>
										);
									})()}
								</div>
							))}
						</div>
					)}
				</div>
			)}
			</main>

			{currentView === 'admin' && (
				<div className="admin-view">
					<button className="back-button" onClick={() => { setCurrentView('catalog'); handleAdminClear(); }}>
						⬅ Voltar para a vitrine
					</button>
					<h2>⚙️ Painel Admin</h2>

					<h3 style={{ marginBottom: '1rem' }}>{adminEditBox ? `Editar: ${adminEditBox.name}` : 'Nova Caixa'}</h3>
					<form className="checkout-form" onSubmit={handleAdminSubmit}>
						<div className="form-group">
							<label>Nome</label>
							<input
								type="text"
								required
								className="input-field"
								value={adminForm.name}
								onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))}
							/>
						</div>
						<div className="form-group">
							<label>Descrição</label>
							<input
								type="text"
								className="input-field"
								value={adminForm.description}
								onChange={(e) => setAdminForm((p) => ({ ...p, description: e.target.value }))}
							/>
						</div>
						<div className="form-row">
							<div className="form-group flex-1">
								<label>Tipo</label>
								<select
									className="input-field"
									value={adminForm.type}
									onChange={(e) => setAdminForm((p) => ({ ...p, type: e.target.value as 'ASSINATURA' | 'AVULSA' }))}
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
									onChange={(e) => setAdminForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
								/>
							</div>
							<div className="form-group flex-1">
								<label>Estoque</label>
								<input
									type="number"
									min="0"
									className="input-field"
									value={adminForm.stock}
									onChange={(e) => setAdminForm((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
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
								onChange={(e) => setAdminForm((p) => ({ ...p, image: e.target.value }))}
							/>
						</div>
						<div style={{ display: 'flex', gap: '1rem' }}>
							<button type="submit" className="submit-button" disabled={adminLoading}>
								{adminLoading ? 'Salvando...' : adminEditBox ? 'Atualizar Caixa' : 'Criar Caixa'}
							</button>
							{adminEditBox && (
								<button type="button" onClick={handleAdminClear} className="back-button">
									Cancelar
								</button>
							)}
						</div>
					</form>

					<h3 style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
						Caixas Cadastradas ({boxes.length})
					</h3>
					<div className="product-grid">
						{boxes.map((box) => (
							<div key={box.id} className="product-card">
								<div className="product-image">
									<img src={box.image} alt={box.name} />
								</div>
								<h3>{box.name}</h3>
								<p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
									{box.type === 'ASSINATURA' ? '📦 Assinatura' : '🛍️ Avulsa'}
								</p>
								<p className="price">
									{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(box.price)}
								</p>
								<div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
									<button
										className="buy-button"
										style={{ background: '#f59e0b', flex: 1 }}
										onClick={() => handleAdminEdit(box)}
									>
										✏️ Editar
									</button>
									<button
										className="buy-button"
										style={{ background: '#ef4444', flex: 1 }}
										onClick={() => handleAdminDelete(box.id)}
									>
										🗑️ Deletar
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

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
