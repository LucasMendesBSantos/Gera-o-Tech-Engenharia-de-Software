const express = require('express')
const mysql = require('mysql2/promise')

const PORTA = 3000
const PRECO_KG_SEDEX = 10
const PRECO_KG_DRONE = 15

// Mudança 2 — O (Open/Closed): cada frete é uma função (kg) => valor.
// Um frete novo é só mais uma entrada aqui, sem mexer em fechar.
const fretes = {
  sedex: (kg) => kg * PRECO_KG_SEDEX,
  retirada: () => 0,
  drone: (kg) => kg * PRECO_KG_DRONE,
}

class EmailInvalidoError extends Error {
  constructor() {
    super('E-mail inválido')
  }
}

const emailValido = (email) => typeof email === 'string' && email.includes('@')

class PedidoService {
  // Mudança 1 — D (Dependency Inversion): recebe o banco pronto, não cria a conexão.
  constructor(db) {
    this.db = db
  }

  // Mudança 2 — O (Open/Closed): recebe a função de frete que deve usar.
  // Mudança 3 — S (Single Responsibility): devolve só { total }, sem texto de tela.
  async fechar({ email, kg, total }, calcularFrete) {
    if (!emailValido(email)) throw new EmailInvalidoError()

    const totalComFrete = total + calcularFrete(kg)
    await this.db.query('INSERT INTO pedidos SET ?', { total: totalComFrete })

    return { total: totalComFrete }
  }
}

// Mudança 1 — D (Dependency Inversion): quem cria o PedidoService entrega o banco pronto.
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'segredo',
  database: process.env.DB_NAME || 'loja',
})
const pedidoService = new PedidoService(db)

const app = express()
app.use(express.json())

app.post('/pedidos', async (req, res) => {
  const { tipoFrete, ...pedido } = req.body
  const calcularFrete = fretes[tipoFrete]
  if (!calcularFrete) return res.status(400).send('Tipo de frete inválido')

  try {
    const { total } = await pedidoService.fechar(pedido, calcularFrete)
    // Mudança 3 — S (Single Responsibility): a rota monta o texto de tela.
    res.send(`Pedido fechado: ${total}`)
  } catch (erro) {
    if (erro instanceof EmailInvalidoError) return res.status(400).send(erro.message)
    res.status(500).send('Erro interno do servidor')
  }
})

app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`))
