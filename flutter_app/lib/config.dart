/// Endereços dos microsserviços. Os padrões batem com o `npm run dev` do
/// backend; para trocar, passe `--dart-define=CATALOGO_URL=...` etc.
class ApiConfig {
  static const catalogo = String.fromEnvironment(
    'CATALOGO_URL',
    defaultValue: 'http://localhost:8001',
  );
  static const auth = String.fromEnvironment(
    'AUTH_URL',
    defaultValue: 'http://localhost:8002',
  );
  static const reserva = String.fromEnvironment(
    'RESERVA_URL',
    defaultValue: 'http://localhost:8003',
  );
  static const pagamento = String.fromEnvironment(
    'PAGAMENTO_URL',
    defaultValue: 'http://localhost:8004',
  );
  static const cancelamento = String.fromEnvironment(
    'CANCELAMENTO_URL',
    defaultValue: 'http://localhost:8005',
  );
}
