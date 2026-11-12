CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    turma VARCHAR(20) NOT NULL,
    turno VARCHAR(20) NOT NULL,
    nota_final DECIMAL(4,2),
    status VARCHAR(20)
);

CREATE TABLE turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    horario VARCHAR(20) NOT NULL
);

CREATE TABLE professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    materia VARCHAR(50) NOT NULL,
    turma VARCHAR(20) NOT NULL
);

INSERT INTO turmas (nome, horario) VALUES
('Turma A', '08:00'),
('Turma B', '14:00');

INSERT INTO professores (nome, materia, turma) VALUES
('Aberlado', 'Engenharia', 'Turma A'),
('lardoAbel', 'Software', 'Turma A'),
('Abel', 'Full Cycle', 'Turma B');

INSERT INTO alunos (nome, turma, turno, status) VALUES
('aberto', 'Turma A', 'manha', 'pendente'),
('alberto', 'Turma A', 'manha', 'pendente'),
('o bom', 'Turma B', 'tarde', 'pendente'),
('o ruim', 'Turma B', 'tarde', 'pendente'),
('o willian', 'Turma A', 'manha', 'pendente');
