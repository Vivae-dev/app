import 'package:flutter/material.dart';

import '../globals.dart';
import '../models.dart';
import '../ui.dart';

/// Meus Pedidos, com o acompanhamento e o botão de cancelar.
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<Order> _orders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() => _loading = true);
    try {
      final orders = await api.getReservas(session.user!.token);
      if (!mounted) return;
      setState(() => _orders = orders);
    } catch (e) {
      if (mounted) tratarErro(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _cancelar(Order o) async {
    if (!await confirmar(context, 'Tem certeza que deseja cancelar este pedido?')) {
      return;
    }
    try {
      await api.cancelReserva(o.id, session.user!.token);
      if (!mounted) return;
      setState(() => _orders.removeWhere((x) => x.id == o.id));
      showToast('✅ Pedido cancelado com sucesso!');
    } catch (e) {
      if (mounted) tratarErro(context, e, prefixo: 'Erro ao cancelar: ');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      maxWidth: 720,
      child: RefreshIndicator(
        onRefresh: _carregar,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 18),
                label: const Text('Voltar para a vitrine'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textSecondary,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const SectionTitle('📦 Meus Pedidos'),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_orders.isEmpty)
              const Text(
                'Nenhum pedido encontrado.',
                style: TextStyle(color: AppColors.textSecondary),
              )
            else
              for (final o in _orders)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: _OrderCard(order: o, onCancel: () => _cancelar(o)),
                ),
          ],
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onCancel;

  const _OrderCard({required this.order, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              if (order.image != null) ...[
                NetImage(
                  order.image!,
                  width: 64,
                  height: 64,
                  borderRadius: BorderRadius.circular(8),
                ),
                const SizedBox(width: 14),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '#${order.id} · ${formatDate(order.date)}',
                      style: const TextStyle(fontSize: 12, color: AppColors.muted),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      order.name ?? '—',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFE2E8F0),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      formatBRL(order.total),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        color: AppColors.accentHover,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: onCancel,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.danger,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  textStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                child: const Text('Cancelar'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _Tracker(status: order.status),
        ],
      ),
    );
  }
}

/// Linha do tempo do pedido (pago → separando → enviado → entregue).
class _Tracker extends StatelessWidget {
  final String status;

  const _Tracker({required this.status});

  static const _etapas = [
    ('pago', 'Pagamento confirmado'),
    ('separando', 'Separando o kit'),
    ('enviado', 'Nos Correios'),
    ('entregue', 'Entregue'),
  ];

  @override
  Widget build(BuildContext context) {
    final ativo = _etapas.indexWhere((e) => e.$1 == status);
    final entregue = status == 'entregue';

    Widget linha(bool feita) => Expanded(
          child: Container(
            height: 2,
            color: feita ? AppColors.adminPurple : AppColors.line,
          ),
        );

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < _etapas.length; i++)
          Expanded(
            child: Column(
              children: [
                Row(
                  children: [
                    i > 0 ? linha(i <= ativo) : const Spacer(),
                    Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: i <= ativo
                            ? (entregue
                                ? const Color(0xFF059669)
                                : AppColors.adminPurple)
                            : AppColors.line,
                        border: i == ativo
                            ? Border.all(color: AppColors.accentHover, width: 2)
                            : null,
                      ),
                    ),
                    i < _etapas.length - 1 ? linha(i < ativo) : const Spacer(),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  _etapas[i].$2,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    height: 1.2,
                    color: i <= ativo
                        ? AppColors.accentHover
                        : const Color(0xFF475569),
                    fontWeight: i == ativo ? FontWeight.w700 : FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
