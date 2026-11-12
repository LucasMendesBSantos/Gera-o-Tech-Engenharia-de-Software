import express from 'express';
import {db} from './db.js';

const app = express();


app.patch('/pedidos/:id/pagar', async (req, res) => {
    try {
        const {id} = req.params;
        const [rows] = await db.query('SELECT id, status FROM pedidos WHERE id = ?', [id]);
        const pedido = rows[0];

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        if (pedido.status !== 'aberto') {
            return res.status(409).json({ message: 'Pedido não está aberto' });
        }

await db.query("UPDATE pedidos SET status = 'pago' WHERE id = ?", [id]);

        res.json({id, status: "pago"})

    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Erro btl'})

    }
})

const PORTA = 3000

app.listen(PORTA, ()=>{
console.log (`Servidor rodando em http://localhost:${PORTA}`)
})
