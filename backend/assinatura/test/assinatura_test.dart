import 'dart:convert';

import 'package:assinatura/assinatura.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:shelf/shelf.dart';
import 'package:test/test.dart';

const secret = 'test-secret';

class FakePedidos implements PedidoRepository {
  final Set<(int, int)> donos;
  FakePedidos(this.donos);

  @override
  Future<bool> pertenceAoUsuario(int idPedido, int idUsuario) async =>
      donos.contains((idPedido, idUsuario));
}

class FakeBarramento implements Barramento {
  final eventos = <(String, Object)>[];
  bool falhar = false;

  @override
  Future<void> publicar(String tipo, Object dados) async {
    if (falhar) throw Exception('fora do ar');
    eventos.add((tipo, dados));
  }
}

void main() {
  late FakeBarramento barramento;
  late Handler handler;

  setUp(() {
    barramento = FakeBarramento();
    handler = buildHandler(
      pedidos: FakePedidos({(10, 1)}),
      barramento: barramento,
      jwtSecret: secret,
      frontUrl: 'http://localhost:8000',
    );
  });

  String token(int id) =>
      JWT({'id': id, 'email': 'a@b.com', 'role': 'user'}).sign(SecretKey(secret));

  Future<Response> cancelar(String id, {String? auth}) => Future.value(
    handler(
      Request(
        'DELETE',
        Uri.parse('http://localhost/api/cancelamento/$id'),
        headers: {'authorization': ?auth},
      ),
    ),
  );

  test('sem token retorna 401', () async {
    final res = await cancelar('10');
    expect(res.statusCode, 401);
  });

  test('token inválido retorna 401', () async {
    final res = await cancelar('10', auth: 'Bearer lixo');
    expect(res.statusCode, 401);
  });

  test('id não numérico retorna 400', () async {
    final res = await cancelar('abc', auth: 'Bearer ${token(1)}');
    expect(res.statusCode, 400);
  });

  test('pedido de outro usuário retorna 404 e não publica evento', () async {
    final res = await cancelar('10', auth: 'Bearer ${token(2)}');
    expect(res.statusCode, 404);
    expect(barramento.eventos, isEmpty);
  });

  test('cancela pedido e publica CancelarPedido no barramento', () async {
    final res = await cancelar('10', auth: 'Bearer ${token(1)}');
    expect(res.statusCode, 200);
    expect(jsonDecode(await res.readAsString())['message'],
        'Pedido cancelado com sucesso!');
    expect(barramento.eventos.single.$1, 'CancelarPedido');
    expect(barramento.eventos.single.$2, [10, 1]);
  });

  test('falha no barramento retorna 500', () async {
    barramento.falhar = true;
    final res = await cancelar('10', auth: 'Bearer ${token(1)}');
    expect(res.statusCode, 500);
  });

  test('preflight OPTIONS responde com CORS', () async {
    final res = await handler(
      Request('OPTIONS', Uri.parse('http://localhost/api/cancelamento/10')),
    );
    expect(res.statusCode, 204);
    expect(res.headers['access-control-allow-origin'], 'http://localhost:8000');
  });
}
