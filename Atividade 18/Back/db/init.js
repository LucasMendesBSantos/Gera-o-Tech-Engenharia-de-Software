// Cria a tabela e insere os produtos de exemplo: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/db');

const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

db.query(sql)
  .then(() => console.log('Banco inicializado com sucesso!'))
  .catch((err) => {
    console.error('Erro ao inicializar o banco:', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
