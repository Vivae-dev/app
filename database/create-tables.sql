CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(30),
    senha_hash VARCHAR(60),
    email VARCHAR(255),
    nome_completo VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS produtos(
    id_produto SERIAL NOT NULL PRIMARY KEY,
    nome VARCHAR(20),
    valor FLOAT
);

CREATE TABLE IF NOT EXISTS reservas(
    id_reserva SERIAL NOT NULL PRIMARY KEY,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    id_produto INT,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    data_reserva TIMESTAMP,
    valor_total FLOAT
);

CREATE TABLE IF NOT EXISTS materiais(
    id_material SERIAL NOT NULL PRIMARY KEY,
    nome VARCHAR(20),
    valor_compra FLOAT
);

CREATE TABLE IF NOT EXISTS composicao_produtos(
    id_composicao INT NOT NULL PRIMARY KEY,
    id_produto INT,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    id_material INT,
    FOREIGN KEY (id_material) REFERENCES materiais(id_material)
);

ALTER TABLE usuarios ADD endereco VARCHAR(200);
ALTER TABLE usuarios DROP COLUMN username;

ALTER TABLE usuarios ADD data_criacao TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
