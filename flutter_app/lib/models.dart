double _toDouble(Object? v) =>
    v is num ? v.toDouble() : double.tryParse('$v') ?? 0;

int _toInt(Object? v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;

String? _toStringOrNull(Object? v) {
  if (v == null) return null;
  final s = '$v';
  return s.isEmpty ? null : s;
}

/// Caixa do catálogo (`/api/caixas`).
class Box {
  final int id;
  final String name;
  final String description;
  final String type; // 'ASSINATURA' ou 'AVULSA'
  final double price;
  final String image;
  final int stock;

  const Box({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.price,
    required this.image,
    required this.stock,
  });

  bool get isSubscription => type == 'ASSINATURA';

  factory Box.fromJson(Map<String, dynamic> j) => Box(
        id: _toInt(j['id']),
        name: '${j['name'] ?? ''}',
        description: '${j['description'] ?? ''}',
        type: '${j['type'] ?? 'AVULSA'}',
        price: _toDouble(j['price']),
        image: '${j['image'] ?? ''}',
        stock: _toInt(j['stock']),
      );
}

/// Dados enviados para criar ou editar uma caixa (admin).
class BoxPayload {
  final String name;
  final String description;
  final String type;
  final double price;
  final String image;
  final int stock;

  const BoxPayload({
    required this.name,
    required this.description,
    required this.type,
    required this.price,
    required this.image,
    required this.stock,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'description': description,
        'type': type,
        'price': price,
        'image': image,
        'stock': stock,
      };
}

/// Usuário logado, no mesmo formato que o serviço de autenticação devolve.
class User {
  final int id;
  final String name;
  final String email;
  final String role;
  final String token;
  final String? cep;
  final String? logradouro;
  final String? numeroCasa;
  final String? complemento;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.token,
    this.cep,
    this.logradouro,
    this.numeroCasa,
    this.complemento,
  });

  bool get isAdmin => role == 'admin';

  factory User.fromJson(Map<String, dynamic> j) => User(
        id: _toInt(j['id']),
        name: '${j['name'] ?? ''}',
        email: '${j['email'] ?? ''}',
        role: '${j['role'] ?? 'user'}',
        token: '${j['token'] ?? ''}',
        cep: _toStringOrNull(j['cep']),
        logradouro: _toStringOrNull(j['logradouro']),
        numeroCasa: _toStringOrNull(j['numeroCasa']),
        complemento: _toStringOrNull(j['complemento']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'token': token,
        'cep': cep,
        'logradouro': logradouro,
        'numeroCasa': numeroCasa,
        'complemento': complemento,
      };

  User withAddress(Address a) => User(
        id: id,
        name: name,
        email: email,
        role: role,
        token: token,
        cep: a.cep,
        logradouro: a.rua,
        numeroCasa: a.numero,
        complemento: a.complemento,
      );
}

/// Endereço de entrega, no formato que o carrinho espera.
class Address {
  final String cep;
  final String rua;
  final String numero;
  final String complemento;

  const Address({
    required this.cep,
    required this.rua,
    required this.numero,
    required this.complemento,
  });

  Map<String, dynamic> toJson() => {
        'cep': cep,
        'rua': rua,
        'numero': numero,
        'complemento': complemento,
      };
}

/// Pedido do usuário (`/api/reservas`).
class Order {
  final int id;
  final String date;
  final double total;
  final String status;
  final String? name;
  final String? image;

  const Order({
    required this.id,
    required this.date,
    required this.total,
    required this.status,
    this.name,
    this.image,
  });

  factory Order.fromJson(Map<String, dynamic> j) => Order(
        id: _toInt(j['id_pedido']),
        date: '${j['data_reserva'] ?? ''}',
        total: _toDouble(j['valor_total']),
        status: '${j['estado'] ?? ''}',
        name: _toStringOrNull(j['nome_experiencia']),
        image: _toStringOrNull(j['imagem']),
      );
}

/// Resultado do pagamento (mock).
class PaymentResult {
  final bool success;
  final String transactionId;

  const PaymentResult({required this.success, required this.transactionId});

  factory PaymentResult.fromJson(Map<String, dynamic> j) => PaymentResult(
        success: j['success'] == true,
        transactionId: '${j['transactionId'] ?? ''}',
      );
}
