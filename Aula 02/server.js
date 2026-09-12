import express from 'express';


const PORT = 3000

const app = express()

app.get('/', (req, res) => {
    res.send('minha API está funcionando')

})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
    console.log(`Acesse: http://localhost:${PORT}`)
})