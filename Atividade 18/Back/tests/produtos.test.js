const { test, mock, afterEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

// O banco é substituído por mocks, assim os testes rodam sem PostgreSQL
const db = require('../src/db');
const app = require('../src/app');

const produtos = [
  { id: 1, nome: 'Camiseta Básica', preco: '49.90', categoria: 'Roupas', estoque: 30 },
  { id: 2, nome: 'Caneca', preco: '34.90', categoria: 'Utilidades', estoque: 50 },
];

afterEach(() => mock.restoreAll());

test('GET /health retorna ok', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { status: 'ok' });
});

test('GET /produtos lista os produtos', async () => {
  mock.method(db, 'query', async () => ({ rows: produtos }));
  const res = await request(app).get('/produtos');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 2);
});

test('GET /produtos envia o preço já formatado em reais', async () => {
  mock.method(db, 'query', async () => ({
    rows: [{ id: 1, nome: 'Caderno', preco: '19.90' }, { id: 2, nome: 'Notebook', preco: '3499.00' }],
  }));
  const res = await request(app).get('/produtos');
  assert.strictEqual(res.body[0].preco_formatado, 'R$ 19,90');
  assert.strictEqual(res.body[1].preco_formatado, 'R$ 3.499,00');
});

test('GET /produtos aplica filtros de busca e categoria', async () => {
  const query = mock.method(db, 'query', async () => ({ rows: [produtos[0]] }));
  await request(app).get('/produtos?busca=cami&categoria=Roupas');
  const [sql, valores] = query.mock.calls[0].arguments;
  assert.match(sql, /nome ILIKE \$1 AND categoria = \$2/);
  assert.deepStrictEqual(valores, ['%cami%', 'Roupas']);
});

test('GET /produtos/categorias lista as categorias', async () => {
  mock.method(db, 'query', async () => ({
    rows: [{ categoria: 'Roupas' }, { categoria: 'Utilidades' }],
  }));
  const res = await request(app).get('/produtos/categorias');
  assert.deepStrictEqual(res.body, ['Roupas', 'Utilidades']);
});

test('GET /produtos/:id retorna o produto', async () => {
  mock.method(db, 'query', async () => ({ rows: [produtos[0]] }));
  const res = await request(app).get('/produtos/1');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.nome, 'Camiseta Básica');
});

test('GET /produtos/:id retorna 404 quando não existe', async () => {
  mock.method(db, 'query', async () => ({ rows: [] }));
  const res = await request(app).get('/produtos/999');
  assert.strictEqual(res.status, 404);
});

test('GET /produtos/:id retorna 400 para id inválido', async () => {
  const res = await request(app).get('/produtos/abc');
  assert.strictEqual(res.status, 400);
});

test('erro no banco retorna 500', async () => {
  mock.method(db, 'query', async () => {
    throw new Error('falhou');
  });
  mock.method(console, 'error', () => {});
  const res = await request(app).get('/produtos');
  assert.strictEqual(res.status, 500);
});
