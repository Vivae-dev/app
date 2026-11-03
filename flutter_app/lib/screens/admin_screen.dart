import 'package:flutter/material.dart';

import '../globals.dart';
import '../models.dart';
import '../ui.dart';

/// Painel admin: cria, edita e remove caixas do catálogo.
class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _image = TextEditingController();
  final _stock = TextEditingController();
  String _type = 'AVULSA';

  Box? _editando;
  bool _salvando = false;
  bool _loading = true;
  List<Box> _boxes = [];

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    for (final c in [_name, _description, _price, _image, _stock]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _carregar() async {
    try {
      final boxes = await api.getCaixas();
      if (mounted) setState(() => _boxes = boxes);
    } catch (e) {
      if (mounted) tratarErro(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _editar(Box box) {
    setState(() {
      _editando = box;
      _name.text = box.name;
      _description.text = box.description;
      _price.text = box.price.toString();
      _image.text = box.image;
      _stock.text = box.stock.toString();
      _type = box.type;
    });
  }

  void _limpar() {
    setState(() {
      _editando = null;
      _type = 'AVULSA';
      for (final c in [_name, _description, _price, _image, _stock]) {
        c.clear();
      }
    });
  }

  double _lerPreco() =>
      double.tryParse(_price.text.trim().replaceAll(',', '.')) ?? 0;

  Future<void> _salvar() async {
    if (!_form.currentState!.validate()) return;
    final token = session.user!.token;
    final payload = BoxPayload(
      name: _name.text.trim(),
      description: _description.text.trim(),
      type: _type,
      price: _lerPreco(),
      image: _image.text.trim(),
      stock: int.tryParse(_stock.text.trim()) ?? 0,
    );
    setState(() => _salvando = true);
    try {
      final editando = _editando;
      if (editando != null) {
        final atualizada = await api.updateCaixa(editando.id, payload, token);
        if (!mounted) return;
        setState(() {
          _boxes = [
            for (final b in _boxes) b.id == editando.id ? atualizada : b,
          ];
        });
        showToast('✅ Caixa atualizada!');
      } else {
        final nova = await api.createCaixa(payload, token);
        if (!mounted) return;
        setState(() => _boxes = [..._boxes, nova]);
        showToast('✅ Caixa criada!');
      }
      _limpar();
    } catch (e) {
      if (mounted) tratarErro(context, e);
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  Future<void> _remover(Box box) async {
    if (!await confirmar(context, 'Deletar esta caixa permanentemente?')) return;
    try {
      await api.deleteCaixa(box.id, session.user!.token);
      if (!mounted) return;
      setState(() => _boxes.removeWhere((b) => b.id == box.id));
      if (_editando?.id == box.id) _limpar();
      showToast('✅ Caixa removida!');
    } catch (e) {
      if (mounted) tratarErro(context, e);
    }
  }

  Widget _formulario() {
    return GlassCard(
      child: Form(
        key: _form,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              _editando != null
                  ? '✏️ Editando: ${_editando!.name}'
                  : '➕ Nova Caixa',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Nome'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _description,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Descrição'),
            ),
            const SizedBox(height: 12),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'AVULSA', label: Text('🛍️ Avulsa')),
                ButtonSegment(value: 'ASSINATURA', label: Text('📦 Assinatura')),
              ],
              selected: {_type},
              showSelectedIcon: false,
              onSelectionChanged: (s) => setState(() => _type = s.first),
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _price,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Preço (R\$)'),
                    validator: (_) =>
                        _lerPreco() > 0 ? null : 'Informe um preço válido',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _stock,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Estoque'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _image,
              decoration: const InputDecoration(labelText: 'URL da imagem'),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    onPressed: _salvando ? null : _salvar,
                    child: Text(
                      _salvando
                          ? 'Salvando...'
                          : _editando != null
                              ? 'Salvar Alterações'
                              : 'Criar Caixa',
                    ),
                  ),
                ),
                if (_editando != null) ...[
                  const SizedBox(width: 12),
                  OutlinedButton(
                    onPressed: _limpar,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 16,
                      ),
                    ),
                    child: const Text('Cancelar'),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _itemLista(Box box) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            NetImage(
              box.image,
              width: 56,
              height: 56,
              borderRadius: BorderRadius.circular(8),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    box.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    '${box.isSubscription ? '📦 Assinatura' : '🛍️ Avulsa'}'
                    ' · ${formatBRL(box.price)} · estoque ${box.stock}',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              tooltip: 'Editar',
              onPressed: () => _editar(box),
              icon: const Icon(Icons.edit_outlined),
              color: AppColors.accentHover,
            ),
            IconButton(
              tooltip: 'Deletar',
              onPressed: () => _remover(box),
              icon: const Icon(Icons.delete_outline),
              color: AppColors.danger,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      maxWidth: 820,
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
          const SectionTitle('⚙️ Painel Admin'),
          _formulario(),
          const SizedBox(height: 28),
          const Text(
            'Caixas cadastradas',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          if (_loading)
            const Center(child: CircularProgressIndicator())
          else if (_boxes.isEmpty)
            const Text(
              'Nenhuma caixa cadastrada.',
              style: TextStyle(color: AppColors.textSecondary),
            )
          else
            for (final b in _boxes) _itemLista(b),
        ],
      ),
    );
  }
}
