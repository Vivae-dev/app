import 'dart:io';

import 'package:assinatura/assinatura.dart';
import 'package:dotenv/dotenv.dart';
import 'package:postgres/postgres.dart';
import 'package:shelf/shelf_io.dart' as io;

Future<void> main() async {
  // Mesma ordem dos serviços Node: .env local e depois backend/.env.
  final env = DotEnv(includePlatformEnvironment: true)
    ..load(['.env', '../.env'].where((f) => File(f).existsSync()));

  final port = int.parse(env['CANCELAMENTO_PORT'] ?? '8005');
  final host = env['HOST'] ?? 'localhost';

  final pool = Pool.withEndpoints(
    [
      Endpoint(
        host: env['DB_HOST'] ?? 'localhost',
        database: env['DB_NAME'] ?? 'postgres',
        username: env['DB_USER'],
        password: env['DB_PASSWORD'],
        port: int.parse(env['DB_PORT'] ?? '5432'),
      ),
    ],
    settings: const PoolSettings(sslMode: SslMode.require),
  );

  final handler = buildHandler(
    pedidos: PostgresPedidoRepository(pool),
    barramento: HttpBarramento(
      env['BARRAMENTO_URL'] ?? 'http://localhost:10000',
    ),
    jwtSecret: env['JWT_SECRET'] ?? 'secret',
    frontUrl: env['FRONT_URL'] ?? 'http://localhost:8000',
  );

  await io.serve(handler, host, port);
  print('Microsserviço de Cancelamento (Dart) rodando em http://$host:$port');
}
