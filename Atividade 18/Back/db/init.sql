DROP TABLE IF EXISTS produtos;

CREATE TABLE produtos (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(120)   NOT NULL,
  descricao   TEXT,
  preco       NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
  categoria   VARCHAR(60)    NOT NULL,
  estoque     INTEGER        NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  criado_em   TIMESTAMP      NOT NULL DEFAULT NOW()
);

INSERT INTO produtos (nome, descricao, preco, categoria, estoque) VALUES
  ('Caderno', 'Caderno universitário 10 matérias', 19.90, 'Papelaria',  40),
  ('Caneta',  'Caneta esferográfica azul',           4.50, 'Papelaria', 100),
  ('Mochila', 'Mochila resistente à água',          89.90, 'Acessórios',  8);
