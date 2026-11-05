import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';
import 'models.dart';

/// Erro vindo de um microsserviço, com a mensagem que ele mandou.
class ApiException implements Exception {
  final int? status;
  final String message;

  const ApiException(this.status, this.message);

  bool get isUnauthorized => status == 401;

  @override
  String toString() => message;
}

/// Chamadas aos microsserviços, as mesmas que o front React faz.
class Api {
  final http.Client _client = http.Client();

  Future<dynamic> _send(
    String method,
    String url, {
    String? token,
    Object? body,
  }) async {
    final uri = Uri.parse(url);
    final req = http.Request(method, uri);
    if (token != null) req.headers['Authorization'] = 'Bearer $token';
    if (body != null) {
      req.headers['Content-Type'] = 'application/json';
      req.body = jsonEncode(body);
    }

    final res = await _executar(req);

    dynamic data;
    if (res.body.isNotEmpty) {
      try {
        data = jsonDecode(utf8.decode(res.bodyBytes));
      } catch (_) {
        data = res.body;
      }
    }

    if (res.statusCode >= 400) {
      String? msg;
      if (data is Map) msg = (data['message'] ?? data['error'])?.toString();
      throw ApiException(res.statusCode, msg ?? 'Erro ${res.statusCode}.');
    }
    return data;
  }

  Future<http.Response> _executar(http.Request req) async {
    try {
      return await http.Response.fromStream(await _client.send(req));
    } catch (_) {
      throw ApiException(
        null,
        'Não foi possível falar com ${req.url.origin}. O serviço está rodando?',
      );
    }
  }

  // ── Autenticação (8002) ───────────────────────────────────────────────

  Future<User> login(String email, String password) async {
    final data = await _send(
      'POST',
      '${ApiConfig.auth}/api/auth/login',
      body: {'email': email, 'password': password},
    );
    return User.fromJson(data as Map<String, dynamic>);
  }

  Future<User> register(String name, String email, String password) async {
    final data = await _send(
      'POST',
      '${ApiConfig.auth}/api/auth/register',
      body: {'name': name, 'email': email, 'password': password},
    );
    return User.fromJson(data as Map<String, dynamic>);
  }

  // ── Catálogo (8001) ───────────────────────────────────────────────────

  Future<List<Box>> getCaixas() async {
    final data = await _send('GET', '${ApiConfig.catalogo}/api/caixas');
    return (data as List)
        .map((j) => Box.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<Box> createCaixa(BoxPayload payload, String token) async {
    final data = await _send(
      'POST',
      '${ApiConfig.catalogo}/api/caixas',
      token: token,
      body: payload.toJson(),
    );
    return Box.fromJson(data as Map<String, dynamic>);
  }

  Future<Box> updateCaixa(int id, BoxPayload payload, String token) async {
    final data = await _send(
      'PUT',
      '${ApiConfig.catalogo}/api/caixas/$id',
      token: token,
      body: payload.toJson(),
    );
    return Box.fromJson(data as Map<String, dynamic>);
  }

  Future<void> deleteCaixa(int id, String token) async {
    await _send('DELETE', '${ApiConfig.catalogo}/api/caixas/$id', token: token);
  }

  // ── Carrinho / pedidos (8003) ─────────────────────────────────────────

  Future<List<Order>> getReservas(String token) async {
    final data =
        await _send('GET', '${ApiConfig.reserva}/api/reservas', token: token);
    return (data as List)
        .map((j) => Order.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<void> createReserva({
    required Box box,
    required int userId,
    required Address address,
    required String token,
  }) async {
    await _send(
      'POST',
      '${ApiConfig.reserva}/api/reservas',
      token: token,
      body: {
        'experienceId': box.id,
        'experienceName': box.name,
        'price': box.price,
        'userId': userId,
        'address': address.toJson(),
      },
    );
  }

  /// Endereço salvo do usuário, ou null se ele ainda não tiver um.
  Future<Address?> getUserAddress(int userId, String token) async {
    final data = await _send(
      'GET',
      '${ApiConfig.reserva}/api/users/$userId/address',
      token: token,
    );
    if (data is! Map || data['cep'] == null || '${data['cep']}'.isEmpty) {
      return null;
    }
    return Address(
      cep: '${data['cep']}',
      rua: '${data['rua'] ?? ''}',
      numero: '${data['numero'] ?? ''}',
      complemento: '${data['complemento'] ?? ''}',
    );
  }

  // ── Cancelamento (8005) ───────────────────────────────────────────────

  Future<void> cancelReserva(int id, String token) async {
    await _send(
      'DELETE',
      '${ApiConfig.cancelamento}/api/cancelamento/$id',
      token: token,
    );
  }

  // ── Pagamento (8004) ──────────────────────────────────────────────────

  Future<PaymentResult> processPayment({
    required double amount,
    required String cardNumber,
    required String cardName,
    required String cardExpiry,
    required String cardCvv,
  }) async {
    final data = await _send(
      'POST',
      '${ApiConfig.pagamento}/api/pagamento',
      body: {
        'amount': amount,
        'cardNumber': cardNumber,
        'cardName': cardName,
        'cardExpiry': cardExpiry,
        'cardCvv': cardCvv,
      },
    );
    return PaymentResult.fromJson(data as Map<String, dynamic>);
  }

  // ── ViaCEP (externo) ──────────────────────────────────────────────────

  /// Retorna a rua do CEP, ou null se não encontrar.
  Future<String?> buscarRua(String cep) async {
    try {
      final res = await http.get(Uri.parse('https://viacep.com.br/ws/$cep/json/'));
      final data = jsonDecode(utf8.decode(res.bodyBytes));
      if (data is Map && data['erro'] == null) {
        return '${data['logradouro'] ?? ''}';
      }
    } catch (_) {}
    return null;
  }
}
