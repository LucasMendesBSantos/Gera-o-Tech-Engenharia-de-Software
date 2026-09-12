CREATE TABLE servico(
    id INT PRIMARY KEY,
    nome VARCHAR (100) NOT NULL,
    preco DECIMAL (18, 2),
    marca VARCHAR (100)
);

CREATE TABLE produto(
    id INT PRIMARY KEY,
    nome VARCHAR (100) NOT NULL,
    preco DECIMAL (18, 2)
);

INSERT INTO servico (id, nome, preco, marca) 
VALUES 
  (1, 'Corte de Cabelo Degradê', 45.00, 'Wahl'),
  (2, 'Barba Completa com Toalha Quente', 35.00, 'Gillette'),
  (3, 'Combo Cabelo e Barba', 70.00, 'Baboon'),
  (4, 'Sobrancelha na Navalha', 15.00, 'Navalhete'),
  (5, 'Pigmentação de Barba', 40.00, 'Bigen');

INSERT INTO produto (id, nome, preco) 
VALUES 
  (1, 'Pomada Modeladora Efeito Matte 150g', 35.90),
  (2, 'Óleo para Barba Hidratante 30ml', 42.00),
  (3, 'Shampoo para Cabelo e Barba Mentolado', 29.90),
  (4, 'Balm para Barba Alinhador 100g', 38.50),
  (5, 'Gel Incolor para Barbear 500g', 25.00);