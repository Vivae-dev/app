import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../globals.dart';
import '../models.dart';
import '../ui.dart';

enum _Etapa { carregando, endereco, confirmacao, pagamento }

/// Só dígitos, com limite de tamanho, formatados por [formatar].
TextInputFormatter _mascara(int maxDigitos, String Function(String) formatar) {
  return TextInputFormatter.withFunction((antigo, novo) {
    var d = novo.text.replaceAll(RegExp(r'\D'), '');
    if (d.length > maxDigitos) d = d.substring(0, maxDigitos);
    final texto = formatar(d);
    return TextEditingValue(
      text: texto,
      selection: TextSelection.collapsed(offset: texto.length),
    );
  });
}

String _cartao(String d) {
  final grupos = <String>[];
  for (var i = 0; i < d.length; i += 4) {
    grupos.add(d.substring(i, i + 4 > d.length ? d.length : i + 4));
  }
  return grupos.join(' ');
}

String _validade(String d) =>
    d.length > 2 ? '${d.substring(0, 2)}/${d.substring(2)}' : d;

String _cep(String d) =>
    d.length > 5 ? '${d.substring(0, 5)}-${d.substring(5)}' : d;

String _soDigitos(String s) => s.replaceAll(RegExp(r'\D'), '');

/// Checkout: endereço → confirmação → pagamento (as 3 telas do React).
class CheckoutScreen extends StatefulWidget {
  final Box box;

  const CheckoutScreen({super.key, required this.box});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  _Etapa _etapa = _Etapa.carregando;

  final _formEndereco = GlobalKey<FormState>();
  final _cepCtrl = TextEditingController();
  final _ruaCtrl = TextEditingController();
  final _numeroCtrl = TextEditingController();
  final _complementoCtrl = TextEditingController();
  bool _buscandoCep = false;

  final _formPagamento = GlobalKey<FormState>();
  final _cardNumber = TextEditingController();
  final _cardName = TextEditingController();
  final _cardExpiry = TextEditingController();
  final _cardCvv = TextEditingController();
  bool _pagando = false;

  Box get box => widget.box;

  @override
  void initState() {
    super.initState();
    _carregarEndereco();
  }

  @override
  void dispose() {
    for (final c in [
      _cepCtrl,
      _ruaCtrl,
      _numeroCtrl,
      _complementoCtrl,
      _cardNumber,
      _cardName,
      _cardExpiry,
      _cardCvv,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  void _preencher(Address a) {
    _cepCtrl.text = _cep(_soDigitos(a.cep));
    _ruaCtrl.text = a.rua;
    _numeroCtrl.text = a.numero;
    _complementoCtrl.text = a.complemento;
  }

  /// Igual ao React: usa o endereço salvo na sessão ou no backend; se não
  /// houver, começa pelo formulário de endereço.
  Future<void> _carregarEndereco() async {
    final user = session.user!;
    if (user.cep != null && user.cep!.isNotEmpty) {
      _preencher(Address(
        cep: user.cep!,
        rua: user.logradouro ?? '',
        numero: user.numeroCasa ?? '',
        complemento: user.complemento ?? '',
      ));
      setState(() => _etapa = _Etapa.confirmacao);
      return;
    }
    Address? salvo;
    try {
      salvo = await api.getUserAddress(user.id, user.token);
    } catch (_) {
      salvo = null;
    }
    if (!mounted) return;
    if (salvo != null) _preencher(salvo);
    setState(() => _etapa = salvo != null ? _Etapa.confirmacao : _Etapa.endereco);
  }

  Address get _endereco => Address(
        cep: _soDigitos(_cepCtrl.text),
        rua: _ruaCtrl.text.trim(),
        numero: _numeroCtrl.text.trim(),
        complemento: _complementoCtrl.text.trim(),
      );

  Future<void> _buscarCep(String valor) async {
    final cep = _soDigitos(valor);
    if (cep.length != 8) return;
    setState(() => _buscandoCep = true);
    final rua = await api.buscarRua(cep);
    if (!mounted) return;
    setState(() => _buscandoCep = false);
    if (rua != null) {
      _ruaCtrl.text = rua;
      showToast('📍 Endereço localizado!');
    } else {
      showToast('❌ CEP não encontrado.');
    }
  }

  Future<void> _pagar() async {
    if (!_formPagamento.currentState!.validate()) return;
    final user = session.user!;
    setState(() => _pagando = true);
    try {
      final pagamento = await api.processPayment(
        amount: box.price,
        cardNumber: _cardNumber.text,
        cardName: _cardName.text,
        cardExpiry: _cardExpiry.text,
        cardCvv: _cardCvv.text,
      );
      if (!pagamento.success) {
        showToast('❌ Pagamento recusado.');
        return;
      }

      final endereco = _endereco;
      await api.createReserva(
        box: box,
        userId: user.id,
        address: endereco,
        token: user.token,
      );

      // Guarda o endereço para as próximas compras
      await session.setUser(user.withAddress(endereco));

      if (!mounted) return;
      showToast(
        '✅ Pedido de ${box.name} realizado! ID: ${pagamento.transactionId}',
      );
      Navigator.pop(context);
    } catch (e) {
      if (mounted) tratarErro(context, e);
    } finally {
      if (mounted) setState(() => _pagando = false);
    }
  }

  // ── Telas ─────────────────────────────────────────────────────────────

  String? _obrigatorio(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null;

  Widget _voltar(String texto, VoidCallback onTap) {
    return Align(
      alignment: Alignment.centerLeft,
      child: TextButton.icon(
        onPressed: onTap,
        icon: const Icon(Icons.arrow_back, size: 18),
        label: Text(texto),
        style: TextButton.styleFrom(foregroundColor: AppColors.textSecondary),
      ),
    );
  }

  Widget _telaEndereco() {
    return Form(
      key: _formEndereco,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _voltar('Voltar para a vitrine', () => Navigator.pop(context)),
          const SizedBox(height: 12),
          const SectionTitle(
            'Dados de Entrega',
            subtitle: 'Preencha o CEP para localizarmos sua rua automaticamente.',
          ),
          TextFormField(
            controller: _cepCtrl,
            keyboardType: TextInputType.number,
            inputFormatters: [_mascara(8, _cep)],
            decoration: InputDecoration(
              labelText: 'CEP',
              hintText: '00000-000',
              suffixIcon: _buscandoCep
                  ? const Padding(
                      padding: EdgeInsets.all(14),
                      child: SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : null,
            ),
            onChanged: _buscarCep,
            validator: (v) =>
                _soDigitos(v ?? '').length == 8 ? null : 'CEP deve ter 8 dígitos',
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: TextFormField(
                  controller: _ruaCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Rua (preenchida pelo CEP)',
                    hintText: 'Digite o CEP acima...',
                  ),
                  validator: _obrigatorio,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _numeroCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Número',
                    hintText: 'Ex: 123',
                  ),
                  validator: _obrigatorio,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _complementoCtrl,
            decoration: const InputDecoration(
              labelText: 'Complemento',
              hintText: 'Apto, bloco, ponto de referência...',
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () {
              if (_formEndereco.currentState!.validate()) {
                setState(() => _etapa = _Etapa.confirmacao);
              }
            },
            child: const Text('Ir para Confirmação'),
          ),
        ],
      ),
    );
  }

  Widget _resumo({bool comEndereco = true}) {
    final e = _endereco;
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text.rich(TextSpan(children: [
            const TextSpan(
              text: 'Item: ',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
            TextSpan(text: box.name),
          ])),
          if (comEndereco) ...[
            const SizedBox(height: 8),
            Text.rich(TextSpan(children: [
              const TextSpan(
                text: 'Endereço: ',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              TextSpan(text: '${e.rua}, ${e.numero}'),
            ])),
            const SizedBox(height: 4),
            Text(
              '${_cep(e.cep)}${e.complemento.isNotEmpty ? ' - ${e.complemento}' : ''}',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const Divider(height: 28, color: AppColors.line),
          ] else
            const SizedBox(height: 8),
          Text(
            '${comEndereco ? 'Total: ' : ''}${formatBRL(box.price)}'
            '${box.isSubscription ? ' / mês' : ''}',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppColors.accentHover,
            ),
          ),
        ],
      ),
    );
  }

  Widget _telaConfirmacao() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _voltar('Voltar para a vitrine', () => Navigator.pop(context)),
        const SizedBox(height: 12),
        const SectionTitle('Confirme seu Pedido'),
        _resumo(),
        const SizedBox(height: 24),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: AppColors.success),
          onPressed: () => setState(() => _etapa = _Etapa.pagamento),
          child: const Text('Ir para Pagamento'),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => setState(() => _etapa = _Etapa.endereco),
          style: TextButton.styleFrom(foregroundColor: AppColors.textSecondary),
          child: const Text('Alterar Endereço'),
        ),
      ],
    );
  }

  Widget _telaPagamento() {
    return Form(
      key: _formPagamento,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _voltar(
            'Voltar para confirmação',
            () => setState(() => _etapa = _Etapa.confirmacao),
          ),
          const SizedBox(height: 12),
          const SectionTitle(
            'Pagamento',
            subtitle: 'Insira os dados do cartão para finalizar.',
          ),
          _resumo(comEndereco: false),
          const SizedBox(height: 20),
          TextFormField(
            controller: _cardNumber,
            keyboardType: TextInputType.number,
            inputFormatters: [_mascara(16, _cartao)],
            decoration: const InputDecoration(
              labelText: 'Número do Cartão',
              hintText: '0000 0000 0000 0000',
            ),
            validator: (v) => _soDigitos(v ?? '').length >= 13
                ? null
                : 'Número do cartão incompleto',
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _cardName,
            textCapitalization: TextCapitalization.characters,
            inputFormatters: [
              TextInputFormatter.withFunction(
                (antigo, novo) => novo.copyWith(text: novo.text.toUpperCase()),
              ),
            ],
            decoration: const InputDecoration(
              labelText: 'Nome no Cartão',
              hintText: 'NOME SOBRENOME',
            ),
            validator: _obrigatorio,
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: TextFormField(
                  controller: _cardExpiry,
                  keyboardType: TextInputType.number,
                  inputFormatters: [_mascara(4, _validade)],
                  decoration: const InputDecoration(
                    labelText: 'Validade',
                    hintText: 'MM/AA',
                  ),
                  validator: (v) =>
                      _soDigitos(v ?? '').length == 4 ? null : 'Use MM/AA',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _cardCvv,
                  keyboardType: TextInputType.number,
                  obscureText: true,
                  inputFormatters: [_mascara(4, (d) => d)],
                  decoration: const InputDecoration(
                    labelText: 'CVV',
                    hintText: '000',
                  ),
                  validator: (v) =>
                      _soDigitos(v ?? '').length >= 3 ? null : 'CVV inválido',
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.success),
            onPressed: _pagando ? null : _pagar,
            child: _pagando
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text('Pagar ${formatBRL(box.price)}'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final Widget tela;
    switch (_etapa) {
      case _Etapa.carregando:
        tela = const Padding(
          padding: EdgeInsets.all(48),
          child: Center(child: CircularProgressIndicator()),
        );
      case _Etapa.endereco:
        tela = _telaEndereco();
      case _Etapa.confirmacao:
        tela = _telaConfirmacao();
      case _Etapa.pagamento:
        tela = _telaPagamento();
    }
    return PageShell(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: tela,
      ),
    );
  }
}
