CREATE TABLE pedidos (
    id INT PRIMARY KEY,
    status VARCHAR(10) NOT NULL 
);
INSERT INTO pedidos VALUES (9, 'aberto'), (7, 'pago');