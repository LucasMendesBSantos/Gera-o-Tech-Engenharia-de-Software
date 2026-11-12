const DESCONTOS_POR_CUPOM = { ALUNO10: 0.1, PROMO20: 0.2 }

function calcularTotal(valor, cupom) {
  const codigo = String(cupom ?? '').trim().toUpperCase().replace(/[\s_]+/g, '')
  const desconto = DESCONTOS_POR_CUPOM[codigo] ?? 0
  return Math.round(valor * (1 - desconto) * 100) / 100
}

app.post('/pedidos/:id/pagar', async (req, res) => {
  try {
    const [[pedido]] = await db.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id])

    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' })
    if (pedido.status === 'pago') return res.status(409).json({ erro: 'Pedido já foi pago' })
    if (pedido.status !== 'aberto') return res.status(422).json({ erro: 'Pedido não pode ser pago' })

    const total = calcularTotal(pedido.valor_total, req.body?.cupom)
    await db.query('UPDATE pedidos SET status = ?, valor_total = ? WHERE id = ?', ['pago', total, pedido.id])
    await mail.send(pedido.email, `Pagamento confirmado no valor de ${total}`)

    res.json({ id: pedido.id, status: 'pago', total })
  } catch {
    res.status(500).json({ erro: 'Erro interno do servidor' })
  }
})
