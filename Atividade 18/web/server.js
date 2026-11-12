// Servidor estático simples para a página: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5500;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};
const ARQUIVOS = ['index.html', 'styles.css', 'app.js'];

http
  .createServer((req, res) => {
    const nome = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0];
    if (!ARQUIVOS.includes(nome)) {
      res.writeHead(404).end('Não encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(nome)] });
    fs.createReadStream(path.join(__dirname, nome)).pipe(res);
  })
  .listen(PORT, () => console.log(`Lojinha em http://localhost:${PORT}`));
