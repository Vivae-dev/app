import 'package:flutter/material.dart';

import '../globals.dart';
import '../models.dart';
import '../ui.dart';
import '../widgets/product_card.dart';
import 'admin_screen.dart';
import 'auth_dialog.dart';
import 'checkout_screen.dart';
import 'orders_screen.dart';

/// Vitrine (tela inicial).
class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  List<Box> _boxes = [];
  bool _loading = true;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      final boxes = await api.getCaixas();
      if (!mounted) return;
      setState(() => _boxes = boxes);
    } catch (e) {
      if (!mounted) return;
      setState(() => _erro = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _comprar(Box box) async {
    if (!session.isLogged) {
      showToast('⚠️ Faça login para continuar.');
      final logou = await showAuthDialog(context);
      if (!logou || !mounted) return;
    }
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => CheckoutScreen(box: box)),
    );
  }

  Future<void> _abrirAdmin() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AdminScreen()),
    );
    // O admin pode ter criado, editado ou removido caixas
    _carregar();
  }

  void _sair() {
    session.logout();
    showToast('👋 Até logo! Você saiu da sua conta.');
  }

  Widget _botaoTopo(String texto, Color cor, VoidCallback onTap) {
    return FilledButton(
      onPressed: onTap,
      style: FilledButton.styleFrom(
        backgroundColor: cor,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      child: Text(texto),
    );
  }

  Widget _menu() {
    return ListenableBuilder(
      listenable: session,
      builder: (context, _) {
        final user = session.user;
        if (user == null) {
          return _botaoTopo(
            'Entrar / Cadastrar',
            AppColors.accent,
            () => showAuthDialog(context),
          );
        }
        return Wrap(
          spacing: 8,
          runSpacing: 8,
          alignment: WrapAlignment.end,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(
              'Olá, ${user.name}',
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            _botaoTopo('📦 Meus Pedidos', AppColors.ordersBlue, () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const OrdersScreen()),
              );
            }),
            if (user.isAdmin)
              _botaoTopo('⚙️ Admin', AppColors.adminPurple, _abrirAdmin),
            _botaoTopo('Sair', const Color(0x33FFFFFF), _sair),
          ],
        );
      },
    );
  }

  Widget _cabecalho() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      child: Column(
        children: [
          Align(alignment: Alignment.centerRight, child: _menu()),
          const SizedBox(height: 28),
          ShaderMask(
            shaderCallback: (rect) => const LinearGradient(
              colors: [Color(0xFFE2E8F0), AppColors.accent],
            ).createShader(rect),
            child: const Text(
              'Vivae',
              style: TextStyle(
                fontSize: 56,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Viva experiências inesquecíveis entregues diretamente na sua casa.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 17, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _conteudo() {
    if (_loading) {
      return const SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.all(48),
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }
    if (_erro != null) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              Text(
                'Erro ao buscar caixas: $_erro',
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _carregar,
                child: const Text('Tentar de novo'),
              ),
            ],
          ),
        ),
      );
    }
    if (_boxes.isEmpty) {
      return const SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            'Nenhuma caixa cadastrada ainda.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ),
      );
    }
    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
          maxCrossAxisExtent: 340,
          mainAxisExtent: 440,
          crossAxisSpacing: 20,
          mainAxisSpacing: 20,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, i) => ProductCard(
            box: _boxes[i],
            onBuy: () => _comprar(_boxes[i]),
          ),
          childCount: _boxes.length,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      maxWidth: 1200,
      child: RefreshIndicator(
        onRefresh: _carregar,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _cabecalho()),
            _conteudo(),
          ],
        ),
      ),
    );
  }
}
