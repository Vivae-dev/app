import 'package:flutter/material.dart';

import 'api.dart';
import 'session.dart';
import 'ui.dart';

/// Instâncias únicas usadas por todas as telas.
final api = Api();
final session = Session();

/// Trata erro de chamada à API igual o React: token expirado desloga e volta
/// pra vitrine; qualquer outro erro vira um toast com a mensagem do serviço.
void tratarErro(BuildContext context, Object erro, {String? prefixo}) {
  if (erro is ApiException && erro.isUnauthorized) {
    session.logout();
    Navigator.of(context).popUntil((route) => route.isFirst);
    showToast('⚠️ Sessão expirada. Faça login novamente.');
    return;
  }
  final msg = erro is ApiException ? erro.message : 'Erro inesperado: $erro';
  showToast('❌ ${prefixo ?? ''}$msg');
}
