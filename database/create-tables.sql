/* MS AUTH */

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL NOT NULL PRIMARY KEY,
    nome_completo VARCHAR(100),
    email VARCHAR(255),
    senha_hash VARCHAR(60),
    CEP VARCHAR(8),
    logradouro VARCHAR(100),
    complemento VARCHAR(50),
    endereco VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    data_criacao TIMESTAMP
);

/* MS CATALOGO DE PRODUTOS */

CREATE TABLE IF NOT EXISTS produtos(
    id_produto SERIAL NOT NULL PRIMARY KEY,
    nome VARCHAR(20),
    valor FLOAT
);
CREATE TABLE IF NOT EXISTS materiais(
    id_material SERIAL NOT NULL PRIMARY KEY,
    nome VARCHAR(20),
    valor_compra FLOAT,
    fornecedor VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS composicao_produtos(
    id_produto INT,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    id_material INT,
    FOREIGN KEY (id_material) REFERENCES materiais(id_material),
    PRIMARY KEY (id_produto, id_material)
);

/* MS CARRINHO/PEDIDOS */
CREATE TYPE status_pedido AS ENUM ('carrinho', 'pago', 'enviado', 'entregue');

CREATE TABLE IF NOT EXISTS pedidos(
    id_pedido SERIAL NOT NULL PRIMARY KEY,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    data_reserva TIMESTAMP,
    valor_total FLOAT,
    estado status_pedido
);

CREATE TABLE IF NOT EXISTS itensPedido(
    id_pedido INT,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    id_produto INT,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
)




