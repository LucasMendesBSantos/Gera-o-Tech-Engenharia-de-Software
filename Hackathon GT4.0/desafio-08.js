const express = require('express')

const PORTA = 3000

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  console.log('GET / recebido — servidor funcionando')
  res.send('Servidor funcionando!')
})

/*Aqui eu usei o Dry: a regra do email estava duplicada  e agora existe uma única vez e as outras vezes ela só chama essa desgraça aqui*/
const exigirEmailValido = (req, res, next) => {
  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ erro: 'email' })
  next()
}

/*Aqui eu usei o japa yagni, trazia anteriormente os pontosfuturos e lojadisicaid, em resumo, desnecessario estupido!!!*/
app.post('/usuarios', exigirEmailValido, (req, res) => {
  const { nome, email } = req.body
  res.status(201).json({ nome, email })
})

app.post('/pedidos', exigirEmailValido, (req, res) => {
  const { email, total } = req.body
  res.status(201).json({ email, total })
})

/*O bloco 3 foi usado para reduzir a bagaça, a hierarquia de aplicar desconto e não aplicar desconto só para retornar o valor, como nn tem desconto, o total é usado direto*/

app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`))
