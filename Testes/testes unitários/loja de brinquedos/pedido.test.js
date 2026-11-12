import {test, before, after} from 'node:test'
import assert from 'node:assert'
import { db } from './db.js'

before (async()=>{
    await db.query("UPDATE pedidos SET status = 'aberto' WHERE id = 9")
})

after(()=>{
    db.end()
})

const URL_API = `http://localhost:${process.env.PORT ?? 3000}`

test("pedido aberto pode ser pago", async ()=>{

    const resposta = await fetch(`${URL_API}/pedidos/9/pagar`, {method: 'PATCH'})
    assert.equal(resposta.status,200)
    const corpo = await resposta.json()
    assert.equal(corpo.status, 'pago')
    
})

test("pedido inexistente", async ()=>{

    const resposta = await fetch(`${URL_API}/pedidos/55/pagar`, {method: 'PATCH'})
    
    assert.equal(resposta.status,404)
    
})

test("pedido já está pago", async ()=>{

    const resposta = await fetch(`${URL_API}/pedidos/7/pagar`, {method: 'PATCH'})
    
    assert.equal(resposta.status,409)
    
})