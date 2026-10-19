import 'dart:convert';

import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:http/http.dart' as http;
import 'package:postgres/postgres.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

/// Acesso aos pedidos no banco.
abstract class PedidoRepository {
  Future<bool> pertenceAoUsuario(int idPedido, int idUsuario);
}

class PostgresPedidoRepository implements PedidoRepository {
  final Pool _pool;

  PostgresPedidoRepository(this._pool);

  @override
  Future<bool> pertenceAoUsuario(int idPedido, int idUsuario) async {
    final result = await _pool.execute(
      r'SELECT 1 FROM pedidos WHERE id_pedido = $1 AND id_usuario = $2',
      parameters: [idPedido, idUsuario],
    );
    return result.isNotEmpty;
  }
}

/// Publica eventos no barramento.
abstract class Barramento {
  Future<void> publicar(String tipo, Object dados);
}

class HttpBarramento implements Barramento {
  final Uri _url;
  final http.Client _client;

  HttpBarramento(String baseUrl, {http.Client? client})
    : _url = Uri.parse('$baseUrl/eventos'),
      _client = client ?? http.Client();

  @override
  Future<void> publicar(String tipo, Object dados) async {
    final res = await _client.post(
      _url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'tipo': tipo, 'dados': dados}),
    );
    if (res.statusCode >= 400) {
      throw Exception('Barramento respondeu ${res.statusCode}');
    }
  }
}

Response _json(int status, Map<String, Object?> body) => Response(
  status,
  body: jsonEncode(body),
  headers: {'Content-Type': 'application/json; charset=utf-8'},
);

Middleware cors(String origin) {
  final headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  return (inner) => (req) async {
    if (req.method == 'OPTIONS') return Response(204, headers: headers);
    final res = await inner(req);
    return res.change(headers: headers);
  };
}

/// Valida o JWT emitido pelo microsserviço de autenticação e guarda o
/// payload em `request.context['user']`.
Middleware authenticate(String jwtSecret) {
  return (inner) => (req) {
    final header = req.headers['authorization'];
    final token = header?.split(' ').elementAtOrNull(1);
    if (token == null || token.isEmpty) {
      return _json(401, {'message': 'Token não fornecido.'});
    }
    try {
      final jwt = JWT.verify(token, SecretKey(jwtSecret));
      return inner(req.change(context: {'user': jwt.payload}));
    } on JWTException {
      return _json(401, {'message': 'Token inválido ou expirado.'});
    }
  };
}

Handler buildHandler({
  required PedidoRepository pedidos,
  required Barramento barramento,
  required String jwtSecret,
  required String frontUrl,
}) {
  final router = Router();

  router.delete('/api/cancelamento/<id>', (Request req, String id) async {
    final idPedido = int.tryParse(id);
    if (idPedido == null) {
      return _json(400, {'message': 'ID do pedido inválido.'});
    }
    final user = req.context['user'] as Map<String, dynamic>;
    final idUsuario = user['id'] as int;

    try {
      if (!await pedidos.pertenceAoUsuario(idPedido, idUsuario)) {
        return _json(404, {
          'message':
              'Pedido não encontrado ou você não tem permissão para cancelá-lo.',
        });
      }
      await barramento.publicar('CancelarPedido', [idPedido, idUsuario]);
      return _json(200, {'message': 'Pedido cancelado com sucesso!'});
    } catch (e) {
      print('Erro ao cancelar pedido $idPedido: $e');
      return _json(500, {'message': 'Erro ao cancelar o pedido.'});
    }
  });

  final protegido = const Pipeline()
      .addMiddleware(authenticate(jwtSecret))
      .addHandler(router.call);

  return const Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(cors(frontUrl))
      .addHandler(protegido);
}
