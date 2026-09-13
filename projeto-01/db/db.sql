CREATE TABLE servicos(
    id INT PRIMARY KEY,
    nome VARCHAR (100) NOT NULL,
    descricao VARCHAR (255),
    preco DECIMAL (18, 2)
);

CREATE TABLE produtos(
    id INT PRIMARY KEY,
    nome VARCHAR (100) NOT NULL,
    marca VARCHAR (100),
    categoria VARCHAR (60),
    descricao VARCHAR (255),
    preco DECIMAL (18, 2)
);

INSERT INTO servicos (id, nome, descricao, preco)
VALUES
  (1, 'Casamentos', 'Planejamento e execução completa do dia mais especial, com atenção a cada detalhe.', 4500.00),
  (2, 'Aniversários', 'Festas elegantes e personalizadas para todas as idades, do íntimo ao grandioso.', 1800.00),
  (3, 'Formaturas', 'Cerimônia e festa à altura da conquista de toda uma trajetória.', 3200.00),
  (4, 'Corporativos', 'Confraternizações, lançamentos e eventos empresariais com organização impecável.', 2500.00),
  (5, 'Bodas', 'Renovação de votos e celebração dos marcos do amor.', 2100.00),
  (6, 'Debutantes', 'Baile de 15 anos único, cheio de magia e recordações.', 3800.00);

INSERT INTO produtos (id, nome, marca, categoria, descricao, preco)
VALUES
  (1, 'Copos Descartáveis Personalizados', 'Copo Fest', 'Descartáveis', 'Kit com 25 unidades personalizadas com o tema da festa.', 24.90),
  (2, 'Bolo Fake Decorativo', 'Cenário Doce', 'Decoração', 'Bolo cenográfico para compor a mesa principal (aluguel).', 120.00),
  (3, 'Bolo Personalizado Temático', 'Doce Arte', 'Bolos', 'Bolo confeitado sob medida, preço por fatia.', 8.90),
  (4, 'Cento de Salgados Sortidos', 'Sabor & Festa', 'Salgados', 'Cento de salgados variados, fresquinhos no dia do evento.', 95.00),
  (5, 'Bem-Casados Personalizados', 'Doce Encanto', 'Doces', 'Bem-casados com embalagem e tag no tema da festa.', 3.50),
  (6, 'Painel de Festa Personalizado', 'ImprimaFesta', 'Decoração', 'Painel redondo de 1,5m impresso com o tema do evento.', 180.00),
  (7, 'Balões Personalizados', 'BalloonArt', 'Decoração', 'Kit com 50 balões nas cores e tema da festa.', 65.00),
  (8, 'Taças Personalizadas para Brinde', 'TaçaFest', 'Descartáveis', 'Taça de acrílico personalizada para brinde e mesa de doces.', 6.90),
  (9, 'Toalha de Mesa Temática', 'TecidoFesta', 'Decoração', 'Toalha de 2,20m nas cores do evento.', 45.00),
  (10, 'Lembrancinhas Personalizadas', 'Mimo & Cia', 'Lembrancinhas', 'Lembrancinha temática para presentear os convidados.', 4.90);
