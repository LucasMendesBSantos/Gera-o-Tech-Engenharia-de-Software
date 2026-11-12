
const freteSedex = (kg) => kg * 10
const freteRetirada = () => 0
const freteDrone = (kg) => kg * 15


class PedidoService {
  constructor(db) {
    this.db = db // D
  }

  async fechar(pedido, calcularFrete) {
    if (!pedido.email.includes('@')) throw new Error('email')
    const frete = calcularFrete(pedido.kg) // O
    const total = pedido.total + frete
    await this.db.query('INSERT INTO pedidos SET ?', { total })
    return { total } // S
  }
}


//testiculo 
const dbFake = { query: async (sql, dados) => console.log('[db]', sql, dados) }
const service = new PedidoService(dbFake)

;(async () => {
  const pedido = { email: 'cliente@email.com', kg: 2, total: 100 }

  const { total } = await service.fechar(pedido, freteDrone)
  console.log('Pedido fechado: ' + total) 

  // Frete novo sem tocar em PedidoService (O)
  const freteMoto = (kg) => kg * 8
  const r = await service.fechar(pedido, freteMoto)
  console.log('Pedido fechado: ' + r.total)
})()

module.exports = { PedidoService, freteSedex, freteRetirada, freteDrone }
