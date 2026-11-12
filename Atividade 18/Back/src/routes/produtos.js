const express = require('express');
const db = require('../db');

const router = express.Router();

// Intl usa espaço não separável depois de "R$"; trocamos por espaço comum
// para o front exibir exatamente "R$ 19,90".
const formatarPreco = (valor) =>
  Number(valor)
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace(/\s/g, ' ');

const comPrecoFormatado = (produto) => ({
  ...produto,
  preco_formatado: formatarPreco(produto.preco),
});

// GET /produtos?busca=texto&categoria=Roupas
router.get('/', async (req, res, next) => {
  try {
    const { busca, categoria } = req.query;
    const filtros = [];
    const valores = [];

    if (busca) {
      valores.push(`%${busca}%`);
      filtros.push(`nome ILIKE $${valores.length}`);
    }
    if (categoria) {
      valores.push(categoria);
      filtros.push(`categoria = $${valores.length}`);
    }

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT * FROM produtos ${where} ORDER BY id`,
      valores
    );
    res.json(rows.map(comPrecoFormatado));
  } catch (err) {
    next(err);
  }
});

// GET /produtos/categorias
router.get('/categorias', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT DISTINCT categoria FROM produtos ORDER BY categoria'
    );
    res.json(rows.map((r) => r.categoria));
  } catch (err) {
    next(err);
  }
});

// GET /produtos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const { rows } = await db.query('SELECT * FROM produtos WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(comPrecoFormatado(rows[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
