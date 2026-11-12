import {test, before, after} from 'node:test'
import assert from 'node:assert'
import { db } from './db.js'

let alunoId, professorDaTurmaId, professorDeOutraTurmaId

before(async()=>{
    await db.query("INSERT INTO turmas (nome, horario) SELECT 'Turma A', '08:00' WHERE NOT EXISTS (SELECT 1 FROM turmas WHERE nome = 'Turma A')")

    const [aluno] = await db.query("INSERT INTO alunos (nome, turma, turno, status) VALUES ('Teste', 'Turma A', 'manha', 'pendente')")
    alunoId = aluno.insertId

    const [prof1] = await db.query("INSERT INTO professores (nome, materia, turma) VALUES ('Prof A', 'Matemática', 'Turma A')")
    professorDaTurmaId = prof1.insertId

    const [prof2] = await db.query("INSERT INTO professores (nome, materia, turma) VALUES ('Prof B', 'História', 'Turma B')")
    professorDeOutraTurmaId = prof2.insertId
})

after(()=>{
    db.end()
})

const URL_API = `http://localhost:${process.env.PORT ?? 3000}`

function matricular(corpo) {
    return fetch(`${URL_API}/alunos`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(corpo)
    })
}

function alterar(rota, corpo) {
    return fetch(`${URL_API}/alunos/${alunoId}/${rota}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(corpo)
    })
}

test("aluno é matriculado em turma existente", async ()=>{

    const resposta = await matricular({nome: 'Lucas', turma: 'Turma A', turno: 'manha'})
    assert.equal(resposta.status, 201)
    const corpo = await resposta.json()
    assert.equal(corpo.turma, 'Turma A')

})

test("nota_final pode ser null no cadastro", async ()=>{

    const resposta = await matricular({nome: 'Lucas', turma: 'Turma A', turno: 'manha'})
    assert.equal(resposta.status, 201)
    const corpo = await resposta.json()
    const [rows] = await db.query('SELECT nota_final FROM alunos WHERE id = ?', [corpo.id])
    assert.equal(rows[0].nota_final, null)

})

test("cadastro com nota válida", async ()=>{

    const resposta = await matricular({nome: 'Lucas', turma: 'Turma A', turno: 'manha', nota_final: 7.5})
    assert.equal(resposta.status, 201)
    const corpo = await resposta.json()
    const [rows] = await db.query('SELECT nota_final FROM alunos WHERE id = ?', [corpo.id])
    assert.equal(Number(rows[0].nota_final), 7.5)

})

test("nota final menor que zero", async ()=>{

    const resposta = await matricular({nome: 'Lucas', turma: 'Turma A', turno: 'manha', nota_final: -1})

    assert.equal(resposta.status, 400)

})

test("nota final maior que 10", async ()=>{

    const resposta = await matricular({nome: 'Lucas', turma: 'Turma A', turno: 'manha', nota_final: 11})

    assert.equal(resposta.status, 400)

})

test("turma inexistente", async ()=>{

    const resposta = await matricular({nome: 'Lucas', turma: 'Turma XYZ', turno: 'manha'})

    assert.equal(resposta.status, 404)

})

test("dados faltando", async ()=>{

    const resposta = await matricular({nome: 'Lucas'})

    assert.equal(resposta.status, 400)

})

test("professor de outra turma não pode alterar a nota", async ()=>{

    const resposta = await alterar('nota', {professor_id: professorDeOutraTurmaId, nota_final: 9})

    assert.equal(resposta.status, 403)

})

test("nota fora de 0 a 10 não é aceita", async ()=>{

    const resposta = await alterar('nota', {professor_id: professorDaTurmaId, nota_final: 15})

    assert.equal(resposta.status, 400)

})

test("não pode aprovar aluno com nota abaixo de 7", async ()=>{

    await alterar('nota', {professor_id: professorDaTurmaId, nota_final: 5})
    const resposta = await alterar('status', {professor_id: professorDaTurmaId, status: 'aprovado'})

    assert.equal(resposta.status, 400)

})

test("pode reprovar ou deixar pendente independente da nota", async ()=>{

    const reprovado = await alterar('status', {professor_id: professorDaTurmaId, status: 'reprovado'})
    assert.equal(reprovado.status, 200)

    const pendente = await alterar('status', {professor_id: professorDaTurmaId, status: 'pendente'})
    assert.equal(pendente.status, 200)

})

test("professor da turma altera a nota", async ()=>{

    const resposta = await alterar('nota', {professor_id: professorDaTurmaId, nota_final: 8})
    assert.equal(resposta.status, 200)
    const corpo = await resposta.json()
    assert.equal(corpo.nota_final, 8)

})

test("aluno com nota 7 ou mais pode ser aprovado", async ()=>{

    const resposta = await alterar('status', {professor_id: professorDaTurmaId, status: 'aprovado'})
    assert.equal(resposta.status, 200)
    const corpo = await resposta.json()
    assert.equal(corpo.status, 'aprovado')

})

test("professor de outra turma não pode alterar o status", async ()=>{

    const resposta = await alterar('status', {professor_id: professorDeOutraTurmaId, status: 'reprovado'})

    assert.equal(resposta.status, 403)

})

test("status inválido na alteração", async ()=>{

    const resposta = await alterar('status', {professor_id: professorDaTurmaId, status: 'sumido'})

    assert.equal(resposta.status, 400)

})

test("professor pode existir independente de turma", async ()=>{

    const [resultado] = await db.query("INSERT INTO professores (nome, materia, turma) VALUES ('Prof Sem Turma', 'Física', 'Turma Fantasma')")
    const [rows] = await db.query('SELECT turma FROM professores WHERE id = ?', [resultado.insertId])
    assert.equal(rows[0].turma, 'Turma Fantasma')

    const [turmas] = await db.query("SELECT id FROM turmas WHERE nome = 'Turma Fantasma'")
    assert.equal(turmas.length, 0)

})
