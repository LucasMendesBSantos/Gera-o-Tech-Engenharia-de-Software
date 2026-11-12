const express = require('express');
const cors = require('cors');
const produtosRouter = require('./routes/produtos');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/produtos', produtosRouter);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
