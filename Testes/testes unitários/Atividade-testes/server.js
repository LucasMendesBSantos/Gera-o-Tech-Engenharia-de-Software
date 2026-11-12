import express from 'express';
import {db} from './db.js';

const app = express();
app.use(express.json());

app.post('/alunos', async (req, res) => {
    try {
        const {nome, turma, turno, nota_final = null, status = 'pendente'} = req.body ?? {};

        if (!nome || !turma || !turno) {
            return res.status(400).json({ message: 'Informe nome, turma e turno' });
        }

        if (nota_final !== null && (nota_final < 0 || nota_final > 10)) {
            return res.status(400).json({ message: 'Nota final deve ser entre 0 e 10' });
        }

        if (!['aprovado', 'reprovado', 'pendente'].includes(status)) {
            return res.status(400).json({ message: 'Status deve ser aprovado, reprovado ou pendente' });
        }

        const [rows] = await db.query('SELECT id FROM turmas WHERE nome = ?', [turma]);

        if (!rows[0]) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }

        const [resultado] = await db.query(
            'INSERT INTO alunos (nome, turma, turno, nota_final, status) VALUES (?, ?, ?, ?, ?)',
            [nome, turma, turno, nota_final, status]
        );

        res.status(201).json({id: resultado.insertId, nome, turma, turno, nota_final, status})

    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Erro btl'})
    }
})

async function buscarAlunoDoProfessor(alunoId, professorId, res) {
    const [alunos] = await db.query('SELECT id, turma, nota_final, status FROM alunos WHERE id = ?', [alunoId]);
    const aluno = alunos[0];

    if (!aluno) {
        res.status(404).json({ message: 'Aluno não encontrado' });
        return null;
    }

    const [professores] = await db.query('SELECT id, turma FROM professores WHERE id = ?', [professorId]);
    const professor = professores[0];

    if (!professor) {
        res.status(404).json({ message: 'Professor não encontrado' });
        return null;
    }

    if (professor.turma !== aluno.turma) {
        res.status(403).json({ message: 'Professor só pode alterar alunos da turma dele' });
        return null;
    }

    return aluno;
}

app.patch('/alunos/:id/nota', async (req, res) => {
    try {
        const {id} = req.params;
        const {professor_id, nota_final} = req.body ?? {};

        if (nota_final === undefined || nota_final === null || nota_final < 0 || nota_final > 10) {
            return res.status(400).json({ message: 'Nota final deve ser entre 0 e 10' });
        }

        const aluno = await buscarAlunoDoProfessor(id, professor_id, res);
        if (!aluno) return;

        await db.query('UPDATE alunos SET nota_final = ? WHERE id = ?', [nota_final, id]);

        res.json({id, nota_final})

    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Erro btl'})
    }
})

app.patch('/alunos/:id/status', async (req, res) => {
    try {
        const {id} = req.params;
        const {professor_id, status} = req.body ?? {};

        if (!['aprovado', 'reprovado', 'pendente'].includes(status)) {
            return res.status(400).json({ message: 'Status deve ser aprovado, reprovado ou pendente' });
        }

        const aluno = await buscarAlunoDoProfessor(id, professor_id, res);
        if (!aluno) return;

        if (status === 'aprovado' && (aluno.nota_final === null || Number(aluno.nota_final) < 7)) {
            return res.status(400).json({ message: 'Aluno só pode ser aprovado com nota final 7 ou mais' });
        }

        await db.query('UPDATE alunos SET status = ? WHERE id = ?', [status, id]);

        res.json({id, status})

    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Erro btl'})
    }
})

const PORTA = 3000

app.listen(PORTA, ()=>{
console.log (`Servidor rodando em http://localhost:${PORTA}`)
})
