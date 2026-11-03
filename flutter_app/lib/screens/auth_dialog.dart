import 'package:flutter/material.dart';

import '../globals.dart';
import '../ui.dart';

/// Login / cadastro (o `AuthModal` do React). Retorna true se logou.
Future<bool> showAuthDialog(BuildContext context) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (_) => const _AuthDialog(),
  );
  return ok ?? false;
}

class _AuthDialog extends StatefulWidget {
  const _AuthDialog();

  @override
  State<_AuthDialog> createState() => _AuthDialogState();
}

class _AuthDialogState extends State<_AuthDialog> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _isRegister = false;
  bool _loading = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final user = _isRegister
          ? await api.register(
              _name.text.trim(),
              _email.text.trim(),
              _password.text,
            )
          : await api.login(_email.text.trim(), _password.text);
      await session.setUser(user);
      if (!mounted) return;
      Navigator.pop(context, true);
      showToast('✨ Bem-vindo(a), ${user.name}!');
    } catch (e) {
      final msg = e.toString().isEmpty ? 'Erro na autenticação' : e.toString();
      showToast('❌ $msg');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String? _obrigatorio(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Campo obrigatório' : null;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E1B4B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _form,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: SegmentedButton<bool>(
                        segments: const [
                          ButtonSegment(value: false, label: Text('Login')),
                          ButtonSegment(value: true, label: Text('Cadastro')),
                        ],
                        selected: {_isRegister},
                        showSelectedIcon: false,
                        onSelectionChanged: (s) =>
                            setState(() => _isRegister = s.first),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context, false),
                      icon: const Icon(Icons.close),
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                if (_isRegister) ...[
                  TextFormField(
                    controller: _name,
                    decoration: const InputDecoration(
                      labelText: 'Nome Completo',
                      hintText: 'Seu nome',
                    ),
                    validator: _obrigatorio,
                  ),
                  const SizedBox(height: 14),
                ],
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'E-mail',
                    hintText: 'seu@email.com',
                  ),
                  validator: (v) {
                    if (_obrigatorio(v) != null) return 'Campo obrigatório';
                    return v!.contains('@') ? null : 'E-mail inválido';
                  },
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _password,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Senha',
                    hintText: '••••••••',
                  ),
                  validator: _obrigatorio,
                  onFieldSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: 22),
                FilledButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(_isRegister ? 'Criar Conta' : 'Acessar'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
